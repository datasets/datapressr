---
number: 198
title: Daily Global Weather Measurements - GSOD on AWS
state: open
author: danfowler
created_at: "2016-09-29T20:11:48Z"
updated_at: "2016-10-03T06:28:47Z"
labels: []
---

# Daily Global Weather Measurements - GSOD on AWS

Amazon hosts this as one of their public datasets on S3.

https://aws.amazon.com/public-data-sets/gsod/

There is an R library for downloading a cleaned version of this dataset.

https://adamhsparks.github.io/GSODR/

I wonder if it is worth packaging this (pointing to the external Amazon-hosted resources) to have an alternative to this R package.

## Comments

### rufuspollock (2016-10-03T06:28:47Z)

@danfowler nice one Dan.
