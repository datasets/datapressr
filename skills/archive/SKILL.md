---
name: archive
description: Use this skill when a captured source has been decided worth pursuing and needs its raw form saved safely before wrangling starts — moving a dataset from stub to status: archived. Downloads/saves the raw source into archive/ with provenance (source URL, retrieval date, license if known), separate from data/ which holds the cleaned output. Precedes structure — read skills/structure/SKILL.md next once this is done.
---

# Archive: get the raw bytes safely stored, with provenance

The step between "worth pursuing" and "worth cleaning." Once this is done, the raw source can't disappear out from under the wrangling work — the live URL going away, the file being edited upstream, the page changing — because a snapshot exists.

## Steps

1. **Check scale before downloading anything.** Same rule as `structure`: comfortably fits in memory in a single Node process, well under ~1GB. If the source is bigger, say so now rather than after downloading it — this workflow assumes small data.

2. **If the dataset directory doesn't exist yet**, scaffold it first — `/init <name>` (creates `datapackage.json` with `status: "stub"`, `data/`, `AGENTS.md`, the validator script).

3. **Save the raw file(s) into `archive/`** at the dataset root, sibling to `data/` — not inside it. This is real precedent from `datasets/economic-history/millennium-macroeconomic-data-uk/archive/`, not an invented convention. For a live URL:

   ```ts
   import { writeFile } from "node:fs/promises";

   const res = await fetch(SRC_URL);
   if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
   await writeFile("archive/<filename>", Buffer.from(await res.arrayBuffer()));
   ```

   For a file the user already has locally, just copy it in.

4. **Record provenance right away** — this is the step most likely to get skipped and regretted later (see the rigor pass in `docs/skills-vision.md`: shipping a dataset with no recorded source/license is a real liability, not a nice-to-have). At minimum, a comment at the top of wherever `build.ts` will live:

   ```ts
   // Source: <url>
   // Retrieved: <YYYY-MM-DD>
   // License: <if stated anywhere on the source page — otherwise say explicitly that it's unknown, don't just omit it>
   ```

   This becomes `datapackage.json`'s `sources`/`licenses` fields in the `structure` step — capturing it now means not having to go back and re-find the source page later.

5. **Set `"status": "archived"`** in `datapackage.json`.

6. **Hand off to `structure`** (`skills/structure/SKILL.md`) to turn the raw snapshot into a clean, typed dataset. Don't do both in one undifferentiated pass if the source is at all messy — archiving first means there's always a stable raw copy to re-run the build script against, even if the live source later changes or disappears.

## What this doesn't cover

Re-fetching a source that updates on a schedule (a "living" dataset) is `monitor`'s job, not this skill's — not designed yet, see `docs/skills-vision.md`. This skill is a one-time snapshot.
