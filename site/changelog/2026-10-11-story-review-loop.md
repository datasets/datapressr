---
date: 2026-10-11
title: Draft stories get an annotation review loop, and the story checks catch broken charts
promote: false
---

Draft data stories are now published to a private-link Flowershow site with annotations on, so a reviewer can select any passage and leave a note, and an agent pulls the notes with `fl annotations pull`, revises the story and republishes; drafts stay off this site until approved. The story checks gained S7, which fails any chart SVG containing NaN, `undefined` or leaked function source, and the story skill now asks writers to state the difference or ratio rather than leave two numbers for the reader to compare.
