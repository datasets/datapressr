// Guards the SKILL.md frontmatter that `npx skills add datasets/datapressr`
// parses. Claude Code's loader is lenient, the installer's YAML parser is not:
// on 2026-09-25 the installer silently skipped `archive` and `structure`
// because their unquoted descriptions contained "status: archived", and a
// plain YAML scalar cannot hold ": ". Nothing here noticed, because inside this
// repo the skills load through .claude/skills symlinks. The rule this encodes is
// the strict subset that every YAML parser accepts: a value is either a
// double-quoted string (which parses as JSON) or a plain scalar with no ": ",
// no " #" and no leading indicator character.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const skillsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "skills");

/** Parses the strict frontmatter subset; throws with the offending line on anything a YAML parser might reject. */
export function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) throw new Error("no frontmatter block");
  const fields = {};
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^([a-z][a-z0-9_-]*): (.*)$/);
    if (!kv) throw new Error(`not a one-line key: value pair: ${line}`);
    const [, key, raw] = kv;
    if (raw.startsWith('"')) {
      fields[key] = JSON.parse(raw);
    } else if (/: | #|^[-?:,[\]{}#&*!|>'"%@`]/.test(raw)) {
      throw new Error(`${key} must be double-quoted: ${raw.slice(0, 60)}`);
    } else {
      fields[key] = raw;
    }
  }
  return fields;
}

test("parseFrontmatter rejects the unquoted colon that broke the installer", () => {
  assert.throws(() => parseFrontmatter("---\nname: x\ndescription: moving to status: archived\n---\n"), /double-quoted/);
  assert.deepEqual(parseFrontmatter('---\nname: x\ndescription: "moving to status: archived"\n---\n'), { name: "x", description: "moving to status: archived" });
});

for (const name of readdirSync(skillsDir)) {
  const file = join(skillsDir, name, "SKILL.md");
  if (!existsSync(file)) continue;
  test(`skills/${name}/SKILL.md frontmatter parses strictly and names its directory`, () => {
    const fields = parseFrontmatter(readFileSync(file, "utf8"));
    assert.equal(fields.name, name);
    assert.ok(fields.description && fields.description.length > 20, "description is present");
  });
}
