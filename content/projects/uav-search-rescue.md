---
title: UAV Search-and-Rescue Vision System
description: Detecting people in aerial imagery with RT-DETR and integrating the model into a local inference tool for field use.
date: 2025-01-01
period: 2024.09 — 2025.01
category: COMPUTER VISION
tags: [RT-DETR, Python, Streamlit]
featured: true
order: 2
role: Research project · National Cheng Kung University
links:
  - label: GitHub (personal fork)
    url: https://github.com/yentaLin/Drone_Human_Detect_ui
---

## The problem

Aerial search and rescue requires identifying people in imagery. Beyond a trained detector, field use needs a practical way to load the model and run inference locally.

## What I built

Curated aerial search-and-rescue imagery, developed an **RT-DETR** person detector, and integrated it into a **local Streamlit inference application** with model loading and execution for Tainan City Government Fire Bureau.

## Results

Evaluation on fire-department data achieved:

| Metric    | Result |
| --------- | ------ |
| Precision | 78%    |
| Recall    | 92%    |

These metrics describe the study dataset, rather than performance across all flight altitudes, weather conditions, or rescue scenarios.

The project won **first place in the Tainan City Hackathon** and **first place in the Undergraduate Project Competition**.

## From model to tool

The work covered data curation, detection, and interface integration. The linked GitHub repository is a personal fork; see the repository for upstream code and licensing.

[View research experience →](/experience/)
