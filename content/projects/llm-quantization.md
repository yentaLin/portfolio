---
title: LLM Quantization for Edge Deployment
description: Identifying activation bottlenecks and exploring quality trade-offs in INT4 quantization for Llama models.
date: 2025-06-01
period: 2025.02 — 2025.06
category: ML SYSTEMS
tags: [PyTorch, INT4, Llama, Quantization]
featured: true
order: 1
role: Research project · National Cheng Kung University
---

## The problem

Low-bit quantization reduces storage costs, but different modules respond differently to quantization error. This project studied **Llama-3.2-1B**, profiling activation distributions and module-level INT4 sensitivity to identify bottlenecks.

## Implementation

- Profiled activation distributions and identified modules sensitive to INT4 quantization.
- Identified MLP down-projection activations as a major bottleneck, guiding outlier-mitigation experiments.
- Implemented two-scale piecewise INT4 quantization with MSE-calibrated thresholds.

The focus was on representing different activation ranges more effectively within a limited quantization budget.

## Results and evaluation scope

In **MLP down-projection component-ablation tests**, perplexity decreased by **86.9%** compared with naive static INT4.

This result applies to the specific component-ablation experiment. It does not describe end-to-end model performance, deployment throughput, or latency improvements.

## Research context

Conducted at National Cheng Kung University from February to June 2025, with a focus on model quantization, activation profiling, and error calibration.

[View research experience →](/experience/)
