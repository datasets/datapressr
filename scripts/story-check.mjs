#!/usr/bin/env node
// Is a blog-format story package ready for `dh publish <dir> -p blog`?
//
//   node scripts/story-check.mjs <post-dir> [--build] [--notes <NOTES.md>]     (npm run story-check -- <dir>)
//
// The checker lives in the story skill, skills/story/scripts/story-check.mjs (checks listed there),
// so a copy of the skill runs it without this repo. This wrapper keeps the DataPressr command and
// imports working, and lets a `git archive` of skills/story plus this file run it too.
import { realpathSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { main } from "../skills/story/scripts/story-check.mjs";

export * from "../skills/story/scripts/story-check.mjs";

const isEntryPoint = (() => {
  try {
    return import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href;
  } catch {
    return false;
  }
})();
if (isEntryPoint) process.exit(await main(process.argv.slice(2)));
