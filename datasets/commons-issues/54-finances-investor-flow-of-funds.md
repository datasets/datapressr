---
number: 54
title: "[finances] Investor Flow of Funds"
state: open
author: rufuspollock
created_at: "2014-05-25T20:07:35Z"
updated_at: "2019-12-02T20:12:31Z"
labels: ["Priority: ★★★"]
---

# [finances] Investor Flow of Funds

Data on flows into and out of funds in the US from http://www.ici.org/research/stats

## Comments

### rufuspollock (2014-08-03T09:17:42Z)

FIXED. See http://data.okfn.org/data/core/investor-flow-of-funds-us

### rufuspollock (2015-02-08T13:04:53Z)

All packaged up https://github.com/datasets/investor-flow-of-funds-us but needs a maintainer!

### EnricGTorrents (2015-03-19T05:42:04Z)

I can take care of it, data needs to be collected every first day of the month?

### rufuspollock (2015-03-19T06:50:21Z)

@EnricGTorrents that's right - you need to run the script every month or less (that way we get full weekly data). Do you want to try running the script now and submitting a pull request. I can then give you full write access to the repo: https://github.com/datasets/investor-flow-of-funds-us

### EnricGTorrents (2015-03-20T15:16:59Z)

Got these errors with dataconverters and messytables when running the script on Python 3.4.3:

```
Traceback (most recent call last):
  File "C:\Users\Research Computer\Desktop\Open Knowledge Foundation\investor-flow-of-funds-us\scripts\process.py", line 6, in <module>
    from dataconverters import xls
  File "C:\Python34\lib\site-packages\dataconverters\__init__.py", line 3, in <module>
    import dataconverters.commas as dcsv
  File "C:\Python34\lib\site-packages\dataconverters\commas.py", line 5, in <module>
    from messytables import (
  File "C:\Python34\lib\site-packages\messytables\__init__.py", line 3, in <module>
    from messytables.headers import headers_guess, headers_processor, headers_make_unique
  File "C:\Python34\lib\site-packages\messytables\headers.py", line 18
    return max(counts.items(), key=lambda (k, v): v)[0]
                                          ^
SyntaxError: invalid syntax
```

Right now I am on Windows 8, I will try again later on another platform and / or Python version. Not sure what is causing the problem, any suggestions on how to proceed?

### EnricGTorrents (2015-03-20T17:17:29Z)

Ok, managed to run the script in Linux (Debian Wheezy) with Python 2.7.3. I will now send a pull request with the data. 

Seems that the problem on Win8 / Python 3.4 had to do with lxml. Note that the package unicodecsv is required but not included in the requirements.txt (pip install unicodecsv). I also had to install lxml before running the pip command: apt-get install libxml2-dev libxslt1-dev python-dev / apt-get install python-lxml

### rufuspollock (2015-04-26T18:26:44Z)

@EnricGTorrents how are you doing here? Would be great to have you as maintainer here.

/cc @Yannael are you happy to follow up to support @EnricGTorrents here if he has any problems?

### Yannael (2015-04-28T05:09:42Z)

@rgrp sure
@EnricGTorrents Let me know if I can help
