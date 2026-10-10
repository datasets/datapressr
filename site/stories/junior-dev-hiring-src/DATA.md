# Data notes: junior software developer hiring

As of 10 October 2026.

## What I looked for

The question needs evidence that separates junior from senior developers, not only "tech jobs fell", and evidence on timing and geography to weigh the popular explanations.

## What I chose, and why

- **Indeed Hiring Lab job postings index** (CC BY 4.0). Daily, to 2 October 2026, open, comparable across countries. Gives the timing of the software postings slump against all postings, and lets the US be compared with five other countries. It has no seniority split.
- **Stanford Digital Economy Lab "Canaries" index for software developers by age** (ADP payroll data, vintage 17 September 2026, to August 2026). The best available junior-vs-senior evidence: millions of payroll records, six age bands. The underlying records are proprietary; the derived index is a public download with no stated licence.
- **CPS basic monthly microdata, January 2020 to September 2026** (public domain). The only open, public-domain source I could process that splits software developers by age. Used as an independent check on the Stanford pattern. It is small: about 30 to 45 employed software developers aged 22–25 a month. Starts in 2020 because CPS moved to the 2018 occupation codes then.
- **New York Fed recent graduates by major** (2024 ACS). Cross-section only: unemployment of computer science and computer engineering graduates against all majors. Cited as an attributed figure.

## What I could not get

- **BLS CPS annual table 11b** (employed persons by occupation and age) and other `bls.gov` tables: HTTP 403 to automated requests.
- **Census API** for CPS microdata: now requires a key. I used the bulk files instead.
- **The Stanford paper's underlying ADP data**: not public.
- **Indeed's seniority split** (entry, mid, senior shares of software postings): published in Hiring Lab articles, not in the open data. Quoted with attribution.
- **A by-major time series** from the New York Fed: only the latest year is published.
- **LinkedIn, Lightcast, Revelio, SignalFire** data on new-graduate hiring: proprietary.

## Vintages

| Source | Latest observation | Release |
|---|---|---|
| Indeed | 2 Oct 2026 | weekly refresh, retrieved 10 Oct 2026 |
| Stanford Canaries | Aug 2026 | vintage 17 Sep 2026 |
| CPS | Sep 2026 | monthly, retrieved 10 Oct 2026 |
| New York Fed | 2024 (by major); June 2026 (rates) | 4 Feb 2026 (by major); 6 Aug 2026 (rates) |
