---
number: 43
title: NUTS Administrative Boundaries
state: closed
author: rufuspollock
created_at: "2013-12-26T14:58:32Z"
updated_at: "2016-02-28T18:08:29Z"
closed_at: "2016-02-21T20:24:50Z"
labels: ["Type: Reference", "Format: Geodata", "Priority: ★★"]
---

# NUTS Administrative Boundaries

## Comments

### rufuspollock (2014-02-19T11:57:27Z)

@pudo do you already have these?

### ThomasG77 (2015-01-19T23:01:30Z)

Waiting but I'm interested: it's geodata dataset and I do GIS.
Which levels are wanted for NUTS?
We can already use http://ec.europa.eu/eurostat/web/gisco/geodata/reference-data/administrative-units-statistical-units except if licence is not OK (not sure about this, not a lawyer).

What about LAU, a.g https://en.wikipedia.org/wiki/Local_administrative_unit?

### rufuspollock (2015-01-20T07:08:04Z)

@ThomasG77 what levels are available for NUTS (I'm not an expert either). Re the license: we will sometimes live with a restrictive license (see e.g. ISO codes) but we will prominently note it and make clear that the data package license (if an open one) only applies to our efforts in packaging and that underlying data may have different and more restrictive rights that affect the data package.

Could you give more detail here on LAU ...

### rufuspollock (2015-02-08T12:22:01Z)

@ThomasG77 are you interested in taking on - this would be a nice one to do.

### ThomasG77 (2015-02-14T15:59:41Z)

I will begin to work on it. We may need to work on NUTS population overall instead of UK only e.g #51

### rufuspollock (2015-02-22T22:12:11Z)

@ThomasG77 how are you doing here - note this is NUTS boundaries _not_ populations per NUTS area

### ThomasG77 (2015-02-22T22:42:23Z)

I will do it this week (end of the week because already busy before)

### ThomasG77 (2015-05-02T16:16:42Z)

After a long time, it's done...
See my repository at https://github.com/ThomasG77/geo-nuts-administrative-boundaries

Feedback welcome (PS: already good for [validation](http://data.okfn.org/tools/validate?url=https%3A%2F%2Fraw.githubusercontent.com%2FThomasG77%2Fgeo-nuts-administrative-boundaries%2Fmaster%2Fdatapackage.json) and [visualisation](http://data.okfn.org/tools/view?url=https%3A%2F%2Fraw.githubusercontent.com%2FThomasG77%2Fgeo-nuts-administrative-boundaries%2Fmaster%2Fdatapackage.json)) before I give ownership to @datasets/owners

### rufuspollock (2015-05-02T19:00:28Z)

@ThomasG77 great job and thanks for the persistence!

@Yannael are you happy to review?

### Yannael (2015-05-05T05:33:34Z)

@ThomasG77 @rgrp 

Nice! Data format and view seem good.

I could not run the code though. 
- Dependency shelljs is missing
- Folder data must be created by hand
- and then get an error 

"debug(drivers.prototype.getNames());  
TypeError: Illegal invocation"

that I could not fix

Also,  
- I suggest you put the code (index.js and package.json) in a separate 'scripts' directory.
- you may add the 'contributors' and 'maintainers' fields if you wish to keep responsibility for the package. 

Thanks!

### ThomasG77 (2015-05-05T16:03:52Z)

@Yannael 

Due to your feedback, I've done the changes:
- to move `index.js` and `package.json` to `scripts` directory
- to add "contributors" and "maintainers" fields in `datapackage.json`

Also, I don't have any issue with "debug(drivers.prototype.getNames());"
Can you provide your system? On my side, for info, my OS is Ubuntu 14.04 64bits.

### Yannael (2015-05-05T22:31:57Z)

@ThomasG77 
Ok great

Regarding the issue with the code, my system is Mac OS X 10.7.5, and I have node.js v0.12.0 

The complete error message is 

```
/Users/yalb/Downloads/geo-nuts-administrative-boundaries-master/scripts/index.js:94
    debug(drivers.prototype.getNames());
                            ^
TypeError: Illegal invocation
    at Request.<anonymous> (/Users/yalb/Downloads/geo-nuts-administrative-boundaries-master/scripts/index.js:94:29)
    at Request.emit (events.js:129:20)
    at IncomingMessage.<anonymous> (/Users/yalb/Downloads/geo-nuts-administrative-boundaries-master/scripts/node_modules/request/request.js:1167:12)
    at IncomingMessage.emit (events.js:129:20)
    at _stream_readable.js:908:16
    at process._tickCallback (node.js:355:11)
```

Maybe this is a platform dependent issue, and I am not sufficiently acquainted to node.js to fix it 

@rgrp What do think, ok to move to core repository?

### ThomasG77 (2015-05-05T23:22:14Z)

@Yannael Can you remove the line doing `debug(drivers.prototype.getNames());` on your local side and try again?
This line was for learning purpose, so if it only fails here because of OS, it would be worth removing IMO.

### Yannael (2015-05-06T05:48:43Z)

@ThomasG77 @rgrp 

Commenting out the line is enough indeed, it runs fine now, great!

### ThomasG77 (2015-05-07T03:36:25Z)

I've done changes in the code to fix issue and in the README.md description for the script path.
The ownership has been changed too and the repo is currently at https://github.com/datasets/geo-nuts-administrative-boundaries The only thing we may change now could be the repository name? Other opinions @rgrp @Yannael ?
Do I update https://github.com/datasets/registry/blob/master/catalog-list.txt and https://github.com/datasets/registry/blob/master/core-list.txt ?

### Yannael (2015-05-07T07:14:55Z)

Nice, I updated catalog and core lists. The repository name is good for me

### lexman (2016-02-21T15:34:53Z)

Hello, 

has this dataset been published yet ?

### rufuspollock (2016-02-21T20:24:33Z)

Good question. The answer is yes: http://data.okfn.org/data/core/geo-nuts-administrative-boundaries

### rufuspollock (2016-02-21T20:24:50Z)

FIXED. This is done and live at http://data.okfn.org/data/core/geo-nuts-administrative-boundaries and https://github.com/datasets/geo-nuts-administrative-boundaries

### rufuspollock (2016-02-21T20:24:59Z)

@pdehaye can we get this tweeted?

### pdehaye (2016-02-26T21:37:28Z)

@rgrp done, tweeted

### danfowler (2016-02-28T18:08:29Z)

:+1:
