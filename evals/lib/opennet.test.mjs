// Open-mode network policy: the post-run scan for the project's own sites, repository, forbidden
// domains and references, and the network notes the writer gets.

import { test } from "node:test";
import assert from "node:assert/strict";
import { OPEN_ALLOWED_DOMAINS, OWN_SITES, openModeNotes, scanOpenMode } from "./opennet.mjs";

const call = (tool, input) => ({ tool, input });

test("own sites, the own repository and forbidden domains are flagged in any access; written text is not", () => {
  const leaks = scanOpenMode([
    call("WebFetch", { url: "https://datapressr.datahub.io/stories", prompt: "title" }),
    call("Bash", { command: "curl -sL datahub.io/core/x.csv -o a.csv" }),
    call("Bash", { command: "git clone https://github.com/datasets/datapressr" }),
    call("Bash", { command: "git clone git@github.com:datasets/datapressr.git" }),
    call("WebSearch", { query: "DataPressr WWII story" }),
    call("WebFetch", { url: "https://www.example-forbidden.org/page" }),
    call("Write", { file_path: "site/stories/DATA.md", content: "Not used: datahub.io, https://datapressr.datahub.io" }),
  ], { forbiddenDomains: ["example-forbidden.org"] });
  const tools = leaks.map((l) => l.tool);
  assert.ok(leaks.every((l) => l.kind === "forbidden" && l.path.startsWith("forbidden: ")));
  assert.ok(!tools.includes("Write"), "the writer's own text is not an access");
  assert.ok(leaks.some((l) => l.tool === "WebFetch" && /datahub\.io/.test(l.path)));
  assert.ok(leaks.some((l) => l.tool === "Bash" && /datahub\.io \(datahub\.io\)/.test(l.path)), "a bare host token counts");
  assert.ok(leaks.some((l) => /own project \(https:\/\/github.com\/datasets\/datapressr/.test(l.path)), "https clone of the repo");
  assert.ok(leaks.some((l) => /own project \(github.com:datasets\/datapressr/.test(l.path)), "ssh clone of the repo");
  assert.ok(leaks.some((l) => l.tool === "WebSearch" && /own project/.test(l.path)));
  assert.ok(leaks.some((l) => /example-forbidden\.org/.test(l.path)));
});

test("ordinary data sources pass, including github.com and paths that merely contain a forbidden word", () => {
  const leaks = scanOpenMode([
    call("Bash", { command: "curl -sL https://raw.githubusercontent.com/owid/owid-datasets/master/x.csv -o site/stories/x-src/a.csv" }),
    call("WebFetch", { url: "https://en.wikipedia.org/wiki/Military_production_during_World_War_II" }),
    call("WebSearch", { query: "Harrison economics of World War II GDP table" }),
    call("Read", { file_path: "/Users/x/.cache/datapressr-evals/node_modules/abc/node_modules/d3/package.json" }),
    call("Bash", { command: "ls notdatahub.io.bak" }),
  ]);
  assert.deepEqual(leaks, []);
});

test("references are flagged by URL (and archive URL) prefix and by title", () => {
  const references = [{ title: "Why the Allies Won, the long read", url: "https://www.example.com/allies-won/", archive_url: "https://web.archive.org/web/2020/https://www.example.com/allies-won/" }];
  const leaks = scanOpenMode([
    call("WebFetch", { url: "http://example.com/allies-won/part-2" }),
    call("WebSearch", { query: "why the allies won, the long read summary" }),
    call("WebFetch", { url: "https://www.example.com/other" }),
  ], { references });
  assert.equal(leaks.length, 2);
  assert.match(leaks[0].path, /reference URL/);
  assert.match(leaks[1].path, /reference title/);
});

test("the notes name the forbidden sites, and no own site is on the allowlist", () => {
  const notes = openModeNotes(["example-forbidden.org"]);
  assert.match(notes, /datahub\.io, flowershow\.me, flowershow\.app, example-forbidden\.org/);
  assert.match(notes, /DATA\.md/);
  for (const d of OWN_SITES) assert.ok(!OPEN_ALLOWED_DOMAINS.includes(d));
});
