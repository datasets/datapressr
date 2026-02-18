---
number: 89
title: "Ecuador's government budget 2015"
state: closed
author: edobejar
created_at: "2015-04-21T02:28:14Z"
updated_at: "2015-05-18T07:12:09Z"
closed_at: "2015-05-18T07:12:09Z"
labels: []
---

# Ecuador's government budget 2015

Hi, 

This is my first datapackage. It's about Ecuador's government budget for 2015:
https://github.com/edobejar/presupuesto

Edo

## Comments

### Yannael (2015-04-21T18:29:26Z)

Great!
The data from the 'Data table' is however not displayed for me at 
http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fedobejar%2Fpresupuesto
(trying with Firefox/Chrome/Safari on Mac OS 10.7.5)

Not sure what the problem is. @rgrp any idea?

Datapackage.json infos:
- For the license, you should use an array, such as described in 
  http://dataprotocols.org/data-packages/
  and add the link in the license section of the Readme
-  It would be good to add the 'sources' field
  So the 'source' appears on the viewer such as in:
  http://data.okfn.org/data/core/language-codes
- Additionally you may add the 'contributors' and 'maintainers' fields if you wish to keep responsibility for the package.
  Thanks!

### edobejar (2015-04-21T19:52:13Z)

Done! Regarding the viewer, added quotes for each value, and also left the header without quotes:
http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fedobejar%2Fpresupuesto

And updated also datapackage.json with your suggestions.

### edobejar (2015-04-21T19:52:58Z)

By the way, at 
http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fedobejar%2Fpresupuesto
when I click the Metadata box (top right) I get not found. Any ideas?

### Yannael (2015-04-22T17:20:41Z)

Ok - looks good!

For the broken link in the Metadata box, the issue should be fixed once the package is moved to the  core repository.

@rgrp Can it be moved it to the core repository?

### rufuspollock (2015-05-02T13:06:31Z)

@Yannael yes this might be better as part of http://OpenSpending.org - @Yannael and @edobejar we are just in the midst of rebooting this work and process in OpenSpending - perhaps we finalise here and then see where we locate this data package.

@edobejar would you like to look at https://discuss.okfn.org/c/openspending and the various threads to get some context - I'd also be interested in your thoughts and feedback.

### Yannael (2015-05-04T05:53:53Z)

@rgrp @edobejar Added to catalog-list

### rufuspollock (2015-05-17T16:07:17Z)

@Yannael can we close this as FIXED w00t!
