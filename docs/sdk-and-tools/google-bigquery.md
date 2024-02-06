---
id: google-bigquery
title: Google BigQuery
---

[comment]: # "mx-abstract"

This page succinctly describes how to use Google BigQuery to analyze data from the MultiversX blockchain.

[comment]: # "mx-context-auto"

## Overview

[**BigQuery**](https://cloud.google.com/bigquery/docs/introduction) is Google's fully managed, serverless data warehouse that enables analysis of extremely large datasets using [SQL queries](https://cloud.google.com/bigquery/docs/introduction-sql) and / or visual tools (such as [Google Looker Studio](https://lookerstudio.google.com)); it also has built-in [machine learning capabilities](https://cloud.google.com/bigquery/docs/bqml-introduction).

[**MultiversX Blockchain data**](https://console.cloud.google.com/marketplace/product/bigquery-public-data/blockchain-analytics-multiversx-mainnet-eu) is published to Google BigQuery, and available (for free) through the [**Google Cloud Marketplace**](https://console.cloud.google.com/marketplace/product/bigquery-public-data/blockchain-analytics-multiversx-mainnet-eu). The dataset, namely [**`bigquery-public-data.crypto_multiversx_mainnet_eu`**](https://console.cloud.google.com/bigquery?p=bigquery-public-data&d=crypto_multiversx_mainnet_eu&page=dataset), is one of many crypto datasets that are available within [**Google Cloud Public Datasets**](https://cloud.google.com/bigquery/public-data). One can query these datasets for free: up to 1TB / month of free processing, every month.

The MultiversX BigQuery dataset closely resembles the set of indices of the [**MultiversX Elasticsearch instance**](/sdk-and-tools/elastic-search#elasticsearch-indices). Their schema and data are **approximatly equivalent**, the data [being mirrored from the Elasticsearch instance to BigQuery](https://github.com/multiversx/multiversx-etl) at regular intervals (most tables are updated _hourly_, and a few are updated every _4 hours_).

:::note
As of February 2024, the MultiversX BigQuery dataset **is not updated in real-time** (see above). For real-time data, [use the public APIs](/sdk-and-tools/rest-api).
:::

:::note
If you experience any issue with the published dataset, please [let us know](https://github.com/multiversx/multiversx-etl/issues).
:::

## Query from BigQuery Studio

[**Google BigQuery Studio**](https://cloud.google.com/bigquery/docs/query-overview#bigquery-studio) is a unified workspace for Google Cloud's data analytics suite which incorporates, among others, an SQL editor (optionally [assisted by AI](https://cloud.google.com/bigquery/docs/write-sql-duet-ai)) and Python notebooks. It is a great way to explore the MultiversX dataset, and to run queries. Below, we'll explore a few example queries.

:::tip
Make sure to explore the dataset, the tables and their schema before running queries. Both the schema and a data preview are available in BigQuery Studio.
:::

#### How many transactions were processed on MultiversX, in the last couple of days?

```sql
SELECT
    DATE(`timestamp`) `day`,
    COUNT(*) `transactions`
FROM `bigquery-public-data.crypto_multiversx_mainnet_eu.transactions`
WHERE DATE(`timestamp`) >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
GROUP BY `day`
ORDER BY `day` DESC
```

#### Which were the top used Smart Contracts, in the last couple of days?

```sql
SELECT
  DATE(`timestamp`) `day`,
  `receiver` `contract`,
  COUNT(DISTINCT `sender`) `num_users`,
FROM `bigquery-public-data.crypto_multiversx_mainnet_eu.transactions`
WHERE `isScCall` = true
GROUP BY `day`, `contract`
HAVING `day` >= DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY) AND `num_users` > 1000
ORDER BY `day` DESC, `num_users` DESC
```

#### What ESDT tokens have the most holders?

```sql
SELECT
    `token`,
    `type`,
    COUNT(_id) `num_holders`
FROM `bigquery-public-data.crypto_multiversx_mainnet_eu.accountsesdt`
WHERE `type` = 'FungibleESDT' OR `type` = 'MetaESDT'
GROUP BY `token`, `type`
HAVING `num_holders` > 5000
ORDER BY `num_holders` DESC
```

#### What are the transactions with the largest transferred EGLD amounts, in the last couple of days?

```sql
SELECT
  `day`,
  `hash`,
  `sender`,
  `receiver`,
  `amount`
FROM (
  SELECT
    DATE(`timestamp`) `day`,
    `_id` `hash`,
    `sender`,
    `receiver`,
    PARSE_BIGNUMERIC(`value`) `amount`,
    ROW_NUMBER() OVER (PARTITION BY DATE(`timestamp`)
    ORDER BY PARSE_BIGNUMERIC(`value`) DESC) AS `row_num`
  FROM
    `bigquery-public-data.crypto_multiversx_mainnet_eu.transactions`
  WHERE
    `status` = 'success'
    AND DATE(`timestamp`) >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) )
WHERE `row_num` = 1
ORDER BY `day` DESC
LIMIT 7;
```

#### What is the (global) network hitrate, per day, in the last month?

```sql
SELECT
    DATE(`timestamp`) `day`,
    -- 14400 is the number of rounds per day, and 3 + 1 = 4 is the number of shards
    ROUND(COUNT(*) / (14400 * 4), 4) `hit_rate`
FROM `bigquery-public-data.crypto_multiversx_mainnet_eu.blocks`
WHERE
  DATE(`timestamp`) >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
  AND DATE(`timestamp`) < CURRENT_DATE()
GROUP BY `day`
ORDER BY `day` DESC
```

:::note
Even if BigQuery includes a generous free tier, it is important to be mindful of the costs associated with running queries. For more information, see [BigQuery pricing](https://cloud.google.com/bigquery/pricing).

If you believe that specific optimizations can applied to the dataset (to improve query performance), please [let us know](https://github.com/multiversx/multiversx-etl/issues).
:::

## Analyze using Looker Studio

[**Google Looker Studio**](https://lookerstudio.google.com) is a powerful tool for analyzing data and create (shareable) reports. Out of the box, it connects to BigQuery (and many other data sources), thus it's a great way to explore the MultiversX dataset.

Example of report created in Looker Studio (leveraging the MultiversX dataset on BigQuery):

![img](/sdk-and-tools/looker_studio_1.png)

:::tip
In the BigQuery Studio, you can save the results of a given query as your own BigQuery tables, then immediately import them in Looker Studio, to create visualizations and reports.
:::

## Programmatic access

One can also query datasets programmatically, using the [BigQuery client libraries](https://cloud.google.com/bigquery/docs/reference/libraries).

See how to [query a public dataset with the BigQuery client libraries](https://cloud.google.com/bigquery/docs/quickstarts/quickstart-client-libraries).
