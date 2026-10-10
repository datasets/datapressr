# Data choices — birth-rates story

**Searched.** UN World Population Prospects 2024 (the brief's first choice); World Bank WDI `SP.DYN.TFRT.IN` (its second); Our World in Data's long-run fertility series (`children-born-per-woman`, which splices Human Fertility Database estimates before 1950 onto WPP 2024).

**Chose WPP 2024, alone, for every charted number.** It covers all 237 countries and areas every year from 1950 with no gaps, so a yearly count of places below 2.1 has a constant denominator; it has births and population on the same basis, which the regional share of births needs; it is the source WDI itself draws on for most countries; and its licence (CC BY 3.0 IGO) is clear. Vintage: the 2024 revision, published July 2024. Its 1950–2023 values are estimates (for recent years, partly modelled ahead of final national figures); 2024 onwards are projections and are not used.

**World Bank as a check, not a source.** WDI 2010 and 2023 values for 18 places (16 countries, the world and sub-Saharan Africa) agree with WPP to within 0.07 children per woman (largest gaps: Hungary 2023, 1.49 in WPP vs 1.55, a gap of 0.064; Germany 2023, 1.44 vs 1.39). The world and regional aggregates are computed differently by the two sources (world 2023: WPP 2.25, WDI 2.20). WDI also has 2024 national figures (South Korea 0.75, up from 0.72; Hungary 1.41, down from 1.55), outside the story's window and quoted only as attributed caveats.

**Not used: OWID's long-run series.** Before 1950 it has only 14 countries, from 1891 at the earliest (Sweden 4.1 in 1891), which is not enough to time Europe's own fall from five children per woman. Splicing it in would mean comparing durations measured from different starting levels, so the story makes no historical-Europe comparison.

**Definitions used.** Below replacement: `tfr < 2.1` (strict). Robustness: WPP's net reproduction rate below 1 (not extracted; checked once on the full file) gives the same count, 130, in 2023, but not the same set: Indonesia and Myanmar are in, Guadeloupe and the US Virgin Islands out (confirmed by the outline reviewer on the full file). "Ultra-low": `tfr < 1.4`, the UN Summary of Results' term. Speed: for countries with ≥ 1 million people in 2023, last year with `tfr ≥ 5` before the first year with `tfr < 2.1`.

**Size.** The full UN file is 16.6 MB gzipped (41 MB, 84,360 rows, 1950–2100); the committed extracts are about 0.7 MB.
