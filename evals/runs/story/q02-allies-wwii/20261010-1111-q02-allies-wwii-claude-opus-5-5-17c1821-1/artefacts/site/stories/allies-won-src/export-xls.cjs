// One-off: export the "Tables" sheet of Harrison's chapter_1_tables.xls to CSV,
// so derive.mjs needs no spreadsheet library. Run from a scratch directory with
// SheetJS installed:  npm i xlsx@0.18.5 && node export-xls.cjs <in.xls> <out.csv>
// (0.18.5 is the last SheetJS release on npm; the file is a trusted academic
// source and this script is not part of the regular build.)
const XLSX = require("xlsx");
const [, , input, output] = process.argv;
const wb = XLSX.readFile(input);
const csv = XLSX.utils.sheet_to_csv(wb.Sheets["Tables"], { blankrows: true, rawNumbers: true });
require("fs").writeFileSync(output, csv.replace(/\r\n/g, "\n") + "\n");
