from pathlib import Path
import re,hashlib,csv,calendar,json,subprocess
base=Path(__file__).resolve().parents[1]
repo=base.parents[2]
factory=repo.parent/'factory'
brief=(repo/'docs/research/story-craft-workshop-v1/brief.md').read_text()
pins=re.findall(r'\| `([^`]+)` \| `([a-f0-9]{64})` \|',brief)
checks=[]
for name,pin in pins:
    original=(base/'original'/name).read_bytes()
    frozen=subprocess.check_output(['git','show',f'1af82923d5fb0c0085781a728d7aa2e0fa6b3e5a:releases/2026-temperature-record-hurdle/public-v2/{name}'],cwd=factory)
    digest=hashlib.sha256(original).hexdigest()
    assert digest==pin and original==frozen,name
    checks.append({'path':name,'sha256':digest,'approved_pin_and_frozen_git_blob_match':True})
rows=list(csv.DictReader(l for l in (base/'original/2026-temperature-record-src/global-monthly.csv').read_text().splitlines() if not l.startswith('#')))
data={tuple(map(int,r['month'].split('-')[:2])):float(r['ano_91-20']) for r in rows}
assert len(data)==len(rows)==1041
assert list(data)==[(y,m) for y in range(1940,2027) for m in range(1,13) if (y,m)<=(2026,9)]
stats=json.loads((base/'original/2026-temperature-record-src/statistics.json').read_text())
results={}
for mode in ['months','days']:
    def weight(y,m): return 1 if mode=='months' else calendar.monthrange(y,m)[1]
    def mean(y,ms): return sum(data[y,m]*weight(y,m) for m in ms)/sum(weight(y,m) for m in ms)
    annual={y:mean(y,range(1,13)) for y in range(1940,2026)}
    q4={y:mean(y,range(10,13)) for y in range(1940,2026)}
    ytd={y:mean(y,range(1,10)) for y in range(1940,2027)}
    annual_w=sum(weight(2026,m) for m in range(1,13))
    actual_sum=sum(data[2026,m]*weight(2026,m) for m in range(1,10))
    tie=(annual[2024]*annual_w-actual_sum)/sum(weight(2026,m) for m in range(10,13))
    repeat=(actual_sum+sum(data[2023,m]*weight(2026,m) for m in range(10,13)))/annual_w
    out={'annual_2024':annual[2024],'ytd_2026':ytd[2026],'q4_tie_threshold':tie,'q4_record':max(q4.values()),'q4_record_year':max(q4,key=q4.get),'threshold_minus_q4_record':tie-max(q4.values()),'repeat_q4_2023_annual_2026':repeat,'repeat_q4_2023_shortfall_vs_2024':annual[2024]-repeat}
    for k,v in out.items(): assert abs(v-stats['modes'][mode][k])<1e-12,(mode,k)
    assert max(annual,key=annual.get)==2024
    assert sorted(ytd,key=ytd.get,reverse=True)[:2]==[2024,2026]
    for item in stats['modes'][mode]['q4_history']: assert abs(q4[item['year']]-item['value'])<1e-12
    for item in stats['modes'][mode]['cumulative_recent']: assert abs(mean(item['year'],range(1,item['through_month']+1))-item['value'])<1e-12
    for item in stats['modes'][mode]['scenario_cumulative_2026_repeat_2023_q4']:
        end=item['through_month']; value=(actual_sum+sum(data[2023,m]*weight(2026,m) for m in range(10,end+1)))/sum(weight(2026,m) for m in range(1,end+1)); assert abs(value-item['value'])<1e-12
    results[mode]={**out,'ytd_2024':ytd[2024],'annual_record_year':max(annual,key=annual.get),'all_stored_chart_series_checked':True}
print(json.dumps({'pins':checks,'coverage_rows':len(rows),'arithmetic':results},indent=2))
