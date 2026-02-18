---
number: 112
title: datapackage.json is missing ?
state: closed
author: femtotrader
created_at: "2015-09-14T18:34:50Z"
updated_at: "2015-09-22T15:21:51Z"
closed_at: "2015-09-22T15:21:51Z"
labels: []
---

# datapackage.json is missing ?

Hello,

I wonder why there is no `datapackage.json` in this repository ?

Any help is welcome.

Kind regards

## Comments

### Yannael (2015-09-14T20:59:42Z)

Hi,

The registry is not a data package, it is the repository that keeps track
of the data packages existing the datasets repository.

Best

On Mon, Sep 14, 2015 at 8:34 PM, femtotrader notifications@github.com
wrote:

> Hello,
> 
> I wonder why there is not datapackage.json in this repository ?
> 
> Any help is welcome.
> 
> Kind regards
> 
> —
> Reply to this email directly or view it on GitHub
> https://github.com/datasets/registry/issues/112.

## 

# 

Yann-Aël Le Borgne
Machine Learning Group
Université Libre de Bruxelles

http://mlg.ulb.ac.be

# http://www.ulb.ac.be/di/map/yleborgn

### femtotrader (2015-09-15T04:54:46Z)

Hi,

Why not making this repository a data package with 2 resources as tabular data ?
It will be very convenient for testing purpose because it will allow same tools to find
list of existing datasets.

Kind regards

### Yannael (2015-09-15T05:06:10Z)

That could indeed make sense,
@rgrp: any reasons why registry is not set as a data package?

On Tue, Sep 15, 2015 at 6:54 AM, femtotrader notifications@github.com
wrote:

> Hi,
> 
> Why not making this repository a data package with 2 resources as tabular
> data ?
> It will be very convenient for testing purpose because it will allow same
> tools to find
> list of existing datasets.
> 
> Kind regards
> 
> —
> Reply to this email directly or view it on GitHub
> https://github.com/datasets/registry/issues/112#issuecomment-140280308.

## 

# 

Yann-Aël Le Borgne
Machine Learning Group
Université Libre de Bruxelles

http://mlg.ulb.ac.be

# http://www.ulb.ac.be/di/map/yleborgn

### rufuspollock (2015-09-15T14:28:04Z)

@femtotrader great minds think alike ;-) This is a very sensible suggestion and actually relates to discussion of "data package catalogs" generally - https://github.com/dataprotocols/dataprotocols/issues/37#issuecomment-129239680

So, yes, we should do this - the only thing is to make sure we upgrade http://data.okfn.org/ - https://github.com/okfn/data.okfn.org at the same time.

### femtotrader (2015-09-19T08:45:06Z)

This code might help to convert to CSV and to look at HTTP status code
You can run it

```
python scripts/txt2csv.py --request --validate
```

Here is code

```
#!/usr/bin/env python

import click

import os
import numpy as np
import pandas as pd
import re

import requests
import datetime
import requests_cache
import warnings
import traceback

def get_user_project(url):
    """
    Returns a tuple (user, project) from a GitHub URL
    """
    pattern = "https:\/\/github.com\/(.*)\/(.*)"
    m = re.match(pattern, url)
    if m is not None:
        (user, project) = m.groups()
        return user, project
    return '', ''

def build_github_url(user, project, branch='master'):
    """
    Returns a GitHub URL from user, project and branch
    branch can be, for example 'master' but it can also be 'gh-pages'
    """
    return "https://raw.githubusercontent.com/%s/%s/%s/" % (user, project, branch)


def request_dpkg(url, session):
    return session.get(url + 'datapackage.json')

def is_valid(url, session):
    """
    Return tuple (valid, errors) to know if url is a valid DataPackage
    """
    url_api_base = 'http://data.okfn.org'
    endpoint = '/tools/validate.json'
    try:
        response = session.get(url_api_base + endpoint, params={'url': url})
        resp = response.json()
        return resp['valid'], resp['errors']
    except:
        return False, traceback.format_exc()

def from_json(r):
    try:
        return r.json()
    except:
        return

def get_name(dpkg):
    try:
        return dpkg['name']
    except:
        warnings.warn(traceback.format_exc())
        return

@click.command()
@click.option('--filename-in', default="catalog-list.txt,core-list.txt", help=u"Filenames")
@click.option('--request/--no-request', default=False, help=u"Status code")
@click.option('--validate/--no-validate', default=False, help=u"Validate")
def main(filename_in, request, validate):
    session = requests_cache.CachedSession(cache_name='cache', backend='sqlite', expire_after=datetime.timedelta(days=3))

    #cols = ['url', 'user', 'name']
    #cols = ['url', 'user', 'name', 'status_code', 'valid']

    for filename in filename_in.split(','):
        print("Processing '%s'" % filename)
        df = process(filename, request, validate, session)
        filename, ext = os.path.splitext(filename)
        filename_out = filename + ".csv"
        #df = df[cols]
        df.to_csv(filename_out, index=False)
        print("")

def process(filename_in, request, validate, session):
    """
    Read a txt file and returns a DataFrame
    """
    df = pd.read_csv(filename_in, names=['url'])
    s_user_project = df['url'].map(get_user_project)
    df['user'] = s_user_project.map(lambda t: t[0])
    df['project'] = s_user_project.map(lambda t: t[1])
    df['branch'] = 'master'

    df['url_optional'] = df.apply(
        lambda row: build_github_url(
            row['user'], row['project'], row['branch']), axis=1)

    if request:
        df['response'] = df['url_optional'].map(lambda url: request_dpkg(url, session))
        df['status_code'] = df['response'].map(lambda r: r.status_code)
        df['datapackage'] = df['response'].map(from_json)
        df['datapackage_name'] = df['datapackage'].map(get_name)

        print("")
        print("status_code!=200")
        print(df[df['status_code']!=200])

    if validate:
        df['valid'] = df['url_optional'].map(lambda url: is_valid(url, session)[0])
        print("")
        print("not valid")
        print(df[~df['valid']])

    df['name'] = np.where(df['datapackage_name']!=df['project'], df['datapackage_name'], '')

    return df


if __name__ == '__main__':
    main()
```

### femtotrader (2015-09-19T09:01:30Z)

I wonder if user, project and branch shouldn't be blank when they can be easily found using GitHub repository url.

I also output status code and noticed that it's different from 200 for the following repositories.

```
$ python scripts/txt2csv.py --status-code
processing 'catalog-list.txt'
status_code!=200
                                                   url           user  \
0    https://github.com/DemocracyClub/ge2015-candid...  DemocracyClub
61        https://github.com/datasets/transformer-test       datasets
80            https://github.com/jacquestardie/library  jacquestardie
124               https://github.com/theodi/hot-drinks         theodi

               project  branch  \
0    ge2015-candidates  master
61    transformer-test  master
80             library  master
124         hot-drinks  master

                                          url_optional  status_code
0    https://raw.githubusercontent.com/DemocracyClu...          404
61   https://raw.githubusercontent.com/datasets/tra...          404
80   https://raw.githubusercontent.com/jacquestardi...          404
124  https://raw.githubusercontent.com/theodi/hot-d...          404

processing 'core-list.txt'
status_code!=200
Empty DataFrame
Columns: [url, user, project, branch, url_optional, status_code]
Index: []
```

Maybe a similar test should be add to Travis CI

### femtotrader (2015-09-19T10:01:12Z)

In datasets/registry

these following Datapackages are not valid:

in `catalog-list`

```
                                                   url
0    https://github.com/DemocracyClub/ge2015-candid...
1              https://github.com/ElenaTomas/FirstTest
2     https://github.com/PV-Log/Open-Inverter-Database
3                  https://github.com/RDBinns/datactrl
21     https://github.com/datasets/citypopulation-year
29                  https://github.com/datasets/cpi-gb
40   https://github.com/datasets/geo-boundaries-us-...
41   https://github.com/datasets/geo-boundaries-wor...
44                    https://github.com/datasets/glwd
51             https://github.com/datasets/land-matrix
52   https://github.com/datasets/lme-large-marine-e...
61        https://github.com/datasets/transformer-test
65                    https://github.com/datasets/zopa
69             https://github.com/fozy81/nuclear-ghost
80            https://github.com/jacquestardie/library
82                     https://github.com/jrnold/CDB13
84             https://github.com/jrnold/playfair-data
88   https://github.com/mihi-tr/dpkg-medientransparenz
89   https://github.com/mihi-tr/dpkg-zimbabwe-censu...
90   https://github.com/mihi-tr/dpkg-zimbabwe-hospi...
95             https://github.com/okffi/popup-katalogi
102         https://github.com/openspending/dpkg-uk25k
106                https://github.com/prmkbr/data_pkgs
107              https://github.com/rgrp/crime-data-sf
116         https://github.com/stevesong/dp-afterfibre
117        https://github.com/stevesong/old-afterfibre
118  https://github.com/texttochange/uganda-admin-d...
120  https://github.com/theodi/csv-validation-research
121  https://github.com/theodi/dataset-metadata-survey
124               https://github.com/theodi/hot-drinks
```

in `core-list`

```
                                                url
38  https://github.com/datasets/citypopulation-year
```
