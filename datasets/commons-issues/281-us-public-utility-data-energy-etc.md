---
number: 281
title: US public utility data (energy etc)
state: open
author: rufuspollock
created_at: "2018-09-01T13:09:06Z"
updated_at: "2019-11-28T16:54:00Z"
labels: []
---

# US public utility data (energy etc)

https://github.com/catalyst-cooperative/pudl

> The Public Utility Data Liberation project aims to provide a useful interface to publicly available electric utility data in the US. It uses information from the Federal Energy Regulatory Commission (FERC), the Energy Information Administration (EIA), and the Environmental Protection Agency (EPA), among others.

## Comments

### zaneselvans (2018-09-01T13:52:51Z)

Would it make sense to have a top level Energy category (akin to Climate Change) which would contain this and other energy related datasets?

Another project that's doing the same kind of thing but for the EU is OPSD, and they're already using data packages, so it ought to be easy to integrate them into datahub. Will definitely bring it up at the meeting in Berlin.

https://open-power-system-data.org/

### zaneselvans (2018-09-01T13:58:51Z)

US data that ought to be brought in includes:
* FERC Form 1 (Small and super messy)
* FERC EQR (Maybe too large? 100+ GB decompressed)
* EIA Form 923 (Small)
* EIA Form 860 (Small)
* EIA Form 861 (Small)
* EPA CEMS (8GB compressed, 100GB uncompressed)
* MSHA mines, production, and operators. (Small and clean)
* EPA GHG reporting system (Small)
* Regional grid operator locational marginal pricing (Huge and complicated)

The MSHA datasets are already provided as bulk CSV files with keys that allow them to be connected together in a relational database. Maybe I can try and package that up for datahub.io just to get familiar with the toolchain since it's already clean...

### rufuspollock (2019-01-31T19:22:59Z)

@zaneselvans this is awesome :smile: Could you package this up and share it?

### zaneselvans (2019-02-02T20:15:43Z)

We're working on packaging the EIA 860, 923, and FERC Form 1 now to publish openly. Less sure about what the right way to share the CEMS is, given how large the files are when uncompressed.

Right now the plan is to do two types of data packages. One with the normalized database tables, including their foreign key relationships, for someone who wants to quickly re-create a relational DB version of the data locally, and another that's more spreadsheet like, with compiled de-normalized versions of the data, organized into useful tabular resources, including many derived values. Does that seem reasonable? Datahub seems like a good place to host it, but I'm concerned about the size of the packages, and the creation of duplicate CSV and JSON versions upon upload. We can partition the data by state or year to keep updates from requiring too much bandwidth/time, but I'm not sure storing hundreds of GB of uncompressed data in several different formats seems like a great option.

### rufuspollock (2019-02-05T19:12:41Z)

@zaneselvans do you have any README for this stuff - we could already boot an awesome page with the overview and then start linking to the data packages as they go up. What do you think?

### zaneselvans (2019-02-06T21:11:52Z)

There's the readme in our repo, which has a little blurb about each of the data sources, and the status of their integration, but I'm not sure if that's enough. We did get a (very) small grant to do the packaging and publishing work so we will definitely be doing it.

### rufuspollock (2019-03-20T21:08:59Z)

@zaneselvans which repo exactly :smile: - and great news on the grant!

### zaneselvans (2019-03-22T03:00:01Z)

Ah sorry. This is [the main PUDL repo](https://github.com/catalyst-cooperative/pudl/).
