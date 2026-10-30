#!/usr/bin/env python3
"""Reproduce outline arithmetic from the frozen C3S monthly CSV; standard library only."""
import calendar
import csv
from collections import defaultdict
from decimal import Decimal, getcontext
import hashlib
import json
from pathlib import Path

getcontext().prec = 30
HERE = Path(__file__).resolve().parent
SOURCE = HERE / "global-monthly.csv"
EXPECTED_SHA256 = "b31271d6984e7e4cc02bedffd268e68d7b5cda571fb521dcedf435c2eca5407e"
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == EXPECTED_SHA256
fields = ["2t", "clim_91-20", "ano_91-20", "offset_pi", "ano_pi"]
rows = list(csv.DictReader(line for line in SOURCE.read_text().splitlines() if not line.startswith("#")))
assert list(rows[0]) == ["month", *fields]
assert len(rows) == 1041
grouped = defaultdict(list)
for index, row in enumerate(rows):
    year, month, day = map(int, row["month"].split("-"))
    assert day == 1
    assert (year, month) == (1940 + index // 12, 1 + index % 12)
    row.update(year=year, number=month, days=calendar.monthrange(year, month)[1])
    for field in fields:
        row[field] = Decimal(row[field])
        assert row[field].is_finite()
    assert abs(row["2t"] - row["clim_91-20"] - row["ano_91-20"]) <= Decimal(".0001")
    assert row["ano_91-20"] + row["offset_pi"] == row["ano_pi"]
    grouped[year].append(row)
assert all(len(grouped[y]) == 12 for y in range(1940, 2026))
assert len(grouped[2026]) == 9
assert all(len({r["clim_91-20"] for r in rows if r["number"] == m}) == 1 for m in range(1, 13))
assert all(len({r["offset_pi"] for r in rows if r["number"] == m}) == 1 for m in range(1, 13))

def mean(rs, mode, field="ano_91-20"):
    weights = [Decimal(r["days"] if mode == "days" else 1) for r in rs]
    return sum(r[field] * w for r, w in zip(rs, weights)) / sum(weights)

result = {"source_sha256": EXPECTED_SHA256,
          "checks": {"rows": len(rows), "first": rows[0]["month"], "last": rows[-1]["month"],
                     "missing_months": 0, "duplicate_months": 0, "nonfinite_values": 0,
                     "absolute_minus_climatology_max_rounding_difference": max(abs(r["2t"] - r["clim_91-20"] - r["ano_91-20"]) for r in rows)},
          "units": "degrees Celsius anomaly relative to 1991-2020, unless explicitly stated",
          "modes": {}}
for mode in ["months", "days"]:
    ytd = {y: mean([r for r in rs if r["number"] <= 9], mode) for y, rs in grouped.items()}
    annual = {y: mean(rs, mode) for y, rs in grouped.items() if len(rs) == 12}
    q4 = {y: mean([r for r in rs if r["number"] >= 10], mode) for y, rs in grouped.items() if len(rs) == 12}
    target = annual[2024]
    if mode == "months":
        w_first, w_last, w_year = map(Decimal, [9, 3, 12])
    else:
        w_first, w_last, w_year = map(Decimal, [273, 92, 365])
    threshold = (target * w_year - ytd[2026] * w_first) / w_last
    max_year = max(q4, key=q4.get)
    repeat = (ytd[2026] * w_first + q4[2023] * w_last) / w_year
    # Source rows are rounded to 0.0001. This is propagation of rounding,
    # not a confidence interval for the temperatures or reanalysis.
    rounding = (Decimal(".00005") * w_year + Decimal(".00005") * w_first) / w_last
    cumulative = [{"year": y, "through_month": m,
                   "value": mean([r for r in grouped[y] if r["number"] <= m], mode)}
                  for y in [2023, 2024, 2025, 2026] for m in range(1, len(grouped[y]) + 1)]
    scenario = [{"through_month": m, "value": mean(grouped[2026] + [r for r in grouped[2023] if 10 <= r["number"] <= m], mode)} for m in [10, 11, 12]]
    # October-December have identical day counts in 2023 and 2026.
    result["modes"][mode] = {
        "annual_2024": target, "ytd_2026": ytd[2026],
        "ytd_ranking_top6": [{"year": y, "value": v} for y, v in sorted(ytd.items(), key=lambda p: p[1], reverse=True)[:6]],
        "q4_tie_threshold": threshold, "q4_overtake_condition": "strictly greater than the unrounded tie threshold",
        "threshold_input_rounding_bound": rounding,
        "q4_record_year": max_year, "q4_record": q4[max_year], "threshold_minus_q4_record": threshold - q4[max_year],
        "repeat_q4_2023_annual_2026": repeat, "repeat_q4_2023_shortfall_vs_2024": target - repeat,
        "annual_2024_preindustrial_offset_applied": target + Decimal(".88"),
        "repeat_annual_2026_preindustrial_offset_applied": repeat + Decimal(".88"),
        "q4_history": [{"year": y, "value": v} for y, v in q4.items()],
        "cumulative_recent": cumulative, "scenario_cumulative_2026_repeat_2023_q4": scenario,
        "annual_complete_ranking_top5": [{"year": y, "value": v} for y, v in sorted(annual.items(), key=lambda p: p[1], reverse=True)[:5]],
    }

def convert(value):
    if isinstance(value, Decimal):
        return float(value)
    raise TypeError(type(value).__name__)

output = json.dumps(result, indent=2, default=convert) + "\n"
(HERE / "statistics.json").write_text(output)
print(json.dumps({"checks": result["checks"], "modes": {mode: {k: v for k, v in data.items() if k not in ["q4_history", "cumulative_recent", "scenario_cumulative_2026_repeat_2023_q4"]} for mode, data in result["modes"].items()}}, indent=2, default=convert))
