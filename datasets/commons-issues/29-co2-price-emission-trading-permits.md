---
number: 29
title: "CO2 \"Price\" (Emission trading permits)"
state: closed
author: rufuspollock
created_at: "2013-08-21T09:21:38Z"
updated_at: "2016-01-21T21:16:56Z"
closed_at: "2016-01-21T21:16:52Z"
labels: ["Type: Indicator", "Topic: Climate"]
---

# CO2 "Price" (Emission trading permits)

Where can we get CO2 price and emission trading scheme info? Which regions run emissions trading schemes?
## EU data

http://www.eea.europa.eu/data-and-maps/data/european-union-emissions-trading-scheme-eu-ets-data-from-citl-7

Data about the EU emission trading system (ETS). The EU ETS data viewer provides aggregated data on emissions and allowances, by country, sector and year. The data mainly comes from the EU Transaction Log (EUTL). Additional information on auctioning and scope corrections is included.

## Comments

### kiliakis (2015-12-10T11:04:34Z)

@rgrp EU ETS datapackage is ready. Links:
- Location: https://github.com/kiliakis/eu-emissions-trading-system
- Validation: http://data.okfn.org/tools/validate?url=https%3A%2F%2Fraw.github.com%2Fkiliakis%2Feu-emissions-trading-system%2Fmaster%2Fdatapackage.json
- Package Viewer: http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fkiliakis%2Feu-emissions-trading-system

Please advise me if there is anything that needs to be altered/ added/ removed.

### pdehaye (2015-12-10T22:31:16Z)

Looks good! @rgrp, this should be included into core. What is the procedure? Do I create a new repository in datasets/ ? Or just include "https://github.com/kiliakis/eu-emissions-trading-system" in core-list.txt ? Embarrassed not to know this as the managing curator...

### pdehaye (2015-12-10T22:31:33Z)

And thanks, @kiliakis !!!

### kiliakis (2015-12-11T00:19:35Z)

@pdehaye thank you too!

### rufuspollock (2015-12-12T20:37:40Z)

@pdehaye we move the dataset across in datasets organization and then we add to core list.

@kiliakis good work.

### pdehaye (2016-01-06T13:06:42Z)

@kiliakis It looks like you are the one who can transfer the dataset across into the datasets organization, as you are the original owner. (I have never done it myself, but this is what GitHub documentation says) Can you do that, and also modify the core-list.txt and submit a pull request?

### rufuspollock (2016-01-07T14:35:07Z)

@kiliakis i would note some minor improvements to README e.g.
- Data section
  - No need for subheading "Description" under Data.
  - Why blockquote the description
  - The description sentence seems odd: "The EU ETS data viewer provides aggregated data on emissions and allowances, by country, sector and year."
- Citation comes under License section usually. Again some note about source licensing would be valuable.
- Re data preparation section - i am increasingly of the view this could/should go in README.md in the scripts directory and we do not have a "preparation" section in the README. But not absolutely sure and comments welcome!

### kiliakis (2016-01-10T15:41:04Z)

@rgrp I updated the README.md . Here is a [view link](http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fkiliakis%2Feu-emissions-trading-system) . I haven't add an additional README file in scripts directory, I could start doing it this way though. Should I transfer the repository into the datasets org?

### rufuspollock (2016-01-10T21:37:43Z)

@kiliakis please transfer :-)

@pdehaye leave you do do any final honours and then close this out.

### kiliakis (2016-01-13T10:44:44Z)

@rgrp  I am trying to transfer it, however github says that I dont have admin rights in datasets organization. What am I missing?

### rufuspollock (2016-01-13T17:54:35Z)

@kiliakis should be fixed as per other message.

### kiliakis (2016-01-16T11:03:31Z)

@pdehaye , @rgrp finally transferred

### rufuspollock (2016-01-21T14:47:10Z)

@kiliakis can you link where it is now both on github and on data.okfn.org.

@pdehaye then you can close - hooray!

### pdehaye (2016-01-21T21:16:52Z)

@rgrp  I am not sure what you mean by linking it on data.okfn.org. I have any case added it on the core-list.txt, and advertised it through the OKFNlabs account on twitter. 

Closing now. Thank you @kiliakis
