---
date: 2026-10-10
title: /validate now checks the data, not just the metadata
promote: false
---

`/validate` now reads every CSV value against the dataset's declared schema (types, real calendar dates, row width, primary key uniqueness, foreign keys and the house CSV format) and says which line is wrong; all seven DataPressr datasets pass clean.
