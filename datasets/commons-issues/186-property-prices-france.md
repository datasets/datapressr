---
number: 186
title: Property Prices (France)
state: open
author: s-celles
created_at: "2016-05-17T09:03:28Z"
updated_at: "2018-01-18T13:21:51Z"
labels: ["Type: Indicator", "Priority: ★★"]
assignees: [lexman, AcckiyGerman]
---

# Property Prices (France)

Following https://github.com/datasets/registry/issues/55

From @lexman

> For France a lot of data can be found here : http://www.cgedd.developpement-durable.gouv.fr/prix-immobilier-evolution-a-long-terme-a1048.html
> 
> Including prices in Paris since 1200 : http://www.cgedd.developpement-durable.gouv.fr/IMG/xls/prix-immo-paris-1200-2012_cle2f2d1a.xls

This Python script might help to download files for each department:

``` python
#!/usr/bin/env python

import requests
import os.path
import shutil

def download_files():
    lst = [
        ("01", "ain"), 
        ("02", "aisne"), 
        ("03", "allier"), 
        ("05", "hautes-alpes"), 
        ("04", "alpes-de-haute-provence"), 
        ("06", "alpes-maritimes"), 
        ("07", "ardeche"), 
        ("08", "ardennes"), 
        ("09", "ariege"), 
        ("10", "aube"), 
        ("11", "aude"), 
        ("12", "aveyron"), 
        ("13", "bouches-du-rhone"), 
        ("14", "calvados"), 
        ("15", "cantal"), 
        ("16", "charente"), 
        ("17", "charente-maritime"), 
        ("18", "cher"), 
        ("19", "correze"), 
        ("2A", "corse-du-sud"),
        ("2B", "haute-corse"), 
        ("21", "cote-d'or"), 
        ("22", "cotes-d'armor"), 
        ("23", "creuse"), 
        ("24", "dordogne"), 
        ("25", "doubs"), 
        ("26", "drome"), 
        ("27", "eure"), 
        ("28", "eure-et-loir"), 
        ("29", "finistere"), 
        ("30", "gard"), 
        ("31", "haute-garonne"), 
        ("32", "gers"), 
        ("33", "gironde"), 
        ("34", "herault"), 
        ("35", "ille-et-vilaine"), 
        ("36", "indre"), 
        ("37", "indre-et-loire"), 
        ("38", "isere"), 
        ("39", "jura"), 
        ("40", "landes"), 
        ("41", "loir-et-cher"), 
        ("42", "loire"), 
        ("43", "haute-loire"), 
        ("44", "loire-atlantique"), 
        ("45", "loiret"), 
        ("46", "lot"), 
        ("47", "lot-et-garonne"), 
        ("48", "lozere"), 
        ("49", "maine-et-loire"), 
        ("50", "manche"), 
        ("51", "marne"), 
        ("52", "haute-marne"), 
        ("53", "mayenne"), 
        ("54", "meurthe-et-moselle"), 
        ("55", "meuse"), 
        ("56", "morbihan"), 
        ("57", "moselle"), 
        ("58", "nievre"), 
        ("59", "nord"), 
        ("60", "oise"), 
        ("61", "orne"), 
        ("62", "pas-de-calais"), 
        ("63", "puy-de-dome"), 
        ("64", "pyrenees-atlantiques"), 
        ("65", "hautes-pyrenees"), 
        ("66", "pyrenees-orientales"), 
        ("67", "bas-rhin"), 
        ("68", "haut-rhin"), 
        ("69", "rhone"), 
        ("70", "haute-saone"), 
        ("71", "saone-et-loire"), 
        ("72", "sarthe"), 
        ("73", "savoie"), 
        ("74", "haute-savoie"), 
        ("75", "paris"), 
        ("76", "seine-maritime"), 
        ("77", "seine-et-marne"), 
        ("78", "yvelines"), 
        ("79", "deux-sevres"), 
        ("80", "somme"), 
        ("81", "tarn"), 
        ("82", "tarn-et-garonne"), 
        ("83", "var"), 
        ("84", "vaucluse"), 
        ("85", "vendee"), 
        ("86", "vienne"), 
        ("87", "haute-vienne"), 
        ("88", "vosges"), 
        ("89", "yonne"), 
        ("90", "territoire-de-belfort"), 
        ("91", "essonne"), 
        ("92", "hauts-de-seine"), 
        ("93", "seine-saint-denis"), 
        ("94", "val-de-marne"), 
        ("95", "val-d'oise"), 
        # ("976", "mayotte"), 
        ("971", "guadeloupe"), 
        ("973", "guyane"), 
        ("972", "martinique"), 
        ("974", "reunion")
    ]

    errors = 0
    downloaded = 0
    from_cache = 0
    for i, (num, dept) in enumerate(lst):
        filename = "immobilier-%s-%s.xls" % (dept, num)
        url = "http://www.cgedd.fr/valeur-immobilier-departement/%s" % filename
        if not os.path.isfile(filename):
            print("%03d - Downloading %s" % (i+1, url))
            r = requests.get(url, stream=True)
            if r.status_code == 200:
                with open(filename, 'wb') as f:
                    r.raw.decode_content = True
                    shutil.copyfileobj(r.raw, f)
                downloaded += 1
            else:
                print("status_code is %d - skipping" % r.status_code)
                errors += 1
        else:
            print("%03d - File '%s' was downloaded previously - skipping" % (i+1, filename))
            from_cache += 1
    print("%d file retrieved (downloaded: %d - from_cache: %d - errors: %d)" % (i+1, downloaded, from_cache, errors))

def main():
    download_files()

if __name__ == "__main__":
    main()

```

processing may also be done using Python Pandas to output "raw" csv files

This script can also help to find xls, xlsx, csv links

``` python
from bs4 import BeautifulSoup
import requests

def find_links():
    url = "http://www.cgedd.developpement-durable.gouv.fr/prix-immobilier-evolution-a-long-terme-a1048.html"
    r = requests.get(url)
    html = r.content
    soup = BeautifulSoup(html)
    i = 0
    for link in soup.findAll("a"):
        href = link.get("href")
        if href is not None:
            for ext in [".xls", ".xlsx", ".csv"]:
                if ext in href:
                    i += 1
                    print(href)
    print("%03d links found" % i)

if __name__ == "__main__":
    find_links()
```

## Comments

### s-celles (2016-05-17T09:47:53Z)

This script (process.py)

``` python
#!/usr/bin/env python

import click
import os.path
import traceback
import glob
import pandas as pd
pd.set_option("max_rows", 10)

@click.command()
@click.option('--filename', default='immobilier-ain-01.xls', help='Filename')
@click.option('--output', default='csv', help='Type of output')
@click.option('--skiprows', default=4, help='Skip rows')
@click.option('--all/--no-all', default=False)
def main(all, filename, output, skiprows):
    output = output.lower()
    if all:
        filenames = glob.glob("immobilier-*-*.xls")
    else:
        filenames = [filename]

    errors = 0
    for i, filename in enumerate(filenames):
        try:
            process(filename, output, skiprows)    
        except:
            print(traceback.format_exc())
            errors += 1
    print("%d files processed (errors: %d)" % (i+1, errors))


def process(filename, output, skiprows):
    print("Read '%s'" % filename)
    df = pd.read_excel(filename, skiprows=skiprows, sheetname="Données", header=[0,1,2])
    print(df)
    print(df.columns)
    if output == 'csv':
        filename_out = os.path.splitext(filename)[0] + ".csv"
        print("Write to '%s'" % filename_out)
        df.to_csv(filename_out, index=False)

if __name__ == "__main__":
    main()

```

can process all department files and output to CSV.

Some manual cleanup (renaming columns...) may be necessary.

### lexman (2016-05-17T14:16:47Z)

Great @scls19fr  ! Do you plan to make a house-prices-fr datapackage ?

### s-celles (2016-05-17T15:16:35Z)

I'm quite busy these days. But I think that someone (maybe you if you can) can do it quite easily thanks to these 3 scripts. I'm using Anaconda Python.
`requests`, `click`, `pandas` are required packages
`conda install package_name`

### lexman (2016-05-18T03:18:00Z)

I'll do it... In a few days !

### rufuspollock (2016-06-11T12:13:04Z)

@lexman how are you doing here?

### lexman (2016-06-12T14:06:35Z)

Hello, 

All I've been able to do yet is to look at the files. 

Unfortunately, the files for each _departement_ contain only the number of houses sold, not the prices ; the only file with prices is about Paris.

I won't be able to package it before a couple of weeks. Be back in a while...

### zelima (2016-07-19T09:57:15Z)

@lexman Any progress here? maybe need some help?

### lexman (2016-07-20T10:36:58Z)

Sorry @zelima, I was short on time for pas few weeks. I'll get back to it in a few days...

### rufuspollock (2016-08-01T15:22:21Z)

@lexman I'd leave this open here until we have a complete data package otherwise we lose track (even if there is a separate issue on the dataset repo). Hope that makes sense.

And great to see this in progress!

### lexman (2016-08-04T06:14:35Z)

Sorry, I didn't notice I had closed the issue. It seams I pushed the wrong button when I made the comment... I'll let you know when work is over :)

### rufuspollock (2016-08-22T07:07:35Z)

@lexman great!

### rufuspollock (2017-11-30T11:36:52Z)

@lexman any updates here? /cc @Mikanebu 

https://github.com/lexman/house-prices-fr

### rufuspollock (2018-01-15T18:22:19Z)

@lexman i've cloned your repo to https://github.com/datasets/house-prices-fr so we can get it up to scratch and get it published. I trust this is ok 😄 

@AcckiyGerman can you take a look at https://github.com/datasets/house-prices-fr and check it is working and get it published (over the new few weeks).

### AcckiyGerman (2018-01-18T13:21:39Z)

yes, will do.
