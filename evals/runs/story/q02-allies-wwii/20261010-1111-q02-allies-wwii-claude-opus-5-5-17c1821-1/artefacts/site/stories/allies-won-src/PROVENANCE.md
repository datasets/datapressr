# Provenance — allies-won-src

Every file the charts in `../allies-won-*.svg` depend on. All retrieved **2026-10-10** with `curl`. `../allies-won-make-charts.mjs` reads only `tidy/*.csv`; `derive.mjs` rebuilds `tidy/` from `raw/` and `transcribed/` with no network.

```sh
node derive.mjs                       # raw/ + transcribed/ -> tidy/
cd .. && node allies-won-make-charts.mjs   # tidy/ -> allies-won-*.svg
```

## raw/ — as downloaded

| File | Source URL | Licence / terms | Vintage | SHA-256 |
|---|---|---|---|---|
| `harrison-1998-chapter_1_tables.xls` | https://warwick.ac.uk/fac/soc/economics/staff/mharrison/data/ww2/chapter_1_tables.xls | No licence stated. Posted by the author for public access to "the data that appear in my book"; book © Cambridge University Press 1998. Used here for research and commentary, with attribution. | Mark Harrison (ed.), *The Economics of World War II: Six Great Powers in International Comparison* (CUP, 1998), chapter 1 tables, Excel 97 file with the author's correction to table 1-3 (Soviet figures). File last saved by the author; no date on the page. | `377e94c4…4e51` |
| `harrison-1998-chapter_1_tables.Tables.csv` | Derived once from the `.xls` above (sheet "Tables") by `export-xls.cjs` with SheetJS `xlsx@0.18.5`, `rawNumbers: true`. Kept so `derive.mjs` needs no spreadsheet library. | as above | as above | `1da3bd76…f7e9` |
| `harrison-ww2-data-page.html` | https://warwick.ac.uk/fac/soc/economics/staff/mharrison/data/ww2 | University of Warwick web page | the landing page, recording the table 1-3 correction note | `df03840d…a4fe` |
| `harrison-1988-ehr-postprint.pdf` | https://warwick.ac.uk/markharrison/public/ehr88postprint.pdf | Author's postprint of a copyrighted article (© Economic History Society). One table transcribed for commentary. | Mark Harrison, "Resource mobilization for World War II: the U.S.A., U.K., U.S.S.R., and Germany, 1938–1945", *Economic History Review* 41:2 (1988), 171–92 | `e2b4265d…4995` |
| `owid-gdp-maddison-project-database-2023.csv` | https://ourworldindata.org/grapher/gdp-maddison-project-database.csv?v=1&csvType=full&useColumnShortNames=false | CC BY 4.0 (Maddison Project Database 2023, Bolt & van Zanden; OWID processing) | MPD 2023 release; OWID `lastUpdated` 2024-04-26. GDP = GDP per head × population, computed by OWID; international $ at 2011 prices. | `86b1fae7…fbd7` |
| `owid-gdp-maddison-project-database-2023.metadata.json` | https://ourworldindata.org/grapher/gdp-maddison-project-database.metadata.json | CC BY 4.0 | as above | `f79fb274…c3bd` |
| `maddison-2023-release-page.html` | https://www.rug.nl/ggdc/historicaldevelopment/maddison/releases/maddison-project-database-2023 | page states CC BY 4.0 for the database | MPD 2023 | `1431fb74…ebedf` |
| `wikipedia-ww2-casualties-oldid1376835265.wiki` | https://en.wikipedia.org/w/index.php?oldid=1376835265&action=raw | CC BY-SA 4.0 | Wikipedia "World War II casualties", revision 1376835265 of 2026-09-26T14:42:15Z | `922eddfb…092d` |

## transcribed/ — tables copied by hand from a document

| File | From | Location |
|---|---|---|
| `goldsmith-1946-munitions-via-harrison-1988-table1.csv` | `raw/harrison-1988-ehr-postprint.pdf` | Table 1, "Volume of combat munitions production of the major belligerents, 1935-44 (annual expenditure in $ billion, U.S. 1944 munitions prices)", postprint p. 3. Harrison's source: R. W. Goldsmith, "The power of victory: munitions output in World War II", *Military Affairs* 10 (1946), p. 75. 1935–9 is an annual average. All six rows (USA, Canada, UK, USSR, Germany, Japan) copied in full; Italy is not in the table. |
| `wikipedia-ww2-deaths-selected.csv` | `raw/wikipedia-ww2-casualties-oldid1376835265.wiki` | Section "Total deaths by country", table rows for the Soviet Union (wikitext lines 147–152), China (52), Nazi Germany (75), Poland (133–134), Japan (96), Yugoslavia (172–173), France (71), Italy (94), United Kingdom (165–167), United States (169–170). Columns "Military deaths from all causes" and "Total deaths", low and high ends of each stated range; the sources named are the ones the cell cites. Ten countries chosen: the seven great powers plus the three with the largest totals among the rest of the table's belligerents (Poland, Yugoslavia, China). |

## tidy/ — derived by `derive.mjs`

| File | Content |
|---|---|
| `munitions-by-coalition-goldsmith-1946.csv` | Goldsmith munitions summed: Allies = USA + Canada + UK + USSR; Axis = Germany + Japan. $ bn, US 1944 munitions prices. |
| `gdp-harrison-1998.csv` | Harrison table 1-3, long format: coalition, country, year, GDP ($ bn, 1990 international dollars). |
| `gdp-coalition-totals-harrison-1998.csv` | Coalition sums of the above; the script checks they reproduce Harrison's own "Allied total" and "Axis total" rows. |
| `gdp-us-uk-vs-axis-two-sources.csv` | Fixed country set (US + UK vs Germany + Italy + Japan; Harrison's Austria added to Germany), 1938–43, from Harrison 1998 and MPD 2023. |
| `armed-forces-harrison-1998.csv` | Harrison table 1-5, thousands. |
| `production-harrison-1998.csv` | Harrison table 1-6, by country, item, year (thousands, or units for naval vessels). |
| `ussr-vs-germany.csv` | USSR and Germany in 1942 and 1944 on five measures, with the ratio, unit and source table. |
| `deaths-wikipedia-2026-09.csv` | The transcription above, range-checked. |
