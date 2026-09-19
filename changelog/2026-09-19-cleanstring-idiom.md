---
date: 2026-09-19
title: "A cleanString idiom for the structure skill, and a correction to what it was claiming"
promote: false
---

The `structure` skill has told you since the value-semantics pass to trim every string you keep once, centrally, rather than per column when a mismatch surprises you — but the helper it named for the job did not exist. [`cleanString`](https://github.com/datasets/datapressr/blob/main/scripts/wrangling-idioms.mjs) is now in the tested idioms module alongside `cleanNumber` and `num`: collapse whitespace runs, including the non-breaking and zero-width spaces HTML leaves behind, trim, and treat what's left of an empty cell as missing. It deliberately takes no placeholder list, because whether `NA` means "not applicable" is a fact about the row and not about the string, which is what the skill already says everywhere else.

The review that checked it found the skill's own evidence for the rule was stated backwards, and that is the more useful half of this note. The World Bank case is not that two regions' observation names are untidy; it is that four entity names in the metadata carry a trailing space while every observation name is clean, so for two of them the metadata disagrees with the entity's own data. Both the skill and the new docstring now say so. The review also drew the boundaries the helper needs: it does not decode HTML entities, it should not be pointed at text you mean to keep line-broken, and it has no business in a build that republishes a source's free text verbatim — `airports` carries 154 internal double spaces that are real differences, not mess.
