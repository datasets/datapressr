---
number: 73
title: UNECE/CEFACT Package Codes for Transportation
state: closed
author: cmsdroff
created_at: "2015-02-13T14:00:41Z"
updated_at: "2015-02-17T10:08:44Z"
closed_at: "2015-02-17T10:08:44Z"
labels: []
---

# UNECE/CEFACT Package Codes for Transportation

Coded representations of the package type names used in International Trade (UNECE/CEFACT Trade Facilitation Recommendation No.21)

These are used in all transport software system and would be a useful addition to the core data sets.

I'm currently working on a single window project with HMRC and this dataset will continue to be used in the upcoming WCO (World Customs Organisation) Data Model, that governments around the world can use.

Information is freely available on the UNECE website with the intention of being adopted in the wider community.

## Comments

### cmsdroff (2015-02-13T14:01:32Z)

I've prepared the data sets and these can be viewed at https://github.com/warrantgroup/unece-package-codes if you have any questions please let me know?

### cmsdroff (2015-02-13T14:02:30Z)

I've also cleansed the data to remove items that are due to be removed.  Happy to assist with the maintenance of this one

### rufuspollock (2015-02-13T20:00:26Z)

@cmsdroff this is fantastic.

@sxren are you up for doing QA here and then migrating the dataset over.

### sxren (2015-02-14T07:32:05Z)

@cmsdroff wow, this is great.

changes:
- [ ] move `title` in `datapackage.json` to `description`
- [ ] change `title` in `datapackage.json` to e.g., UNECE Package Codes, UNECE/CEFACT Package Codes—something concise
- [ ] change `version` in `datapackage.json` to a string that conforms to the Semantic Versioning requirements (http://semver.org/); maybe `0.21.9` would be appropriate

additions:
- [ ] add license to datapackage.json (e.g., ODC-PDDL-1.0)
- [ ] add license to readme (for ODC-PDDL-1.0 see "How to Apply" at http://opendatacommons.org/licenses/pddl/)

suggestions:
- [ ] add brief data processing description to readme; it's useful for others to know the process you went through to scrape and cleanse the data

thank you very much. @ me if anything above is unclear.

### cmsdroff (2015-02-14T10:09:09Z)

Thanks for the feedback I'll make the changes and check the license details and confirm once resolved

Sent from my iPhone

> On 14 Feb 2015, at 07:33, Søren Jones notifications@github.com wrote:
> 
> @cmsdroff wow, this is great.
> 
> changes:
> 
>  move title in datapackage.json to description
>  change title in datapackage.json to e.g., UNECE Package Codes, UNECE/CEFACT Package Codes—something concise
>  change version in datapackage.json to a string that conforms to the Semantic Versioning requirements (http://semver.org/); maybe 0.21.9 would be appropriate
> additions:
> 
>  add license to datapackage.json (e.g., ODC-PDDL-1.0)
>  add license to readme (for ODC-PDDL-1.0 see "How to Apply" at http://opendatacommons.org/licenses/pddl/)
> suggestions:
> 
>  add brief data processing description to readme; it's useful for others to know the process you went through to scrape and cleanse the data
> thank you very much. @ me if anything above is unclear.
> 
> —
> Reply to this email directly or view it on GitHub.

All business is conducted subject to Warrant Group Limited Standard Terms and Conditions 2012, a copy of which is available on request and at www.warrant-group.com/terms.  
Registered Office: Warrant House, 157 Regent Road, Liverpool, L5 9TF. Registered in England No. 1941659 VAT Reg. No. GB 100116496.

### cmsdroff (2015-02-14T17:54:41Z)

@sxren just quick one on the license, I checked the un-locode file as its from the same source (UNECE) and the license shows as 
"license": "PDDL-1.0",
So would it be safe to assume the same license can be applied to this data, just wondering if I have to check or if I apply the license even though I'm not the natural source?

Once this is clear I can resubmit 

Thanks

### sxren (2015-02-14T21:49:11Z)

@cmsdroff 
1. `"license": ODC-PDDL-1.0,`. the id for the PDDL license seems to have changed at some point. see the id at http://licenses.opendefinition.org/licenses/ODC-PDDL-1.0.json.
2. as i understand it, the license can be applied to the data package only or to both the data and the data package. is that correct, @rgrp? in this case, again as i understand it, the goal of un/cefact is to create standards (data) with no usage restrictions. so, an ODC-PDDL-1.0 license should be appropriate for both.

> **Royalty-free goals for UN/CEFACT specifications**
> In order to promote the widest adoption of Specifications, UN/CEFACT seeks to
> issue Specifications that can generally be implemented without fees or restrictions. Subject
> to the conditions of this IPR Policy (the “Policy”), UN/CEFACT will generally not approve
> a Specification if it is aware that Essential Intellectual Property Rights (IPR) exist that are
> not available without fees or restrictions.[1](http://www.unece.org/fileadmin/DAM/cefact/cf_plenary/plenary12/ECE_TRADE_C_CEFACT_2010_20_Rev2E_UpdatedIPRpolicy.pdf)

### rufuspollock (2015-02-16T08:57:58Z)

@sxren my recommendation is to apply the preferred license and then note in license section if you think there are issue with licensing the data under that license (e.g. that base data has rights in it that aren't themselves licensed in suitable way).

I really think we need to extend FAQ here - https://github.com/okfn/data.okfn.org/issues/154

### cmsdroff (2015-02-16T09:32:13Z)

@rgrp I think that after reading the PDDL should be fine, i've updated the readme and data package.json files with the license info and enhanced some of the descriptions.  Think this could be ready to publish if you are both happy @sxren ?

### sxren (2015-02-17T05:43:34Z)

@cmsdroff your datapackage.json doesn't validate http://data.okfn.org/tools/validate?url=https%3A%2F%2Fgithub.com%2Fwarrantgroup%2Funece-package-codes%2Fblob%2Fmaster%2Fdatapackage.json in schema, you're missing a comma after the description in the codes field.

@rgrp sorry to trouble you with another question, but what is the preferred workflow for getting this data package into datasets? cmsdroff -> me -> datasets? something else? thanks.

### rufuspollock (2015-02-17T07:54:05Z)

@sxren can you raise in https://github.com/datasets/registry/issues/76 and will answer there

### cmsdroff (2015-02-17T09:38:03Z)

@sxren your now admin for the data repo and changes have been made and schema validates, thanks to both of you for your help getting to this stage :)

Sent from my iPhone

> On 17 Feb 2015, at 05:44, Søren Jones notifications@github.com wrote:
> 
> @cmsdroff your datapackage.json doesn't validate http://data.okfn.org/tools/validate?url=https%3A%2F%2Fgithub.com%2Fwarrantgroup%2Funece-package-codes%2Fblob%2Fmaster%2Fdatapackage.json in schema, you're missing a comma after the description in the codes field.
> 
> @rgrp sorry to trouble you with another question, but what is the preferred workflow for getting this data package into datasets? cmsdroff -> me -> datasets? something else? thanks.
> 
> —
> Reply to this email directly or view it on GitHub.

All business is conducted subject to Warrant Group Limited Standard Terms and Conditions 2012, a copy of which is available on request and at www.warrant-group.com/terms.  
Registered Office: Warrant House, 157 Regent Road, Liverpool, L5 9TF. Registered in England No. 1941659 VAT Reg. No. GB 100116496.

### sxren (2015-02-17T10:08:44Z)

@cmsdroff thank **you** very much. transferred and added to datasets.
