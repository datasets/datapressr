---
number: 229
title: Impossible to clone all datasets
state: closed
author: amirouche
created_at: "2018-02-10T21:25:10Z"
updated_at: "2018-03-21T13:42:06Z"
closed_at: "2018-02-24T17:26:18Z"
labels: []
---

# Impossible to clone all datasets

After git cloning the repository and using `npm install` I get an error about missing `datahub-client` after manually installing it, I get another error:

```
Error: Cannot find module 'datahub-cli/lib/utils/error'
```

After doing `npm datahub-cli` it still fails with the above error.

```
$ node --version
v9.4.0
$ npm --version
5.6.0
```

## Comments

### rufuspollock (2018-02-11T19:02:26Z)

What are you trying to do exactly?

The main location for the registry for bulk access is http://datahub.io/core/registry

### amirouche (2018-02-11T20:11:47Z)

> What are you trying to do exactly?

I wanted to see how big the git repositories were. For full, disclosure I am looking for a better solution than git. At $WORK we use the same workflow but it fails with big datasets. We are thinking to move to a custom git backend (see [1](https://www.perforce.com/blog/your-git-repository-database-pluggable-backends-libgit2)). That said, I prefer a solution like [rawbase](https://github.com/rawbase/rawbase-server).

### rufuspollock (2018-02-14T00:45:11Z)

@amirouche these git repos aren't that big (most are under 100Mb) -- intentionally.

In general git does have issues with largish datasets (depending on how the diffs work the problems come in from 100s of MBs to GB range) . There are loads of potential solutions but all involve moving to specialized tooling (the simplest is just to store complete files in e.g. s3 with versioning turned on!). What's crucial is to get clear on your use cases 😉  -- and starting as simple as possible (it's always tempting to starting building your own "castle in the sky").

If you want to chat more our chat channel is http://gitter.im/datahubio/chat

Finally, to answer your question: to find all the core datasets look at https://github.com/datasets/registry/blob/master/core-list.csv -- and then script yourself cloning them if you want.

### amirouche (2018-02-23T19:28:02Z)

Thanks.

I am very tempted to build my own "castle in the sky".

### rufuspollock (2018-03-21T13:42:05Z)

@amirouche people often are 😉 -- the problem is most of them remain unfinished. If you want to help out with an existing effort you can join us with https://datahub.io/ via http://gitter.im/datahubio/chat
