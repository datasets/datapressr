---
number: 118
title: Licenses, list of most used ones
state: open
author: ppKrauss
created_at: "2015-09-21T13:25:15Z"
updated_at: "2019-12-02T19:54:36Z"
labels: ["Type: Reference"]
---

# Licenses, list of most used ones

List all useful ([non-vanity](https://en.wikipedia.org/wiki/License_proliferation#Vanity_licenses)) licenses, not only the open ones.  Of course, the main are the open, and there are a lot of JSON materal at [okfn/licenses](https://github.com/okfn/licenses), about licenses, but no "official CSV dataset".  [This `licenses.csv` is a draft  proposal](https://github.com/ppKrauss/dataset_licenses/blob/master/data/licenses.csv).  

---

The prepare and maintenance will be simple, :
1. converts the JSON data, as examplified at https://github.com/ppKrauss/dataset_licenses
2. Use the `context` column (that was empty at JSON data), with a new semantic: the inferred "canonical license" of each license, to group similar ones. 
3. Add some more licenses, because the license list is a "knowledge source", not only a tool  for open-licence advocacy.

Example of family: the licences _OGL-UK-1.0_,  _OPL-1.0_,  _CC-BY-2.0_,  _CC-BY-4.0_, etc.are similar and can be grouped into a family. We elected the CC-BY as  representant of the group, so  _cc-by_ is the label of the family  (and CC-BY is the canonical license of the family).

## Comments

### ppKrauss (2015-09-22T02:26:12Z)

Sorry, I changed the text of the issue, now is more simple and readable... ignore email text and use updated at [datasets/registry/issues/118](https://github.com/datasets/registry/issues/118).

### pdehaye (2015-12-01T21:43:36Z)

This looks very good, and useful. I would recommend adding rows for intermediate licenses though: if this is meant as a reference, it might be that someone wants to mark their stuff using now obsolete licenses?
Also, the `maintainer` type is a string, not a number, in the `datapackage.json`

### ppKrauss (2015-12-05T20:08:41Z)

Hi @pdehaye , thanks (!), now I review, adding more 2 csv files, and correctiong `datapackage.json`. See  [dataset_licenses](https://github.com/ppKrauss/dataset_licenses)...  I think now the project  have a more definitive aspect.

### pdehaye (2015-12-10T23:43:37Z)

I think the name has to match what is in the datapackage.json, so the name of this dataset should be changed from `dataset_licenses` to `licenses`. 

The sources listed in the `datapackage.json` don't match the sources in the `README.md`.

Also, `implied.csv` 's format is not documented in `datapackage.json`.  (also, spelling wrong: "inffering" is actually "inferring")

### ppKrauss (2015-12-11T15:40:13Z)

@pdehaye , thanks.  I changed the project's name to  [licenses](https://github.com/ppKrauss/licenses), corrected spelling problems, and added the cited (in progress) `implied.csv` in the _datapackage_.

### ppKrauss (2015-12-14T01:07:34Z)

Hi @pdehaye , do you see [okfn/licenses/issues/45](https://github.com/okfn/licenses/issues/45)?  Perhaps we can join efforts there...
