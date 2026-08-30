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

**Update:** Stage 1 worked — 20+ datasets published to DataHub from the backlog. `/init`/`/validate`/`/push` cover the last mile, and `structure` (turning a raw source into a clean, typed dataset) is now a real skill too — see [`docs/skills-vision.md`](docs/skills-vision.md). `/validate` and the `structure` playbook's cleanup idioms are backed by an actual test suite (`npm test`), not just prose.

The backlog/inbox/dashboards markdown files are superseded — active candidates are [GitHub issues](https://github.com/datasets/datapressr/issues) now, with [`NEXT.md`](NEXT.md) as the short "what's actionable right now" view.

**Next:** `capture`/`archive` skills, then a few data stories written by hand before deciding on a charting approach — see `docs/skills-vision.md`.

---

The insight driving this: don't design the system before you've felt the workflow. Ten manual posts will teach more than ten hours of architecture.
