# Structure eval, co2-monthly, round 1: skill vs no skill vs Codex

Date: 2026-10-10. Bead: `datapressr-8no.3`. Harness: `evals/` (design [`docs/plans/2026-10-09-story-harness.md`](../plans/2026-10-09-story-harness.md), structure checks in [`evals/README.md`](../../evals/README.md#structure-checks)). Raw results: `evals/ledger.jsonl` and `evals/runs/structure/co2-monthly/`; the generated tables are in [`evals/REPORT.md`](../../evals/REPORT.md) under "structure/co2-monthly". This note wraps that report: what the numbers mean, where the arms agree, and what to change.

## Setup

- Case `structure/co2-monthly`: turn the archived NOAA Mauna Loa monthly file into a structured dataset (`build.ts`, one CSV, `datapackage.json` at `status: structured`, `DECISIONS.md`). Inputs: the raw file at `e24166f` and the validator at `1c1b1eb` (repinned in this bead from `e24166f`, so writers can self-check values with the `datapressr-ck8` validator; decision for owner review). The oracle still scores 13/13.
- Arms, all blind-staged, fixed mode, no network:
  - **Claude + skill**: `claude-opus-5-5`, skill `structure` at tree `fbf4d07`.
  - **Claude, no skill**: same model, `--no-skill` (new in this bead): no `skills/` folder, the prompt's skill line dropped, `AGENTS.md` staged as usual. This is the realistic baseline, since `AGENTS.md` already carries the contract.
  - **Codex + skill**: `gpt-6-astra` (codex-cli 0.161.0), same skill tree.
- Canaries for both CLIs on the current recipe had passed earlier the same day (`20261010-0211-canary-claude-haiku-5-5-1`, `20261010-0212-canary-codex-gpt-6-luna-1`).
- No critic: the structure domain has no rubric yet (`datapressr-8no.4`), so only the 13 deterministic checks score.
- Caps: 30 USD total for the bead; each Claude run capped with the new `--max-usd 5` (so the worst case stayed under the total).

## Results

Complete runs only. Four Claude runs started in parallel at 02:55 to 02:56 UTC hit the subscription's five-hour usage limit (`api_error: usage_limit_reached`) and are flagged `failed` in the ledger (one skill run, three no-skill runs, one of them a 0.51 USD partial). They stay in the ledger and the report, but they are excluded here. The arms were re-run one at a time after the reset.

| Arm | Run | Checks failed | Cost USD | Minutes | Turns |
|---|---|---|---|---|---|
| Claude + skill | `20261010-0250-…-fbf4d07-1` | D11, D12 | 0.80 | 2.5 | 17 |
| Claude + skill | `20261010-0253-…-fbf4d07-1` | D8, D9, D10, D11, D12 | 0.85 | 2.7 | 15 |
| Claude + skill | `20261010-0519-…-fbf4d07-1` | D5, D8, D9, D10, D11, D12 | 0.85 | 2.6 | 19 |
| Claude, no skill | `20261010-0512-…-noskill-1` | D8, D9, D10, D11, D12 | 0.75 | 2.6 | 17 |
| Claude, no skill | `20261010-0514-…-noskill-1` | D8, D9, D10, D11, D12 | 0.68 | 2.3 | 15 |
| Claude, no skill | `20261010-0517-…-noskill-1` | D8, D9, D10, D11, D12 | 0.69 | 2.3 | 17 |
| Codex + skill | `20261010-0250-…-gpt-6-astra-fbf4d07-1` | D5, D11 | tokens | 2.1 | 11 |
| Codex + skill | `20261010-0256-…-gpt-6-astra-fbf4d07-1` | D5, D11 | tokens | 2.0 | 13 |
| Codex + skill | `20261010-0258-…-gpt-6-astra-fbf4d07-1` | D5, D11 | tokens | 2.6 | 16 |

Passes out of 13: Claude + skill 11, 8, 7; Claude without the skill 8, 8, 8; Codex + skill 11, 11, 11. Codex reports tokens, not money: about 220k to 277k input tokens per run (80 to 84% cached) and 5.0k to 5.8k output tokens.

**Spend.** 5.22 USD at list price for all Claude runs in the ledger, the failed and partial ones included (complete runs 0.68 to 0.85 USD each). That is 17% of the 30 USD cap. Wall clock was 2 to 3 minutes per run. The design's guess of 10 to 30 USD for two arms was about ten times too high.

**Leak flags.** Every Claude run is flagged `leaked`. On review, each hit is a false positive. Most are relative paths such as `../../../AGENTS.md`, run from a Bash cwd inside `datasets/climate-and-environment/co2-ppm/`, which resolve back into the workspace. The other two are Reads of the CLI's own persisted-output file under `~/.claude/projects/<workspace>/…/tool-results/`, which the deny rule refused ("File is in a directory that is denied by your permission settings"). The runs are used here and filed for a fix (`datapressr-9lc`). Codex runs had no hits.

## What the checks show

Every failure comes from five decisions. None of the failures is a broken build: D2, D3, D4, D6, D7 and D13 passed on all nine complete runs (offline build, byte-identical rebuild, clean validator with value checks, house CSV format, 821 rows, inputs untouched).

1. **Zero uncertainty next to a sentinel (D8, D9, D10).** In 1975-12 and 1984-04 the raw file has `unc = 0.00`, both in rows where `sdev` holds the `-9.99` sentinel. NOAA documents `-0.99` as the uncertainty sentinel, not zero. Claude blanked the zeros in 5 of 6 runs (skill 2 of 3, no skill 3 of 3), each time as a written decision. Codex kept them in 3 of 3, as the oracle does. This one choice accounts for every D8, D9 and D10 failure in the round.
2. **Monthly date form (D12).** Claude used one `date` column typed `yearmonth` (`YYYY-MM`) in 6 of 6 runs. Codex used `YYYY-MM-01` typed `date` in 3 of 3. `AGENTS.md` names `YYYY-MM-DD` and `YYYY` only. Both models said they were filling that gap.
3. **Licence name (D5).** NOAA gives use terms, not a licence. Claude invented a slug, `NOAA-GML-data-use`, in 5 runs and once used `Use of NOAA GML Data`; Codex used the header's own title, `USE OF NOAA GML DATA`, 3 of 3. The oracle uses `PDDL-1.0`. D5 passes only the hyphenated slug, because it is SPDX-shaped. `AGENTS.md`, though, allows "the license's own name and a link", so D5 is stricter than the convention it checks.
4. **Provenance header (D11), failed on all 9.** With the skill, both models wrote the source URL and the retrieval date at the top of `build.ts` (6 of 6) but no licence, which matches the skill's step 1 example exactly. Without the skill, Claude wrote none of the three (3 of 3); its header described what the script does instead.
5. **Licence check vs the "terms" wording (D11).** One Codex run wrote `// Terms: USE OF NOAA GML DATA`, which D11 does not recognise.

## Skill vs no skill

On the pass count, the skill arm does not beat the baseline: 7 to 11 passes with the skill, 8 every time without it. The difference between the arms is mostly one judgement call (point 1), and the skill does not settle that call. Where the skill does settle something, the runs show it:

- **Provenance header.** The skill arm wrote source URL and retrieval date in 3 of 3 runs, the baseline in 0 of 3. D11 hides this, because the licence line is missing in both arms.
- **Resource naming.** The skill arm named the resource `co2-ppm-monthly` in 3 of 3 runs, after the skill's `<thing>-<frequency>` pattern. The baseline used the source's `co2-mm-mlo` in 3 of 3.
- **Sentinel handling.** The skill arm used per-column sentinel lists, mostly by copying `num()` from the idioms module. The baseline did the same by hand. Both arms had it right in all runs (D9's sentinel half never failed).
- **Unsettled decisions.** The baseline recorded more of them: 17 to 18 items in `DECISIONS.md` against 12 to 15 with the skill. The skill settles a few things, and the rest are the same open questions.
- **Cost.** The skill arm cost about 0.15 USD more per run, for reading the skill and its references, and wrote longer builds (119 to 144 lines against 70 to 101).

The headline: on this source, with this model, `AGENTS.md` alone gets Claude to a valid, reproducible, validator-clean dataset. What separates runs is a handful of judgement calls that neither document settles, and the same model makes them the same way with or without the skill. The skill's measurable effects are the conventions it spells out (header, naming). That points to the edits below, not to a skill that is failing.

Codex with the skill scored best (11 of 13 on every run). It did so because it kept the zeros and used a full date. It was not more careful in general: its builds were shorter, and its licence form fails D5.

## Agreement across runs on DECISIONS.md items

Each cell counts the runs that made a choice, out of the arm's three.

| Decision | Claude + skill | Claude, no skill | Codex + skill | Oracle |
|---|---|---|---|---|
| Date form | `YYYY-MM` yearmonth 3/3 | `YYYY-MM` yearmonth 3/3 | `YYYY-MM-01` date 3/3 | `YYYY-MM-01` |
| `unc = 0.00` beside the sdev sentinel | blanked 2/3, kept 1/3 | blanked 3/3 | kept 3/3 | kept |
| Sentinels per column (`-1`, `-9.99`, `-0.99`) | 3/3 | 3/3 | 3/3 | yes |
| `decimal_date` kept | 3/3 | 3/3 | 3/3 (as `decimal_year`) | yes |
| `year`/`month` columns dropped | 3/3 | 3/3 | 3/3 | yes |
| Licence | slug `NOAA-GML-data-use` 2/3, `Use of NOAA GML Data` 1/3 | slug 3/3 | `USE OF NOAA GML DATA` 3/3 | `PDDL-1.0` |
| Interpolation or site flag column | none 3/3 | none 3/3 | none 3/3 | none |
| Numbers copied as the source's text (trailing zeros kept) | 3/3 | 3/3 | 3/3 | yes |
| Resource name | `co2-ppm-monthly` 3/3 | `co2-mm-mlo` 3/3 | `co2-monthly` 3/3 | `co2-monthly-mlo` |
| Mean column name | `co2_ppm` 2/3, `average_ppm` 1/3 | `co2_ppm` 3/3 | `average_ppm` 3/3 | `co2_ppm` |
| Copied `AGENTS.md` into the dataset dir | 3/3 | 3/3 | 3/3 | n/a |
| Adversarial review not run, and said so in `DECISIONS.md` | 2/3 | 3/3 | 2/3 | n/a |

High agreement within one model and low agreement across models marks a call that a document should settle. Here that means the date form, the zero-uncertainty rule and the licence form. Low agreement within one arm means the skill is ambiguous; in the Claude + skill arm that is the zero-uncertainty rule, and to a lesser degree the licence form and column names.

## Suggested edits (filed, not applied)

| Bead | Edit |
|---|---|
| `datapressr-n98` | `structure` skill, "Values that lie": blank only tokens the source documents as missing for that column; keep an implausible-looking value (a zero uncertainty) verbatim and flag it in the field description. Settles point 1. |
| `datapressr-2m5` | `AGENTS.md` data conventions and skill step 2: name the monthly date form (`YYYY-MM-01` typed `date`, or `YYYY-MM` typed `yearmonth` and relax D12). Owner decision. |
| `datapressr-368` | `structure` skill: one rule for a licence with no SPDX id (the terms' own title, a link to where they are stated, a one-line summary), and when a public-domain id may be asserted for US federal data. |
| `datapressr-nda` | `structure` skill step 1: add `// License:` to the header example, or drop the licence from D11. |
| `datapressr-gap` | Evals: D5 accepts a non-SPDX licence name with a path (as `AGENTS.md` allows), and D11 accepts "terms". |
| `datapressr-6lx` | `AGENTS.md`: the dataset part tells readers to copy "everything above the repo-only marker below", but the copy contains no marker. Writers in every arm copied `AGENTS.md` into the dataset directory, and several Claude runs spent turns searching for the marker. |
| `datapressr-9lc` | Evals harness: leak-scan false positives (relative paths, denied Reads); the CLI writing per-run project dirs into the real `~/.claude/projects`; stop repeats on `usage_limit_reached`; the misleading "not scored (--no-critic)" message when no rubric exists. |

## Caveats

- n = 3 per arm, one case, one source that the skill names as its own worked example. The skill cannot point the writer at the published `co2-ppm` build, because the workspace has no network. A second case is needed before reading anything into skill vs no skill beyond this source.
- The pass count is only as good as the checks. Two of the five failure causes (D5's SPDX shape, and D12 against an unsettled convention) are partly the checker's strictness. Fix them (`datapressr-gap`, `datapressr-2m5`) and re-run `check --all` before round 2.
- No judged layer yet (`datapressr-8no.4`). Field descriptions, honesty about interpolation and build readability are not scored.
- After the edits above, round 2 should repeat the three arms on the new skill tree, run the `--no-skill` arm again so the baseline is as fresh as the skill arm, and pair the skill trees once a structure rubric exists.
