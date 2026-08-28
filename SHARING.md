---
created: 2026-02-18
---

# DataPressr

**Turn raw data finds into published datasets — fast, with AI.**

The goal: go from "interesting data thing" to a polished, published entry on DataHub in under 10 minutes. No more half-finished tabs and good intentions.

---

## Where We Are

We're at the end of Stage 1: the posting loop exists, on paper and in practice.

**Done:**

- **Plan** — a clear, staged approach: backlog first, manual posts next, automation only after we feel the friction
- **Backlog** — 100+ dataset candidates imported from the Data Commons issue tracker, plus a live inbox for new finds
- **Data model docs** — defined the data hierarchy, lifecycle, and a catalog-as-repo pattern (with EH.net as a concrete example)
- **Dashboard candidates** — an initial list of data stories worth building

**Update:** Stage 1 worked — 20+ datasets published to DataHub from the backlog. `/init`, `/validate`, `/push` cover the last mile (clean data → package → ship), but everything upstream (capture, archive, wrangling, storytelling) is still done ad hoc in conversation.

**Next:** build out the rest of the skill suite — see [`docs/skills-vision.md`](docs/skills-vision.md) for the outline (capture/archive/structure/enrich/story skills, DuckDB-first wrangling, charting still to be decided).

---

The insight driving this: don't design the system before you've felt the workflow. Ten manual posts will teach more than ten hours of architecture.
