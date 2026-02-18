---
number: 46
title: EDGAR company identifiers (CIK)
state: open
author: rufuspollock
created_at: "2014-01-23T22:29:49Z"
updated_at: "2019-12-02T20:11:25Z"
labels: ["Type: Reference", "Priority: ★★"]
---

# EDGAR company identifiers (CIK)

There's a list here: http://www.sec.gov/edgar/NYU/cik.coleft.c

Would also be nice to have ticket to CIK (which EDGAR must have as they use in their search).

To do this you probably need to do a search by ticker on edgar standard search and request atom output e.g.

http://www.sec.gov/cgi-bin/browse-edgar?CIK=ibm&Find=Search&owner=exclude&action=getcompany&output=atom

Then parse the atom to grab the CIK. (If you prefer HTML output just omit output=atom).
