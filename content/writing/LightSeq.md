---
title: LightSeq — LLM Systems Paper Reading Notes
description: Notes on a required reading for LLM Systems at CMU, exploring how LightSeq combines operation fusion, hierarchical search, and GPU memory reuse for Transformer inference.
# Date added to this site; not the original lecture or reading date.
date: 2026-09-19
updated: 2026-09-19
tags: [LLM Systems, Paper Notes, GPU, Inference, LightSeq]
category: Paper Notes
draft: false
featured: false
---

Notes on **LightSeq: A High Performance Inference Library for Transformers**, a required reading for **LLM Systems at CMU**. 

> **Paper:** *LightSeq: A High Performance Inference Library for Transformers*  
> **Core idea:** LightSeq does **not** mainly change what a Transformer computes. It removes waste from **how Transformer inference is executed** on GPUs.

---


## 1. Overview

### What is LightSeq trying to solve?

LightSeq is a **high-performance inference library for Transformer-family models**.

Its goal is to answer:

> **The Transformer computation is already defined. How can we execute inference much more efficiently on GPUs?**

Directly serving a model through a training framework such as TensorFlow or PyTorch can introduce overhead because those frameworks must support flexible model structures, backward propagation, and many fine-grained operations.

NLP inference adds another challenge: **variable-length inputs** and **auto-regressive decoding** make memory management and output search more dynamic.

So LightSeq focuses on removing avoidable inference overhead.

```text
Transformer computation is correct
          ↓
but execution contains avoidable overhead
          ↓
How can we remove that overhead?
```

---

### Where does the overhead come from?

The paper groups Transformer inference into two broad components:

```text
Transformer Inference
│
├── Feature Calculation
│   ├── Self-Attention
│   ├── Feature Transformation / FFN
│   ├── GEMM
│   └── element-wise / reduction operations
│
└── Output Layer
    ├── Softmax
    ├── Top-k / sorting
    ├── Beam Search / Sampling
    └── Cache Refreshing
```

From this perspective, LightSeq identifies three major sources of waste:

```text
1. Too many fine-grained GPU operations
      ↓
   excessive kernel launches
   + intermediate memory I/O

2. Too much output-layer computation
      ↓
   process the full vocabulary
   even though only a few candidates matter

3. Too many dynamic memory allocations
      ↓
   variable sequence lengths
   + short-lived intermediate tensors
```

---

### The Three Main Optimizations

```text
                    Transformer Inference
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
Fine-grained           Redundant            Dynamic
GPU execution          search work          memory allocation
        │                   │                   │
        ▼                   ▼                   ▼
Operation Fusion       HARS                Dynamic GPU
                                           Memory Reuse
```

#### Operation Fusion
**Execute necessary work more efficiently.**

```text
same useful computation
        ↓
fewer kernel launches
+
less intermediate memory traffic
```

#### HARS
**Avoid unnecessary computation.**

```text
full vocabulary
      ↓
cheap filtering
      ↓
small candidate set
      ↓
accurate ranking
```

#### Dynamic GPU Memory Reuse
**Avoid unnecessary allocation.**

```text
maximum-shape pre-allocation
+
reuse storage when tensor lifetimes permit
```

---

## 2. Operation Fusion

### Why is Operation Fusion needed?

A Transformer layer contains two different types of work:

```text
Large computation
    ↓
GEMM / matrix multiplication

Fine-grained operations
    ↓
bias, activation, reshape,
LayerNorm, residual, etc.
```

GEMMs are compute-heavy and are already highly optimized by libraries such as **cuBLAS**.

The problem is the many small operations between GEMMs.

Suppose we need:

$$
Y = \operatorname{ReLU}(X+b)
$$

If bias addition and ReLU are executed as separate GPU kernels:

```text
X
 ↓
Bias Add Kernel
 ↓
write temporary result to global memory
 ↓
ReLU Kernel
 ↓
read temporary result again
 ↓
output
```

The arithmetic itself is cheap, but execution pays for:

```text
kernel launch overhead
+
global-memory write
+
global-memory read
```

So low-FLOP operations can still be expensive.

---

### Core Idea

LightSeq keeps large matrix multiplications in **cuBLAS GEMMs**, while combining nearby lightweight operations into **custom fused CUDA kernels**.

```text
Unfused

Op A
 ↓
Global Memory
 ↓
Op B
 ↓
Global Memory


Fused

Op A
 ↓
Op B
 ↓
Global Memory
```

The Transformer mathematics may stay the same.

What changes is the **execution boundary**.

$$
\boxed{\text{Fusion changes execution boundaries, not Transformer mathematics.}}
$$

---

### LightSeq Execution Pattern

The optimized encoder can be understood as:

```text
cuBLAS GEMM
     ↓
Fused Custom Kernel
     ↓
cuBLAS GEMM
     ↓
Fused Custom Kernel
     ↓
...
```

The paper reports that an encoder layer can be implemented with **6 GEMMs + 6 custom kernels**, substantially reducing the number of atomic kernels compared with common framework implementations at the time.

---

### Code Example 1 — Bias + ReLU

#### What needs to be computed?

$$
Y_{i,j}=\operatorname{ReLU}(X_{i,j}+b_j)
$$

Example:

```text
X:
[ 1, -3,  2, -1 ]

bias:
[ 1,  1,  1,  1 ]

        ↓ add bias

[ 2, -2, 3, 0 ]

        ↓ ReLU

[ 2, 0, 3, 0 ]
```

#### Without Fusion

```text
X
 ↓
Bias Add
 ↓
temporary tensor
 ↓
write to global memory
 ↓
ReLU
 ↓
read temporary tensor
 ↓
output
```

#### LightSeq Implementation

```cpp
__global__ void ker_bias_relu(
    T* input,
    const T* bias,
    int feature_dim
) {
    int offset = blockIdx.x * feature_dim;

    for (int idx = threadIdx.x;
         idx < feature_dim;
         idx += blockDim.x) {

        int cur_offset = offset + idx;

        input[cur_offset] =
            max(input[cur_offset] + __ldg(&bias[idx]), (T)0.f);
    }
}
```

The key line is:

```cpp
input[cur_offset] =
    max(input[cur_offset] + bias[idx], 0);
```

This performs:

```text
load X[i,j]
     ↓
+ bias[j]
     ↓
ReLU
     ↓
store final result
```

So the fused work is:

$$
\boxed{\text{Bias Add}+\text{ReLU}}
$$

The intermediate tensor `X + bias` does not need to be fully materialized in global memory before applying ReLU.

---

### Code Example 2 — QKV Bias + Layout Transformation

This example shows that fusion is not limited to arithmetic operations.

#### What needs to be computed?

The QKV GEMM produces data in one layout:

```text
ori_qkv:

[batch, seq_len, 3, hidden_size]
```

But attention wants a layout closer to:

```text
new_qkv:

[3, batch, head, seq_len, dim_per_head]
```

Bias must also be added.

#### Without Fusion

```text
QKV GEMM result
      ↓
Bias Add Kernel
      ↓
temporary QKV
      ↓
Split / Reshape / Rearrange Kernel
      ↓
final attention layout
```

#### LightSeq Implementation

```cpp
int head_id = i / dim_per_head;
int dim_id  = i % dim_per_head;

int target_id =
    targetid_4dim(
        batch_id,
        head_id,
        token_id,
        dim_id,
        head_num,
        batch_seq_len,
        dim_per_head
    );

new_qkv[qkv_offset + target_id] =
    ori_qkv[...] +
    __ldg(&qkv_bias[blockIdx.y * hidden_size + i]);
```

The kernel does two things at once:

1. Determines where the element belongs in the new attention layout.
2. Adds QKV bias while writing directly to the final location.

For example:

```text
hidden_size  = 8
head_num     = 2
dim_per_head = 4

hidden index:
0 1 2 3 | 4 5 6 7
 Head 0  |  Head 1
```

If:

```text
i = 6
```

then:

```text
head_id = 6 / 4 = 1
dim_id  = 6 % 4 = 2
```

So feature 6 belongs to:

```text
Head 1, dimension 2
```

The actual execution becomes:

```text
read original QKV element
        ↓
add QKV bias
        ↓
determine final head/dimension
        ↓
write directly to final Q/K/V layout
```

The fused work is approximately:

$$
\boxed{
\text{Bias Add}
+
\text{Q/K/V Split}
+
\text{Layout Rearrangement}
}
$$

This reveals an important systems idea:

> **Fusion can combine computation with data movement.**

---

### Code Example 3 — LayerNorm

LayerNorm contains dependent stages:

$$
\mu=\frac{1}{H}\sum_i x_i
$$

$$
\sigma^2=\frac{1}{H}\sum_i(x_i-\mu)^2
$$

$$
y_i=
\frac{x_i-\mu}{\sqrt{\sigma^2+\epsilon}}
\gamma_i+\beta_i
$$

Conceptually:

```text
Compute Mean
     ↓
Compute Variance
     ↓
Normalize
     ↓
Scale + Bias
```

A multi-kernel implementation would repeatedly materialize intermediate state.

LightSeq instead keeps the stages inside one kernel.

#### Mean

```cpp
__shared__ float s_mean;

float reduce_res =
    blockReduceSum<float>(val);

if (threadIdx.x == 0)
    s_mean =
        reduce_res / float(hidden_size);

__syncthreads();
```

#### Variance

```cpp
val = 0.0;

for (...) {
    float tmp =
        matrix[i] - s_mean;

    val += tmp * tmp;
}

__shared__ float s_var;

reduce_res =
    blockReduceSum(val);

if (threadIdx.x == 0)
    s_var =
        rsqrtf(
            reduce_res /
            float(hidden_size)
            + epsilon
        );

__syncthreads();
```

#### Normalize + Scale + Bias

```cpp
for (...) {
    val =
        matrix[i] - s_mean;

    matrix[i] =
        val * s_var
        * scale[i - block_start]
        + bias[i - block_start];
}
```

So one kernel performs:

```text
mean
 ↓
variance
 ↓
normalization
 ↓
scale + bias
```

`__shared__` variables allow threads in the block to reuse the intermediate mean and variance, while `__syncthreads()` ensures later stages do not run before those values are ready.

This is a more advanced fusion case:

> Multiple dependent stages can still live inside one kernel if their dependencies are handled internally.

---

## 3. Hierarchical Auto-Regressive Search (HARS)

### The Problem

In beam search, each active beam produces logits over the **entire vocabulary**.

Suppose:

$$
k=2
$$

and:

$$
V=50{,}000
$$

Then one decoding step considers:

$$
kV=100{,}000
$$

possible next-token extensions.

But only a few will survive.

```text
2 current beams
      ↓
decoder produces logits
      ↓
[2, 50,000]
      ↓
probability calculation
      ↓
ranking / top-k
      ↓
keep only a few beams
```

The waste is obvious:

```text
process ~100,000 candidates
          ↓
finally keep
          ↓
only a few
```

The original search pipeline performs expensive probability and ranking work across the full vocabulary even though most tokens are clearly irrelevant.

---

### Core Idea — Retrieve Before Re-rank

Instead of immediately performing expensive ranking over all vocabulary entries:

```text
full vocabulary
      ↓
cheap rough retrieval
      ↓
small candidate set
      ↓
accurate probability / ranking
      ↓
Top-k beams
```

For each beam, the paper groups logits and computes a group maximum:

$$
m_1,m_2,\ldots,m_k
$$

Then defines:

$$
R=\min(m_1,\ldots,m_k)
$$

as a rough top-k threshold.

Only logits satisfying:

$$
l_i\ge R
$$

are retained.

#### Small Example

Suppose:

```text
beam size = 2

logits:
[2, 1, 4, 3, 2, 7, 4, 4]
```

Split into two groups:

```text
Group 1:
[2, 1, 4, 3]
max = 4

Group 2:
[2, 7, 4, 4]
max = 7
```

So:

$$
R=\min(4,7)=4
$$

Keep:

```text
logit ≥ 4

→ [4, 7, 4, 4]
```

The goal is not to immediately find the exact top-k.

It is to create a much smaller candidate set that still contains the important candidates.

```text
Exact Top-k
      ⊆
Retrieved Candidates
      ≪
Full Vocabulary
```

---

### LightSeq Code

A representative kernel is:

```cpp
select_beam_rough_topk
```

Conceptually, one CUDA block handles one beam.

#### Step 1 — Local Maxima

```cpp
float rough_top_kth_logit = CUDA_FLOAT_INF_NEG;

for (int i = left_idx;
     i < right_idx;
     i += blockDim.x) {

    float lgt =
        logits[i] +
        logit_bias[i - block_start];

    rough_top_kth_logit =
        fmaxf(rough_top_kth_logit, lgt);
}
```

Each GPU thread processes a subset of vocabulary entries:

```text
Thread 0:
token 0, token 256, token 512, ...

Thread 1:
token 1, token 257, token 513, ...

Thread 2:
token 2, token 258, token 514, ...
```

Each thread finds a local maximum.

```text
assigned logits
      ↓
local maximum
```

This is the GPU-oriented equivalent of:

```text
divide logits into groups
      ↓
find group maxima
```

---

#### Step 2 — Rough Threshold

```cpp
rough_top_kth_logit =
    blockRoughTopK<float, beam_size>(
        rough_top_kth_logit
    );

if (threadIdx.x == 0) {
    s_topk = rough_top_kth_logit;
}
```

Conceptually:

```text
local maxima
     ↓
blockRoughTopK
     ↓
s_topk
```

`s_topk` becomes a rough threshold for deciding whether a token is worth keeping.

---

#### Step 3 — Save Only Competitive Candidates

```cpp
lgt =
    logits[idx] +
    logit_bias[vocab_id];

if (lgt >= s_topk)
    pos = atomicAdd(&l_n, 1);
```

Then:

```cpp
if (lgt >= s_topk) {
    can_score[pos] = ...;
    can_idx[pos] = ...;
}
```

So:

```text
for each vocabulary token

       logit
         │
         ▼

    logit ≥ s_topk ?
      /          \
    no            yes
    │              │
 discard        keep as
                candidate
```

---

## 4. Dynamic GPU Memory Reuse

### The Problem

Transformer inference creates many temporary tensors:

```text
QKV projection output
attention scores
softmax output
FFN intermediate
```

Their sizes depend on the request.

Suppose:

```text
max batch size = 8
hidden size    = 512
FP16           = 2 bytes
```

For a QKV tensor:

$$
[B,L,3H]
$$

If sequence length changes:

```text
seq_len = 32
→ small QKV buffer

seq_len = 128
→ larger QKV buffer

seq_len = 256
→ much larger QKV buffer
```

A naive serving system might do:

```text
request arrives
      ↓
determine tensor size
      ↓
allocate GPU memory
      ↓
run inference
      ↓
free memory
      ↓
repeat
```

The problem is:

> **Dynamic input shapes cause repeated runtime allocation of temporary GPU buffers.**

There is a second problem.

Suppose:

```text
Temporary A = 6 MB
Temporary B = 8 MB
```

but they are needed at different times:

```text
time ─────────────────────────────►

A:
██████████

              B:
              ████████████
```

If A is dead before B is created, permanently reserving:

$$
6+8=14\text{ MB}
$$

is unnecessary.

A single 8 MB buffer could be reused.

```text
One shared buffer:

██████████
     A

              ████████████
                    B
```

So there are two memory problems:

```text
Problem 1:
Dynamic shapes
→ repeated runtime allocation

Problem 2:
Short-lived intermediate tensors
→ unnecessary simultaneous memory reservation
```

---

### Solution 1 — Maximum-Shape Pre-allocation

LightSeq allocates capacity according to the **maximum supported shape** before serving.

```text
maximum supported shape
        ↓
allocate capacity once
        ↓
smaller requests reuse
part of that capacity
```

Example:

```text
max batch size = 8
max seq len    = 256
```

Instead of:

```text
seq 32  → allocate
seq 80  → allocate again
seq 200 → allocate again
```

LightSeq prepares capacity for:

```text
8 × 256 tokens
```

Then:

```text
Request A: batch=2, seq=32
→ use a small portion

Request B: batch=4, seq=128
→ use a larger portion

Request C: batch=8, seq=256
→ use full capacity
```

Trade-off:

```text
more reserved capacity
        ↓
but
        ↓
far fewer runtime allocations
```

---

### Code — Maximum Capacity

During construction:

```cpp
int max_batch_tokens =
    tw_._max_step * _max_batch_size;
```

where:

```text
tw_._max_step
= maximum sequence length

_max_batch_size
= maximum batch size
```

So:

```text
max_batch_tokens
=
max_batch_size × max_seq_len
```

Layers are created using this capacity:

```cpp
launch_enc_emb_layer.reset(
    new LaunchEncEmbLayer<OpType_>(
        max_batch_tokens,
        tw_._padding_id,
        tw_._hidden_size,
        tw_._multilg_type
    )
);
```

and:

```cpp
enc_norm_layer.reset(
    new LyrNormalizeLayer<OpType_, OpType_>(
        max_batch_tokens,
        tw_._hidden_size
    )
);
```

When an actual request arrives, the model updates only the actual shape:

```cpp
inp_tokens->set_shape({
    size_t(batch_size),
    size_t(seq_len)
});
```

and:

```cpp
iter->before_forward(
    batch_size,
    seq_len
);
```

So:

```text
Capacity
──────────────
determined at initialization
using maximum shapes


Actual shape
──────────────
determined per request
```

---

### Solution 2 — Lifetime-Based Memory Reuse

A temporary tensor only needs memory while its value is still needed.

Example:

```text
time ─────────────────────────────►

Tensor A
████████
        dies

                Tensor B
                █████████
```

If:

$$
\text{lifetime}(A)\cap\text{lifetime}(B)=\varnothing
$$

then the same physical storage can be reused.

```text
Shared Buffer

████████
   A

                █████████
                    B
```

So the rule is:

$$
\boxed{
\text{Non-overlapping tensor lifetimes}
\Rightarrow
\text{memory can be reused}
}
$$

`non-dependent` does **not** simply mean the tensors have unrelated formulas.

The practical question is:

> **When B starts using this memory, will anything still need A's old value?**

---

### Code Example — Pre-planned Backing Storage

The current LightSeq implementation shows the broader memory-planning philosophy through decoder KV cache storage.

First:

```cpp
cache_size =
    max_batch_tokens
    * tw_._beam_size
    * tw_._hidden_size;
```

Then large backing buffers are created:

```cpp
total_cache_k =
    new Variable(
        "total_cache_k",
        cache_size * tw_._n_dec_layer,
        ...
    );
```

```cpp
total_cache_v =
    new Variable(
        "total_cache_v",
        cache_size * tw_._n_dec_layer,
        ...
    );
```

Their shape is based on the maximum supported configuration:

```cpp
total_cache_k->set_shape({
    size_t(tw_._n_dec_layer),
    size_t(_max_batch_size * tw_._beam_size),
    size_t(tw_._max_step),
    size_t(tw_._hidden_size)
});
```

Think of `total_cache_k` as:

```text
one large backing buffer

┌─────────────────────────────────────────┐
│ Layer 0 │ Layer 1 │ Layer 2 │ Layer 3  │
└─────────────────────────────────────────┘
```

Each layer then references its own region:

```cpp
Variable *cache_k =
    new Variable(
        "cache_k",
        total_cache_k
    );
```

```cpp
cache_k->set_offset(
    cache_size * dec_layer_idx,
    ...
);
```

So:

```text
NOT:

Layer 0 → independent allocation
Layer 1 → independent allocation
Layer 2 → independent allocation


INSTEAD:

one planned backing allocation
          ↓
Layer 0 gets one region
Layer 1 gets another region
Layer 2 gets another region
```

> **Important:** This KV-cache example demonstrates **pre-planned shared backing storage**, not lifetime reuse itself. KV caches must remain alive during generation. The paper's temporary-memory reuse goes further by reusing the same region for intermediates whose lifetimes do not overlap.

---

## 5. Experiments

The experiments mainly verify two things:

```text
1. Where is GPU time spent after optimization?
2. Does LightSeq actually become faster?
```

---

### GPU Occupation

A key result is that GEMM becomes a much larger fraction of total runtime.

Approximate example from the paper:

```text
TensorFlow FP16:
GEMM ≈ 25%

LightSeq FP16:
GEMM ≈ 87%
```

This does **not** mean GEMM becomes slower.

It means:

```text
non-GEMM overhead ↓
        ↓
useful matrix computation becomes
the dominant remaining cost
```

Example intuition:

```text
Before optimization

GEMM            25 ms
Other overhead  75 ms
────────────────────
Total          100 ms
```

After optimization:

```text
GEMM            25 ms
Other overhead   4 ms
────────────────────
Total           29 ms
```

GEMM now occupies most of the remaining runtime simply because other overhead has been removed.

---

### Overall Speedup

The paper reports up to:

$$
14\times
$$

speedup over TensorFlow and approximately:

$$
1.4\times
$$

over FasterTransformer in its machine-translation benchmarks.

The broader point is:

```text
different batch sizes
different sequence lengths
different decoding methods
        ↓
LightSeq still shows strong speedup
```

---

## 6. Summary

| Technique | Main Problem | Core Solution |
|---|---|---|
| **Operation Fusion** | Too many small kernels and intermediate memory transfers | Fuse adjacent operations into custom CUDA kernels |
| **HARS** | Too many vocabulary candidates processed | Retrieve a small candidate set before expensive ranking |
| **Dynamic GPU Memory Reuse** | Repeated allocation and wasted temporary buffers | Pre-allocate maximum capacity and reuse storage by lifetime |

---

## Source References

- Paper: **LightSeq: A High Performance Inference Library for Transformers**  
  https://arxiv.org/abs/2010.13887

- GitHub repository:  
  https://github.com/bytedance/lightseq

- CUDA Transformer kernels:  
  https://github.com/bytedance/lightseq/blob/master/lightseq/csrc/kernels/cuda/transformerKernels.cc.cu

- Transformer model implementation:  
  https://github.com/bytedance/lightseq/blob/master/lightseq/csrc/models/transformer.cu

---

> **Version note:** The GitHub `master` branch has evolved beyond the exact implementation used in the 2021 paper. The code examples here are used to understand how the same optimization ideas appear in the later LightSeq codebase.
