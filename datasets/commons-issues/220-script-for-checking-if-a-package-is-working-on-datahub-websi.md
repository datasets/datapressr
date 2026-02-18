---
number: 220
title: Script for checking if a package is working on DataHub website
state: closed
author: Mikanebu
created_at: "2017-09-18T16:45:33Z"
updated_at: "2017-10-23T06:55:35Z"
closed_at: "2017-10-23T06:55:35Z"
labels: []
---

# Script for checking if a package is working on DataHub website

At the moment, we are checking if a package works on the website, which is time-consuming and not efficient. We want to have a script that will test each package on the website by doing curl probably:

checking number of resources displayed in the package summary in the top of the page (e.g., for co2-ppm it must be 6, see https://testing.datahub.io/core/co2-ppm)
(?) we may need to check if views working by checking for canvas element (in case if datapackage has views property)
first need analysis
(?) we may need to check for handsontable tables (by class name) (in case if there is a tabular data in resources)
also need ananlysis
(?) we may need to check for leafletmap element (in case if there is geojson file in resources)
also need ananlysis

## Comments

### Mikanebu (2017-10-23T06:55:35Z)

FIXED, script to test frontend functionality is created https://github.com/datahq/frontend-functional-tests. It checks for graphs, preview tables
