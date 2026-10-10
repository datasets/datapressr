// The /stories index is hand-written so outlines sit under their story
// instead of in a flat list. This keeps it from drifting: every story and
// every outline in site/stories/ must be linked from site/stories/README.md.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "site", "stories");

test("site/stories/README.md links every story and outline", () => {
  const index = readFileSync(join(dir, "README.md"), "utf8");
  const pages = readdirSync(dir).filter((f) => f.endsWith(".md") && f !== "README.md");
  const missing = pages.filter((f) => !index.includes(`](${f})`));
  assert.deepEqual(missing, [], `add these to site/stories/README.md: ${missing.join(", ")}`);
});
