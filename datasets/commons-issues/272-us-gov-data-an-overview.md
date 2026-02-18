---
number: 272
title: "US Gov Data: an overview"
state: open
author: rufuspollock
created_at: "2019-01-10T13:29:08Z"
updated_at: "2019-11-28T16:52:14Z"
labels: []
---

# US Gov Data: an overview

High level overview of US gov data locations.

# Research

# Where does the U.S. Government Keep its Data?

*From awesome work at https://sctyner.github.io/static/presentations/Misc/GraphicsGroupISU/2018-11-16-us-govt-data.html*

#### _2018-11-16 10:13:19 CST_

Inspiration and primary source for all of this information: [Statistical Programs of the United States Government Fiscal Year 2017](https://obamawhitehouse.archives.gov/sites/default/files/omb/assets/information_and_regulatory_affairs/statistical-programs-2017.pdf)

# Principal Statistical Agency Programs

“The Federal Statistical System of the United States is the decentralized network of federal agencies which produce data about the people, economy, natural resources, and infrastructure of the United States.” ([Wikipedia](https://en.wikipedia.org/wiki/Federal_Statistical_System_of_the_United_States))

I recently got the opportunity to visit the offices of the [Committee on National Statistics](http://sites.nationalacademies.org/dbasse/cnstat/index.htm) and I realized I had no idea just how much statistical work the Federal government does. Before this, the only statistical agency I really knew about was the Census Bureau. Based on my complete and total ignorance about all of the work done and data collected by the U.S. federal government, I decided to compile together as many sources of data as I could. Wherever possible, I tried to find APIs. This list is also probably not exhaustive. There is also way more data from state and local governments on [data.gov](https://www.data.gov/), but I have not found this site to be particularly helpful when just looking for possible interesting data sources. It’s better for very specific searches in my opinion.

These 13 principal agencies are crucial to collecting data on the population and resources of the United States. They “provide critical support for policymaking, program management, and evaluation.” Two of the 13 are independent: the National Center for Science and Engineering Statistics (NCSES), a part of the National Science Foundation (NSF), and the Office of Research, Evaluation, and Statistics (ORES), a part of the Social Security Administration (SSA).

(If you’re exhausted by the alphabet soup already, I suggest you stop reading….)

The report linked at the top contains descriptions of every agency and every statistical program. It also links to every program’s website and provides employment data tables for the 13 principal agencies. Below, the numbers (x/y) are x = the number of statisticians employed and y = the number of full-time employees in the agency as of 2017.

1.  Bureau of Economic Analysis (BEA): (12/509 <nobr aria-hidden="true"><span class="math" id="MathJax-Span-1" style="width: 0.896em; display: inline-block;"><span style="display: inline-block; position: relative; width: 0.717em; height: 0px; font-size: 120%;"><span style="position: absolute; clip: rect(1.908em, 1000.66em, 2.741em, -999.997em); top: -2.557em; left: 0em;"><span class="mrow" id="MathJax-Span-2"><span class="mo" id="MathJax-Span-3" style="font-family: STIXGeneral-Regular;">≈</span></span><span style="display: inline-block; width: 0px; height: 2.562em;"></span></span></span><span style="display: inline-block; overflow: hidden; vertical-align: -0.068em; border-left: 0px solid; width: 0px; height: 0.718em;"></span></span></nobr><math xmlns="http://www.w3.org/1998/Math/MathML"><mo>≈</mo></math> 2%)

    * Description: “BEA is responsible for the preparation, development, and interpretation of the Nation’s economic accounts.”
    * Home Agency: Department of Commerce (DOC)
    * [Website](https://www.bea.gov/)
    * [API](https://apps.bea.gov/API/signup/index.cfm)

2.  Bureau of Justice Statistics (BJS): (42/69 <nobr aria-hidden="true"><span class="math" id="MathJax-Span-4" style="width: 0.896em; display: inline-block;"><span style="display: inline-block; position: relative; width: 0.717em; height: 0px; font-size: 120%;"><span style="position: absolute; clip: rect(1.908em, 1000.66em, 2.741em, -999.997em); top: -2.557em; left: 0em;"><span class="mrow" id="MathJax-Span-5"><span class="mo" id="MathJax-Span-6" style="font-family: STIXGeneral-Regular;">≈</span></span><span style="display: inline-block; width: 0px; height: 2.562em;"></span></span></span><span style="display: inline-block; overflow: hidden; vertical-align: -0.068em; border-left: 0px solid; width: 0px; height: 0.718em;"></span></span></nobr><math xmlns="http://www.w3.org/1998/Math/MathML"><mo>≈</mo></math> 61%)

    * Description: “BJS collects, analyzes, publishes, and disseminates statistical information on all aspects of the criminal justice system; assists State, Tribal, and local governments in gathering and analyzing justice statistics; and disseminates high value information and statistics to inform policymakers, researchers, criminal justice practitioners and the general public.”
    * Home Agency: Department of Justice (DOJ)
    * [Website](https://www.bjs.gov/)
    * [Data](https://www.bjs.gov/datacollection.cfm)

3.  Bureau of Labor Statistics (BLS): (168/2167 <nobr aria-hidden="true"><span class="math" id="MathJax-Span-7" style="width: 0.896em; display: inline-block;"><span style="display: inline-block; position: relative; width: 0.717em; height: 0px; font-size: 120%;"><span style="position: absolute; clip: rect(1.908em, 1000.66em, 2.741em, -999.997em); top: -2.557em; left: 0em;"><span class="mrow" id="MathJax-Span-8"><span class="mo" id="MathJax-Span-9" style="font-family: STIXGeneral-Regular;">≈</span></span><span style="display: inline-block; width: 0px; height: 2.562em;"></span></span></span><span style="display: inline-block; overflow: hidden; vertical-align: -0.068em; border-left: 0px solid; width: 0px; height: 0.718em;"></span></span></nobr><math xmlns="http://www.w3.org/1998/Math/MathML"><mo>≈</mo></math> 8%)

    * Description: “BLS is responsible for measuring labor market activity, working conditions, and price changes in the economy.”
    * Home Agency: Department of Labor (DOL)
    * [Website](https://www.bls.gov/)
    * [API](https://www.bls.gov/developers/api_r.htm) (An R script for accessing their API!!)

4.  Bureau of Transportation Statistics (BTS): (15/84 <nobr aria-hidden="true"><span class="math" id="MathJax-Span-10" style="width: 0.896em; display: inline-block;"><span style="display: inline-block; position: relative; width: 0.717em; height: 0px; font-size: 120%;"><span style="position: absolute; clip: rect(1.908em, 1000.66em, 2.741em, -999.997em); top: -2.557em; left: 0em;"><span class="mrow" id="MathJax-Span-11"><span class="mo" id="MathJax-Span-12" style="font-family: STIXGeneral-Regular;">≈</span></span><span style="display: inline-block; width: 0px; height: 2.562em;"></span></span></span><span style="display: inline-block; overflow: hidden; vertical-align: -0.068em; border-left: 0px solid; width: 0px; height: 0.718em;"></span></span></nobr><math xmlns="http://www.w3.org/1998/Math/MathML"><mo>≈</mo></math> 18%)

    * Description: “BTS compiles, analyzes, and disseminates information about the Nation’s transportation systems, including the extent, use, condition, performance, and consequences of those systems.”
    * Home Agency: Department of Transportation (DOT)
    * [Website](https://www.bts.gov/)
    * [Data](https://www.bts.gov/browse-statistical-products-and-data) (an [app](https://www.bts.gov/browse-statistical-products-and-data/pocket-guide-transportation/pocket-guide-transportation))

5.  Census Bureau (Census): (2311/6551 <nobr aria-hidden="true"><span class="math" id="MathJax-Span-13" style="width: 0.896em; display: inline-block;"><span style="display: inline-block; position: relative; width: 0.717em; height: 0px; font-size: 120%;"><span style="position: absolute; clip: rect(1.908em, 1000.66em, 2.741em, -999.997em); top: -2.557em; left: 0em;"><span class="mrow" id="MathJax-Span-14"><span class="mo" id="MathJax-Span-15" style="font-family: STIXGeneral-Regular;">≈</span></span><span style="display: inline-block; width: 0px; height: 2.562em;"></span></span></span><span style="display: inline-block; overflow: hidden; vertical-align: -0.068em; border-left: 0px solid; width: 0px; height: 0.718em;"></span></span></nobr><math xmlns="http://www.w3.org/1998/Math/MathML"><mo>≈</mo></math> 35%)

    * Description: “Census measures and disseminates information about the Nation’s ever-changing economy, society, and institutions.”
    * Home Agency: DOC
    * [Website](https://www.census.gov/)
    * [APIs (plural!)](https://www.census.gov/data/developers/data-sets.html)

6.  Economic Research Service (ERS): (1/359 <nobr aria-hidden="true"><span class="math" id="MathJax-Span-16" style="width: 0.896em; display: inline-block;"><span style="display: inline-block; position: relative; width: 0.717em; height: 0px; font-size: 120%;"><span style="position: absolute; clip: rect(1.908em, 1000.66em, 2.741em, -999.997em); top: -2.557em; left: 0em;"><span class="mrow" id="MathJax-Span-17"><span class="mo" id="MathJax-Span-18" style="font-family: STIXGeneral-Regular;">≈</span></span><span style="display: inline-block; width: 0px; height: 2.562em;"></span></span></span><span style="display: inline-block; overflow: hidden; vertical-align: -0.068em; border-left: 0px solid; width: 0px; height: 0.718em;"></span></span></nobr><math xmlns="http://www.w3.org/1998/Math/MathML"><mo>≈</mo></math> .3%)

    * Description: “ERS provides economic and other social science research and analysis to inform public and private decision making on agriculture, food, natural resources, and rural America.”
    * Home Agency: United States Department of Agriculture (USDA)
    * Website: https://www.ers.usda.gov/
    * ~~API~~ Prayer directed at Excel files here: https://www.ers.usda.gov/data-products/
    * Bonus: Cool sounding [postdoc gig](https://www.ers.usda.gov/about-ers/careers-at-ers/employment-opportunities/data-scientist-post-doctoral-position/). Application due November 19, 2018!

7.  Energy Information Administration (EIA): (75/368 <nobr aria-hidden="true"><span class="math" id="MathJax-Span-19" style="width: 0.896em; display: inline-block;"><span style="display: inline-block; position: relative; width: 0.717em; height: 0px; font-size: 120%;"><span style="position: absolute; clip: rect(2.027em, 1000.66em, 2.741em, -999.997em); top: -2.557em; left: 0em;"><span class="mrow" id="MathJax-Span-20"><span class="mo" id="MathJax-Span-21" style="font-family: STIXGeneral-Regular;">=</span></span><span style="display: inline-block; width: 0px; height: 2.562em;"></span></span></span><span style="display: inline-block; overflow: hidden; vertical-align: -0.068em; border-left: 0px solid; width: 0px; height: 0.575em;"></span></span></nobr><math xmlns="http://www.w3.org/1998/Math/MathML"><mo>=</mo></math> 20%)

    * Description: “EIA collects, analyzes, and disseminates independent and impartial energy information to promote sound policymaking, efficient markets, and public understanding of energy and its interaction with the economy and the environment.”
    * Home Agency: Department of Energy (DOE)
    * Website: [https://www.eia.gov](https://www.eia.gov/)
    * API: https://www.eia.gov/opendata/qb.php

8.  National Agricultural Statistics Service (NASS): (634/1037 <nobr aria-hidden="true"><span class="math" id="MathJax-Span-22" style="width: 0.896em; display: inline-block;"><span style="display: inline-block; position: relative; width: 0.717em; height: 0px; font-size: 120%;"><span style="position: absolute; clip: rect(1.908em, 1000.66em, 2.741em, -999.997em); top: -2.557em; left: 0em;"><span class="mrow" id="MathJax-Span-23"><span class="mo" id="MathJax-Span-24" style="font-family: STIXGeneral-Regular;">≈</span></span><span style="display: inline-block; width: 0px; height: 2.562em;"></span></span></span><span style="display: inline-block; overflow: hidden; vertical-align: -0.068em; border-left: 0px solid; width: 0px; height: 0.718em;"></span></span></nobr><math xmlns="http://www.w3.org/1998/Math/MathML"><mo>≈</mo></math> 61%)

    * Description: " NASS collects, summarizes, analyzes, and publishes data on the number of farms and land in farms; acreage, yield, production, and stocks of crops; inventories and production of livestock, including eggs and dairy products; prices received by farmers for products, prices paid for commodities and services, and related indexes; agriculture production and marketing data; cold storage supplies; agricultural chemical use; and other related areas of the agricultural economy."
    * Home Agency: USDA
    * Website: https://www.nass.usda.gov/
    * API: https://quickstats.nass.usda.gov/api (This was hard to find.)

9.  National Center for Education Statistics (NCES): (71/93 <nobr aria-hidden="true"><span class="math" id="MathJax-Span-25" style="width: 0.896em; display: inline-block;"><span style="display: inline-block; position: relative; width: 0.717em; height: 0px; font-size: 120%;"><span style="position: absolute; clip: rect(1.908em, 1000.66em, 2.741em, -999.997em); top: -2.557em; left: 0em;"><span class="mrow" id="MathJax-Span-26"><span class="mo" id="MathJax-Span-27" style="font-family: STIXGeneral-Regular;">≈</span></span><span style="display: inline-block; width: 0px; height: 2.562em;"></span></span></span><span style="display: inline-block; overflow: hidden; vertical-align: -0.068em; border-left: 0px solid; width: 0px; height: 0.718em;"></span></span></nobr><math xmlns="http://www.w3.org/1998/Math/MathML"><mo>≈</mo></math> 76%)

    * Description: “NCES collects, analyzes, and disseminates education statistics at all levels, from preschool through postsecondary and adult education, including statistics on international education.”
    * Home Agency: Department of Education (ED)
    * Website: https://nces.ed.gov/
    * ~~API~~ Good luck: https://nces.ed.gov/pubsearch/ , https://nces.ed.gov/datatools/

10.  National Center for Health Statistics (NCHS): (164/503 <nobr aria-hidden="true"><span class="math" id="MathJax-Span-28" style="width: 0.896em; display: inline-block;"><span style="display: inline-block; position: relative; width: 0.717em; height: 0px; font-size: 120%;"><span style="position: absolute; clip: rect(1.908em, 1000.66em, 2.741em, -999.997em); top: -2.557em; left: 0em;"><span class="mrow" id="MathJax-Span-29"><span class="mo" id="MathJax-Span-30" style="font-family: STIXGeneral-Regular;">≈</span></span><span style="display: inline-block; width: 0px; height: 2.562em;"></span></span></span><span style="display: inline-block; overflow: hidden; vertical-align: -0.068em; border-left: 0px solid; width: 0px; height: 0.718em;"></span></span></nobr><math xmlns="http://www.w3.org/1998/Math/MathML"><mo>≈</mo></math> 33%)

    * Description: “NCHS is responsible for the collection, maintenance, analysis, and dissemination of statistics on the nature and extent of the health, illness, and disability of the U.S. population; the impact of illness and disability on the economy; the effects of environmental, social, and other health hazards; health care costs and financing; family formation, growth, and dissolution; and vital events (births and deaths).”
    * Home Agency: Department of Health and Human Services (HHS)
    * Website: https://www.cdc.gov/nchs/
    * API: Supposedly http://www.healthindicators.gov/ and https://ephtracking.cdc.gov/apihelp and https://wonder.cdc.gov/ and https://www.cdc.gov/sdp/SDPForDevelopers.html.

11.  National Center for Science and Engineering Statistics (NCSES): (25/52 <nobr aria-hidden="true"><span class="math" id="MathJax-Span-31" style="width: 0.896em; display: inline-block;"><span style="display: inline-block; position: relative; width: 0.717em; height: 0px; font-size: 120%;"><span style="position: absolute; clip: rect(1.908em, 1000.66em, 2.741em, -999.997em); top: -2.557em; left: 0em;"><span class="mrow" id="MathJax-Span-32"><span class="mo" id="MathJax-Span-33" style="font-family: STIXGeneral-Regular;">≈</span></span><span style="display: inline-block; width: 0px; height: 2.562em;"></span></span></span><span style="display: inline-block; overflow: hidden; vertical-align: -0.068em; border-left: 0px solid; width: 0px; height: 0.718em;"></span></span></nobr><math xmlns="http://www.w3.org/1998/Math/MathML"><mo>≈</mo></math> 48%)

    * Description: “NCSES is called on to support the collection of statistical data on research and development trends, the science and engineering workforce, U.S. competitiveness, and the condition and progress of the Nation’s science, technology, engineering, and mathematics (STEM) education; to support research using the data it collects and on methodologies in areas related to the work of the Center; and to support the education and training of researchers in the use of its own and other large-scale, nationally representative data sets.”
    * Home Agency: NSF
    * Website: https://www.nsf.gov/statistics/
    * ~~API~~ Prayer and patience: https://www.nsf.gov/statistics/data-tools.cfm

12.  Office of Research, Evaluation, and Statistics (ORES): (3/66 <nobr aria-hidden="true"><span class="math" id="MathJax-Span-34" style="width: 0.896em; display: inline-block;"><span style="display: inline-block; position: relative; width: 0.717em; height: 0px; font-size: 120%;"><span style="position: absolute; clip: rect(1.908em, 1000.66em, 2.741em, -999.997em); top: -2.557em; left: 0em;"><span class="mrow" id="MathJax-Span-35"><span class="mo" id="MathJax-Span-36" style="font-family: STIXGeneral-Regular;">≈</span></span><span style="display: inline-block; width: 0px; height: 2.562em;"></span></span></span><span style="display: inline-block; overflow: hidden; vertical-align: -0.068em; border-left: 0px solid; width: 0px; height: 0.718em;"></span></span></nobr><math xmlns="http://www.w3.org/1998/Math/MathML"><mo>≈</mo></math> 5%)

    * Description: “ORES performs demographic and socioeconomic research to assess the impact of program changes or alternatives.”
    * Home Agency: SSA
    * Website: https://www.ssa.gov/policy/about/ORES.html
    * ~~API~~ Prayer: https://www.ssa.gov/policy/docs/data/index.html

13.  Statistics of Income (SOI): (25/116 <nobr aria-hidden="true"><span class="math" id="MathJax-Span-37" style="width: 0.896em; display: inline-block;"><span style="display: inline-block; position: relative; width: 0.717em; height: 0px; font-size: 120%;"><span style="position: absolute; clip: rect(1.908em, 1000.66em, 2.741em, -999.997em); top: -2.557em; left: 0em;"><span class="mrow" id="MathJax-Span-38"><span class="mo" id="MathJax-Span-39" style="font-family: STIXGeneral-Regular;">≈</span></span><span style="display: inline-block; width: 0px; height: 2.562em;"></span></span></span><span style="display: inline-block; overflow: hidden; vertical-align: -0.068em; border-left: 0px solid; width: 0px; height: 0.718em;"></span></span></nobr><math xmlns="http://www.w3.org/1998/Math/MathML"><mo>≈</mo></math> 22%)

    * Description: “SOI collects, analyzes, and disseminates information on the Federal tax system.”
    * Home Agency: Internal Revenue Service (IRS)
    * Website: https://www.irs.gov/statistics/soi-tax-stats-about-soi
    * ~~API~~ 🤷: https://www.irs.gov/statistics/soi-tax-stats-release-and-dissemination

# Other Federal Statistical Programs, by Department

Of the fifteen US federal government departments, fourteen have additional statistical programs (outside of the 13 principal statistical agencies), and there are even more programs in independent agencies. There are 115 of these statistical programs in total (yes, I counted them). For each one, I just link to the closest thing to a data website I could find.

1.  Department of Agriculture : https://www.usda.gov/media/digital/developer-resources

    1.  Agricultural Research Service (ARS) : https://www.ars.usda.gov/research/datasets/
    2.  Food and Nutrition Service (FNS) : https://www.fns.usda.gov/data-and-statistics
    3.  Foreign Agricultural Service (FAS) : https://www.fas.usda.gov/data
    4.  Forest Service (FS) : closest I could find to a data warehouse https://www.fs.fed.us/publications
    5.  Natural Resources Conservation Service (NRCS) : https://www.nrcs.usda.gov/wps/portal/nrcs/detail/national/home/?cid=stelprdb1049255
    6.  Risk Management Agency (RMA) : https://www.rma.usda.gov/ under the “Tools” menu
    7.  World Agricultural Outlook Board (WAOB) : (just some reports) https://www.usda.gov/oce/commodity/index.htm

2.  Department of Commerce : APIs linked + code on Github!!!! https://github.com/CommerceGov/commerce.gov-api

    1.  Economics and Statistics Administration (ESA) : https://www.commerce.gov/bureaus-and-offices/ousea
    2.  International Trade Administration (ITA) : API here: https://developer.trade.gov/
    3.  National Oceanic and Atmospheric Administration (NOAA) : https://www.ncdc.noaa.gov/cdo-web/webservices/v2 (R Package https://cran.r-project.org/web/packages/rnoaa/index.html)
    4.  National Environmental Satellite, Data, and Information Service (NESDIS) : Cool maps and other viz https://www.nesdis.noaa.gov/content/imagery-and-data
    5.  Marine Fisheries Service (NMFS) : https://www.fisheries.noaa.gov/resources/data-and-maps
    6.  Patent and Trademark Office (PTO) : https://www.uspto.gov/learning-and-resources/open-data-and-mobility

3.  Department of Defense : https://data.defense.gov/

    1.  Army Corps of Engineers (ACE) : https://www.iwr.usace.army.mil/about/technical-centers/wcsc-waterborne-commerce-statistics-center/
    2.  Defense Health Agency (DHA) : https://health.mil/Military-Health-Topics/Health-Readiness/Armed-Forces-Health-Surveillance-Branch/Data-Management-and-Technical-Support
    3.  Defense Manpower Data Center (DMDC) : https://www.dmdc.osd.mil/appj/dwp/data_reqs.jsp

4.  Department of Education: https://www2.ed.gov/rschstat/catalog/index.html, https://eddataexpress.ed.gov/?src=ft , https://usedgov.github.io/, https://usedgov.github.io/api/

    1.  Institute of Education Sciences (IES) : https://ies.ed.gov/data.asp
    2.  Office of Career, Technical, and Adult Education (OCTAE) : https://www2.ed.gov/about/offices/list/ovae/resource/index.html
    3.  Office for Civil Rights (OCR) : https://ocrdata.ed.gov/
    4.  Office of Elementary and Secondary Education (OESE) : https://www2.ed.gov/about/offices/list/oese/resources.html
    5.  Office of Innovation and Improvement (OII) : https://innovation.ed.gov/resources/
    6.  Office of Planning, Evaluation, and Policy Development (OPEPD) : https://www2.ed.gov/about/offices/list/opepd/reports.html
    7.  Office of Postsecondary Education (OPE) : https://nces.ed.gov/ipeds/use-the-data
    8.  Office of Special Education and Rehabilitative Services (OSERS) : https://rsa.ed.gov/

5.  Department of Energy : https://www.energy.gov/data/open-energy-data

    1.  Office of Environment, Health, Safety, and Security (OEHSS) : https://www.energy.gov/ehss/policy-guidance-reports/databases

6.  Department of Health and Human Services : https://www.hhs.gov/developer.html, https://healthdata.gov/

    1.  Administration for Children and Families (ACF) : https://www.acf.hhs.gov/reports#block-acf-theme-opre-reports
    2.  Administration for Community Living (ACL) : https://agid.acl.gov/
    3.  Agency for Healthcare Research and Quality (AHRQ) : https://www.ahrq.gov/data/resources/index.html
    4.  Centers for Disease Control and Prevention (CDC) : https://data.cdc.gov/ ; https://github.com/CDCgov .

        1.  Agency for Toxic Substance and Disease Registry (ATSDR) : https://www.atsdr.cdc.gov/publications_data_resources.html
        2.  Center for Global Health : https://www.cdc.gov/globalhealth/index.html
        3.  National Center on Birth Defects and Developmental Disabilities (NCBDDD) : https://www.cdc.gov/ncbddd/index.html
        4.  National Center for Chronic Disease Prevention and Health Promotion (NCCDPHP) : https://www.cdc.gov/chronicdisease/data/indicators.htm
        5.  National Center for Emerging Zoonotic and Infectious Diseases (NCEZID) : https://www.cdc.gov/ncezid/multimedia/infographics.html
        6.  National Center for Environmental Health (NCEH) : https://www.cdc.gov/nceh/data.htm
        7.  National Center for HIV/AIDS, Viral Hepatitis, Sexually Transmitted Disease, and Tuberculosis Prevention (NCHHSTP) : https://www.cdc.gov/nchhstp/data-tools-resources.htm
        8.  National Center for Immunization and Respiratory Diseases (NCIRD) : https://www.cdc.gov/ncird/
        9.  National Center for Injury Prevention and Control (NCIPC) : https://www.cdc.gov/injury/wisqars/index.html
        10.  National Institute for Occupational Safety and Health (NIOSH) : https://www.cdc.gov/niosh/data/default.html
        11.  Office of Public Health Scientific Services (PHSS) : https://www.cdc.gov/cpr/

    5.  Centers for Medicare and Medicaid Services (CMS) : https://www.cms.gov/Research-Statistics-Data-and-Systems/Research-Statistics-Data-and-Systems.html
    6.  Health Resources and Services Administration (HRSA) : https://data.hrsa.gov/
    7.  Indian Health Service (IHS) : https://www.ihs.gov/dps/
    8.  National Institutes of Health (NIH) : https://www.nimhd.nih.gov/resources/reports-data.html, https://ghr.nlm.nih.gov/about/data-files-api, https://report.nih.gov/databases.aspx
    9.  National Cancer Institute (NCI) : https://api.seer.cancer.gov/, https://clinicaltrialsapi.cancer.gov/ , https://www.cancer.gov/search/results?swKeyword=api
    10.  National Center for Complementary and Integrative Health (NCCIH) : https://nccih.nih.gov/research/statistics
    11.  National Eye Institute (NEI) : https://nei.nih.gov/eyedata
    12.  National Heart, Lung, and Blood Institute (NHLBI) : https://www.nhlbi.nih.gov/science
    13.  National Human Genome Research Institute (NHGRI) : https://www.genome.gov/policyethics/legdatabase/pubsearch.cfm, https://www.genome.gov/10000018/computational-and-statistical-genomics-branch-csgb/
    14.  National Institute on Aging (NIA) : https://www.nia.nih.gov/research/resources
    15.  National Institute on Alcohol Abuse and Alcoholism (NIAAA) : https://www.niaaa.nih.gov/research/guidelines-and-resources/epidemiologic-data
    16.  National Institute of Allergy and Infectious Diseases (NIAID) : https://www.niaid.nih.gov/research/resources
    17.  National Institute of Biomedical Imaging and Bioengineering (NIBIB) : https://www.nibib.nih.gov/
    18.  National Institute of Child Health and Human Development (NICHD) : https://www.nichd.nih.gov/research/resources/index
    19.  National Institute on Deafness and Other Communication Disorders (NIDCD) : https://www.nidcd.nih.gov/
    20.  National Institute of Dental and Craniofacial Research (NIDCR) : https://www.nidcr.nih.gov/research/data-statistics
    21.  National Institute of Diabetes and Digestive and Kidney Diseases (NIDDK) : https://www.niddk.nih.gov/research-funding/research-resources
    22.  National Institute on Drug Abuse (NIDA) : https://github.com/nih-nida
    23.  National Institute of Environmental Health Sciences (NIEHS) : https://www.niehs.nih.gov/research/resources/databases/index.cfm
    24.  National Institute of General Medical Sciences’ (NIGMS) : https://www.nigms.nih.gov/education/other-resources
    25.  National Institute of Mental Health (NIMH) : https://www.nimh.nih.gov/health/statistics/index.shtml
    26.  Office of the Director (NIH/OD) : https://acd.od.nih.gov/working-groups.html
    27.  Office of the Assistant Secretary for Planning and Evaluation (ASPE) : https://aspe.hhs.gov/basic-search/data
    28.  Office of Population Affairs (OPA) : https://www.hhs.gov/opa/
    29.  Substance Abuse and Mental Health Services Administration (SAMHSA) : https://www.samhsa.gov/data/all-reports

7.  Department of Homeland Security : https://www.dhs.gov/dhs-developer-community

    1.  Citizenship and Immigration Services (CIS) : https://www.uscis.gov/tools/reports-studies/immigration-forms-data
    2.  Coast Guard : https://www.uscg.mil/
    3.  Customs and Border Protection (CBP) : https://www.cbp.gov/trade/itrac-requests, https://www.cbp.gov/newsroom/stats
    4.  Federal Emergency Management Agency’s (FEMA) : https://www.fema.gov/data-visualization, https://www.fema.gov/data-feeds
    5.  Office of Immigration Statistics (OIS) : https://www.dhs.gov/immigration-statistics (Link was broken last I checked…)

8.  Department of Housing and Urban Development : https://data.hud.gov/

    1.  Office of Housing (Housing) : https://www.hud.gov/program_offices/housing
    2.  Office of Policy Development and Research (PD&R) : https://www.huduser.gov/portal/pdrdatas_landing.html
    3.  Office of Public and Indian Housing (PIH) : https://www.hud.gov/program_offices/public_indian_housing/ih/pubs

9.  Department of the Interior : https://www.doi.gov/data, https://data.doi.gov/dataset

    1.  Bureau of Land Management (BLM) : https://www.blm.gov/about/data
    2.  Bureau of Ocean Energy Management (BOEM) : https://www.boem.gov/Maps-and-GIS-Data/, https://www.boem.gov/Renewable-Energy-Program-Mapping-and-Data/, https://www.data.boem.gov/ (woof)
    3.  Bureau of Reclamation (BoR) : https://water.usbr.gov/ , https://www.usbr.gov/rsvrWater/HistoricalApp.html
    4.  Fish and Wildlife Service (FWS) : https://www.fws.gov/southeast/data-management/, https://www.fws.gov/gis/data/national/
    5.  Geological Survey (GS) : https://www.usgs.gov/products/data-and-tools/overview (NICE!)
    6.  National Park Service (NPS) : https://www.nps.gov/gis/data_info/, https://irma.nps.gov/DataStore/, https://www.nps.gov/subjects/digital/nps-data-api.htm
    7.  Office of Natural Resources Revenue (ONRR) : https://revenuedata.doi.gov/explore/#federal-disbursements, https://www.onrr.gov/About/production-data.htm

10.  Department of Justice : https://www.justice.gov/developer , https://data.ojp.gov/developer/index.html

    1.  Bureau of Prisons’ (BOP) : http://prisondb.github.io/bopapidocs.html (not affiliated with bop.gov), https://www.bop.gov/about/statistics/
    2.  Drug Enforcement Administration (DEA) : https://www.dea.gov/data-and-statistics, https://dea.ntis.gov/
    3.  Federal Bureau of Investigation’s (FBI) : https://www.fbi.gov/wanted/api, https://crime-data-explorer.fr.cloud.gov/api
    4.  National Institute of Justice (NIJ) : https://www.nij.gov/journals/258/Pages/forensic-databases.aspx, https://www.nij.gov/funding/data-resources-program/Pages/accessing.aspx
    5.  Office of Juvenile Justice and Delinquency Prevention (OJJDP) : https://www.icpsr.umich.edu/icpsrweb/content/NACJD/archiving/deposit-ojjdp-data.html, https://www.ojjdp.gov/ojstatbb/dat.htmlm https://www.ojjdp.gov/ojstatbb/ezapop/

11.  Department of Labor: https://enforcedata.dol.gov/homePage.php, https://developer.dol.gov/

    1.  Chief Evaluation Office (CEO) : https://www.dol.gov/asp/evaluation/PublicUseData.htm
    2.  Employment and Training Administration (ETA) : https://www.doleta.gov/research/
    3.  Mine Safety and Health Administration (MSHA) : https://www.msha.gov/data-reports/data-sources-calculators
    4.  Occupational Safety and Health Administration (OSHA) : https://www.osha.gov/oshstats/index.html
    5.  Office of Federal Contract Compliance Programs (OFCCP) : https://www.dol.gov/ofccp/BTN/index.html
    6.  Wage and Hour Division (WHD) : https://catalog.data.gov/dataset/whd-compliance-full

12.  Department of State : https://www.state.gov/api/v1/docs/, https://www.state.gov/developer/, https://www.state.gov/data/

    1.  Office of the U.S. Global AIDS Coordinator (OGAC) :https://www.pepfar.gov/priorities/data/index.htm, https://www.hiv.gov/locator#api

13.  Department of Transportation : https://www.transportation.gov/developer

    1.  Federal Aviation Administration (FAA) : https://www.faa.gov/data_research/
    2.  Federal Highway Administration (FHWA) : https://infopave.fhwa.dot.gov/Data/DataSelection
    3.  Federal Motor Carrier Safety Administration (FMCSA) : [https://dataqs.fmcsa.dot.gov](https://dataqs.fmcsa.dot.gov/)
    4.  Federal Railroad Administration (FRA) : https://safetydata.fra.dot.gov/officeofsafety/publicsite/downloaddbf.aspx
    5.  Federal Transit Administration (FTA) : https://www.transit.dot.gov/ntd
    6.  National Highway Traffic Safety Administration (NHTSA) : https://www.nhtsa.gov/research-data
    7.  Pipeline and Hazardous Materials Safety Administration (PHMSA) : https://www.phmsa.dot.gov/data-and-statistics/pipeline/data-and-statistics-overview

14.  Department of Veterans Affairs : https://www.data.va.gov/, https://developer.va.gov/

    1.  National Cemetery Administration (NCA) : https://gravelocator.cem.va.gov/
    2.  VA Office of Inspector General (VAOIG) : https://www.va.gov/oig/publications/default.asp
    3.  Office of Policy and Planning (OPP) : https://www.va.gov/HEALTHPOLICYPLANNING/OSPA_prod.asp
    4.  Veterans Benefits Administration (VBA) : https://benefits.va.gov/benefits/
    5.  Veterans Health Administration (VHA) : https://www.publichealth.va.gov/studies-data.asp?_ga=2.43552869.1979850101.1542340457-1023302291.1542340457, https://www.va.gov/health/

15.  Statistical Programs of Other Federal Agencies 57

    1.  ~~Broadcasting Board of Governors (BBG)~~ United States Agency for Global Media (USAGM): https://www.usagm.gov/our-work/strategy-and-results/strategic-priorities/research-reports/
    2.  Consumer Product Safety Commission (CPSC) : https://www.cpsc.gov/Recalls/CPSC-Recalls-Application-Program-Interface-API-Information, https://www.cpsc.gov/Newsroom/Downloadable-Data
    3.  Corporation for National and Community Service’s (CNCS) : https://www.nationalservice.gov/impact-our-nation/evidence-exchange/basic-search
    4.  Environmental Protection Agency (EPA) : https://www.epa.gov/enviro/web-services (loads of APIs)
    5.  Equal Employment Opportunity Commission (EEOC) : https://www.eeoc.gov/eeoc/statistics/index.cfm,
    6.  Institute of Museum and Library Services (IMLS) : https://www.imls.gov/research-tools/data-collection
    7.  National Aeronautics and Space Administration (NASA) : https://api.nasa.gov/, https://www.nasa.gov/data/
    8.  National Science Foundation (NSF) : https://www.nsf.gov/developer/
    9.  Office of National Drug Control Policy (ONDCP) : https://www.whitehouse.gov/ondcp/ (I couldn’t find any data.)
    10.  Small Business Administration (SBA) : https://www.sba.gov/about-sba/sba-performance/open-government/digital-sba/open-data/open-data-sources
    11.  Social Security Administration (SSA) : https://www.ssa.gov/developer/, https://www.ssa.gov/data/
    12.  U.S. Agency for International Development (USAID) : https://www.usaid.gov/results-and-data/data-resources, https://www.usaid.gov/developer

# What did I learn?

* Just Google “search term” + gov + data + api. You’ll probably find what you’re looking for.
* data.gov is not super useful unless you know exactly what you’re looking for. There’s just too much data!
* There are a surprising number of federal agencies and/or programs putting their work on Github. Pretty exciting!
* Get one API key for many .gov APIs: https://api.data.gov/
* The Open Data Executive Order is pretty great: https://obamawhitehouse.archives.gov/the-press-office/2013/05/09/executive-order-making-open-and-machine-readable-new-default-government-
