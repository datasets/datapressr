---
number: 163
title: R datasets
state: open
author: s-celles
created_at: "2016-02-25T12:34:22Z"
updated_at: "2016-03-11T07:25:12Z"
labels: []
---

# R datasets

Hello,

it will be nice to convert R datasets to DataPackages so that they will be available both for R and Python
(and also any language where a DataPackage client is available) in a structured way.

see these projects
https://github.com/vincentarelbundock/Rdatasets
https://github.com/iamaziz/PyDataset

see also
https://github.com/iamaziz/PyDataset/issues/7
https://github.com/vincentarelbundock/Rdatasets/issues/19

Kind regards

## Comments

### rufuspollock (2016-03-04T16:22:54Z)

@scls19fr this is a great suggestion and would be great to connect these up.

### s-celles (2016-03-04T17:23:59Z)

This R script might help https://github.com/Rdatasets/Rdatasets/blob/master/Rdatasets2dpkg.R
But it's failing on `datasets::HairEyeColor` dataset because we need to flatten data before saving to DataPackage (since there is no "standardized" cube/hypercube format - see https://discuss.okfn.org/t/datapackage-for-3-dimensional-arrays-and-maybe-more/2107 )

I'm not a great R user ... maybe you know someone who can have a look at this ?

I see 2 paths:
1) a short term path: flatten data and save to DataPackage (and accept that user will have to re-create structure of data such as hierarchical index, 3 (or more) dimensional data). That shouldn't be a great effort.
2) a long term path: create a format (probably on top of JSON) to store cube/hypercube data and have a ND-array / N dimensional DataFrame JavaScript implementation. https://github.com/rgrp/dataframe.js ... that's the hard way !

I think the short term approach will help to see some technical details for the second approach that we weren't aware of.

### rufuspollock (2016-03-09T09:05:23Z)

@scls19fr got you. We are doing some work on an R Tabular Data Package library right now. This may be something to feed in.

In the short term i think we do option (1) and see how that goes.

### s-celles (2016-03-09T09:09:34Z)

Nice news! Thanks @rgrp Could you post here link about this work when it will be available ?

### danfowler (2016-03-09T11:32:45Z)

@scls19fr I can keep you updated on the availability of an R library

### s-celles (2016-03-09T11:58:40Z)

Thanks @danfowler 

A local cache will be a great feature.

Automatically downloading several datasets (whole https://github.com/datasets/registry for example ) will also be an other interesting feature for such an R library.

### rufuspollock (2016-03-11T07:25:12Z)

@danfowler @scls19fr updates on R library will be in the main Data Package tracking repo here https://github.com/okfn/data.okfn.org/issues/102
