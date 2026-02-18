---
number: 406
title: "GCAT: General Catalog of Artificial Space Objects"
state: open
author: rufuspollock
created_at: "2025-02-21T21:15:21Z"
updated_at: "2025-02-21T21:15:21Z"
labels: []
---

# GCAT: General Catalog of Artificial Space Objects

**UPDATE**: stubbed a dataset here https://github.com/datasets/gcat-artificial-space-objects/tree/main

https://planet4589.org/space/gcat/

> The General Catalog of Artificial Space Objects (GCAT) makes public the full satellite database that underlies Jonathan's Space Report
> 
> 
> The diagram below indicates the general structure of the database, which reflects the data model of the information it describes.
> 
> 
> An artificial space object (for short, in future simply `object') a satellite or spacecraft (active payload, rocket stage, discarded component, piece of debris) outside the Earth's lower atmosphere. At a given time it can be in one of the following object states:
> 
> Attached to another object
> In free flight in the gravitational field of a world or astronomical body
> On the surface of an astronomical body
> Destroyed (in a collision, explosion or by burnup in atmospheric entry).
> Each time the object transitions to another state (undocks, is attached to something, reenters, changes which body it is orbiting, etc.) marks the beginning or end of a phase. Most objects in GCAT have only a single phase - they separate from an object (launch vehicle) and then are either still in free flight or have reentered. However, some objects go through many phases.
> 
> The main object catalogs define and list the first phase of each object. Objects with more than one phase have their subsequent phases listed as entries in the event object catalogs. A subset of objects are considered payloads and have additional data in the payload catalogs.
> 
> 
> Each object (with rare exceptions) is associated with a single launch, described in the launch lists. Each launch may be associated with many objects. The launch lists are the same as those in the already-published LVDB.
> 
> 
> Each launch is associated with a launch vehicle and a launch origin (generalization of launch site), and both launches and objects are associated with organizations of several kinds (countries, owners, manufacturers). These associations are expressed by strings which link the launch and object catalogs with the supporting tables.

cool visualization using the data (good for an image) - comes from default observable install

![Image](https://github.com/user-attachments/assets/9181ff80-acfe-49d8-9cf0-654935e518f1)
