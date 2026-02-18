---
number: 245
title: BigQuery datasets
state: open
author: rufuspollock
created_at: "2018-01-09T19:34:15Z"
updated_at: "2019-11-28T16:37:35Z"
labels: []
---

# BigQuery datasets

A specific page of bigquery prepared datasets

* The official samples: https://cloud.google.com/bigquery/sample-tables
* Curated list on reddit: https://www.reddit.com/r/bigquery/wiki/datasets

## Comments

### saad-gh (2018-05-01T12:36:30Z)

`process.py` for [these](https://bigquery.cloud.google.com/dataset/bigquery-public-data:samples) tables can be done in 1 - 3 hours.

### zelima (2018-05-02T06:11:02Z)

@saad-gh could you please be more descriptive. Eg 
* the link you provided does not really work - says `unable to find dataset: bigquery-public-data:samples`
* How the data will look like. Eg: what columns it will have
  * maybe you could draft the `datapackage.json`

### saad-gh (2018-05-02T08:54:45Z)

@zelima Ok. 

- I think maybe its because the API is enabled with my personal account, therefore, I was able to visit the link. 
- I will start working on the datapackage.json

### rufuspollock (2018-05-04T20:21:03Z)

@saad-gh all that is wanted here to start with is a simple markdown page for bigquery datasets listing what is out there - no data packaging at all.

Aside: this is a case where "data packages in markdown" using yaml might be cool! e.g.

```
...

```datapackage
yaml version of datapackage
``` // end
```

And have this nicely rendered as a data package ... - we could call this datadown :wink:
