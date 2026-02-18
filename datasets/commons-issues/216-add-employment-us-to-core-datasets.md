---
number: 216
title: Add employment-us to core datasets
state: closed
author: rufuspollock
created_at: "2017-09-16T20:50:52Z"
updated_at: "2017-10-10T20:35:23Z"
closed_at: "2017-10-02T11:46:51Z"
labels: []
assignees: [Mikanebu]
---

# Add employment-us to core datasets

Currently living at: https://github.com/datasets/employment-us

For some reason this never got added to the registry list for core.

Note also that this also exists at https://old.datahub.io/dataset/us-employment-bls/resource/c3ade464-11cb-46b4-9181-27bb9505bf3d (and we can redirect)

## Comments

### Mikanebu (2017-10-02T06:19:55Z)

@rufuspollock added into [core list](https://github.com/datasets/registry/blob/master/core-list.csv) and fixed some properties https://github.com/datasets/employment-us/commit/5b014c7c2288cb6d3c0dd51ae47b6ec2ff2c72c3 according to the spec v1. And published under the `core` https://datahub.io/core/us-employment-bls .

### zelima (2017-10-02T11:45:22Z)

@Mikanebu I believe this is now fixed. Could you please close?

### Mikanebu (2017-10-02T11:46:51Z)

FIXED, it is live now in  https://datahub.io/core/us-employment-bls under the `core`

### rufuspollock (2017-10-05T14:53:50Z)

@mikanebu where is the graph for this dataset (cc @zelima). Our standard practice is to add a graph and it is good practice or us to do this!

### rufuspollock (2017-10-05T14:56:47Z)

@Mikanebu also it would have been nice to do things like add source info to the datapackage.json and maybe a note to the README. Please be **proactive** in this kind of work and go "above and beyond" in thinking what would make a high quality core dataset.

Also did you add a note about redirecting this to the redirection plan spreadsheet?

### Mikanebu (2017-10-05T17:53:53Z)

@rufuspollock Thanks for this advise, I will update it with `sources` property and update `readme.md` as well. In the future, I will be more proactive. Added into redirection plan spreadsheet

### rufuspollock (2017-10-10T14:55:43Z)

@Mikanebu can you also add a graph.

### rufuspollock (2017-10-10T15:56:20Z)

@Mikanebu is this live on datahub.io yet? Can you link to it here once it is.

### Mikanebu (2017-10-10T20:05:08Z)

@rufuspollock yes, I linked it when I closed this issue. See my comments ablove: https://datahub.io/core/us-employment-bls. Also, I will add graph as well

### Mikanebu (2017-10-10T20:35:23Z)

@rufuspollock Updated with graph, added sources property into `datapackage.json` and updated `README.md`
