// Network-only snapshot step. Sources and licences are recorded in archive/manifest.json.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
process.chdir(fileURLToPath(new URL('.', import.meta.url)));
const api = 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/';
function query(dataset, filters) {
  const params = new URLSearchParams({ lang: 'EN' });
  for (const [key, values] of Object.entries(filters)) for (const value of [].concat(values)) params.append(key, value);
  return api + dataset + '?' + params;
}
const eurostatLicence = 'https://ec.europa.eu/eurostat/help/copyright-notice';
const inseeLicence = 'https://www.insee.fr/fr/information/2008466';
const sources = [
  { file: 'fiscal.json', dataset: 'gov_10a_main', licence: eurostatLicence, url: query('gov_10a_main', { geo: ['FR', 'DE', 'IT', 'ES', 'EU27_2020'], sector: 'S13', unit: ['MIO_EUR', 'PC_GDP'], na_item: ['TE', 'TR', 'B9', 'D41PAY', 'D2REC', 'D5REC', 'D61REC', 'D91REC', 'D995REC', 'D1PAY', 'P2', 'D3PAY', 'D62PAY', 'D632PAY', 'P51G'] }) },
  { file: 'functions.json', dataset: 'gov_10a_exp', licence: eurostatLicence, url: query('gov_10a_exp', { geo: 'FR', sector: 'S13', unit: ['MIO_EUR', 'PC_GDP'], na_item: 'TE' }) },
  { file: 'insee-quarterly-debt.html', licence: inseeLicence, url: 'https://www.insee.fr/fr/statistiques/9053525' },
  { file: 'insee-annual-accounts.html', licence: inseeLicence, url: 'https://www.insee.fr/fr/statistiques/8997691' },
  { file: 'insee-spending-functions.html', licence: inseeLicence, url: 'https://www.insee.fr/fr/statistiques/8735252' },
  { file: 'insee-accounting-explainer.html', licence: inseeLicence, url: 'https://blog.insee.fr/depenses-et-recettes-des-comptes-publics/' },
  { file: 'eurostat-reuse.html', licence: eurostatLicence, url: eurostatLicence },
  { file: 'insee-reuse.html', licence: inseeLicence, url: inseeLicence },
];
await mkdir('archive', { recursive: true });
if (!process.argv.includes('--refresh')) {
  let old;
  try { old = JSON.parse(await readFile('archive/manifest.json', 'utf8')); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  if (old) {
    if (old.files.length !== sources.length) throw new Error('Snapshot source list changed; inspect and use --refresh explicitly.');
    for (const spec of sources) {
      const entry = old.files.find(f => f.file === spec.file && f.url === spec.url);
      if (!entry) throw new Error('Snapshot source mismatch: ' + spec.file);
      const bytes = await readFile('archive/' + entry.file);
      if (bytes.length !== entry.bytes || createHash('sha256').update(bytes).digest('hex') !== entry.sha256) throw new Error('Snapshot integrity failure: ' + entry.file);
    }
    console.log('Reusing verified archived snapshot; use --refresh to replace it.');
    process.exit(0);
  }
}
const files = [];
for (const spec of sources) {
  let bytes, response;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      response = await fetch(spec.url, { signal: AbortSignal.timeout(30000) });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const declared = Number(response.headers.get('content-length'));
      if (declared > 10_000_000) throw new Error('Unexpectedly large source');
      bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.length > 10_000_000) throw new Error('Unexpectedly large source');
      if (spec.dataset) {
        const json = JSON.parse(bytes.toString('utf8'));
        if (json.class !== 'dataset' || !json.id || !json.value || json.error) throw new Error('Invalid Eurostat dataset payload');
      } else if (!bytes.toString('utf8').includes('<html')) throw new Error('Expected HTML');
      break;
    } catch (e) {
      if (attempt === 2) throw new Error(spec.file + ': ' + e.message);
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  await writeFile('archive/' + spec.file, bytes);
  files.push({ ...spec, retrieved_at: new Date().toISOString(), bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), source_updated: spec.dataset ? JSON.parse(bytes.toString('utf8')).updated : null });
  console.log(spec.file + ': ' + bytes.length + ' bytes');
  await new Promise(resolve => setTimeout(resolve, 200));
}
await writeFile('archive/manifest.json', JSON.stringify({ files }, null, 2) + '\n');
