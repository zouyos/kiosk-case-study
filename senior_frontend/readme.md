# Kiosk Senior frontend case study
Thanks for applying at Kiosk!

Our second round is a technical case study that’s designed to take you about one hour.

## Guidelines
* favor finished work
* use TypeScript and React
* you are free to leverage AI tools
* you don’t have to deal with auth etc
* you are provided with an SQLite database and an API
  you are free to create a BFF or another backend if you want to
* if you feel something is taking you too much time, it’s fine to stop early and explain how to take the solution further

### What matters
* clarity
* code architecture
* UI snapiness
* simplicity
* practicality of eventual deployment

### What doesn’t matter
* bells and whistles
* actual deployment (dockerfile, whatever)

## Introduction
Kiosk is developing an ESG reporting tool to help companies comply with [CSRD](https://finance.ec.europa.eu/capital-markets-union-and-financial-markets/company-reporting-and-auditing/company-reporting/corporate-sustainability-reporting_en).

As part of our product, we offer our clients a comprehensive **dashboard** that provides insights into their environmental, social, and governance (ESG) reporting.
The dashboard is crucial for our clients, as it helps them visualize their data in a meaningful way and drive change.

## Task
Your task is to create an interactive dashboard to visualise ESG indicators.

Some indicators come directly from the database (CO₂ emissions), and some need to be computed on the fly (gender parity ratio).

Indicators we want to display:
- total revenue
- total CO₂ emissions
- total headcount
- gender parity ration (female headcount / total headcount)

The user should be able to select the time granularity (yearly or monthly) as well as time boundaries.

The user should be able to have these metrics broken down by dimensions they can filter.
For example: only show data from France.

## Backend
Please refer to the backend’s [readme](./backend/README.md) to see how to run it.

It exposes a couple of models:
* dimensions
* indicators

A dimension is a piece of metadata of the form: `(country, business unit)`.

An indicator is a timestamped value for a given dimension.
For example: `dimension=1, date=2024-01-01, indicator=co2_emissions, value=10000`

These two models can be read using three endpoints:
```shell
# list dimensions
> curl http://localhost:8080/dimensions | jq
{
  "results": [
    {
      "id": "0",
      "country": "Germany",
      "business_unit": "Manufacturing"
    },
    {
      "id": "1",
      "country": "Germany",
      "business_unit": "IT"
    },
    ...
  ]
}

# fetch one dimension
> curl http://localhost:8080/dimensions/1 | jq
{
  "result": {
    "id": "1",
    "country": "Germany",
    "business_unit": "IT"
  }
}


# 
> curl "http://localhost:8080/indicators?start=2023-01-01&end=2024-01-01&indicators=co2_emissions" | jq
{
  "results": [
    {
      "date": "2023-12-01",
      "dimension": "0",
      "indicator": "co2_emissions",
      "value": 10668179
    },
    {
      "date": "2023-12-01",
      "dimension": "1",
      "indicator": "co2_emissions",
      "value": 13084014
    },
    {
      "date": "2023-12-01",
      "dimension": "2",
      "indicator": "co2_emissions",
      "value": 12468682
    },
    ...
  ]
}
```
