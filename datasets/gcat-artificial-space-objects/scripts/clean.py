#!/usr/bin/env python3
"""
Clean GCAT satcat.tsv → satcat.csv

Downloads: https://planet4589.org/space/gcat/tsv/cat/satcat.tsv
Produces: data/satcat.csv with selected, clean columns.
"""
import csv
import re
import sys
from pathlib import Path

RAW = Path("data/satcat_raw.tsv")
OUT = Path("data/satcat.csv")

MONTH_MAP = {
    "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04",
    "May": "05", "Jun": "06", "Jul": "07", "Aug": "08",
    "Sep": "09", "Oct": "10", "Nov": "11", "Dec": "12",
}

def parse_date(s):
    """Convert GCAT vague date string to YYYY-MM-DD (best effort)."""
    s = s.strip().rstrip("?").strip()
    if not s or s == "-":
        return ""
    # Format: "1957 Oct  4"
    m = re.match(r"(\d{4})\s+([A-Za-z]+)\s+(\d{1,2})", s)
    if m:
        y, mon, d = m.groups()
        mm = MONTH_MAP.get(mon[:3].capitalize(), "01")
        return f"{y}-{mm}-{int(d):02d}"
    # Year only
    m = re.match(r"(\d{4})", s)
    if m:
        return m.group(1)
    return ""

def classify_type(raw_type):
    """Simplify the 12-byte SatType string to a human-readable category."""
    byte1 = raw_type[0] if raw_type else ""
    byte2 = raw_type[1] if len(raw_type) > 1 else " "
    if byte1 == "P":
        return "Payload"
    elif byte1 == "R":
        return "Rocket Body"
    elif byte1 == "D":
        return "Debris"
    elif byte1 == "C":
        return "Component"
    elif byte1 == "S":
        return "Suborbital Payload"
    elif byte1 in ("X", "Z"):
        return "Other"
    else:
        return "Unknown"

def simplify_status(raw_status):
    """Map status code to a simple label."""
    s = raw_status.strip()
    # In orbit variants
    if s in ("O", "OX", "AO", "N", "ATT", "GRP", "TFR"):
        return "In Orbit"
    # Decayed / re-entered
    if s in ("R", "AR", "S", "AS"):
        return "Decayed"
    # Deep space / escaped Earth
    if s in ("L", "L?", "LR"):
        return "Beyond Earth Orbit"
    # Deorbited deliberately
    if s in ("D", "DSO", "DSA", "DK"):
        return "Deorbited"
    # Exploded
    if s == "E":
        return "Exploded"
    # Capture, orbit around another body
    if s in ("AO",):
        return "In Orbit"
    if s in ("ERR", "-", ""):
        return ""
    # Catch-all
    return s

def main():
    with open(RAW, encoding="utf-8") as f:
        lines = list(f)

    # First non-comment line is the header (starts with #)
    header_line = None
    data_lines = []
    for line in lines:
        if line.startswith("# Updated"):
            continue
        if line.startswith("#"):
            header_line = line
        else:
            data_lines.append(line)

    if not header_line:
        sys.exit("ERROR: Could not find header line")

    cols = header_line.lstrip("#").strip().split("\t")
    col_idx = {c: i for i, c in enumerate(cols)}

    def get(row, name):
        i = col_idx.get(name, -1)
        if i < 0 or i >= len(row):
            return ""
        return row[i].strip()

    output_cols = [
        "jcat",
        "satcat",
        "name",
        "launch_date",
        "launch_year",
        "object_type",
        "state",
        "owner",
        "status",
        "orbit_class",
        "perigee_km",
        "apogee_km",
        "inclination_deg",
    ]

    written = 0
    skipped = 0

    with open(OUT, "w", newline="", encoding="utf-8") as out:
        writer = csv.DictWriter(out, fieldnames=output_cols)
        writer.writeheader()

        for line in data_lines:
            line = line.rstrip("\n")
            if not line.strip():
                continue

            row = line.split("\t")

            raw_type = get(row, "Type")
            byte1 = raw_type[0] if raw_type else ""

            # Skip deleted/spurious entries
            if byte1 in ("X", "Z"):
                skipped += 1
                continue

            jcat = get(row, "JCAT")
            satcat = get(row, "Satcat")
            name = get(row, "Name")
            if not name:
                name = get(row, "PLName")

            ldate_raw = get(row, "LDate")
            launch_date = parse_date(ldate_raw)
            launch_year = launch_date[:4] if launch_date else ""

            object_type = classify_type(raw_type)
            state = get(row, "State")
            owner = get(row, "Owner")
            status = simplify_status(get(row, "Status"))
            orbit_class = get(row, "OpOrbit")

            def num(s):
                s = s.strip().rstrip("?").strip()
                if not s or s == "-":
                    return ""
                try:
                    return str(float(s))
                except ValueError:
                    return ""

            perigee = num(get(row, "Perigee"))
            apogee = num(get(row, "Apogee"))
            inc = num(get(row, "Inc"))

            writer.writerow({
                "jcat": jcat,
                "satcat": satcat,
                "name": name,
                "launch_date": launch_date,
                "launch_year": launch_year,
                "object_type": object_type,
                "state": state,
                "owner": owner,
                "status": status,
                "orbit_class": orbit_class,
                "perigee_km": perigee,
                "apogee_km": apogee,
                "inclination_deg": inc,
            })
            written += 1

    print(f"Written: {written} rows → {OUT}")
    print(f"Skipped (deleted/spurious): {skipped}")

if __name__ == "__main__":
    main()
