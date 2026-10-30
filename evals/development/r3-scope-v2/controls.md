# Exposed-development R3 controls

These are authored review anchors, not new writer outputs or an independently validated diagnostic. Bad passages below are constructed reductions of exposed failure modes, not verbatim historical writer quotations. Improved passages are proposed repairs. Accept/reject labels express intended semantic judgments; an independent reviewer must assess them. None is a fresh-case control. No external source has been refreshed.

## 1. Amount/share — preserve the existing positive

**Evidence:** baseline `skills/story/references/voice-guide.md`, explicitly synthetic.

**Old/bad:** “Spending rose from £100 to £120. Its share of the economy fell from 10% to 8%.” These facts are compatible, but leave their connection to the reader.

**Improved/accept (original unchanged):** “Spending rose from £100 to £120, but the economy grew faster, from £1,000 to £1,500. That larger denominator means spending increased in pounds while falling from 10% to 8% of the economy.”

**Reject:** “Spending fell in real terms because its share fell.” The figures are nominal; no price index is supplied. Arithmetic: 100/1,000 = 10%; 120/1,500 = 8%; nominal spending grows 20%, the economy 50%. The explanation reconciles measures without asserting what caused either increase.

## 2. Debt ratio — an identity is not a full causal account

**Evidence:** `reference-led-v1/decisions.md`, R3; `readings/Mb8941a-stage3.json`, corrections and debt anchors; `readings/M1d3194-stage3.json`, G2. All paths in this file refer to `evals/experiments/story-quality/reference-led-v1/` unless stated otherwise.

**Bad/reject:** “Deficits explain the rise in debt-to-GDP: each year's shortfall adds to the ratio.” This substitutes a stock/flow link for a complete ratio explanation and makes an unconditional direction claim.

**Improved/accept:** “Debt rose from €2,663.9 billion at end-2020 to €3,103.2 billion at end-2023, yet its GDP share fell from 114.9% to 109.5%. The GDP denominator grew faster than the debt stock. Persistent deficits help explain borrowing needs; changes in GDP and stock-flow adjustments are also needed to account fully for the debt ratio.”

**Check:** implied GDP is approximately €2,318.5 billion then €2,834.0 billion, derived from rounded ratios, not independent measurements. Debt growth is about 16.5%, implied nominal GDP growth about 22.2%. This is a useful accounting explanation of the apparent contradiction, not a causal decomposition. No inference about inflation-adjusted debt follows.

## 3. Population — keep the verified mechanism and repair its scope

**Evidence:** `readings/Mb8941a-stage3.json`, corrections/G1/G2; `readings/M1d3194-stage3.json`, G1 and `source_excerpts["insee-annual-accounts.html"]`, excerpt keyed `11,2` containing the interest explanation. These are exposed v1 review evidence, not a new source audit.

**Bad/reject:** “General-government interest spending rose 14.3% in 2025 after 13.2% in 2024, because debt and rates rose.” Those rates refer to central government; a correct mechanism does not rescue a wrong population.

**Improved/accept:** “INSEE reports that general-government interest spending, excluding the SIFIM correction, rose 11.2% in 2025 after 13.9% in 2024. It attributes the increase to a larger debt stock and interest-rate rises since 2022, despite easing inflation.”

**Why accept:** This keeps a useful external explanation at the verified source's population and accounting convention. It does not claim the chart independently identifies the mechanism or that these growth rates describe every interest series. For a publication, link the pinned INSEE source; this development control points to the existing archived-source excerpt rather than inventing a URL. “SIFIM” is the source's financial-intermediation adjustment; retain the accounting convention in a note if the sentence is shortened for readers.

**Additional positive/accept:** “Central-government interest spending rose 14.3% in 2025 after 13.2% in 2024.” This is supported as a labelled subset. Reject promoting it to the whole of government or comparing it silently to a series with a different adjustment convention.

## 4. Peer comparison — useful implication without an adequacy judgment

**Evidence:** `readings/Mb8941a-stage3.json`, peer calculations; `readings/M1d3194-stage3.json`, G2. Use the single peer-table vintage here; do not mix it with the slightly different INSEE annual ratios in source excerpts.

**Bad/reject:** “France collects more than its peers, so low revenue cannot explain its deficit.” A relative level does not establish adequacy or exclude revenue-side contributions.

**Improved/accept:** “France's revenue was 52.1% of GDP in 2025, above the EU's 46.4%. Its spending was higher still, at 57.2%, leaving a deficit of 5.1% of GDP. High revenue relative to the EU therefore coexisted with a shortfall against France's own spending.”

**Check:** 57.2 − 52.1 = 5.1 percentage points of GDP. This gives the reader a concrete accounting payoff while leaving the choice of tax or spending policy unresolved. Reject “revenue caused spending” as an unsupported causal addition.

## 5. Spot/futures — preserve the observation, require the actual link

**Evidence:** `readings/M948761-stage3.json`, G1/G2, preliminary answers and calculations; `readings/Mee832a-stage3.json`, G1/G2. Both retain unresolved external mechanism verification. No oil mechanism here is relabelled verified.

**Bad/reject:** “The May futures contract expired, forcing the charted daily spot price to −$36.98 a barrel.” The observation is a spot quotation; an expiry mechanism for a futures contract is not itself evidence explaining that quotation.

**Improved/accept:** “The WTI spot quotation at Cushing fell to −$36.98 a barrel on 20 April 2020 and returned to $8.91 the next day. Brent remained positive on 20 April. The supplied price series establish this contrast; the proposed expiry explanation still needs evidence connecting the futures contract to the spot quotation.”

**Reject even with attribution:** “According to EIA, expiry caused this spot quotation,” when only an unchecked source link is supplied. Naming EIA is not the missing verification.

**Conditional positive (synthetic source condition, not a historical finding):** If a checked source explicitly explains how delivery and storage constraints transmitted futures distress to this spot quotation at this time, retain a plain explanation of that process, name and link that source, and separate its account from what the price series measures. Do not demand that a descriptive price CSV identify causality itself. The unconditional verified external-mechanism positive is control 3, not this conditional oil case.

## 6. Units and averaging — informative relationship without invented cause

**Evidence:** `readings/M948761-stage3.json`, calculations: daily −$36.98, week mean $3.324, April mean about $16.548; reported averages $3.32 and $16.55, nominal US dollars per barrel.

**Bad/reject:** “Oil was negative throughout April, averaging −$36.98.” This swaps one observation for a monthly mean and broadens WTI to oil generally.

**Improved/accept:** “The negative WTI day disappears in the longer averages: the week averaged $3.32 a barrel and April $16.55. A positive average therefore does not rule out a negative daily quotation.”

**Check:** This explains what averaging conceals. It does not attribute the recovery to expiry, assert that every day was positive, or treat the week and month as independent mechanisms. Reject a demand for a generic causal caveat after this self-contained statistical comparison.

## Review criteria

For each control, independently check the stated population, period, units, denominator/series and inference against the cited exposed evidence. Accept useful accounting links and verified attributed mechanisms; reject the stronger scope/causality negatives even when readable. Assess whether the candidate invites explanation rather than ritual disclaimers. These checks do not measure writer compliance, reader comprehension, preference, or transfer. Final diagnostic preparation and fresh-case experiment design remain separate tasks.
