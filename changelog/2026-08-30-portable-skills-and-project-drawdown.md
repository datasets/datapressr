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
solution-to-sector links), validation clean. drawdown.org's own site terms are
all-rights-reserved, but the dataset is just the numbers — measured and modelled
emissions-impact estimates, which are facts and not per se copyrightable —
restructured into tidy tables, not the prose or figures. We release the
compilation as PDDL-1.0 and attribute Project Drawdown as the source. It still
needs relocating into the `datasets/climate-and-environment` catalog repo before
it goes live.
