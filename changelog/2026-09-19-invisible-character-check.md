---
date: 2026-09-19
title: "A check that catches invisible characters before they ship"
promote: false
---

A no-break space or a zero-width space pasted into a regular expression is invisible in the editor, invisible in the diff and invisible in review — and if a later copy-paste flattens it to a plain space, the code still compiles and quietly stops doing the one thing `\s` cannot do. That bug was written twice here inside two days, and one of the two shipped. `npm test` now scans every source file in the repo for literal invisible characters and fails with the file, the position and the escape to write instead; the `structure` skill carries the rule alongside the whitespace-trimming guidance it belongs with. Archived snapshots, published CSVs and the copied upstream issues are deliberately exempt: what a source actually said is evidence, not a defect.
