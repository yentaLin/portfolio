---
title: Memory Hierarchy and Cache — CSAPP Reading Notes
description: Reading notes for CSAPP at CMU, covering memory hierarchy, locality, cache organization, write policies, AMAT, and cache-aware optimization.
# Date added to this site; not the original lecture or reading date.
date: 2026-09-19
updated: 2026-09-19
tags: [CSAPP, Computer Systems, Memory Hierarchy, Cache]
category: Course Notes
draft: false
featured: false
---

Reading notes for **CSAPP at CMU**, consolidating memory-hierarchy and cache concepts, worked examples, and review procedures. These are personal study notes rather than official course material.

---

## Chapter 1 — Memory Access Foundations

### Memory Access

A **load** transfers data from memory to the CPU, while a **store** transfers data from the CPU to memory.

```text
Load:
address → memory system → data → CPU

Store:
CPU data + address → memory system
```

The CPU requests data using a **memory address**. The memory system decides where the requested data is actually obtained from.

### Cache Is Transparent to the Program

```text
CPU requests address A
        ↓
L1 → L2 → L3 → Main Memory
```

The program still sees one memory address space. Cache lookup and movement between hierarchy levels are handled automatically by hardware.

> **Cache changes how a memory access is served, not the address used by the program.**

### SRAM vs. DRAM

| Property | SRAM | DRAM |
|---|---|---|
| Speed | Faster | Slower |
| Density | Lower | Higher |
| Cost / byte | Higher | Lower |
| Refresh | No | Yes |
| Main use | Cache | Main memory |

Fast storage is smaller and more expensive; large storage is slower and cheaper. This trade-off motivates a memory hierarchy.

```text
CPU
 ↓
L1 Cache
 ↓
L2 Cache
 ↓
L3 Cache
 ↓
Main Memory
```

> **CPU asks for an address; the memory hierarchy decides how quickly that request can be served.**

---

## Chapter 2 — Locality and Memory Hierarchy

### Principle of Locality

Programs usually access memory in predictable clusters rather than randomly.

#### Temporal Locality

Recently accessed data is likely to be accessed again soon.

```text
X → ... → X → ... → X
```

> **Temporal locality = reuse recently accessed data.**

#### Spatial Locality

Addresses near a recently accessed address are likely to be accessed soon.

```text
A → A+4 → A+8 → A+12
```

> **Spatial locality = access nearby data.**

### Spatial Locality and Block Transfer

Spatial locality makes it useful to fetch nearby data together.

```text
request a[0]
↓
load [a0 a1 a2 a3]
↓
later accesses to a[1], a[2], a[3] may hit
```

Temporal locality benefits from **keeping data**.
Spatial locality benefits from **fetching nearby data together**.

### Locality in Arrays

C arrays use **row-major** layout.

```text
Row-wise access
→ small stride
→ good spatial locality

Column-wise access
→ large stride
→ poor spatial locality
```

> **Locality depends on the memory access order.**

### Memory Hierarchy

```text
Registers
↓
L1
↓
L2
↓
L3
↓
Main Memory
↓
Storage
```

Upper levels are faster, smaller, and more expensive per byte.
Lower levels are slower, larger, and cheaper per byte.

Each faster level stores a subset of data from the level below.

```text
Temporal locality
→ recently used data is worth keeping

Spatial locality
→ nearby data is worth fetching together
```

> **Memory hierarchies exploit locality to keep useful data close to the CPU.**

---

## Chapter 3 — Cache Blocks, Hits, and Misses

### Cache Blocks

Main memory is viewed as a sequence of fixed-size **blocks**.
A cache stores copies of only a subset of those blocks.

```text
Memory

Block 0
Block 1
Block 2
...
```

Data is transferred between hierarchy levels in **block-sized units**.

> **Cache transfer unit = block.**

### Block vs. Cache Line

```text
Block
= fixed-size chunk of memory data

Cache line
= cache entry that stores one block
  together with metadata
```

A cache line conceptually contains:

```text
valid | tag | B bytes of block data
```

### Cache Hit

```text
CPU requests address A
↓
block containing A is already in cache
↓
HIT
↓
return data from cache
```

> **Hit = required block is present in cache.**

### Cache Miss

```text
CPU requests address A
↓
required block is not in cache
↓
MISS
↓
fetch entire block from lower level
↓
place block in cache
↓
return requested data
```

The CPU requests a specific address, but the cache fetches the **entire containing block**.

### Spatial Locality and Hits

Example:

$$
B=16\text{ B},\qquad \text{sizeof(int)}=4\text{ B}
$$

One block contains four consecutive integers:

```text
[a0 a1 a2 a3]
```

Sequential access:

```text
a[0] → Miss
a[1] → Hit
a[2] → Hit
a[3] → Hit
```

Different addresses can hit as long as their **containing block** is already cached.

---

## Chapter 4 — Cache Organization and Lookup

### Cache Organization

A cache is organized as:

$$
S\text{ sets} \times E\text{ lines/set} \times B\text{ bytes/block}
$$

where:

- `S` = number of sets
- `E` = number of lines per set (**associativity**)
- `B` = bytes per cache block
- `C` = cache data capacity

$$
\boxed{C=S\times E\times B}
$$

Each cache line contains:

```text
valid | tag | B-byte block data
```

### Address Decomposition

An `m`-bit memory address is divided into:

```text
|       tag       | set index | block offset |
|     t bits      |  s bits   |    b bits    |
```

with:

$$
S=2^s,\qquad B=2^b
$$

$$
\boxed{m=t+s+b}
$$

#### Set Index

Selects the cache set.

```text
set index
→ which set should be searched?
```

#### Tag

Identifies which memory block is currently stored in the selected set.

```text
set index
→ where to look

tag
→ which block is there
```

Many different memory blocks can map to the same set, so the set index alone is not enough to identify the block.

A useful relation is:

```text
memory block number
=
[tag | set index]
```

#### Block Offset

Selects the byte position inside the block.

```text
block offset
→ which byte inside the block?
```

For example, if `B = 8 B`, then `b = 3` and the 3 offset bits select one of 8 byte positions.

### Cache Lookup

```text
Memory address
      ↓
tag | set index | block offset
      ↓
set index selects one set
      ↓
compare requested tag with line(s) in that set
      ↓
valid + tag match?
    /            \
  yes             no
  Hit             Miss
   ↓
block offset selects data
```

A hit requires:

$$
\boxed{\text{valid}=1\ \land\ \text{tag matches}}
$$

### Direct-Mapped Cache

$$
\boxed{E=1}
$$

Each set contains exactly one line.

```text
set index
↓
one set
↓
one candidate line
```

Therefore:

> **Each memory block has exactly one possible cache location.**

### E-Way Set-Associative Cache

Each set contains `E` lines.

Example: `E = 2`

```text
Selected Set

[ Line 0 ] [ Line 1 ]
     \         /
      compare tags
```

The set is still fixed by the **set index**, but the block may occupy any of the `E` lines inside that set.

> **E = number of candidate lines in the selected set.**

### Placement

**Placement** asks:

> Where is a newly fetched block allowed to be stored?

```text
Direct-Mapped, E = 1
→ one possible line

2-Way Set Associative, E = 2
→ two possible lines in the mapped set

E-Way Set Associative
→ E possible lines in the mapped set
```

> **Set index determines the set; associativity determines the possible lines inside it.**

### Replacement

Replacement is needed only when a miss occurs and all allowed lines in the selected set are occupied.

```text
fetch requested block
        ↓
go to its mapped set
        ↓
is an invalid line available?
      /                \
    yes                 no
     ↓                   ↓
  place block        Replacement
                         ↓
                    choose victim
                         ↓
                       evict
                         ↓
                   place new block
```

#### LRU

**LRU — Least Recently Used** evicts the line in the selected set that has not been accessed for the longest time.

> **Placement = where may the block go?**
>
> **Replacement = if those locations are full, which block leaves?**

### Complete Cache Access

```text
Memory Address
      ↓
tag | set index | block offset
      ↓
set index
→ select one set
      ↓
compare tag with E candidate lines
      ↓
valid + tag match?
   /             \
 Hit             Miss
  ↓                ↓
offset          fetch block
selects             ↓
data            Placement
                     ↓
             free allowed line?
                 /        \
               yes         no
                ↓           ↓
              place     Replacement
                           ↓
                       choose victim
                           ↓
                         evict
```

---

## Chapter 5 — Working Set and Cache Misses

### Working Set

The **working set** is the set of data and instructions actively used by a program during a period of execution.

Caches are most effective when the working set fits in the cache.

```text
good locality
↓
small active working set
↓
working set remains in cache
↓
more hits
```

### Cold / Compulsory Miss

First reference to a memory block.

```text
block has never been accessed
→ Cold Miss
```

The classification is based on the **block**, not the individual byte address.

### Conflict Miss

The cache has enough total capacity, but multiple blocks are forced to compete for the same cache location(s).

```text
enough total space
+
mapping collision
→ Conflict Miss
```

Example:

```text
Block A → Set 0
Block B → Set 0

A → B → A → B
```

The blocks repeatedly evict each other even if other cache locations are unused.

### Capacity Miss

The active working set is larger than the cache.

```text
working set > cache capacity
→ Capacity Miss
```

### Conflict vs. Capacity

```text
Conflict
→ space exists elsewhere,
  but mapping prevents using it

Capacity
→ not enough total cache space exists
```

### Cache Trace Procedure

For each memory access:

```text
Address
↓
Block
↓
Tag + Set
↓
Check current cache state
↓
Hit / Miss
↓
Update cache state
↓
If miss, classify the reason
```

Miss classification should be done **after** understanding why the block is absent.

```text
Never loaded before?
→ Cold

Forced out by mapping competition?
→ Conflict

Cache cannot hold the active working set?
→ Capacity
```

---

## Chapter 6 — Cache Writes

When the CPU writes data, multiple copies may exist across L1, L2, L3, main memory, and storage. The cache therefore needs policies for keeping those copies consistent.

### Write Hit

A **write hit** means the target block is already in cache.

#### Write-Through

Update the cache and immediately propagate the write to the next lower level.

```text
CPU write
↓
update cache
↓
update lower memory immediately
```

Advantage: lower memory stays up to date.
Cost: more write traffic to lower levels.

#### Write-Back

Update the cache first and defer the lower-level write until the cache line is evicted.

```text
CPU write
↓
update cache only
↓
mark line dirty
↓
write back later when line is replaced
```

A **dirty bit** indicates that the cached block has been modified and differs from the copy in lower memory.

### Write Miss

A **write miss** means the block being written is not currently in cache.

#### Write-Allocate

Fetch the block into cache, then perform the write in cache.

```text
write miss
↓
fetch block into cache
↓
update cached block
```

Useful when the program is likely to access or write the same block again soon.

#### No-Write-Allocate

Write directly to lower memory without loading the block into cache.

```text
write miss
↓
write to lower memory
↓
do not allocate block in cache
```

### Typical Pairings

```text
Write-through
+ No-write-allocate

Write-back
+ Write-allocate
```

The two decisions are separate:

```text
Write hit policy:
write-through vs. write-back

Write miss policy:
write-allocate vs. no-write-allocate
```

---

## Chapter 7 — Cache Performance

### Performance Metrics

#### Miss Rate

$$
\text{Miss Rate}
=
\frac{\text{misses}}{\text{accesses}}
=
1-\text{Hit Rate}
$$

#### Hit Time

Time required to determine a hit and deliver the cached data.

#### Miss Penalty

Additional time required because of a cache miss.

For a simple single-level cache:

$$
\boxed{
AMAT
=
\text{Hit Time}
+
\text{Miss Rate}\times\text{Miss Penalty}
}
$$

### Why Small Miss Rates Matter

Example:

$$
\text{Hit Time}=1\text{ cycle},\qquad
\text{Miss Penalty}=100\text{ cycles}
$$

97% hit rate:

$$
1+0.03(100)=4\text{ cycles}
$$

99% hit rate:

$$
1+0.01(100)=2\text{ cycles}
$$

A small change in miss rate can have a large performance impact because misses are much more expensive than hits.

### Single-Level vs. Multi-Level

These terms describe **how many cache levels exist**.

```text
Single-level:
CPU → Cache → Memory

Multi-level:
CPU → L1 → L2 → Memory
```

### Latency Interpretation

This is a separate issue from the number of cache levels.

#### Incremental Latency

Each given latency represents only the additional time spent at that level.

```text
L1 time
+
if L1 misses: L2 time
+
if L2 misses: memory time
```

For a multi-level hierarchy:

$$
\boxed{
AMAT
=
T_{L1}
+
MR_{L1}\left(T_{L2}+MR_{L2}T_M\right)
}
$$

The probability of reaching main memory is:

$$
MR_{L1}\times MR_{L2}
$$

#### End-to-End Latency

Each given latency already includes the time spent checking the previous levels.

Example outcomes:

```text
L1 hit
→ total time = T1

L1 miss + L2 hit
→ total time = T2_end-to-end

L1 miss + L2 miss + memory
→ total time = TM_end-to-end
```

Do **not** add previous-level times again.

Use:

$$
\boxed{
E[T]=\sum_i P(\text{outcome}_i)T(\text{outcome}_i)
}
$$

#### Overlapping Accesses

If cache and memory accesses overlap, do not blindly add their latencies. The miss path should use the elapsed time implied by the overlap.

### Exam Procedure

```text
1. Draw the memory path.
2. Compute the probability of each path.
3. Determine whether times are incremental, end-to-end, or overlapping.
4. Compute the expected access time.
```

> **Single-level / Multi-level = how many levels?**
>
> **Incremental / End-to-End / Overlap = what do the latency numbers mean?**

---

## Chapter 8 — Stride, Arrays, and Cache Locality

### Stride

**Stride** is the index distance between consecutive array accesses.

```text
stride 1:
a[0] → a[1] → a[2] → ...

stride 2:
a[0] → a[2] → a[4] → ...
```

If `sizeof(int) = 4 B`:

```text
stride 1 → 4-byte address gap
stride 2 → 8-byte address gap
stride 4 → 16-byte address gap
```

### Elements per Block

If:

$$
B=\text{block size},\qquad e=\text{element size}
$$

then:

$$
\boxed{
\text{elements per block}=\frac{B}{e}
}
$$

Example:

$$
B=16\text{ B},\qquad sizeof(int)=4\text{ B}
$$

so one block holds 4 integers.

#### Stride 1

```text
a[0] → Miss
a[1] → Hit
a[2] → Hit
a[3] → Hit
```

$$
MR=\frac14=25\%
$$

#### Stride 2

```text
a[0] → Miss
a[2] → Hit
a[4] → Miss
a[6] → Hit
```

$$
MR=\frac12=50\%
$$

#### Stride 4

Each access reaches a new block.

$$
MR=100\%
$$

### Miss Rate for Regular Sequential Strides

For the simple sequential-array model used in the lecture/exam problems:

$$
\boxed{
MR\approx
\min\left(
1,
\frac{\text{stride}}{\text{elements per block}}
\right)
}
$$

or equivalently:

$$
MR\approx
\min\left(
1,
\frac{\text{stride}\times e}{B}
\right)
$$

The better reasoning is still:

```text
How many elements fit in one block?
↓
With this stride, how many of them will actually be used?
↓
one miss / useful accesses per block
```

### C Array Layout

C uses **row-major order**:

```text
a[0][0] a[0][1] ... a[0][N-1]
a[1][0] a[1][1] ... a[1][N-1]
...
```

#### Row-Wise Traversal

```text
stride 1
→ consecutive elements
→ good spatial locality
```

Under the lecture assumptions:

$$
MR=\frac{sizeof(element)}{B}
$$

#### Column-Wise Traversal

```text
stride N
→ distant elements
→ poor spatial locality
```

For large `N`, each access often reaches a different block, giving a miss rate near 100% under the lecture assumptions.

### Complete Relation

```text
Memory layout
      ↓
Access order
      ↓
Stride
      ↓
Elements reused per cache block
      ↓
Hit / miss pattern
      ↓
Miss rate
```

> **A cache block is useful only if the program actually accesses the other data brought in with it.**

---

## Chapter 9 — Memory Mountain and Cache-Aware Optimization

### Memory Mountain

The **Memory Mountain** measures **read throughput** as a function of:

- **working-set size** → temporal locality / cache-capacity effects
- **stride** → spatial locality / block-use effects

Read throughput is the number of bytes read from memory per second.

```text
smaller working set
→ more of the active data fits in upper caches
→ higher throughput

smaller stride
→ more useful data per fetched block
→ higher throughput
```

The plot exposes performance regions associated with L1, L2, L3, and main memory.

```text
working-set size changes
→ cross cache-capacity boundaries

stride changes
→ change spatial locality
```

### Matrix Multiplication and Loop Order

C matrices are row-major, so the inner-loop access pattern matters.

For the lecture analysis:

- matrix elements are `double` = 8 B
- block size = 32 B
- one block contains 4 doubles
- `N` is large

#### `ijk`

```c
for (i = 0; i < n; i++)
    for (j = 0; j < n; j++) {
        sum = 0.0;
        for (k = 0; k < n; k++)
            sum += a[i][k] * b[k][j];
        c[i][j] = sum;
    }
```

Inner-loop behavior:

```text
A: row-wise    → miss rate 0.25
B: column-wise → miss rate 1.0
C: fixed       → miss rate 0.0
```

Average misses per inner-loop iteration:

$$
1.25
$$

#### `kij` / `ikj`

The inner loop accesses `B` and `C` row-wise while one `A` value is reused.

```text
A: fixed       → miss rate 0.0
B: row-wise    → miss rate 0.25
C: row-wise    → miss rate 0.25
```

Average misses per inner-loop iteration:

$$
0.5
$$

#### `jki` / `kji`

The inner loop accesses `A` and `C` column-wise.

```text
A: column-wise → miss rate 1.0
B: fixed       → miss rate 0.0
C: column-wise → miss rate 1.0
```

Average misses per inner-loop iteration:

$$
2.0
$$

The important reasoning is:

```text
inner-loop access pattern
↓
row-wise / column-wise / fixed
↓
stride
↓
spatial locality
↓
miss rate
```

### Blocking / Tiling

Loop reordering mainly improves **spatial locality**.
Blocking is used to improve **temporal locality**.

Basic idea:

```text
large matrices
↓
divide into L × L submatrices
↓
bring a small working set into cache
↓
reuse those blocks many times before eviction
```

The blocked algorithm performs many small `L × L` matrix multiplications.

To exploit blocking effectively, the three active blocks should fit in cache:

$$
\boxed{3L^2<C}
$$

under the lecture's simplified capacity model.

With the lecture assumptions:

#### No Blocking

$$
\boxed{\frac{9}{8}n^3\text{ misses}}
$$

#### Blocking

$$
\boxed{\frac{1}{4L}n^3\text{ misses}}
$$

Larger `L` reduces misses as long as the required blocks still fit in cache.

The reason blocking helps is that matrix multiplication has strong inherent temporal reuse: each array element is used many times, but the program must organize accesses so that reuse happens **before the data is evicted**.

### Cache-Friendly Optimization Summary

```text
Spatial locality
→ access consecutive elements
→ prefer stride-1 patterns

Temporal locality
→ reuse data soon after it is loaded
→ keep the active working set in cache

Loop reordering
→ improve access direction / spatial locality

Blocking
→ reduce working-set size and improve temporal locality
```

---

## Final Review — Cache Problem Solving

### Given Cache Parameters

```text
S = number of sets
E = lines per set
B = bytes per block
C = S × E × B
```

### Given an Address

```text
address
↓
tag | set index | block offset
↓
set index → where to look
tag       → which block is there
offset    → where inside the block
```

### Given an Address Trace

```text
Address
↓
Block
↓
Tag + Set
↓
Check current cache state
↓
Hit / Miss
↓
Update state / replacement if needed
↓
Classify miss
```

### Given a Miss Type Question

```text
First reference to block?
→ Cold

Enough total capacity, but mapping collision?
→ Conflict

Working set larger than cache?
→ Capacity
```

### Given a Stride Question

```text
block size
÷
element size
=
elements per block
↓
compare with stride
↓
derive useful accesses per fetched block
↓
miss rate
```

### Given an AMAT Question

```text
1. Draw the memory path.
2. Compute path probabilities.
3. Determine latency interpretation:
   incremental / end-to-end / overlap.
4. Compute expected access time.
```

### Given Nested Loops

```text
memory layout
↓
inner-loop address sequence
↓
stride
↓
spatial / temporal locality
↓
cache behavior
```

### Final Chain

```text
Program access pattern
        ↓
Locality
        ↓
Blocks
        ↓
Cache organization
        ↓
Lookup / placement / replacement
        ↓
Hit / miss behavior
        ↓
Miss rate
        ↓
Memory access time
        ↓
Program performance
```
