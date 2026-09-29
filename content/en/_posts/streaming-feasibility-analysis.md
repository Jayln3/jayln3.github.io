---
title: Evening Streaming Tests — BandwagonHost CN2 GIA and LisaHost Cogent
date: 2026-02-04T11:00:00.000Z
abbrlink: c9a4d8
tags:
  - BandwagonHost
  - Streaming
  - CN2 GIA
  - LisaHost
  - Reviews
  - 4K Streaming
categories:
  - Infrastructure
cover: /assets/images/streaming-network-v1-1280.webp
lang: en
translation_key: streaming-network
author: Jayln3
cover_alt: Video frames travel from a camera through two server routes toward a screen in a network-testing concept.
description: The original comparison of evening upload throughput, packet loss and jitter for live-streaming workloads.
translation_edition: edited
translated_on: '2026-09-29'
---

For a live stream, stable upload capacity matters as much as download speed. The original article compares **BandwagonHost / IT7 CN2 GIA** with **LisaHost / Cogent** during evening hours.

<!-- more -->

## Streaming capacity in the original test

The article uses **20 Mbps** as its working threshold for a 2K stream.

- **LisaHost / Cogent:** the lowest recorded upload rate was about 40 Mbps. The article regarded this as adequate for a single stream, while noting the drop at 8 p.m.
- **BandwagonHost / IT7:** recorded upload rates stayed close to 118 Mbps. The article saw more headroom for high-bitrate streaming or sending streams to multiple platforms.

The original multi-platform example estimates a combined 60–80 Mbps for YouTube, Twitch and Bilibili.

## Evening upload measurements

**Window:** 19:30–23:00 China Standard Time (UTC+8).

**Metric:** upload throughput in Mbps.

| Time | LisaHost / Cogent | BandwagonHost / IT7 | Ratio | Original assessment |
| --- | ---: | ---: | ---: | --- |
| 19:30 | 60.04 | 114.28 | 1.9× | Both exceed the working threshold |
| 20:00 | 40.30 | 118.17 | 2.9× | A clear drop on LisaHost |
| 21:00 | 65.45 | 122.79 | 1.8× | More headroom on BandwagonHost |
| 22:00 | 57.60 | 119.43 | 2.0× | BandwagonHost remains stable |
| 23:00 | 64.40 | 119.32 | 1.8× | BandwagonHost remains stable |
| Mean | 57.56 | 118.80 | 2.06× | — |

The article's interpretation is that BandwagonHost remained close to 120 Mbps, while LisaHost still exceeded its working threshold but varied more.

## Packet loss and jitter

The original article also gives a qualitative comparison involving a standard international Alibaba Cloud route:

| Observation | LisaHost / Cogent | Alibaba Cloud international, standard route | BandwagonHost / CN2 GIA |
| --- | --- | --- | --- |
| Routing description | Budget-oriented route | Standard BGP route | Premium China Telecom route |
| Reported evening loss | Occasional loss | Multiple timeouts in the reported test | Almost no loss in the reported test |
| Reported jitter | Noticeable | Pronounced | Low |
| Author's streaming assessment | Usable with reservations | Poor in this test | Preferred in this test |

The author describes being surprised by the observed timeouts on the tested Alibaba Cloud route and by the comparatively steady CN2 GIA results.

These observations describe the original test. The article does not supply raw logs or a full reproducible test configuration.

[BandwagonHost purchase page — affiliate link](https://bandwagonhost.com/aff.php?aff=80594)
