---
number: 153
title: IMO IMDG Codes
state: closed
author: cmsdroff
created_at: "2015-12-22T15:22:52Z"
updated_at: "2016-01-06T20:20:51Z"
closed_at: "2016-01-06T20:20:36Z"
labels: ["Type: Indicator", "Difficulty: easy"]
---

# IMO IMDG Codes

Official IMDG Codes for use in transport of dangerous goods as described by the IMO

Source of the information is from the IMO and Gov.uk: http://www.imo.org/blast/mainframe.asp?topic_id=158 https://www.gov.uk/guidance/moving-dangerous-goods#the-classification-of-dangerous-goods

Requests for addition to the codes should be made to the IMO directly

Work on this package has already been done locally if of interest?

## Comments

### rufuspollock (2015-12-22T21:13:43Z)

@cmsdroff definitely of interest - would be happy to have this in here as a data package.

### pdehaye (2016-01-06T13:13:16Z)

@cmsdroff Would love to see this in!

### cmsdroff (2016-01-06T14:51:44Z)

The work is done i just can't get the schema to validate?  Error is not very descriptive of where the problem lies?

Status: Invalid

[SCHEMA] String does not match pattern: ^([a-z0-9._-])+$
[
  {
    "message": "String does not match pattern: ^([a-z0-9\.\_\-])+$",
    "params": {
      "pattern": "^([a-z0-9\.\_\-])+$"
    },
    "code": 202,
    "dataPath": "/name",
    "schemaPath": "/properties/name/pattern",
    "subErrors": null,
    "type": "schema"
  }
]

Any ideas what this is causing problems with?  the data package.json url is 

http://data.okfn.org/tools/validate?url=https%3A%2F%2Fraw.githubusercontent.com%2Fwarrantgroup%2FIMO-IMDG-Codes%2Fmaster%2Fdatapackage.json

help appreciated @pdehaye ?

### pdehaye (2016-01-06T16:08:40Z)

It took me a long while, but yes. The problem lies in the "name" field, whose value needs to be all lowercase. This condition does not apply to GitHub repo names.

### cmsdroff (2016-01-06T16:25:09Z)

fantastic, i understand this now, will makes sure future commits don't drive me or you crazy @pdehaye the dataset along with with the ISO-Container-Codes are both ready to transfer the ownership to datasets.  I don't have admin just tried, i've added you into the group that will allow it on our side.  Let me know if i need to do anything else, thanks for your help!

### cmsdroff (2016-01-06T16:37:55Z)

Valid url http://data.okfn.org/tools/validate?url=https%3A%2F%2Fraw.githubusercontent.com%2Fwarrantgroup%2FIMO-IMDG-Codes%2Fmaster%2Fdatapackage.json

data package link: http://data.okfn.org/tools/view?url=https%3A%2F%2Fgithub.com%2Fwarrantgroup%2FIMO-IMDG-Codes

ready to go, added you down as a contributor on both noted packages

### pdehaye (2016-01-06T16:40:00Z)

Got it, have to run myself and want to do it in calm conditions, so I have just labeled the issue and will get back to this.

### pdehaye (2016-01-06T20:20:36Z)

Done now! @cmsdroff you should have been invited to the organisation.
