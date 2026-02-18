---
number: 147
title: Cleantech and renewable 
state: open
author: Snekili
created_at: "2015-12-15T18:16:16Z"
updated_at: "2019-12-02T19:55:00Z"
labels: ["Type: Indicator", "Topic: Climate"]
---

# Cleantech and renewable 

## Comments

### Snekili (2015-12-16T19:30:09Z)

@rgrp World Energy > http://www.bp.com/en/global/corporate/energy-economics/statistical-review-of-world-energy.html

http://data.worldbank.org/data-catalog/sustainable-energy-for-all
1. https://drive.google.com/drive/folders/0B_KlKJBuuX4aVHdJb0t6a2VKa0U
2. https://drive.google.com/drive/folders/0B_KlKJBuuX4aV0lFa0JtNlQ0VVk

### zelima (2016-06-29T11:36:57Z)

@Snekili I can not open google drive links, Could you please double check if they are valid links. Also is this the data that we need from BP website: www.bp.com/content/dam/bp/excel/energy-economics/statistical-review-2016/bp-statistical-review-of-world-energy-2016-workbook.xlsx
@rgrp  The world bank data has download link to .zip files that contain CSV, or Excel files. Do we work with .zip files?

### Snekili (2016-06-29T11:50:18Z)

@zelima All climate docs and spreadsheets are now shared with you. Try that links now.

### Snekili (2016-06-29T11:52:42Z)

@zelima 
@rgrp 

you decide if you need this one :), to me it looks interesting enough, just need a proper description,.

**Description of BP Statistical review of world energy:**

 BP Statistical Review of World Energy June 2016            

 This workbook contains information presented in the 2016  
 BP Statistical Review of World Energy, which can be found on the  
 internet at:           

http://www.bp.com/statisticalreview         

Please use the contents or the tabs at the bottom to navigate between the tables.           

Oil: Proved reserves  
Oil: Proved reserves - Barrels (from 1980)  
Oil: Production – Barrels (from 1965)  
Oil: Production – Tonnes (from 1965)  
Oil: Consumption – Barrels (from 1965)  
Oil: Consumption – Tonnes (from 1965)  
Oil: Regional consumption – by product (from 1965)  
Oil: Spot crude prices  
Oil: Crude prices since 1861  
Oil: Refinery throughput (from 1980)  
Oil: Refinery capacities (from 1965)  
Oil: Regional refining margins (from 1992)  
Oil: Trade movements (from 1980)  
Oil: Inter-area movements  
Oil: Trade 2014-2015            

Gas: Proved reserves  
Gas: Proved reserves - Bcm (from 1980)  
Gas: Production – Bcm (from 1970)  
Gas: Production – Bcf (from 1970)  
Gas: Production – Mtoe (from 1970)  
Gas: Consumption – Bcm (from 1965)  
Gas: Consumption – Bcf (from 1965)  
Gas: Consumption – Mtoe (from 1965)  
Gas: Trade movements pipeline  
Gas: Trade movements LNG  
Gas: Trade 2014-2015  
Gas: Prices             

Coal: Reserves  
Coal: Prices  
Coal: Production - Tonnes (from 1981)  
Coal: Production - Mtoe (from 1981)  
Coal: Consumption - Mtoe (from 1965)            

Nuclear Energy – Consumption - TWh (from 1965)  
Nuclear Energy – Consumption - Mtoe (from 1965)  
Hydroelectricity – Consumption - TWh (from 1965)  
Hydroelectricity – Consumption - Mtoe (from 1965)         

Renewables - Other renewables consumption -Twh (from 1965)  
Renewables - Other renewables consumption - Mtoe (from 1965)  
Renewables - Solar consumption - TWh (from 1965)  
Renewables - Solar consumption - Mtoe (from 1965)  
Renewables - Wind consumption - TWh (from 1965)  
Renewables - Wind consumption - Mtoe (from 1965)  
Renewables - Geothermal, Biomass and Other - TWh  (from 1965)  
Renewables - Geothermal, Biomass and Other - Mtoe  (from 1965)  
Renewables - Biofuels production - Kboe/d (from 1990)  
Renewables - Biofuels production - Ktoe (from 1990)         

Primary Energy: Consumption - Mtoe (from 1965)  
Primary Energy: Consumption by fuel type - Mtoe (2014-2015)         

Electricity Generation - TWh (from 1985)            

Carbon Dioxide Emissions (from 1965)            

Renewable Energy - Geothermal (Installed capacity)  
Renewable Energy - Solar (Installed capacity)  
Renewable Energy - Wind  (Installed capacity)           

Approximate conversion factors          

Definitions

### zelima (2016-06-29T12:20:13Z)

Ok so we can make separate csv files for each item @Snekili listed above, with columns like:

```
period, country, barrels (or cubic meters for gas), share, ratio
```

What do you think @rgrp

### rufuspollock (2016-07-03T15:14:51Z)

@zelima the BP stuff looks like a generic energy database. Worth doing but would be called something like `energy-production-bp`. Suggest you boot that repo and start a README that can explain what is in the source. Then we can go from that.

Can you also look at the world bank dataset http://data.worldbank.org/data-catalog/sustainable-energy-for-all - what is in there?

### zelima (2016-07-04T11:09:30Z)

@rgrp I added repo with README in it, please review it https://github.com/zelima/energy-production-bp

### zelima (2016-07-04T11:15:29Z)

@rgrp I'm don't really get terminology, but as World Bank shares on it's website the 

> database provides country level historical data for access to electricity and non-solid fuel; share of renewable energy in total final energy consumption by technology; and energy intensity rate of improvement.
- Type: Time series 
- Periodicity: Annual
- Last Updated: 09-Sep-2015
- Topic: Energy & Mining
- Coverage: 1990 - 2010

### rgieseke (2016-08-09T11:43:15Z)

Not sure if you're already aware, but this project (already creating data packages) might be useful, data for Germany and Europe:

http://open-power-system-data.org/

> we will provide information of power plants and time series of electricity consumption and wind and solar generation. We have collected data from Germany and extend the geographical scope step by step. It is also planned to gradually include more types of data, such as historical spot prices and weather data.

Repos:
https://github.com/Open-Power-System-Data
