"""Separate raw-CSV reconstruction using Python stdlib csv and Decimal, offline."""
import csv, json, pathlib, decimal, sys
from decimal import Decimal as D
root=pathlib.Path(__file__).resolve().parents[1]
with (root/'inputs/raw/population.csv').open(encoding='utf-8-sig',newline='') as f:
    allrows=list(csv.DictReader(f))
r=[r for r in allrows if r['SUMLEV']=='010' and r['STATE']=='00'][0]
with (root/'inputs/data/components.csv').open(newline='') as f: tidy=list(csv.DictReader(f))
results=[]
for row in tidy:
    y=int(row['year_ending_july_1']); n=lambda field:D(r[field+str(y)])
    change=n('POPESTIMATE')-D(r['POPESTIMATE'+str(y-1)])
    natural=n('BIRTHS')-n('DEATHS'); mig=n('INTERNATIONALMIG')
    assert change==natural+mig+n('DOMESTICMIG')+n('RESIDUAL')==n('NPOPCHG_')
    for target,source in [('births_people','BIRTHS'),('deaths_people','DEATHS'),('natural_change_people','NATURALCHG'),('net_international_migration_people','INTERNATIONALMIG'),('net_domestic_migration_people','DOMESTICMIG'),('residual_people','RESIDUAL'),('population_end_people','POPESTIMATE'),('population_change_people','NPOPCHG_')]: assert D(row[target])==n(source)
    assert D(row['population_start_people'])==D(r['POPESTIMATE'+str(y-1)])
    for key,value in [('migration_share_of_change_percent',100*mig/change),('population_growth_percent',100*change/D(r['POPESTIMATE'+str(y-1)]))]: assert abs(D(row[key])-value)<D('1e-12')
    results.append({'year':y,'change_people':int(change),'natural_change_people':int(natural),'net_international_migration_people':int(mig),'migration_share_of_change_percent':str(100*mig/change)})
assert len(tidy)==4
print(json.dumps({'status':'PASS','method':'Python csv/Decimal independent implementation; same custodian, pending separate-person review','rows':results},indent=2))
