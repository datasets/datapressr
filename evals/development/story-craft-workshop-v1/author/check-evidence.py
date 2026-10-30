from pathlib import Path
import csv,calendar,hashlib,json,re
root=Path(__file__).resolve().parent.parent
release=Path('/Users/rgrp/src/datasets/factory/releases/2026-temperature-record-hurdle/public-v2')
pins={}
for p in release.rglob('*'):
 if p.is_file():
  rel=p.relative_to(release); assert p.read_bytes()==(root/'original'/rel).read_bytes(),rel
  if str(rel)!='README.md': assert p.read_bytes()==(root/'revised'/rel).read_bytes(),rel
  pins[str(rel)]=hashlib.sha256(p.read_bytes()).hexdigest()
rows=list(csv.DictReader(line for line in (root/'original/2026-temperature-record-src/global-monthly.csv').read_text().splitlines() if not line.startswith('#')))
data={}
for r in rows:
 y,m=map(int,r['month'].split('-')[:2]);data.setdefault(y,{})[m]=float(r['ano_91-20'])
stored=json.loads((root/'original/2026-temperature-record-src/statistics.json').read_text())
results={}
for mode in ['months','days']:
 def w(y,m): return 1 if mode=='months' else calendar.monthrange(y,m)[1]
 def avg(y,months):return sum(data[y][m]*w(y,m) for m in months)/sum(w(y,m) for m in months)
 annual=avg(2024,range(1,13)); q4weights=sum(w(2026,m) for m in range(10,13))
 threshold=(annual*sum(w(2026,m) for m in range(1,13))-sum(data[2026][m]*w(2026,m) for m in range(1,10)))/q4weights
 repeat=(sum(data[2026][m]*w(2026,m) for m in range(1,10))+sum(data[2023][m]*w(2026,m) for m in range(10,13)))/sum(w(2026,m) for m in range(1,13))
 result={'annual_2024':annual,'q4_tie_threshold':threshold,'repeat_q4_2023_annual_2026':repeat,'repeat_q4_2023_shortfall_vs_2024':annual-repeat,'ytd_2026':avg(2026,range(1,10)),'q4_record':avg(2023,range(10,13))}
 for key,value in result.items():assert abs(value-stored['modes'][mode][key])<1e-12,(mode,key)
 assert max((avg(y,range(10,13)),y) for y in data if len(data[y])==12)[1]==2023
 assert max((avg(y,range(1,13)),y) for y in data if len(data[y])==12)[1]==2024
 results[mode]=result
for v in ['original','revised']:
 for link in re.findall(r'(?:href|src)="([^"]+)"',(root/v/'index.html').read_text()):
  if not link.startswith(('https:','#')):assert (root/v/link).exists(),link
out={'original_release_files_byte_identical':len(pins),'revised_non_story_files_byte_identical':len(pins)-1,'pins':pins,'central_arithmetic':results,'local_HTML_links':'all resolve'}
(root/'author/evidence-checks.json').write_text(json.dumps(out,indent=2)+'\n')
print(json.dumps(out,indent=2))
