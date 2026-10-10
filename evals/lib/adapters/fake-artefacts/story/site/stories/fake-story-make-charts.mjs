// Placeholder chart build for the eval harness's fake writer: writes one fixed SVG.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100" viewBox="0 0 200 100"><polyline points="20,80 180,20" fill="none" stroke="black"/><text x="20" y="95">2000: 10</text><text x="120" y="15">2020: 20</text></svg>\n`;
writeFileSync(join(here, "fake-story-trend.svg"), svg);
