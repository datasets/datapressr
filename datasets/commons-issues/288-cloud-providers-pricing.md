---
number: 288
title: Cloud Providers Pricing
state: open
author: rufuspollock
created_at: "2018-05-09T19:22:00Z"
updated_at: "2021-11-15T17:51:16Z"
labels: []
---

# Cloud Providers Pricing

I want a time series dataset of cloud provider pricing for storage, compute, databases etc

## Research

https://redmonk.com/rstephens/2018/07/13/iaas-pricing-patterns-and-trends-2018/ - has a link to a google spreadsheet https://docs.google.com/spreadsheets/d/1BrXfyq-u9nTDy-HS43G4lYFZ6Yej1hUSnj17kIRdcUk/edit#gid=0

## S3

6 components to their pricing: Storage Pricing, Request Pricing. Data Tranfer (bandwidth) pricing, Amazon S3 Storage Management Pricing, Cross-Region Replication Pricing, Amazon S3 Transfer Acceleration Pricing

Amazon S3 prices over time:

$0.15 (before 2010) - https://aws.amazon.com/blogs/aws/what-can-i-say-another-amazon-s3-price-reduction/
$0.14 (2010) - https://aws.amazon.com/blogs/aws/what-can-i-say-another-amazon-s3-price-reduction/
$0.09 (2012) - https://aws.amazon.com/blogs/aws/amazon-s3-price-reduction-december-1-2012/
$0. 03 (2014) - https://aws.amazon.com/blogs/aws/aws-price-reduction-42-ec2-s3-rds-elasticache-and-elastic-mapreduce/

## Comments

### rufuspollock (2019-01-03T17:41:01Z)

@tomvachon i came across your excellent https://www.stayclassyinternet.com/articles/investigating-AWS-pricing-over-time/ I wondered if you'd be willing to share your thoughts and perhaps the spreadsheet of data you collected

### rufuspollock (2021-11-07T07:29:26Z)

Just came across y-combinator backed https://www.taloflow.ai (launched 2021) - they do some of this automatically for you.

### austinpena-taloflow (2021-11-11T11:52:24Z)

Sure do! There are so many variations of the data based on region and tier that if you're using this as a decision tool we gave vendors relative rankings depending on the storage type https://www.taloflow.ai/cloud-object-storage/pricing-guide.

For a full ROI comparison (like with hard numbers) we're launching a tool next week to give that data.

### rufuspollock (2021-11-15T09:40:59Z)

@austinpena-taloflow so can you share the raw data (openly)? That would be great and still provide a lot of room for you to add value and provide a service ... (and it would be great to have *historical* data ...)

PS: and thanks for jumping in and responding 🙂

### austinpena-taloflow (2021-11-15T17:51:16Z)

@rufuspollock I'll bring it up with the team! I don't imagine anything being made public for a few months though. I'll write back if I have good news 😊
