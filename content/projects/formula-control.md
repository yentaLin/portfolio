---
title: Formula Racing Embedded Control
description: Connecting six vehicle subsystems through STM32 firmware, CAN communication, and hands-on integration.
date: 2023-08-01
period: 2022.03 — 2023.08
category: EMBEDDED SYSTEMS
tags: [STM32, C, CAN Bus, Motor Control]
featured: true
order: 3
role: Electrical & Controls Team Lead · NCKU Formula Racing
---

## The problem

Vehicle control brings software and hardware together. This project used **STM32F407** firmware and **CAN bus** communication across six vehicle subsystems, including EMRAX-208 motor control and vehicle integration.

## Firmware and integration

- Programmed STM32F407 firmware and configured CAN communication across subsystems.
- Integrated the EMRAX-208 motor controller with vehicle systems.
- Led the Electrical & Controls team, assigning technical responsibilities and coordinating subsystem integration.

## Debugging through the signal path

During integration, CAN communication with the motor controller failed. Using an oscilloscope, I traced the problem to an open circuit in an adapter cable and restored communication with the EMRAX-208 motor controller.

The issue crossed firmware, communication, and physical wiring. Following the actual signal path was essential to finding its cause.

## Team results

The team placed **first in Formula Student Taiwan in 2022** and **third in 2023**. These were shared results across the whole team.

[View team experience →](/experience/)
