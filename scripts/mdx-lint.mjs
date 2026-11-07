// Will this Markdown render on DataHub? DataHub compiles every .md page as MDX
// (remark-gfm, remark-math with $$ only), and one stray `<` or `{` replaces the
// whole page with "Error parsing MDX" (datapressr-fyy).
//
// Two layers, so the check runs from any directory with no install step
// (factory-but.3.4.4):
//   checkMdx(text)    the real compiler (site/stories/mdx-check.mjs, whose
//                     @mdx-js/mdx resolves from site/stories/node_modules next to
//                     it, whatever the cwd) when installed; otherwise
//   mdxHazards(text)  a dependency-free scan for the constructs that break MDX:
//                     autolinks, HTML comments, `<` that cannot start a tag,
//                     unclosed void elements, and `{...}` that is not valid JS.
// The scan is a fallback, not a parser: mdx-lint.test.mjs pins it against the
// compiler on the known failure cases. Zero dependencies.

// DataHub strips YAML front matter before compiling; blank it line for line.
export const blankFrontmatter = (text) => text.replace(/^---\r?\n[\s\S]*?\r?\n---(?=\r?\n|$)/, (m) => m.replace(/[^\n]/g, ""));

const blank = (s) => s.replace(/[^\n]/g, " ");

// Code is literal in MDX: blank fenced blocks and inline code spans, keeping
// line and column positions.
export function stripCode(text) {
  return text
    .replace(/^(\s{0,3})(`{3,}|~{3,})[^\n]*\n[\s\S]*?(?:\n\s{0,3}\2[`~]*[ \t]*(?=\n|$)|$(?![\s\S]))/gm, blank)
    .replace(/(`+)(?!`)[\s\S]*?[^`]\1(?!`)/g, blank);
}

const VOID = "area|base|br|col|embed|hr|img|input|link|meta|source|track|wbr";
const lineAt = (text, index) => text.slice(0, index).split("\n").length;
const colAt = (text, index) => index - text.lastIndexOf("\n", index - 1);

// Does `{inner}` parse as a JavaScript expression (or hold only a comment)?
function validExpression(inner) {
  const t = inner.trim();
  if (t === "" || /^\/\*[\s\S]*\*\/$/.test(t)) return true;
  try {
    new Function(`return (${inner}\n);`);
    return true;
  } catch {
    return false;
  }
}

// Returns [{ line, column, message }] for constructs that make MDX fail.
export function mdxHazards(text) {
  let src = stripCode(blankFrontmatter(text));
  const out = [];
  const add = (index, message) => out.push({ line: lineAt(src, index), column: colAt(src, index), message });
  // Quoted attribute values inside tags are literal strings.
  src = src.replace(/<[A-Za-z][\w.:-]*(?:\s(?:[^>"']|"[^"]*"|'[^']*')*)?\/?>/g, (tag) => tag.replace(/"[^"]*"|'[^']*'/g, (q) => q[0] + blank(q.slice(1, -1)) + q[0]));
  for (const m of src.matchAll(/<(?:[a-z][a-z0-9+.-]*:[^\s<>]*|[^\s<>@]+@[^\s<>]+)>/gi)) {
    add(m.index, `autolink ${m[0]}: MDX cannot parse <...> links; write [text](url)`);
  }
  for (const m of src.matchAll(/<!--/g)) add(m.index, "HTML comment <!-- -->: MDX cannot parse it; use {/* ... */} or delete it");
  for (const m of src.matchAll(/<(?=[^\sA-Za-z$_/>!])/g)) {
    if (!out.some((h) => h.line === lineAt(src, m.index) && h.column === colAt(src, m.index))) add(m.index, `"<${src[m.index + 1]}" cannot start a tag: MDX fails; write "less than" or put it in code`);
  }
  for (const m of src.matchAll(new RegExp(`<(${VOID})\\b((?:[^>"'/]|"[^"]*"|'[^']*'|/(?!>))*)>`, "gi"))) {
    add(m.index, `<${m[1]}> is not closed: MDX needs <${m[1]} ... />`);
  }
  // Balanced {...} groups must be valid expressions; a lone brace is an error.
  let depth = 0;
  let start = -1;
  for (let i = 0; i < src.length; i++) {
    if (src[i] === "{") {
      if (depth++ === 0) start = i;
    } else if (src[i] === "}" && depth > 0) {
      if (--depth === 0 && !validExpression(src.slice(start + 1, i))) add(start, `{${src.slice(start + 1, i).slice(0, 40)}} is not a valid JavaScript expression: MDX fails; escape it as \\{ or reword`);
    }
  }
  if (depth > 0) add(start, "unclosed { : MDX reads it as the start of an expression; escape it as \\{");
  return out.sort((a, b) => a.line - b.line || a.column - b.column);
}

// The real compiler, loaded once. null when site/stories has no node_modules.
let compilerPromise;
export function loadCompiler() {
  compilerPromise ??= import("../site/stories/mdx-check.mjs").then((m) => m.mdxError, () => null);
  return compilerPromise;
}

// { error: null | { line, column, message }, mode: "compile" | "heuristic" }.
// Pass { compiler: null } to force the dependency-free scan.
export async function checkMdx(text, { compiler } = {}) {
  const mdxError = compiler === undefined ? await loadCompiler() : compiler;
  if (mdxError) return { error: await mdxError(text), mode: "compile" };
  const [first] = mdxHazards(text);
  return { error: first ?? null, mode: "heuristic" };
}
