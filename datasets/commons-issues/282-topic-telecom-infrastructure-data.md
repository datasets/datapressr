---
number: 282
title: "[topic] Telecom infrastructure data"
state: open
author: rufuspollock
created_at: "2018-08-06T08:37:39Z"
updated_at: "2020-04-24T13:07:06Z"
labels: []
---

# [topic] Telecom infrastructure data

Data like:

* [ ] Location ownership of fibre optic cables
* [ ] Spectrum ownership and management including allocation of licenses
* [ ] Location and ownership of towers
* [ ] Telecom operators
* [ ] Pricing (esp backhaul)

For more including lots of detail on these items see @stevesong recent post: https://manypossibilities.net/2018/05/open-telecom-data-moving-forward/

## Comments

### ismail-shahzad (2019-11-30T23:26:17Z)

## List of mobile network operators [Sub-Topic]:
Question:
* [ ] Telecom operators
Who are the leading telecom operators in the world and how much is there total revenue.
## Data: 
* [GSM Intelligence  : Definitive data and analysis for the mobile industry](https://www.gsmaintelligence.com/)  
  * Apparently they have all kind of data and research material about telecom operators
    * Subscriber data
    * Operational data
    * Financial data
    * Demographic Economic Data
**But signup required**

* [List of mobile network operators -Wikipedia ](https://en.wikipedia.org/wiki/List_of_mobile_network_operators)  
The data contains:
  * The overall rank of the mobile network company.
  * Their main markets.
  * Technology they use
  * Total Subscription
  * Ownership of the company 
* [List of Telephone operating companies and their revenue -Wikipedia](https://en.wikipedia.org/wiki/List_of_telephone_operating_companies) 
The data contains: The total revenue of the mobile network company in US$.
  * Name of the company
  * Total Revenue
  * Country of the company

### iamraf-ca (2020-04-24T00:19:36Z)

I pointed out some solutions for the Rufus topic, question by question, below and now I'll be gathering the datasets to commit here later.

Data like:

- [ ]  Location ownership of fibre optic cables:

  - I don't know any place that can provide this info in a dataset available for free. I found this map with all submarine fibre optic cables, where I can scrap this data from [SubmarineCableMap](https://submarinecablemap.com)
  - This information is only about the submarine cables, the information about the terrestrial cables will not be easily found because it's sensitive data for the ISP's (Internet Service Provider) companies.

- [ ]  Spectrum ownership and management including allocation of licenses:

  - The spectrum is related to mobile networks (GSM, TDMA, CDMA), we can get from Wikipedia by sectors:
  - Americas: [Spectrum ownership Americas](https://en.wikipedia.org/wiki/List_of_mobile_network_operators_of_the_Americas)
  - Asia-Pacific: [Spectrum ownership Asia-Pacific](https://en.wikipedia.org/wiki/List_of_mobile_network_operators_of_the_Asia_Pacific_region)
  - Europe: [Spectrum ownership Europe](https://en.wikipedia.org/wiki/List_of_mobile_network_operators_of_Europe)
  - Middle East-Africa: [Spectrum ownership the Middle East and Africa](https://en.wikipedia.org/wiki/List_of_mobile_network_operators_of_the_Middle_East_and_Africa)

- [ ]  Location and ownership of towers

  - We can use [OpenCellID](https://opencellid.org/) from UnWiredLabs: "OpenCelliD is working towards creating an open cellular dataset that is driven and inspired by the community. This cellular data is used for a multitude of commercial/private purposes by patrons worldwide. From locating devices to understanding network coverage patterns; OpenCelliD enables it by providing convenient access to the data via an API and data dumps."
  - I already download the raw, 948MB of data, and I'll analyze it to upload to our datasets

- [ ]  Telecom operators

  - This information can be acquired on the same link as pointed on above on the topic **Spectrum ownership**.

- [ ]  Pricing (esp backhaul)

  - Backhaul pricing will be hard to get because it depends on which region do you want to connect, speed access, type of access (Radio, Fiber, Copper).
You can get this info only asking directly to the ISP, informing point A to Point B and speed required.

### rufuspollock (2020-04-24T13:07:05Z)

@toguko this is great - you can start collecting research info in this issue and then start wrangling datasets. /cc @nirabpudasaini
