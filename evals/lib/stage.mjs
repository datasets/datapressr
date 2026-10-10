// Blind workspace staging (design section 4.2 step 3). A run happens in a fresh temp git repo
// that holds only an allowlist: the case prompt as TASK.md, the case inputs and skills at their
// pinned commits (via git archive, at the same paths as in this repo), the dataset-conventions
// part of AGENTS.md, and site/stories/package.json with a read-only link to a cached
// node_modules so chart builds work offline. Anything not named here is absent.

import { execFileSync } from "node:child_process";
import { chmodSync, cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, renameSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { dirname, join, relative, resolve, sep } from "node:path";
import { git, sha256 } from "./versions.mjs";

// Same marker as scripts/sync-dataset-agents.mjs (kept literal so staging does not depend on scripts/).
export const AGENTS_MARKER = "<!-- repo-only: everything below this line stays in the root AGENTS.md and is not copied into datasets -->";

export const STORIES_DIR = "site/stories";
export const WORKSPACE_GITIGNORE = `${STORIES_DIR}/node_modules\n`;

export function datasetConventions(agentsText) {
  const at = agentsText.indexOf(AGENTS_MARKER);
  if (at === -1) throw new Error("AGENTS.md has no repo-only marker line");
  return agentsText.slice(0, at).trimEnd() + "\n";
}

function sh(cwd, cmd, args, opts = {}) {
  return execFileSync(cmd, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 1 << 30, ...opts });
}

// git archive <ref> -- <path> | tar -x -C <dest>
function archiveInto(root, ref, path, dest) {
  const tar = execFileSync("git", ["archive", "--format=tar", ref, "--", path], { cwd: root, maxBuffer: 1 << 30, stdio: ["ignore", "pipe", "pipe"] });
  if (tar.length === 0) throw new Error(`git archive ${ref} -- ${path} is empty`);
  execFileSync("tar", ["-x", "-C", dest], { input: tar, stdio: ["pipe", "ignore", "pipe"] });
  if (!existsSync(join(dest, path))) throw new Error(`no ${path} at ${ref}`);
}

function showFile(root, ref, path) {
  return git(root, ["show", `${ref}:${path}`]) + "\n";
}

const inside = (child, parent) => {
  const rel = relative(parent, child);
  return rel === "" || (!rel.startsWith("..") && !rel.startsWith(sep) && rel !== ".." && !/^[A-Za-z]:/.test(rel));
};

// Paths a writer must never read; also the deny list of the vendor recipes.
export function deniedPaths(root, home = homedir()) {
  return [root, ...[".claude", ".codex", ".agents", ".config/gh", ".ssh"].map((d) => join(home, d))];
}

export function defaultCacheRoot() {
  return process.env.EVALS_CACHE_DIR || join(homedir(), ".cache", "datapressr-evals", "node_modules");
}

function npmCi(dir) {
  sh(dir, "npm", ["ci", "--ignore-scripts", "--no-audit", "--no-fund", "--loglevel=error"]);
}

function makeReadOnly(p) {
  const st = lstatSync(p);
  if (st.isSymbolicLink()) return;
  if (st.isDirectory()) for (const name of readdirSync(p)) makeReadOnly(join(p, name));
  chmodSync(p, st.mode & ~0o222);
}

// node_modules for site/stories built once per (package.json, package-lock.json) hash with
// npm ci, outside every denied path, then made read-only. Returns the node_modules directory.
// `install(dir)` is injectable so tests never touch the network.
export function ensureModulesCache({ root, ref = "HEAD", cacheRoot = defaultCacheRoot(), home = homedir(), install = npmCi, log = () => {} }) {
  const pkg = showFile(root, ref, `${STORIES_DIR}/package.json`);
  const lock = showFile(root, ref, `${STORIES_DIR}/package-lock.json`);
  const key = sha256(`package.json\0${pkg}\0package-lock.json\0${lock}`).slice(0, 16);
  const absRoot = resolve(cacheRoot);
  for (const d of deniedPaths(root, home)) {
    if (inside(absRoot, d)) throw new Error(`node_modules cache ${absRoot} is inside a denied path (${d}); set EVALS_CACHE_DIR elsewhere`);
  }
  const dir = join(absRoot, key);
  const modules = join(dir, "node_modules");
  if (existsSync(join(dir, ".complete"))) return { key, dir, modules };
  mkdirSync(absRoot, { recursive: true });
  const tmp = mkdtempSync(join(absRoot, `.${key}-`));
  log(`building node_modules cache ${key} (npm ci) in ${absRoot}`);
  writeFileSync(join(tmp, "package.json"), pkg);
  writeFileSync(join(tmp, "package-lock.json"), lock);
  install(tmp);
  if (!existsSync(join(tmp, "node_modules"))) throw new Error(`npm ci produced no node_modules in ${tmp}`);
  writeFileSync(join(tmp, ".complete"), `${new Date().toISOString()}\n`);
  makeReadOnly(join(tmp, "node_modules"));
  if (existsSync(dir)) rmSync(tmp, { recursive: true, force: true }); // lost a race; keep the first
  else renameSync(tmp, dir);
  return { key, dir, modules };
}

// Stage a blind workspace. Returns { dir, baseline, modules }. `dir` is a realpath (macOS temp
// dirs live behind the /var -> /private/var link, and tools report realpaths).
// extraFiles: { "<rel path>": "<text>" } added before the baseline (the canary's probe files).
export function stageWorkspace({ root, kase, prompt, skillRef = "HEAD", modules, extraFiles = {}, tmpRoot = tmpdir() }) {
  const dir = realpathSync(mkdtempSync(join(tmpRoot, "evals-ws-")));
  try {
    sh(dir, "git", ["init", "-q", "-b", "main"]);
    for (const [k, v] of [["user.email", "evals@example.invalid"], ["user.name", "Evals"], ["commit.gpgsign", "false"]]) sh(dir, "git", ["config", k, v]);

    writeFileSync(join(dir, "TASK.md"), prompt);
    for (const input of kase.inputs) archiveInto(root, input.commit, input.path, dir);
    for (const name of kase.skills) archiveInto(root, skillRef, `skills/${name}`, dir);
    writeFileSync(join(dir, "AGENTS.md"), datasetConventions(showFile(root, skillRef, "AGENTS.md")));

    mkdirSync(join(dir, STORIES_DIR), { recursive: true });
    writeFileSync(join(dir, STORIES_DIR, "package.json"), showFile(root, skillRef, `${STORIES_DIR}/package.json`));
    writeFileSync(join(dir, STORIES_DIR, "package-lock.json"), showFile(root, skillRef, `${STORIES_DIR}/package-lock.json`));
    if (modules) symlinkSync(modules, join(dir, STORIES_DIR, "node_modules"), "dir");
    writeFileSync(join(dir, ".gitignore"), WORKSPACE_GITIGNORE);

    for (const [rel, text] of Object.entries(extraFiles)) {
      mkdirSync(dirname(join(dir, rel)), { recursive: true });
      writeFileSync(join(dir, rel), text);
    }

    sh(dir, "git", ["add", "--all"]);
    sh(dir, "git", ["commit", "-q", "-m", "baseline"]);
    const baseline = sh(dir, "git", ["rev-parse", "HEAD"]).trim();
    return { dir, baseline, modules: modules || null };
  } catch (e) {
    rmSync(dir, { recursive: true, force: true });
    throw e;
  }
}

// Files added or modified since the baseline commit (deletions listed separately), relative paths.
// Diffs the index against the baseline, not HEAD: writers that follow the story skill commit their
// work, and a diff against HEAD then finds nothing (the q01 pilot lost all its artefacts that way).
export function changedFiles(dir, baseline) {
  if (!baseline) throw new Error("changedFiles: baseline commit required");
  sh(dir, "git", ["add", "--all"]);
  const out = sh(dir, "git", ["diff", "--cached", "--name-status", "--no-renames", "-z", baseline]);
  const parts = out.split("\0").filter(Boolean);
  const changed = [];
  const deleted = [];
  for (let i = 0; i < parts.length; i += 2) {
    const [status, path] = [parts[i], parts[i + 1]];
    (status === "D" ? deleted : changed).push(path);
  }
  return { changed: changed.sort(), deleted: deleted.sort() };
}

// Copy changed files into destDir at their workspace paths, up to maxBytes in total.
export function collectArtefacts(dir, destDir, { baseline, maxBytes = 2 * 1024 * 1024 } = {}) {
  const { changed, deleted } = changedFiles(dir, baseline);
  let total = 0;
  const copied = [];
  const skipped = [];
  for (const rel of changed) {
    const src = join(dir, rel);
    const st = lstatSync(src);
    if (!st.isFile() || total + st.size > maxBytes) {
      skipped.push(rel);
      continue;
    }
    mkdirSync(dirname(join(destDir, rel)), { recursive: true });
    cpSync(src, join(destDir, rel));
    total += st.size;
    copied.push(rel);
  }
  return { copied, skipped, deleted, bytes: total };
}

// tar of the workspace (the node_modules link is stored as a link, not followed).
export function tarWorkspace(dir, file) {
  sh(dir, "tar", ["-cf", file, "-C", dir, "."]);
  return readFileSync(file);
}

export function removeWorkspace(dir) {
  rmSync(dir, { recursive: true, force: true });
}
