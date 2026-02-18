---
number: 114
title: Add unit tests and continuous integration
state: open
author: femtotrader
created_at: "2015-09-19T09:10:08Z"
updated_at: "2016-09-01T11:46:42Z"
labels: ["Tooling: feature request"]
---

# Add unit tests and continuous integration

Hello,

when datasets/registry will be a DataPackage it will be a good idea to ensure that every URL are available and requests returns a HTTP status code == 200.

Such a test could be done using python and requests (see some sample code https://github.com/datasets/registry/issues/112 )

but a more rigorous approach (maybe in a second time) could be to ensure that they are "valid" DataPackages.

It will avoid to add bad DataPackages url to this repository.

Kind regards

## Comments

### rufuspollock (2015-09-21T10:15:53Z)

Great suggestion!

### danfowler (2016-08-26T21:34:00Z)

👍 

Lots of datasets in this organization are not quite valid for one reason or another.  It would be good to get some validation in place.

Going even further: https://github.com/frictionlessdata/ex-continuous-data-integration

### femtotrader (2016-08-29T12:51:48Z)

The "problem" here is that each repository is responsible of testing if its data are valid or not.

You have to visit each repository to see if it's valid or not.

If code of validator or datapackage spec change you have to run CI in EACH repository. It may be quite long.

I think we should be able to download a lot of datapackage locally (for example all https://github.com/datasets/registry ) so a cache mechanism is something very important https://github.com/frictionlessdata/datapackage-py/issues/72 ) and run validation with cached datapackages.

We will only have to use CI in ONE repository which will be responsible of testing if datapackage are valid (or not)

### rufuspollock (2016-08-29T12:55:22Z)

@danfowler I have ideas / plans as to how to do this. However, want to do this as part of the systematic infrastructure upgrade we are planning here ;-)

### femtotrader (2016-08-29T20:12:03Z)

Some (quick and dirty) code that might help.

``` python
from requests import Session
from unittest import TestCase

import re
import datapackage

pattern = re.compile("https:\/\/github\.com\/(.*)\/(.*)")


def fix_url(url, pattern):
    m = re.search(pattern, url)
    if m is not None:
        owner, repository = m.groups()
        return "https://raw.githubusercontent.com/%s/%s/master/datapackage.json" % (owner, repository)
    else:
        return url


class TestDatasets(TestCase):
    def setUp(self):
        self.session = Session()

    def test_datasets(self):
        url_registry = "https://github.com/datasets/registry"
        url_registry = fix_url(url_registry, pattern)
        dp_registry = datapackage.DataPackage(url_registry)
        print(url_registry)
        dp_registry.validate()

        for resources in dp_registry.resources:
            for data in resources.data:
                url = data["url"]
                url = fix_url(url, pattern)
                dp = datapackage.DataPackage(url_registry)
                print(url)
                dp.validate()
```

that can be run using

```
$ nosetests -s -v tests/test_dp.py
```

but there are 2 issues:
- no cache (so running several times can cause important network traffic and it's quite long!) https://github.com/frictionlessdata/datapackage-py/issues/72
- it doesn't catch any problem (because validator is not strict enough) even with datapackage that are known to be invalid https://github.com/datasets/gdp/issues/5 https://github.com/frictionlessdata/datapackage-validate-js/issues/12 https://github.com/frictionlessdata/datapackage-py/issues/105

### rufuspollock (2016-09-01T11:35:36Z)

@femtotrader that's amazing - thanks!
