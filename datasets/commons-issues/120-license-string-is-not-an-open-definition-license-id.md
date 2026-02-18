---
number: 120
title: License string is not an Open Definition License ID
state: closed
author: femtotrader
created_at: "2015-09-22T17:08:00Z"
updated_at: "2015-09-23T09:19:31Z"
closed_at: "2015-09-23T09:19:31Z"
labels: []
---

# License string is not an Open Definition License ID

Hello,

I'm trying @trickvi datapackage https://github.com/trickvi/datapackage/ with this new datasets/registry DataPackage but it raises a warning.

```
/Users/femto/datapackage/datapackage/datapackage.py:236: UserWarning: License string is not an Open Definition License ID: PDDL-1.0
  warnings.warn("License string is not an Open Definition License ID: {0}".format(value))
```

I think we should fix this (on datasets/registry side)

Kind regards

## Comments

### femtotrader (2015-09-22T17:57:40Z)

I also wonder why trickvi/datapackage is warning user about this but http://data.okfn.org/tools/validate?url=https%3A%2F%2Fgithub.com%2Fdatasets%2Fregistry is just displaying "Valid" without warnings.

### trickvi (2015-09-22T23:00:04Z)

@femtotrader trickvi/datapackage warns about this because this particular id: ``"PDDL-1.0"" is not an Open Definition license ID. The data package specification says:

> license MUST be a string and its value SHOULD be an Open Definition license ID (preferably one that is Open Definition approved.

The list of licenses with identifiers is here: http://licenses.opendefinition.org/licenses/groups/all.json and the particular license in question is: http://licenses.opendefinition.org/licenses/ODC-PDDL-1.0.json

This shows that the id should be `"ODC-PDDL-1.0"` hence the warning.

I guess the http://data.okfn.org/tools/validate doesn't do validation on the same level as trickvi/datapackage.

### trickvi (2015-09-22T23:00:40Z)

...and I now see you've fixed this in #121
