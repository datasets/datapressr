# Dataset-page charts — `views` in `datapackage.json`

Packaged with the `enrich` skill so it works from an installed copy. Mirrors the DataPressr `AGENTS.md` → "Adding charts (views)".

Add a `views` array to `datapackage.json` to render charts on the dataset page (DataHub renders these directly; no build step, no committed image):

```json
{
  "views": [
    {
      "name": "gdp-over-time",
      "title": "GDP Over Time",
      "specType": "simple",
      "resources": ["gdp"],
      "spec": {
        "type": "line",
        "group": "year",
        "series": ["gdp_usd"]
      }
    }
  ]
}
```

- Supported chart types: `line`, `bar`, `lines-and-points`.
- Only CSV and GeoJSON resources can be visualised.
- `group` is the x-axis field; `series` is the list of y-axis fields, all from the resource(s) named in `resources`.

## Checks

- **The title must match what is plotted.** A view titled "A vs B" that lists only resource A is a broken promise — the oil-prices trial found exactly this. If two resources can't share one simple view, make two views, one per resource.
- Every field in `group` and `series` exists in the resource's schema.
- One to three views; the headline series first.

## Limits

`views` is a DataHub feature. On a host that doesn't render it, the dataset page simply shows no chart — `SUMMARY.md` must stand on its own without them. `views` cannot annotate or direct-label; an annotated chart is a story's job (the `story` skill's Observable Plot charts).
