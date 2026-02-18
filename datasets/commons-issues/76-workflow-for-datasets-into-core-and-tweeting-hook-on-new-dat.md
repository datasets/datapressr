---
number: 76
title: Workflow for Datasets into Core and Tweeting hook on new dataset
state: open
author: rufuspollock
created_at: "2015-02-17T07:53:45Z"
updated_at: "2015-12-01T15:35:15Z"
labels: [meta]
---

# Workflow for Datasets into Core and Tweeting hook on new dataset

## Comments

### sxren (2015-02-17T07:57:07Z)

@rgrp sorry to trouble you with another question, but what is the preferred workflow for getting this data package into datasets? cmsdroff -> me -> datasets? something else? thanks.

### rufuspollock (2015-02-17T08:02:41Z)

@sxren great question. Basic answer is yes. Standard workflow is:
- Someone creates their repo and gets it to ready state
- Repo gets reviewed
- Approved
- Moves to github.com/datasets (they given admin to an Editor such as @sxren or me (or they transfer ownership), who then moves it to datasets)
- we add to catalog-list.txt and core-list.txt

I could imagine a model going forward where we start "stubbing" new data repos and giving people access to that data repo but it seems more painful.

### rufuspollock (2015-02-22T21:05:02Z)

@sxren would also be nice to tweet each new dataset published. If i give you access to @okfnlabs twitter account would you be up for doing that?

### sxren (2015-02-23T06:28:30Z)

@rgrp that would be nice. i'm not up for that right now but thank you for the offer.

### rufuspollock (2015-02-23T12:01:13Z)

@sxren np - i may try to make a bot!

### sxren (2015-02-23T13:04:04Z)

@rgrp great plan :) it's good work for a bot. reading https://developer.github.com/webhooks/   and https://github.com/github/github-services/blob/master/lib/services/twitter.rb maybe as simple as adding a .git/hooks/post-commit script
