# Seeding the Database

The data that ends up being served is sourced from here, [link](https://github.com/CSSEGISandData/COVID-19/blob/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_US.csv). The data has to be fetched, transformed and inserted into the mongo database before it is served.

## Fetching & Parsing

The data starts in a csv file with headers looking like this:

| UID      | iso2 | iso3 | code3 | FIPS    | Admin2    | Province_State | Country_Region | Lat         | Long\_       | Combined_Key              | ... | 7/16/20 | 7/17/20 | 7/18/20 | 7/19/20 | 7/20/20 | 7/21/20 | 7/22/20 | 7/23/20 | 7/24/20 | 7/25/20 | ... |
| -------- | ---- | ---- | ----- | ------- | --------- | -------------- | -------------- | ----------- | ------------ | ------------------------- | --- | ------- | ------- | ------- | ------- | ------- | ------- | ------- | ------- | ------- | ------- | --- |
| 84021111 | US   | USA  | 840   | 21111.0 | Jefferson | Kentucky       | US             | 38.18664655 | -85.65931031 | "Jefferson, Kentucky, US" | ... | 4778    | 4861    | 4962    | 5170    | 5263    | 5441    | 5519    | 5635    | 5836    | 6080    | ... |

Using [axios](https://github.com/axios/axios) (http data streaming) and [papaparse](https://www.papaparse.com/) (csv parsing) the csv data is parsed into objects that look like this:

```javascript
{
  UID: '84021111',
  iso2: 'US',
  iso3: 'USA',
  code3: '840',
  FIPS: '21111.0',
  Admin2: 'Jefferson',
  Province_State: 'Kentucky',
  Country_Region: 'US',
  Lat: '38.18664655',
  Long_: '-85.65931031',
  Combined_Key: 'Jefferson, Kentucky, US',
  // ...
  '7/16/20': '4778',
  '7/17/20': '4861',
  '7/18/20': '4962',
  '7/19/20': '5170',
  '7/20/20': '5263',
  '7/21/20': '5441',
  '7/22/20': '5519',
  '7/23/20': '5635',
  '7/24/20': '5836',
  '7/25/20': '6080',
  // ...
}
```
