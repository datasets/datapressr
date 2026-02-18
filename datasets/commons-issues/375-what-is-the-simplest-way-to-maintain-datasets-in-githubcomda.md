---
number: 375
title: What is the (simplest) way to maintain datasets in github.com/datasets?
state: closed
author: rufuspollock
created_at: "2023-03-13T08:36:39Z"
updated_at: "2023-03-14T10:51:58Z"
closed_at: "2023-03-14T10:51:58Z"
labels: []
assignees: [davidgasquez]
---

# What is the (simplest) way to maintain datasets in github.com/datasets?

Quite a few of the core datasets are not getting updated. This raises the questions how we maintain the core datasets e.g.

- What patterns and tooling for creating and running data pipelines
- orchestration / running of that e.g. github actions or something else
- how we log errors
- how we (socially) know what datasets need updating and when (i.e. their frequency)

We could try this out re work of getting core datasets up to date #376

## Comments

### sabas (2023-03-13T11:31:31Z)

I try to maintain my main dataset (UN/LOCODE) when I remember, perhaps it could be useful to have a way of monitoring when a new release is needed by scraping the page from which we grab the dataset?
On datahub I see my dataset is stuck to 3 years ago, why?
