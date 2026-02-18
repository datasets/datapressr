---
number: 230
title: Installation warnings suggesting upgrades in the software
state: open
author: ppKrauss
created_at: "2018-03-19T06:18:55Z"
updated_at: "2018-03-21T13:40:30Z"
labels: []
---

# Installation warnings suggesting upgrades in the software

After  `git clone https://github.com/datasets/registry.git; cd registry; npm install`, at UBUNTU 16 LTS, 

```
npm WARN deprecated formatio@1.2.0: This package is unmaintained. Use @sinonjs/formatio instead
npm WARN deprecated fs-promise@2.0.3: Use mz or fs-extra^3.0 with Promise Support
npm WARN deprecated graceful-fs@3.0.11: please upgrade to graceful-fs 4 for compatibility with current and future versions of Node.js
npm notice created a lockfile as package-lock.json. You should commit this file.
npm WARN optional SKIPPING OPTIONAL DEPENDENCY: fsevents@1.1.3 (node_modules/fsevents):
npm WARN notsup SKIPPING OPTIONAL DEPENDENCY: Unsupported platform for fsevents@1.1.3: wanted {"os":"darwin","arch":"any"} (current: {"os":"linux","arch":"x64"})

added 599 packages from 609 contributors in 81.608s
```

## Comments

### rufuspollock (2018-03-21T13:40:30Z)

@ppKrauss generally you don't need to "install" this repo - only need if you want to help maintain core datasets 😄 - but thanks for the update.
