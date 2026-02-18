# Dataset (and Post) Life Cylce

## Design Suggestion — Capture and Stub *May* Be the Same

Before defining stages, consider this alternative:

> The act of capture could immediately create a public stub post.

That would mean:

* No private backlog layer.
* Every interesting URL instantly becomes a minimal published entry.
* It is clearly marked `status: stub`.
* Nothing lingers in private limbo.

However, this is a design choice.
Below, the stages remain separated conceptually, because the distinction between *private attention* and *public indexing* may still matter operationally.

---

Each object (URL, article, dataset, site, repo, API) moves through progressively higher levels of commitment and structure.

Not all objects go through all stages.

---

## 1. Capture — *Attention Without Commitment*

**Purpose**
Prevent loss. Preserve intent.

**What happens**

* Save URL or file reference
* Add 1–3 lines: why interesting, what data might exist
* No validation, no downloading
* May remain private

**Why this stage exists**
Capture must be near-zero friction.
This is bookmarking plus intellectual intent — without forcing publication or structure too early.

Transition trigger:

> “This is worth making public or exploring.”

---

## 2. Stub Post — *Public Pointer*

**Purpose**
Make the object visible and indexed.

**What happens**

* Create minimal structured Markdown entry
* Clean title
* Short description
* Basic tags / type classification
* Mark `status: stub`
* Still no local archive required

**Why this stage exists**
This separates “private backlog” from “public reference.”
It creates accountability and searchable structure without heavy work.

Transition trigger:

> “This source is important enough to preserve.”

---

## 3. Archive — *Stability Layer*

**Purpose**
Reduce dependency on the live web.

**What happens**

* Download raw data files or snapshot HTML
* Store locally (or object storage)
* Record timestamp
* Optionally record license/checksum/version

**Why this stage exists**
Web sources disappear, change, or degrade.
Archiving turns a pointer into a controlled asset.

Shift:

> “Interesting site” → “Controlled source”

Transition trigger:

> “I need to actually use or understand this data.”

---

## 4. Extraction / Structuring — *Comprehension*

**Purpose**
Make the data intelligible and reusable.

**What happens**

* Extract tables from HTML/PDF
* Normalize CSV/JSON
* Clean column names
* Document schema, coverage, update frequency
* Identify units and assumptions

**Why this stage exists**
Raw data is rarely usable.
Structuring is where informational value is created.

Shift:

> “Stored” → “Understandable”

Transition trigger:

> “I want insight or reuse.”

---

## 5. Enrichment / Analysis — *Value Creation*

**Purpose**
Generate interpretation or derived artifacts.

**What happens**

* Quick statistical summary
* Visualization
* Derived datasets
* Commentary
* Cross-linking to related sources

**Why this stage exists**
At this point, the object contributes meaning rather than merely existing.

Optional stage.

---

## 6. Monitoring (Optional) — *Continuity*

**Purpose**
Handle living data sources.

**What happens**

* Track version changes
* Schedule pulls
* Diff new releases
* Archive versions
* Log update frequency

**Why this stage exists**
Some sources are dynamic (e.g., large data portals).
Monitoring converts one-time work into durable infrastructure.

---

# Core Structural Insight

Separate:

* **Source Node** — website/article/repo
* **Dataset Node(s)** — structured data extracted from source

One source may produce many datasets.
They may be at different lifecycle stages.

---

# Minimal Tracking Field

Each object carries:

```
status: captured | stub | archived | structured | enriched | monitored
```

This tracks depth of investment without overengineering.

