# Independent France public finances review
Revision: 47e8631072215adb258bd42bf7697790c8910743. Independent agent, no hand in build. 2026-10-08.
- SHA256 datapackage.json: 6a8ee76d3a1cc4eacd74bb468a4341fc6971833e2aeb523f381028a558558a8e
- SHA256 build.ts: 390cf7dd3f139afb4d4de34043a85496ad5a82ed5ed677a3c01058c864faefd4
- SHA256 data/fiscal-accounts.csv: 5d03664891a916ada144ef29895f6e8940ad254ad3e56c00d7c014454a9b0733
- SHA256 data/quarterly-debt.csv: bde7e6e1f2663b9156bf72b1d7f71a089929f679c7d888c91cf436dd5e0d2307
- SHA256 data/spending-functions.csv: 2387b6d41aa566a863b0e761889a99cb9acda23ed020e06e228972b390f9a494

## Independent derivations and names

### fiscal-accounts: 7650 rows
- {'freq': 'A', 'sector': 'S13', 'unit': 'MIO_EUR', 'geo': 'EU27_2020', 'time': '2020', 'na_item': 'B9', 'cofog99': None}: source fiscal.json JSON /value/45 = -908997.9; CSV = -908997.9; matches.
- {'freq': 'A', 'sector': 'S13', 'unit': 'MIO_EUR', 'geo': 'EU27_2020', 'time': '2025', 'na_item': 'TE', 'cofog99': None}: source fiscal.json JSON /value/3365 = 9317906.5; CSV = 9317906.5; matches.
- {'freq': 'A', 'sector': 'S13', 'unit': 'MIO_EUR', 'geo': 'DE', 'time': '1975', 'na_item': 'B9', 'cofog99': None}: source fiscal.json JSON /value/51 = None; CSV = empty; matches.
- {'freq': 'A', 'sector': 'S13', 'unit': 'PC_GDP', 'geo': 'IT', 'time': '2025', 'na_item': 'TR', 'cofog99': None}: source fiscal.json JSON /value/7649 = 48.1; CSV = 48.1; matches.
- {'freq': 'A', 'sector': 'S13', 'unit': 'MIO_EUR', 'geo': 'DE', 'time': '2025', 'na_item': 'B9', 'cofog99': None}: source fiscal.json JSON /value/101 = -119147.0; CSV = -119147; matches.
- Distinct country_code: ["DE", "ES", "EU27_2020", "FR", "IT"]
- Distinct country: ["European Union - 27 countries (from 2020)", "France", "Germany", "Italy", "Spain"]
- Distinct indicator: ["B9", "D1PAY", "D2REC", "D3PAY", "D41PAY", "D5REC", "D61REC", "D62PAY", "D632PAY", "D91REC", "D995REC", "P2", "P51G", "TE", "TR"]
- Distinct indicator_label: ["Capital taxes, revenue", "Capital transfers from general government to relevant sectors representing taxes and social contributions assessed but unlikely to be collected", "Compensation of employees, expenditure", "Current taxes on income, wealth, etc., revenue", "Gross fixed capital formation", "Interest, expenditure", "Intermediate consumption", "Net lending (+)/net borrowing (-)", "Net social contributions, revenue", "Social benefits other than social transfers in kind, expenditure", "Social transfers in kind, purchased market production, expenditure", "Subsidies, expenditure", "Taxes on production and imports, revenue", "Total general government expenditure", "Total general government revenue"]
- Distinct unit: ["MIO_EUR", "PC_GDP"]
- Distinct status_flag: ["", "m"]
- Distinct source_updated: ["2026-07-21T11:00:00+0200"]

### spending-functions: 5760 rows
- {'freq': 'A', 'sector': 'S13', 'unit': 'PC_GDP', 'geo': 'FR', 'time': '1995', 'na_item': 'TE', 'cofog99': 'GF0105'}: source functions.json JSON /value/3101 = 0.0; CSV = 0; matches.
- {'freq': 'A', 'sector': 'S13', 'unit': 'MIO_EUR', 'geo': 'FR', 'time': '2024', 'na_item': 'TE', 'cofog99': 'TOTAL'}: source functions.json JSON /value/34 = 1671793.8; CSV = 1671793.8; matches.
- {'freq': 'A', 'sector': 'S13', 'unit': 'MIO_EUR', 'geo': 'FR', 'time': '1990', 'na_item': 'TE', 'cofog99': 'GF01'}: source functions.json JSON /value/36 = None; CSV = empty; matches.
- {'freq': 'A', 'sector': 'S13', 'unit': 'PC_GDP', 'geo': 'FR', 'time': '2025', 'na_item': 'TE', 'cofog99': 'TOTAL'}: source functions.json JSON /value/2915 = None; CSV = empty; matches.
- {'freq': 'A', 'sector': 'S13', 'unit': 'MIO_EUR', 'geo': 'FR', 'time': '2024', 'na_item': 'TE', 'cofog99': 'GF01'}: source functions.json JSON /value/70 = 181103.2; CSV = 181103.2; matches.
- Distinct function_code: ["GF01", "GF0101", "GF0102", "GF0103", "GF0104", "GF0105", "GF0106", "GF0107", "GF0108", "GF02", "GF0201", "GF0202", "GF0203", "GF0204", "GF0205", "GF03", "GF0301", "GF0302", "GF0303", "GF0304", "GF0305", "GF0306", "GF04", "GF0401", "GF0402", "GF0403", "GF0404", "GF0405", "GF0406", "GF0407", "GF0408", "GF0409", "GF05", "GF0501", "GF0502", "GF0503", "GF0504", "GF0505", "GF0506", "GF06", "GF0601", "GF0602", "GF0603", "GF0604", "GF0605", "GF0606", "GF07", "GF0701", "GF0702", "GF0703", "GF0704", "GF0705", "GF0706", "GF08", "GF0801", "GF0802", "GF0803", "GF0804", "GF0805", "GF0806", "GF09", "GF0901", "GF0902", "GF0903", "GF0904", "GF0905", "GF0906", "GF0907", "GF0908", "GF10", "GF1001", "GF1002", "GF1003", "GF1004", "GF1005", "GF1006", "GF1007", "GF1008", "GF1009", "TOTAL"]
- Distinct function_name: ["Agriculture, forestry, fishing and hunting", "Basic research", "Broadcasting and publishing services", "Civil defence", "Communication", "Community development", "Cultural services", "Defence", "Defence n.e.c.", "Economic affairs", "Economic affairs n.e.c.", "Education", "Education n.e.c.", "Education not definable by level", "Environmental protection", "Environmental protection n.e.c.", "Executive and legislative organs, financial and fiscal affairs, external affairs", "Family and children", "Fire-protection services", "Foreign economic aid", "Foreign military aid", "Fuel and energy", "General economic, commercial and labour affairs", "General public services", "General public services n.e.c.", "General services", "Health", "Health n.e.c.", "Hospital services", "Housing", "Housing and community amenities", "Housing and community amenities n.e.c.", "Housing development", "Law courts", "Medical products, appliances and equipment", "Military defence", "Mining, manufacturing and construction", "Old age", "Other industries", "Outpatient services", "Police services", "Pollution abatement", "Post-secondary non-tertiary education", "Pre-primary and primary education", "Prisons", "Protection of biodiversity and landscape", "Public debt transactions", "Public health services", "Public order and safety", "Public order and safety n.e.c.", "R&D Defence", "R&D Economic affairs", "R&D Education", "R&D Environmental protection", "R&D General public services", "R&D Health", "R&D Housing and community amenities", "R&D Public order and safety", "R&D Recreation, culture and religion", "R&D Social protection", "Recreation, culture and religion", "Recreation, culture and religion n.e.c.", "Recreational and sporting services", "Religious and other community services", "Secondary education", "Sickness and disability", "Social exclusion n.e.c.", "Social protection", "Social protection n.e.c.", "Street lighting", "Subsidiary services to education", "Survivors", "Tertiary education", "Total", "Transfers of a general character between different levels of government", "Transport", "Unemployment", "Waste management", "Waste water management", "Water supply"]
- Distinct level: ["0", "1", "2"]
- Distinct parent_code: ["", "GF01", "GF02", "GF03", "GF04", "GF05", "GF06", "GF07", "GF08", "GF09", "GF10", "TOTAL"]
- Distinct unit: ["MIO_EUR", "PC_GDP"]
- Distinct status_flag: ["", "p"]
- Distinct source_updated: ["2026-09-16T23:00:00+0200"]

### quarterly-debt: 106 rows
- 2000-Q1: insee-quarterly-debt.html tables "Dette au sens de Maastricht et dette nette" row 2000-T1 columns gross/net, ratio table row 2000-T1: source [854.8, 724.0, 60.5]; CSV [854.8, 724.0, 60.5]; matches.
- 2026-Q2: insee-quarterly-debt.html tables "Dette au sens de Maastricht et dette nette" row 2026-T2 columns gross/net, ratio table row 2026-T2: source [3595.5, 3366.8, 119.0]; CSV [3595.5, 3366.8, 119.0]; matches.
- 2001-Q1: insee-quarterly-debt.html tables "Dette au sens de Maastricht et dette nette" row 2001-T1 columns gross/net, ratio table row 2001-T1: source [875.5, 760.4, 58.7]; CSV [875.5, 760.4, 58.7]; matches.
- Distinct source_release_date: ["2026-09-29"]

## Gates and mutations
Baseline validator: ✓ no errors

0 error(s), 0 warning(s)
Offline double build: identical hashes to each other and committed CSV files: {'fiscal-accounts.csv': '5d03664891a916ada144ef29895f6e8940ad254ad3e56c00d7c014454a9b0733', 'quarterly-debt.csv': 'bde7e6e1f2663b9156bf72b1d7f71a089929f679c7d888c91cf436dd5e0d2307', 'spending-functions.csv': '2387b6d41aa566a863b0e761889a99cb9acda23ed020e06e228972b390f9a494'}
Root npm test: 172 passed, 0 failed; /tmp/france-root-tests.log. Dataset declares no additional test script.
- label: build exit 0; validator exit 0; root test exit 0; NOT CAUGHT: published Defence}}.
- drop-zero: build exit 1; validator exit 0; root test exit 0; AssertionError [ERR_ASSERTION]: COFOG snapshot observation count changed; review before accepting a refresh
- truncate: build exit 1; validator exit 0; root test exit 0; AssertionError [ERR_ASSERTION]: Quarterly coverage changed: review the snapshot and anchors
- swap-columns: build exit 1; validator exit 0; root test exit 0; AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:

## Additional per-unit extrema and literal anchors
- fiscal-accounts {'freq': 'A', 'unit': 'MIO_EUR', 'sector': 'S13', 'geo': 'EU27_2020', 'time': '2020', 'na_item': 'B9', 'cofog99': None}: archive/fiscal.json /value/45 = -908997.9; CSV -908997.9; matches.
- fiscal-accounts {'freq': 'A', 'unit': 'MIO_EUR', 'sector': 'S13', 'geo': 'EU27_2020', 'time': '2025', 'na_item': 'TE', 'cofog99': None}: archive/fiscal.json /value/3365 = 9317906.5; CSV 9317906.5; matches.
- fiscal-accounts {'freq': 'A', 'unit': 'PC_GDP', 'sector': 'S13', 'geo': 'ES', 'time': '2012', 'na_item': 'B9', 'cofog99': None}: archive/fiscal.json /value/3964 = -11.5; CSV -11.5; matches.
- fiscal-accounts {'freq': 'A', 'unit': 'PC_GDP', 'sector': 'S13', 'geo': 'FR', 'time': '2020', 'na_item': 'TE', 'cofog99': None}: archive/fiscal.json /value/7338 = 61.7; CSV 61.7; matches.
- fiscal-accounts {'freq': 'A', 'unit': 'PC_GDP', 'sector': 'S13', 'geo': 'FR', 'time': '2025', 'na_item': 'B9', 'cofog99': None}: archive/fiscal.json /value/4028 = -5.1; CSV -5.1; matches.
- fiscal-accounts {'freq': 'A', 'unit': 'MIO_EUR', 'sector': 'S13', 'geo': 'FR', 'time': '2025', 'na_item': 'TE', 'cofog99': None}: archive/fiscal.json /value/3518 = 1714137.2; CSV 1714137.2; matches.
- fiscal-accounts {'freq': 'A', 'unit': 'MIO_EUR', 'sector': 'S13', 'geo': 'FR', 'time': '2025', 'na_item': 'TR', 'cofog99': None}: archive/fiscal.json /value/3773 = 1561626.1; CSV 1561626.1; matches.
- spending-functions {'freq': 'A', 'unit': 'MIO_EUR', 'sector': 'S13', 'geo': 'FR', 'time': '1995', 'na_item': 'TE', 'cofog99': 'GF0108'}: archive/functions.json /value/329 = 0.0; CSV 0; matches.
- spending-functions {'freq': 'A', 'unit': 'MIO_EUR', 'sector': 'S13', 'geo': 'FR', 'time': '2024', 'na_item': 'TE', 'cofog99': 'TOTAL'}: archive/functions.json /value/34 = 1671793.8; CSV 1671793.8; matches.
- spending-functions {'freq': 'A', 'unit': 'PC_GDP', 'sector': 'S13', 'geo': 'FR', 'time': '1995', 'na_item': 'TE', 'cofog99': 'GF0105'}: archive/functions.json /value/3101 = 0.0; CSV 0; matches.
- spending-functions {'freq': 'A', 'unit': 'PC_GDP', 'sector': 'S13', 'geo': 'FR', 'time': '2020', 'na_item': 'TE', 'cofog99': 'TOTAL'}: archive/functions.json /value/2910 = 61.7; CSV 61.7; matches.
- spending-functions {'freq': 'A', 'unit': 'MIO_EUR', 'sector': 'S13', 'geo': 'FR', 'time': '2024', 'na_item': 'TE', 'cofog99': 'GF10'}: archive/functions.json /value/2554 = 693028.8; CSV 693028.8; matches.

## Anchoring
Single JSON-stat layout per JSON source; one HTML table layout across 2000-Q1–2026-Q2 (separate amounts and ratios tables). Literal source anchors present at build.ts:85–87 (annual fiscal), :110 (COFOG), :134–135 (quarterly debt). Reviewer independently verified those literals above. No missing layout-era anchor found.

## Names read
All distinct categorical values printed above were read; no malformed labels in the committed CSV files. Periods/dates were treated as temporal keys, not category labels.

## Verdict: findings (not APPROVED)
1. `datasets/france-public-finances/build.ts:95` (also :111–112): category labels other than GF07/GF10 have no semantic guard. A scratch mutation from GF02="Defence" to "Defence}}", with refreshed snapshot bytes/SHA-256, succeeds in the build, validator and root test suite and publishes malformed function names. Add a checked-in independently reviewed code-to-label contract for every expected COFOG code, and regression coverage demonstrating this mutation fails. Apply the same protection to fiscal indicator and geography labels, which currently have similarly selective checks at :88–89. This is a demonstrated resilience finding, not a mismatch in the current dataset. No uncertainty about reproduction.

All mutations were isolated in /tmp/france-review-scratch, one at a time from original files. Raw-input mutation manifests were refreshed to test semantics beyond hashes. Validator success following failed builds validates the previous scratch CSV, not rejected input; the build is the effective guard. Root tests run against the repository (no dataset-specific test script exists), and their success does not itself validate scratch data. Logs: /tmp/france-mutation-{label,drop-zero,truncate,swap-columns}.log; derivation code /tmp/france-review.py and /tmp/france-extra.py; mutations /tmp/france-mutations.py. Original repository source/data files were not edited.
