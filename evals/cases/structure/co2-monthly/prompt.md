# Task

Turn the archived NOAA Mauna Loa monthly CO2 file into a structured, publishable dataset.

Use the `structure` skill in `skills/structure/` and the conventions in `AGENTS.md`.

## What you have

- The dataset directory is `datasets/climate-and-environment/co2-ppm/` (dataset name `co2-ppm`). It holds only the raw snapshot, `archive/co2_mm_mlo.csv`, and the validator, `scripts/validate-datapackage.mjs`. There is no `datapackage.json` yet.
- Source: NOAA Global Monitoring Laboratory, Trends in Atmospheric Carbon Dioxide, Mauna Loa monthly mean, `https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_mm_mlo.csv` (landing page `https://gml.noaa.gov/ccgg/trends/data.html`). The snapshot was retrieved on 2026-08-30. The terms of use are quoted in the file's own header.
- There is no network access. Do not try to re-download the source: the snapshot is the input.

## What to produce

All in `datasets/climate-and-environment/co2-ppm/`:

- `build.ts`: reads `archive/co2_mm_mlo.csv` and nothing else, writes the cleaned monthly series to `data/` (one CSV), runs offline with `node build.ts`, and gives the same bytes every time it runs.
- `data/*.csv`: the output of `build.ts`, committed.
- `datapackage.json`: the dataset's metadata, at `status: "structured"`, meeting the definition of done in `AGENTS.md`.
- `DECISIONS.md`: a list of every decision you made that neither the skill nor `AGENTS.md` settled for you. One item per decision: what you decided, the alternatives, and why. Write "none" if there were none.

Do not edit or delete anything in `archive/` or `scripts/`. Skip the parts of the workflow that need things this workspace does not have: no README, no DataHub publishing, no Beads, no changelog. Commit your work in this repository when you are done.
