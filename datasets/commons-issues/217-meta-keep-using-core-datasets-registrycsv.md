---
number: 217
title: "[meta] Keep using core datasets registry.csv"
state: open
author: rufuspollock
created_at: "2017-09-16T20:53:46Z"
updated_at: "2017-09-18T17:01:54Z"
labels: []
assignees: [zelima, Mikanebu]
---

# [meta] Keep using core datasets registry.csv

*NB: this is not an issue involving any tasks it is a FYI item*

For attention of @zelima and @Mikanebu as the lead core data curators.

As we start using the new datahub.io as the home for the core datasets it will be important to know where we keep the authoritative list of the core datasets.

The answer is that, for now, we should keep the authoritative list of core datasets here:

https://github.com/datasets/registry/blob/master/data/core-list.csv

And then use this to drive this tooling to load core datasets.

**That is: the source of truth for the list of core datasets is not datahub.io/core but the core-list.csv.**

This is important so we don't get out of sync ...

## Comments

### Mikanebu (2017-09-18T17:01:54Z)

@rufuspollock Understood
