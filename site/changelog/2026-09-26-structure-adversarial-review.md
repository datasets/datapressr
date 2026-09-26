---
date: 2026-09-26
title: Parsed datasets now get an adversarial review before they count as structured
description: A fresh reviewer re-derives values from the source, reads every label and tries to break the build.
promote: false
---

The `structure` skill now requires an independent review before a dataset built with a custom parser (PDF, HTML, messy spreadsheets) or from many source documents is marked structured, and recommends one for everything else: the reviewer re-derives values from the source, reads every category label, deliberately breaks the build to see whether any check notices, and records an `APPROVED` verdict. In both of our source-discovery runs, the most valuable finding came from this kind of review.
