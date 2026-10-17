import { readFileSync } from "node:fs";
const D = process.argv[2];
const load = (f) => readFileSync(`${D}/${f}.csv`, "utf8").trim().split("\n").slice(1).map((l) => { const [d, p] = l.split(","); return { d, p: Number(p) }; });
const w = load("wti-daily"), b = load("brent-daily");
const get = (r, d) => { const x = r.find((o) => o.d === d); if (!x) throw d; return x.p; };
console.log("rows", w.length, b.length, "first", w[0].d, b[0].d);
console.log("wti<=0", w.filter((o) => o.p <= 0), "brent<=0", b.filter((o) => o.p <= 0).length);
for (const d of ["2020-01-02", "2020-04-17", "2020-04-20", "2020-04-21"]) console.log(d, "wti", get(w, d), "brent", b.find((o) => o.d === d)?.p);
console.log("brent min", b.reduce((a, o) => (o.p < a.p ? o : a)));
console.log("brent drop to 04-20", 1 - get(b, "2020-04-20") / get(b, "2020-01-02"), "wti drop to 04-17", 1 - get(w, "2020-04-17") / get(w, "2020-01-02"));
const wk = w.filter((o) => o.d >= "2020-04-20" && o.d <= "2020-04-24"); console.log("week", wk.length, wk.reduce((s, o) => s + o.p, 0) / wk.length);
const ap = w.filter((o) => o.d.startsWith("2020-04")); console.log("april", ap.length, ap.reduce((s, o) => s + o.p, 0) / ap.length);
for (const f of ["wti-weekly", "wti-monthly", "wti-year", "brent-weekly", "brent-monthly", "brent-year"]) { const r = load(f); console.log(f, "min", r.reduce((a, o) => (o.p < a.p ? o : a))); }
console.log("wk 04-24", get(load("wti-weekly"), "2020-04-24"), "mo 04", get(load("wti-monthly"), "2020-04-15"));
