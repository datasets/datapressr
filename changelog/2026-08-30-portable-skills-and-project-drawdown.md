---
date: 2026-08-30
title: Skills become installable anywhere, and Project Drawdown gets structured
promote: false
---

The skill playbooks moved out of `.claude/` into a top-level `skills/` directory in
the flat layout [`npx skills`](https://github.com/vercel-labs/skills) expects, so
any agent can install them — `npx skills add datasets/datapressr` — not just Claude
Code, which keeps working through symlinks. The three last-mile commands (`init`,
`validate`, `push`) became `SKILL.md` playbooks alongside `capture`, `archive`, and
`structure`, so there is now one consistent format for all six.

Project Drawdown's 2020 Table of Solutions was run through `structure`: a
reproducible `build.ts`, two tidy typed CSVs (82 solutions × 2 scenarios; the
solution-to-sector links), validation clean. It is **not cleared to publish** —
drawdown.org's Terms of Use reserve all rights and require written consent to
redistribute, with no open licence offered. The structured dataset is committed so
that call can be made quickly, but a human has to make it.
