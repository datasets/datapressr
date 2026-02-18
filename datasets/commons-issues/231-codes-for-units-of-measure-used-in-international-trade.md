---
number: 231
title: Codes for Units of Measure Used in International Trade
state: closed
author: sabas
created_at: "2018-03-26T13:41:01Z"
updated_at: "2018-04-03T06:55:47Z"
closed_at: "2018-04-03T06:55:47Z"
labels: []
---

# Codes for Units of Measure Used in International Trade

UNECE Recommendation 20
Transform and normalize an Excel file
https://www.unece.org/fileadmin/DAM/uncefact/recommendations/rec20/rec20_Rev13e_2017.xls

## Comments

### rufuspollock (2018-03-29T08:25:54Z)

@sabas brilliant - would you be up for packaging?

### sabas (2018-03-29T16:38:57Z)

I made this, removing the symbols and conversion columns because they had a lot of symbols that broke in the conversion. If it's acceptable I move to the datasets org
https://github.com/sabas/unece-units-of-measure

### rufuspollock (2018-03-31T09:44:58Z)

@sabas can you report whether you have validated this i.e. run `data validate` on the dataset using the `data` command line tool https://datahub.io/docs/features/data-cli

@Mikanebu (and @zelima) can you review @sabas new dataset here and if acceptable let's get it across.

### sabas (2018-03-31T18:23:36Z)

@rufuspollock nice, I didn't know that!
I tried but I get the following error
```
/usr/lib/node_modules/data-cli/node_modules/datahub-client/lib/cat.js:12
const getRows = async (fileOrStream, {sheet}={}) => {
                      ^

SyntaxError: Unexpected token (
    at createScript (vm.js:56:10)
    at Object.runInThisContext (vm.js:97:10)
    at Module._compile (module.js:549:28)
    at Object.Module._extensions..js (module.js:586:10)
    at Module.load (module.js:494:32)
    at tryModuleLoad (module.js:453:12)
    at Function.Module._load (module.js:445:3)
    at Module.require (module.js:504:17)
    at require (internal/module.js:20:19)
    at Object.<anonymous> (/usr/lib/node_modules/data-cli/node_modules/datahub-client/index.js:1:75)
```

### anuveyatsu (2018-03-31T19:03:12Z)

@sabas Hi! It seems like you're using older NodeJS version - you need version `>7.6`.

### sabas (2018-03-31T19:41:35Z)

Thank you @anuveyatsu I upgraded to the latest version
@rufuspollock I fixed the json accordingly and validated

### Mikanebu (2018-04-01T16:12:18Z)

@sabas Great! There is one typo in https://github.com/sabas/unece-units-of-measure/blob/83b6ed270f8d44355b800f7a03f27937843e3e35/datapackage.json#L5 (`licenses` instead of `licensces`). Also, including `Preparation` section to `readme.md` would be a bonus point. Please, see https://github.com/datasets/pharmaceutical-drug-spending#preparation

### sabas (2018-04-01T16:58:59Z)

Done.

### Mikanebu (2018-04-01T17:02:58Z)

@sabas Thanks! 
@zelima It is ready to go under `datasets` organization. Do I need to publish it under `core`? 
cc: @rufuspollock

### zelima (2018-04-02T04:55:59Z)

@Mikanebu yes, let's transfer the ownership and publish under core

### Mikanebu (2018-04-02T12:16:59Z)

@sabas Could you transfer ownership to the datasets org ? I will publish under `core`

### sabas (2018-04-02T15:41:24Z)

https://github.com/datasets/unece-units-of-measure here it is @Mikanebu

### Mikanebu (2018-04-02T15:48:35Z)

@sabas Well done! 🎆It is available now on https://datahub.io/core/unece-units-of-measure. Also, added into registry https://datahub.io/core/registry. Added description and link to DataHub https://github.com/datasets/unece-units-of-measure.

### rufuspollock (2018-04-02T19:06:16Z)

@sabas awesome work - and you should become an official member of the data curator team and get a badge, see #232

### rufuspollock (2018-04-02T19:06:31Z)

@Mikanebu do you want to close the issue with a FIXED statement?

### Mikanebu (2018-04-03T06:55:47Z)

FIXED, the dataset is live now on DataHub https://datahub.io/core/unece-units-of-measure. Added into datasets org https://github.com/datasets/unece-units-of-measure.
