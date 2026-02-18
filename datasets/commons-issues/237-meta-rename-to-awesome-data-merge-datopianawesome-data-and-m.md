---
number: 237
title: "[meta] Rename to awesome-data, merge @datopian/awesome-data and more"
state: closed
author: rufuspollock
created_at: "2019-11-27T20:14:05Z"
updated_at: "2019-12-16T22:12:57Z"
closed_at: "2019-12-16T22:12:57Z"
labels: []
assignees: [svetozarstojkovic, glgoose]
---

# [meta] Rename to awesome-data, merge @datopian/awesome-data and more

We want to merge @datopian/awesome-data into this repo and rename this to awesome-data

Note `@` is just a prefix to designation an org on github.

## Acceptance

Desired result:

* [x] [@datasets/awesome-data] exists - as relocated version of [@datasets/registry] so we keep :star: and issue tracker)
  * [x] It has 191 :star:
  * [x] It has all issues (open and closed) from [@datasets/registry] with their labels
  * [x] It has all (open) issues in [@datopian/awesome-data] (without their labels)
  * [x] Contents of repo (files) are from [@datopian/awesome-data]
* [x] [@datasets/core-datasets] exists with the repo contents of current [@datopian/awesome-data] and :star: 37
* [x] [@datopian/awesome-data] no longer exists (it won't as it will have moved!)
  * [x] [@datopian/awesome-data] redirects to [@datasets/core-datasets]
* [ ] datahub.io/collections still working and now pulling from [@datasets/awesome-data]
  * [ ] Edit links work @svetozarstojkovic 

[@datasets/core-datasets]: https://github.com/datasets/core-datasets
[@datasets/awesome-data]: https://github.com/datasets/awesome-data
[@datasets/registry]: https://github.com/datasets/registry
[@datopian/awesome-data]: https://github.com/datopian/awesome-data

## Tasks

Preliminaries

* [x] @rufuspollock Grant whomever is doing this admin rights in both locations @datasets and @datopian
* [x] Check how we reconfigure datahub to use new repo locations (see below)
* [x] Can we move issues in bulk? (10m research)
  * Github has function to move 1 by 1 but no bulk ...
  * Worst case we do one by one
* [x] Clone the repos locally so we have a back-up (plus needed for later)

The move

* [x] Move @datasets/registry to @datasets/awesome-data
* [x] Move @datopian/awesome-data to @datopian/core-datasets (in prep for move to @datasets otherwise we get name collisions) and then move to to @datasets/core-datasets (i.e. move org)

Moving issues:

* [x] Take screen shots of issue list (3 pages) with current issue labels
* [x] Move all the open issues from @datasets/core-datasets to @datasets/awesome-data
  * Don't worry about labels for now as not systematically used we can add back "later"

Updating repo contents - we want to swap over repo contents now (as easier than swapping issues!)

* [x] Force push contents of old @datasets/registry to @datasets/core-datasets
* [x] Force push contents of old @datopian/awesome-data to @datasets/awesome-data

Afterwards

* [x] Reconfigure datahub to run off new location @svetozarstojkovic 
  * [x] where is this configured?
  * [x] Change it
  * [x] Deploy
* [x] Close this issue @svetozarstojkovic 

## Context

We have two issue trackers / repos serving similar purposes

* datasets/registry (132 / 78)
* awesome-data (50 / 5)

awesome-data/issues and datasets/registry/issues are pretty much identical in function and purpose.

Originally dataset/registry was "core datasets". Over time, we've added ideas for interesting topics or datasets even if not core. Core datasets will continue to be a major focus.

Repo contents is a little different:

* datasets/registry: files and scripts for publishing core datasets to the DataHub.io (and tracking that)
* awesome-data: topics / collections items which are then publishing on datahub.io/collections

Plan would be to move datasets/registry to datasets/awesome-data and merge in @datopian/awesome-data (why this way round? more :star: on registry plus more contents)

## Comments

### glgoose (2019-11-28T14:35:38Z)

@rufuspollock 
In the acceptance criteria (item 2):

> @datasets/core-datasets exists with the repo contents of current **@datasets/registry** and ⭐️ 39

There is no `@datasets/registry` currently existent and it does not have ⭐️ 39. So did you mean `@datopian/awesome-data`?

And thus the acceptance criteria item 2 becomes:
* [ ] @datasets/core-datasets exists with the repo contents of current **@datopian/awesome-data** and ⭐️ 37

## Analysis
| repo | exists | stars |
| ---- | ------ | ----- |
| datasets/awesome-data | No | 191 |
| [datasets/registry] | Yes | 191 |
| datasets/core-datasets | No | 39 |
| [datopian/awesome-data] | Yes | 37 |

[datopian/awesome-data]: https://github.com/datopian/awesome-data
[datasets/registry]: https://github.com/datasets/registry

### glgoose (2019-11-28T14:48:47Z)

# Research: Move issues in bulk
Bulk move of issues is not possible in GitHub, found 2 tools (nr.1 best):
1.  https://github.com/ahadik/git_mover

    > Merging repositories. If you want to combine issues from multiple repositories into a single one, this tool does its best to handle name clashes where they matter. It'll even keep assignees on issues if that user if found on the source and destination repo.

    For more detailed info see: http://www.alexhadik.com/blog/2016/5/26/migrating-github-repositories-with-gitmover
2. https://github.com/ahmadnassri/github-bulk-transfer

### glgoose (2019-11-28T15:07:43Z)

@rufuspollock For the move from `@datopian/awesome-data` to `@datopian/core-datasets` to `@datasets/core-datasets`, I selected the following for Team Access rights, is that ok?:
![image](https://user-images.githubusercontent.com/48956933/69816615-06648000-11f9-11ea-97c3-3612ff16b86c.png)

### glgoose (2019-11-28T15:10:34Z)

> @rufuspollock
> In the acceptance criteria (item 2):
> 
> > @datasets/core-datasets exists with the repo contents of current **@datasets/registry** and ⭐️ 39
> 
> There is no `@datasets/registry` currently existent and it does not have ⭐️ 39. So did you mean `@datopian/awesome-data`?
> 
> And thus the acceptance criteria item 2 becomes:
> 
> * [ ]  @datasets/core-datasets exists with the repo contents of current **@datopian/awesome-data** and ⭐️ 37
> 
> ## Analysis
> repo	exists	stars
> datasets/awesome-data	No	191
> [datasets/registry](https://github.com/datasets/registry)	Yes	191
> datasets/core-datasets	No	39
> [datopian/awesome-data](https://github.com/datopian/awesome-data)	Yes	37

It must be so, so I've gone ahead and implemented the change. Will already update this in acceptance criteria as well

### glgoose (2019-11-28T15:43:27Z)

## Situation

In acceptance criteria it says:
> It has all (open) issues in @datopian/awesome-data (**without their labels**)

In tasks it says:
> Move all the open issues from @datasets/core-datasets to @datasets/awesome-data
Don't worry about labels for now as not systematically used **we can add back "later"**

##Question

Would you like to have labels there or do you specifically *don't* want labels there?

## Hypothesis

Yes, move labels. I think because it was assumed labels should not be moved because it was a lot of work.

### glgoose (2019-11-28T17:17:01Z)

@svetozarstojkovic Do you know where to configure where `datahub.io/collections` pulls data from?

It should be reconfigured so that it now pulls from `datasets/awesome-data` instead of `datopian/awesome-data` (it redirects at the moment so it still works but should probably change it).

### glgoose (2019-11-28T17:24:34Z)

# Former `/datopian/awesome-data/` issue list
Now this repo is named `/datasets/core-data/` and the issues have been moved to `/datasets/awesome-data/`

![github com_datasets_core-datasets_issues_utf8=%E2%9C%93 q=is%3Aissue](https://user-images.githubusercontent.com/48956933/69824402-ec806880-120b-11ea-9f9b-de597b408273.png)
![github com_datasets_core-datasets_issues_page=2 q=is%3Aissue utf8=%E2%9C%93](https://user-images.githubusercontent.com/48956933/69824400-ec806880-120b-11ea-89c0-8b8fa53433b6.png)
![github com_datasets_core-datasets_issues_page=3 q=is%3Aissue utf8=%E2%9C%93](https://user-images.githubusercontent.com/48956933/69824401-ec806880-120b-11ea-8498-7ea684544200.png)

### rufuspollock (2019-11-29T15:02:47Z)

@glgoose this item is ticked

> Contents of repo (files) are from @datopian/awesome-data

As is 

> @datasets/core-datasets exists with the repo contents of current @datopian/awesome-data

But this is not the case afaict. the idea was to force push over current repo with the relevant contents. have you done that?

![image](https://user-images.githubusercontent.com/180658/70867281-b06b3880-1f6b-11ea-83a0-7a9431576294.png)

![image](https://user-images.githubusercontent.com/180658/70867283-b8c37380-1f6b-11ea-9254-8abbe597b918.png)

![image](https://user-images.githubusercontent.com/180658/70867287-c0831800-1f6b-11ea-8f9b-5a0db191481a.png)

### rufuspollock (2019-12-15T19:18:40Z)

@glgoose I've now fixed this by force pushing backup clones of these 2 old repo (specifically made in case something went wrong like this!)

@svetozarstojkovic i've also fixed the code on datahub.io frontend - can you get this redeployed as asap as pages are 404'ing atm https://datahub.io/collections/bibliographic-data

### svetozarstojkovic (2019-12-15T20:16:58Z)

@rufuspollock 
Done, please check it out.

### rufuspollock (2019-12-16T22:12:57Z)

FIXED. All done.
