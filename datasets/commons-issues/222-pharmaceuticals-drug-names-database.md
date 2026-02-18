---
number: 222
title: Pharmaceuticals / Drug Names Database
state: open
author: rufuspollock
created_at: "2017-10-23T12:31:04Z"
updated_at: "2017-10-25T13:33:40Z"
labels: []
---

# Pharmaceuticals / Drug Names Database

A list of officially approved drugs with their trade name and medical name plus other relevant info.

What we would like:

* Official (clinical) name
* Brand name(s)
* Short description (?)
* Disease it is related to (?)
* Translations into other languages (?)
* Primary manufacturer (?)

A good starting point might be FDA drugs database:

https://www.fda.gov/drugs/informationondrugs/

See also https://discuss.okfn.org/t/database-of-drug-names/880

## Comments

### vitorbaptista (2017-10-24T10:59:23Z)

@sebbacon Do you know of any sources we're missing here (specially on the Discuss thread)?

### sebbacon (2017-10-25T13:33:12Z)

Hi - DM+D is the canonical UK dataset that is supposed to underpin everything else in NHS - you don't want to miss that. These are the British drug names which are mostly the same as the International drug names (IIRC they're supposed to be converging very quickly if not already).  These are mapped to SNOMED codes.  http://dmd.medicines.org.uk/

Also available as (XML) downloads.

I would also take a look at MHRA publications though there is no open data dataset - but I believe their monthly (?) approvals *are* OK to copy.

### sebbacon (2017-10-25T13:33:40Z)

P.S. "Primary Manufacturer" is a surprisingly slippery concept
