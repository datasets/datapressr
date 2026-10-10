// Open-mode network policy (design section 4.3, datapressr-hcn.12). In open mode the writer finds
// its own data, so it gets the web, but on three conditions:
//
// 1. Web tools (WebSearch, WebFetch) are on for any site except the project's own published
//    outputs (OWN_SITES: DataHub and Flowershow, where our stories and datasets are published),
//    which are denied by WebFetch(domain:…) rules.
// 2. Shell downloads (curl inside the Bash sandbox) reach only an allowlist of data hosts
//    (OPEN_ALLOWED_DOMAINS): Claude Code's sandbox accepts no bare "*" in allowedDomains and no
//    TLD wildcard such as "*.org", so "open" for the shell means a curated list. OWN_SITES are
//    also in the sandbox's deniedDomains, which win over the allowlist.
// 3. The project's own repository on GitHub cannot be denied by domain (github.com hosts data
//    too), so the post-run scan (scanOpenMode) flags any tool call that names it, any own site,
//    any case forbidden domain, and any case reference by URL or title. Like the path scan, a hit
//    flags the run `leaked`.

// Hosts a shell download may reach. Wildcards cover subdomains only, so apexes are listed too.
export const OPEN_ALLOWED_DOMAINS = [
  // Encyclopaedias and compiled statistics
  "wikipedia.org", "*.wikipedia.org", "*.wikimedia.org", "wikidata.org", "*.wikidata.org", "britannica.com", "*.britannica.com",
  "ourworldindata.org", "*.ourworldindata.org",
  // Code and file hosting (data repositories live here too)
  "github.com", "*.github.com", "*.githubusercontent.com", "*.github.io", "gitlab.com", "*.gitlab.com",
  "registry.npmjs.org",
  // Research data repositories and archives
  "zenodo.org", "*.zenodo.org", "doi.org", "*.doi.org", "dataverse.nl", "*.dataverse.nl", "dataverse.harvard.edu", "*.harvard.edu",
  "archive.org", "*.archive.org", "gutenberg.org", "*.gutenberg.org", "hathitrust.org", "*.hathitrust.org",
  "osf.io", "*.osf.io", "figshare.com", "*.figshare.com", "*.icpsr.umich.edu", "*.umich.edu",
  "correlatesofwar.org", "*.correlatesofwar.org", "*.ucdp.uu.se", "prio.org", "*.prio.org",
  // Economic history and statistics
  "rug.nl", "*.rug.nl", "ggdc.net", "*.ggdc.net", "nber.org", "*.nber.org", "eh.net", "*.eh.net",
  "worldbank.org", "*.worldbank.org", "imf.org", "*.imf.org", "oecd.org", "*.oecd.org", "un.org", "*.un.org",
  "stlouisfed.org", "*.stlouisfed.org", "census.gov", "*.census.gov", "bls.gov", "*.bls.gov", "bea.gov", "*.bea.gov", "eia.gov", "*.eia.gov", "data.gov", "*.data.gov",
  "*.ac.uk", "*.cam.ac.uk", "cambridge.org", "*.cambridge.org", "*.ox.ac.uk", "*.stanford.edu", "*.yale.edu", "*.berkeley.edu", "*.mit.edu", "*.princeton.edu", "*.columbia.edu",
  // Military and official history
  "ibiblio.org", "*.ibiblio.org", "army.mil", "*.army.mil", "navy.mil", "*.navy.mil", "af.mil", "*.af.mil", "defense.gov", "*.defense.gov",
  "archives.gov", "*.archives.gov", "loc.gov", "*.loc.gov", "nps.gov", "*.nps.gov",
  "*.gov.uk", "nationalarchives.gov.uk", "*.nationalarchives.gov.uk", "iwm.org.uk", "*.iwm.org.uk", "cwgc.org", "*.cwgc.org",
  "awm.gov.au", "*.awm.gov.au", "*.gc.ca", "*.canada.ca",
  "nationalww2museum.org", "*.nationalww2museum.org", "ww2db.com", "*.ww2db.com",
];

// The project's own published outputs: never fetched in a blind run. Denied for WebFetch and the
// shell, and scanned for afterwards.
export const OWN_SITES = ["datahub.io", "*.datahub.io", "flowershow.me", "*.flowershow.me", "flowershow.app", "*.flowershow.app"];

// The project's own repository and name: scanned for in URLs and search queries (github.com
// itself cannot be denied by domain).
export const OWN_PATTERNS = [/datapressr/i];

const URL_RE = /[a-z][a-z0-9+.-]*:\/\/[^\s"'`<>)\]]+/gi;

// "datahub.io" and "*.datahub.io" both forbid the apex and every subdomain.
const bareDomain = (d) => String(d).toLowerCase().replace(/^\*\./, "").replace(/^https?:\/\//, "").replace(/\/.*$/, "");

function hostMatches(host, domain) {
  const h = host.toLowerCase().replace(/\.$/, "");
  return h === domain || h.endsWith(`.${domain}`);
}

// A forbidden domain named in a string as a URL host or as a bare host token (`curl datahub.io/x`).
function domainHits(text, domains) {
  const hits = [];
  const lower = String(text).toLowerCase();
  for (const m of lower.matchAll(URL_RE)) {
    let host = "";
    try {
      host = new URL(m[0]).hostname;
    } catch {
      continue;
    }
    for (const d of domains) if (hostMatches(host, d)) hits.push(`${d} (${m[0].slice(0, 120)})`);
  }
  for (const d of domains) {
    const re = new RegExp(`(^|[^a-z0-9.@/-])((?:[a-z0-9-]+\\.)*${d.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})(?![a-z0-9-])`, "g");
    for (const m of lower.matchAll(re)) hits.push(`${d} (${m[2]})`);
  }
  return hits;
}

function strings(v, out = []) {
  if (typeof v === "string") out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => strings(x, out));
  else if (v && typeof v === "object") Object.values(v).forEach((x) => strings(x, out));
  return out;
}

// Write/Edit content is the writer's own text (a DATA.md may well name a site it chose not to
// use); only accesses count: every other tool's input is scanned whole.
const WRITES = new Set(["Write", "Edit", "MultiEdit", "NotebookEdit"]);

const normUrl = (u) => String(u).toLowerCase().replace(/^https?:\/\/(www\.)?/, "").replace(/\/+$/, "");

// Open-mode scan over tool calls ({ tool, input }). forbiddenDomains: the case's plus OWN_SITES;
// references: the case's { title, url, archive_url }. Returns [{ tool, path, kind: "forbidden" }].
export function scanOpenMode(calls, { forbiddenDomains = [], references = [], ownSites = OWN_SITES, ownPatterns = OWN_PATTERNS } = {}) {
  const domains = [...new Set([...ownSites, ...forbiddenDomains].map(bareDomain).filter(Boolean))];
  const refUrls = references.flatMap((r) => [r.url, r.archive_url]).filter(Boolean).map(normUrl);
  const refTitles = references.map((r) => r.title).filter((t) => typeof t === "string" && t.length >= 12).map((t) => t.toLowerCase());
  const leaks = [];
  const seen = new Set();
  const add = (tool, what) => {
    const key = `${tool}\0${what}`;
    if (seen.has(key)) return;
    seen.add(key);
    leaks.push({ tool, path: `forbidden: ${what}`, kind: "forbidden" });
  };
  for (const call of calls) {
    if (WRITES.has(call.tool)) continue;
    for (const s of strings(call.input)) {
      for (const h of domainHits(s, domains)) add(call.tool, h);
      const urls = [...s.matchAll(URL_RE)].map((m) => m[0]);
      const ownText = call.tool === "WebSearch" ? [s] : urls;
      // A repository path (`github.com/datasets/datapressr`, `git@github.com:datasets/datapressr`) counts as a URL.
      for (const m of s.matchAll(/(?:github\.com[:/]|raw\.githubusercontent\.com\/)[^\s"'`]+/gi)) ownText.push(m[0]);
      for (const t of ownText) for (const p of ownPatterns) if (p.test(t)) add(call.tool, `own project (${t.slice(0, 120)})`);
      for (const u of urls) for (const r of refUrls) if (normUrl(u).startsWith(r)) add(call.tool, `reference URL (${u.slice(0, 120)})`);
      const lower = s.toLowerCase();
      for (const t of refTitles) if (lower.includes(t)) add(call.tool, `reference title (${t.slice(0, 80)})`);
    }
  }
  return leaks;
}

// The text the prompt gives the writer about the network (the same for every open-mode case;
// a case adds its own forbidden domains). Kept here so the recipe and the prompt cannot drift.
export function openModeNotes(forbiddenDomains = []) {
  const own = [...new Set([...OWN_SITES, ...forbiddenDomains].map(bareDomain))];
  return [
    "## Network (open mode)",
    "",
    "- WebSearch and WebFetch work for any site except the forbidden ones below. WebFetch returns a model's summary of a page, not the file, so do not take numbers from it: download the source file itself into the snapshot folder and read it there.",
    "- Shell downloads (`curl`) are confined by a sandbox to a list of data hosts: encyclopaedias and Our World in Data; GitHub and GitLab; research repositories and archives (Zenodo, Dataverse, Harvard Dataverse, OSF, Figshare, ICPSR, archive.org, HathiTrust, Project Gutenberg, the Correlates of War, UCDP, PRIO); economic-history and statistical sources (the Groningen and Maddison project pages at rug.nl, NBER, EH.net, the World Bank, IMF, OECD, UN, FRED and FRASER, US Census, BLS, BEA); UK universities (`*.ac.uk`) and Cambridge University Press, and a few US universities; official and military history (HyperWar at ibiblio.org, the US Army, Navy and Air Force history sites, the US National Archives and Library of Congress, UK government and National Archives, the Imperial War Museums, the Commonwealth War Graves Commission, the Australian War Memorial, the Government of Canada, the National WWII Museum, WW2DB). A download from any other host fails with a sandbox error. If a source you want is not reachable, record it in `DATA.md` as searched but unreachable rather than working around the sandbox, and do not copy its numbers from a WebFetch summary.",
    "- Use `curl` for downloads; Node's `fetch` may not use the sandbox's proxy.",
    `- Forbidden: this project's own published sites and repository, so the run stays blind: ${own.join(", ")}, and any repository or page named DataPressr. Do not search for, fetch or download them.`,
    "- The chart build must not use the network: `make-charts.mjs` reads only the snapshot files in the workspace.",
  ].join("\n");
}
