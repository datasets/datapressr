---
number: 171
title: Economic indicators over time by country
state: open
author: pwalsh
created_at: "2016-03-10T16:42:40Z"
updated_at: "2016-08-22T07:10:01Z"
labels: []
---

# Economic indicators over time by country

There are various indexes used as (socio)economic indicators. These can be used as part of a normalisation mechanism for understanding other data. 

In the past, I've used the [GINI index](http://www.investopedia.com/terms/g/gini-index.asp) across regions in Israel, but there are all sorts of relevant indexes out there. [example](http://www.abs.gov.au/websitedbs/censushome.nsf/home/seifa)

A datapackage that took even a few indexes that are globally applicable, and collected data over time for countries and regions would be very useful.

## Comments

### rufuspollock (2016-03-11T07:26:47Z)

@pwalsh crucial question is which indices. We can definitely open an issue for GINI. We do have GDP etc already done.

### gsilvapt (2016-04-29T17:07:04Z)

GINI and GDP have been taken care of. There are other indicators we can potentially take from the World Bank and create an entire data package about it. @pwalsh, would you like to work on something like that with me?

### pwalsh (2016-05-01T21:44:49Z)

@gsilvapt sure!

### gsilvapt (2016-05-02T10:28:40Z)

Were you trying to get any indicator in particular, @pwalsh ? Perhaps we can start with those first.

### rufuspollock (2016-05-04T20:36:04Z)

@gsilvapt i can liase with you here. I think we may also want to start thinking about taking a more systematic approach for the World Bank.

So, to start with can I ask you to summarize what _you_ think are the top socio-economic indicators we might want and post a bullet list here. Suggest structure like:
- Title. "Short justification of its importance". Likely source.

### gsilvapt (2016-05-13T10:03:02Z)

I am not entirely sure what is currently posted as data package and what sources are there so I am basing my comment only in data available in the World Bank of Data:
- Cash Surplus/Deficit (% of GDP). This is key to know how countries are managing their cash flows. Likely source: World Bank of Data (http://data.worldbank.org/indicator/GC.BAL.CASH.GD.ZS)
- Inflation, GDP Deflator. Inflation is a key indicator to understand the economic situation of a country. Likely source: World Bank of Data (http://data.worldbank.org/indicator/NY.GDP.DEFL.KD.ZG)
- Inflation, consumer prices: Same as above. Likely source: http://data.worldbank.org/indicator/FP.CPI.TOTL.ZG

**NOTE:** Inflation should be the same package.

### zelima (2016-07-05T14:04:36Z)

@gsilvapt Think we do have GDP Deflator and consumer prices: http://data.okfn.org/data/core/inflation
Was not able to find surplus/deficit

### zelima (2016-07-19T10:07:33Z)

@gsilvapt do you think you could help us with packaging Cash Surplus/Deficit?

### gsilvapt (2016-07-19T13:39:06Z)

Yes, I can help preparing this package during this afternoon. Will post
something when the repo is complete.

Best regards/Com os melhores cumprimentos,
Gustavo Silva.

Sent from my Nexus 5.

On 19 Jul 2016 11:07 a.m., "Irakli Mchedlishvili" notifications@github.com
wrote:

> @gsilvapt https://github.com/gsilvapt do you think you could help us
> with packaging Cash Surplus/Deficit?
> 
> —
> You are receiving this because you were mentioned.
> Reply to this email directly, view it on GitHub
> https://github.com/datasets/registry/issues/171#issuecomment-233587978,
> or mute the thread
> https://github.com/notifications/unsubscribe-auth/AHbQPDfmo2KrNi0d0YTkC0ab_1UTNbkmks5qXKHmgaJpZM4Ht6dj
> .

### gsilvapt (2016-07-19T15:33:12Z)

@zelima The package is here: https://github.com/gsilvapt/cash-surplus-deficit

The main issue is the country strings that have spaces, dots and other kind of characters. For that reason, the package is failing. Have to improve the script. Nevertheless, I'm letting you know this package is practically done.

### rufuspollock (2016-08-01T15:23:39Z)

@zelima do you want to take a look and review?

### zelima (2016-08-02T08:45:52Z)

@gsilvapt Sorry for such late respond.

I reviewed data - everything looks great, well Done! 
Link to view data: http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fgsilvapt%2Fcash-surplus-deficit

I just don't get what issues are you talking about? Are they fixed already?
Also there is problem with validating Datapackage: http://data.okfn.org/tools/validate?url=https%3A%2F%2Fgithub.com%2Fgsilvapt%2Fcash-surplus-deficit
Do you think you could fix this?

### gsilvapt (2016-08-02T23:33:01Z)

@zelima The problem is exactly the output of the validator. There are some strange characters in the "Country Name" column, which include `^([a-z0-9\\.\\_\\-])+$`.

I can try and see what is missing currently in the script under`/scripts/process.py` but I may need some time. I was trying to find a list to remove all of those characters at the same time but it seems I cannot find a way.
Do you know someone with more experience dealing with these special characters that usually don't go very well with JSON files?

### zelima (2016-08-03T09:05:25Z)

@gsilvapt Unfortunately I don't.
You can take as much time as you need, that's up to you! :)

Are you sure the problem is there? I went through data several times and could not detect any strange symbols there. Saw your script and it is already removing/replacing "suspicious" ones. 
So I would suggest first removing whole `Country Name` column, or filling it's values with single string e.g: `"Test"`. As a result we can be 100% sure that problem is there, or elsewhere.

### zelima (2016-08-03T09:09:45Z)

@gsilvapt Also recommend removing "suspicious" symbols form `datapackage.json` like `/` or `%` from https://github.com/gsilvapt/cash-surplus-deficit/blob/master/datapackage.json#L36 and replacing them with actual words e.g: "or" "percentage"

### sxren (2016-08-03T12:55:54Z)

@gsilvapt In datapackage.json, change
"name": "Cash-Surplus-Deficit",
to
"name": "cash-surplus-deficit",

The dataPath "/name" part of the error means the name attribute of the datapackage.json.

In the pattern part of the error, the plain English meaning of "a-z" is only lowercase letters.

### zelima (2016-08-03T14:06:21Z)

@sxren Thanks for help!

### gsilvapt (2016-08-04T18:18:01Z)

@zelima @sxren 

It seems @sxren's suggestion fixed the issue. However, the datapackage viewer is not working. It is outputing an error "Unable to access file. Status code: 404". Validator is working though.

**DPKG Validator:** http://data.okfn.org/tools/validate?url=https%3A%2F%2Fgithub.com%2Fgsilvapt%2Fcash-surplus-deficit%2F

### danfowler (2016-08-04T19:29:17Z)

Hm, /view seemed to work:

http://data.okfn.org/tools/view?url=https%3A%2F%2Fraw.github.com%2Fgsilvapt%2Fcash-surplus-deficit%2Fmaster%2Fdatapackage.json

On 4 August 2016 at 14:18, Gustavo Silva notifications@github.com wrote:

> @zelima https://github.com/zelima @sxren https://github.com/sxren
> 
> It seems @sxren https://github.com/sxren's suggestion fixed the issue.
> However, the datapackage viewer is not working. It is outputing an error
> "Unable to access file. Status code: 404". Validator is working though.
> 
> _DPKG Validator:_ http://data.okfn.org/tools/validate?url=https%3A%2F%
> 2Fgithub.com%2Fgsilvapt%2Fcash-surplus-deficit%2F
> 
> —
> You are receiving this because you are subscribed to this thread.
> Reply to this email directly, view it on GitHub
> https://github.com/datasets/registry/issues/171#issuecomment-237638209,
> or mute the thread
> https://github.com/notifications/unsubscribe-auth/AAvKCFBVWnc6j0HXd6oFvGrvg_vOSDwEks5qcizZgaJpZM4Ht6dj
> .

### gsilvapt (2016-08-04T19:32:32Z)

Wow, weird. Maybe a temporary issue or something I did wrong when pasting
the link. Thanks!

@rgpg, I believe this package is ready but let me know (you too, Dan) if
there's anything else needed to do.

On 4 Aug 2016 8:29 p.m., "Daniel Fowler" notifications@github.com wrote:

> Hm, /view seemed to work:
> 
> http://data.okfn.org/tools/view?url=https%3A%2F%2Fraw.
> github.com%2Fgsilvapt%2Fcash-surplus-deficit%2Fmaster%2Fdatapackage.json
> 
> On 4 August 2016 at 14:18, Gustavo Silva notifications@github.com wrote:
> 
> > @zelima https://github.com/zelima @sxren https://github.com/sxren
> > 
> > It seems @sxren https://github.com/sxren's suggestion fixed the issue.
> > However, the datapackage viewer is not working. It is outputing an error
> > "Unable to access file. Status code: 404". Validator is working though.
> > 
> > _DPKG Validator:_ http://data.okfn.org/tools/validate?url=https%3A%2F%
> > 2Fgithub.com%2Fgsilvapt%2Fcash-surplus-deficit%2F
> > 
> > —
> > You are receiving this because you are subscribed to this thread.
> > Reply to this email directly, view it on GitHub
> > <https://github.com/datasets/registry/issues/171#issuecomment-237638209
> > ,
> > or mute the thread
> > <https://github.com/notifications/unsubscribe-auth/
> > AAvKCFBVWnc6j0HXd6oFvGrvg_vOSDwEks5qcizZgaJpZM4Ht6dj>
> > .
> 
> —
> You are receiving this because you were mentioned.
> Reply to this email directly, view it on GitHub
> https://github.com/datasets/registry/issues/171#issuecomment-237658096,
> or mute the thread
> https://github.com/notifications/unsubscribe-auth/AHbQPAiIHeUQkniS6OsfK_GZIZvEcKRyks5qcj2OgaJpZM4Ht6dj
> .

### zelima (2016-08-05T08:32:11Z)

@gsilvapt The little thing and think we are ready to go:
I would separate country names that have "and" inside with spaces e.g: `Antigua and Barbuda` instead of `AntiguaandBarbuda`. This looks nicer.
After Please paste one last time validate and view link here. And at last transfer ownership, so I can make it available online. :)

### gsilvapt (2016-08-05T11:39:16Z)

@zelima yes, I removed those because I thought they were raising issues when creating and validating the `datapackage.json`. Do you think that will not cause any problems?

### zelima (2016-08-05T13:16:26Z)

@gsilvapt I'm pretty sure it won't cause any problems.
For example it works for this dataset: http://data.okfn.org/data/core/country-list

### gsilvapt (2016-08-05T22:01:08Z)

@zelima I thought it did. Well, here it is, properly fixed:

**Validator:** http://data.okfn.org/tools/validate?url=https%3A%2F%2Fgithub.com%2Fgsilvapt%2Fcash-surplus-deficit

**Viewer:** http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fgsilvapt%2Fcash-surplus-deficit

Will transfer ownership now.

### zelima (2016-08-08T08:18:20Z)

@gsilvapt Great job, thanks for help!

The data has landed here: http://data.okfn.org/data/core/cash-surplus-deficit

@pdehaye could you help with tweeting this one?

### rufuspollock (2016-08-22T07:10:01Z)

@all: small comment for the future - we should always split out work on _specific_ datasets out of a general issue like this and give them their own issue and then link to that item from the main description for the issue as that makes it much easier to follow.

Discussion in this issue should focus on what are the economic indicators we want rather than packaging questions on specific items.

@zelima can you please create a separate issue now on "Cash Surplus and Deficit" and provide a summary of where things are at. We can then use that issue to finalize publication and do any final discussion.
