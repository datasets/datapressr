---
number: 329
title: Project Drawdown
state: open
author: rufuspollock
created_at: "2021-05-08T09:52:48Z"
updated_at: "2024-12-09T22:40:10Z"
labels: ["Topic: Climate"]
---

# Project Drawdown

Project Drawdown is a project to identifying solutions to get to "drawdown" (i.e. net zero or negative carbon emissions). Started in 2014 (by Paul Hawken and Amanda Ravenhill) they released a book in 2017 with their first summary of options and followed up with a major update in 2020.

The main output is set of potential "solutions" with detailed estimates of the impact - which allows for ranking solutions by their impact. 

From the About page https://drawdown.org/about:

> Founded in 2014, Project Drawdown® is a nonprofit organization that seeks to help the world reach “Drawdown”— the future point in time when levels of greenhouse gases in the atmosphere stop climbing and start to steadily decline.
>
> Since the 2017 publication of the New York Times bestseller, Drawdown, the organization has emerged as a leading resource for information and insight about climate solutions. We continue to develop that resource by conducting rigorous review and assessment of climate solutions, creating compelling and human communication across mediums, and partnering with efforts to accelerate climate solutions globally.



## Data

Table of solutions: https://drawdown.org/solutions/table-of-solutions. HTML table with links to more detail though mainly text - no detailed modelling (though i think they are now releasing their platform - see code section below)

Inlining main table here:

SOLUTION | SECTOR(S) | SCENARIO 1 * | SCENARIO 2 *
-- | -- | -- | --
Reduced Food Waste | Food, Agriculture, and Land Use / Land Sinks | 87.45 | 94.56
Health and Education | Health and Education | 85.42 | 85.42
Plant-Rich Diets | Food, Agriculture, and Land Use / Land Sinks | 65.01 | 91.72
Refrigerant Management | Industry / Buildings | 57.75 | 57.75
Tropical Forest Restoration | Land Sinks | 54.45 | 85.14
Onshore Wind Turbines | Electricity | 47.21 | 147.72
Alternative Refrigerants | Industry / Buildings | 43.53 | 50.53
Utility-Scale Solar Photovoltaics | Electricity | 42.32 | 119.13
Improved Clean Cookstoves | Buildings | 31.34 | 72.65
Distributed Solar Photovoltaics | Electricity | 27.98 | 68.64
Silvopasture | Land Sinks | 26.58 | 42.31
Peatland Protection and Rewetting | Food, Agriculture, and Land Use / Land Sinks | 26.03 | 41.93
Tree Plantations (on Degraded Land) | Land Sinks | 22.24 | 35.94
Temperate Forest Restoration | Land Sinks | 19.42 | 27.85
Concentrated Solar Power | Electricity | 18.60 | 23.96
Insulation | Electricity / Buildings | 16.97 | 19.01
Managed Grazing | Land Sinks | 16.42 | 26.01
LED Lighting | Electricity | 16.07 | 17.53
Perennial Staple Crops | Land Sinks | 15.45 | 31.26
Tree Intercropping | Land Sinks | 15.03 | 24.40
Regenerative Annual Cropping | Food, Agriculture, and Land Use / Land Sinks | 14.52 | 22.27
Conservation Agriculture | Food, Agriculture, and Land Use / Land Sinks | 13.40 | 9.43
Abandoned Farmland Restoration | Land Sinks | 12.48 | 20.32
Electric Cars | Transportation | 11.87 | 15.68
Multistrata Agroforestry | Land Sinks | 11.30 | 20.40
Offshore Wind Turbines | Electricity | 10.44 | 11.42
High-Performance Glass | Electricity / Buildings | 10.04 | 12.63
Methane Digesters | Electricity / Industry | 9.83 | 6.18
Improved Rice Production | Food, Agriculture, and Land Use / Land Sinks | 9.44 | 13.82
Indigenous Peoples’ Forest Tenure | Food, Agriculture, and Land Use / Land Sinks | 8.69 | 12.93
Bamboo Production | Land Sinks | 8.27 | 21.31
Alternative Cement | Industry | 7.98 | 16.10
Hybrid Cars | Transportation | 7.89 | 4.63
Carpooling | Transportation | 7.70 | 4.17
Public Transit | Transportation | 7.51 | 23.36
Smart Thermostats | Electricity / Buildings | 6.99 | 7.40
Building Automation Systems | Electricity / Buildings | 6.47 | 10.48
District Heating | Electricity / Buildings | 6.28 | 9.85
Efficient Aviation | Transportation | 6.27 | 9.18
Geothermal Power | Electricity | 6.19 | 9.85
Forest Protection | Food, Agriculture, and Land Use / Land Sinks | 5.52 | 8.75
Recycling | Industry | 5.50 | 6.02
Biogas for Cooking | Buildings | 4.65 | 9.70
Efficient Trucks | Transportation | 4.61 | 9.71
Efficient Ocean Shipping | Transportation | 4.40 | 6.30
High-Efficiency Heat Pumps | Electricity / Buildings | 4.16 | 9.29
Perennial Biomass Production | Land Sinks | 4.00 | 7.04
Solar Hot Water | Electricity / Buildings | 3.59 | 14.29
Grassland Protection | Food, Agriculture, and Land Use / Land Sinks | 3.35 | 4.25
System of Rice Intensification | Food, Agriculture, and Land Use / Land Sinks | 2.78 | 4.26
Nuclear Power | Electricity | 2.65 | 3.23
Bicycle Infrastructure | Transportation | 2.56 | 6.65
Biomass Power | Electricity | 2.52 | 3.57
Nutrient Management | Food, Agriculture, and Land Use | 2.34 | 12.06
Biochar Production | Engineered Sinks | 2.22 | 4.39
Landfill Methane Capture | Electricity / Industry | 2.18 | -1.60
Composting | Industry | 2.14 | 3.13
Waste-to-Energy | Electricity / Industry | 2.04 | 3.00
Small Hydropower | Electricity | 1.69 | 3.28
Walkable Cities | Transportation | 1.44 | 5.45
Ocean Power | Electricity | 1.38 | 1.38
Sustainable Intensification for Smallholders | Food, Agriculture, and Land Use / Land Sinks | 1.36 | 0.68
Electric Bicycles | Transportation | 1.31 | 4.07
High-Speed Rail | Transportation | 1.30 | 3.77
Farm Irrigation Efficiency | Food, Agriculture, and Land Use | 1.13 | 2.07
Recycled Paper | Industry | 1.10 | 1.95
Telepresence | Transportation | 1.05 | 3.80
Coastal Wetland Protection | Food, Agriculture, and Land Use / Coastal and Ocean Sinks | 0.99 | 1.45
Bioplastics | Industry | 0.96 | 3.80
Low-Flow Fixtures | Electricity / Buildings | 0.91 | 1.56
Coastal Wetland Restoration | Coastal and Ocean Sinks | 0.77 | 1.01
Water Distribution Efficiency | Electricity | 0.66 | 0.94
Green and Cool Roofs | Electricity / Buildings | 0.60 | 1.10
Dynamic Glass | Electricity / Buildings | 0.29 | 0.47
Electric Trains | Transportation | 0.10 | 0.65
Micro Wind Turbines | Electricity | 0.09 | 0.13
Building Retrofitting | Electricity / Buildings |   |  
Net-Zero Buildings | Electricity / Buildings |   |  
Grid Flexibility | Electricity |   |  
Microgrids | Electricity |   |  
Distributed Energy Storage | Electricity |   |  
Utility-Scale Energy Storage | Electricity |   |  

### Framework

See https://drawdown.org/drawdown-framework. Key summary info (in graphics):

![image](https://user-images.githubusercontent.com/180658/117535454-1f7c7d80-aff6-11eb-8239-ec7eae04e9ea.png)

![image](https://user-images.githubusercontent.com/180658/117535474-358a3e00-aff6-11eb-80c9-cab90b41b027.png)

## Code

* They have their modelling framework (ported from excel to python) here: https://github.com/ProjectDrawdown/solutions

## TODO

* Scrape the key solution info and store in a little database.
* Identify where the background calculations are coming from

## Comments

### twolfson (2024-12-09T22:40:09Z)

If y'all need a headstart on this, I wrote up this scraper. Unsure what data you specifically were looking for (I wanted the stats buried in the detailed pages that I couldn't find elsewhere)

https://gist.github.com/twolfson/728ea57ea9aafcb731ab43fce52be711
