# covid-19

A [GraphQL](https://graphql.org/) server on top of a [MongoDB](https://www.mongodb.com/) database for COVID-19 time series data for counties in the United States.

## Table of Contents <!-- omit in toc -->

- [Querying the Production Server](#querying-the-production-server)
  - [Additional Methods & Examples for Querying the Heroku Server](#additional-methods--examples-for-querying-the-heroku-server)
    - [GET request](#get-request)
    - [POST request](#post-request)
- [Local Setup & Development](#local-setup--development)
  - [Requirements](#requirements)
  - [Clone and Install](#clone-and-install)
  - [Environment Variables](#environment-variables)
  - [Seeding the Database](#seeding-the-database)
  - [Starting the GraphQL Server](#starting-the-graphql-server)
- [The Data](#the-data)
  - [Fetching & Parsing](#fetching--parsing)
  - [Transforming & Cleaning](#transforming--cleaning)

---

## Querying the Production Server

A production version of the GraphQL server is hosted on [Heroku](https://www.heroku.com/platform). The endpoint is at: `https://covid-19-73586.herokuapp.com/`. A scheduler add-on runs the [seed](#Seeding-the-Database) script once a day to update the MongoDB Atlas database cluster.

If you have [Postman](https://www.postman.com/) feel free to import the collection and play around with the different ways to send requests.

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/454fef37883d327dd93a)

### Additional Methods & Examples for Querying the Heroku Server

Each example below sends the following GraphQL query and variables.

```graphql
query($where: EntriesWhereInput!) {
  entries(where: $where) {
    id
    combined_name
    population
    loc {
      type
      coordinates
    }
    date
    confirmed
  }
}
```

```json
{
  "where": {
    "state": "Kentucky",
    "county": "Jefferson"
  }
}
```

#### GET request

```http
GET /?query=query(%24where%3A%20EntriesWhereInput!)%20%7B%20entries(where%3A%20%24where)%20%7B%20id%20combined_name%20population%20loc%20%7B%20type%20coordinates%20%7D%20date%20confirmed%20%7D%20%7D&variables=%7B%22where%22%3A%7B%22state%22%3A%22Kentucky%22%2C%22county%22%3A%22Jefferson%22%7D%7D HTTP/1.1
Host: covid-19-73586.herokuapp.com
Content-Type: application/json
```

<details>
<summary>cURL</summary>

```sh
curl 'https://covid-19-73586.herokuapp.com/?query=query(%24where%3A%20EntriesWhereInput!)%20%7B%20entries(where%3A%20%24where)%20%7B%20id%20combined_name%20population%20loc%20%7B%20type%20coordinates%20%7D%20date%20confirmed%20%7D%20%7D&variables=%7B%22where%22%3A%7B%22state%22%3A%22Kentucky%22%2C%22county%22%3A%22Jefferson%22%7D%7D' \
  --request GET \
  --header 'Content-Type: application/json'
```

</details>

<details>
<summary>JavaScript - Fetch</summary>

```javascript
const getHeaders = new Headers({ 'Content-Type': 'application/json' })

const requestOptions = {
  method: 'GET',
  headers: getHeaders,
  redirect: 'follow',
}

fetch(
  'https://covid-19-73586.herokuapp.com/?query=query(%24where%3A%20EntriesWhereInput!)%20%7B%20entries(where%3A%20%24where)%20%7B%20id%20combined_name%20population%20loc%20%7B%20type%20coordinates%20%7D%20date%20confirmed%20%7D%20%7D&variables=%7B%22where%22%3A%7B%22state%22%3A%22Kentucky%22%2C%22county%22%3A%22Jefferson%22%7D%7D',
  requestOptions
)
  .then((response) => response.text())
  .then((result) => console.log(result))
  .catch((error) => console.log('error', error))
```

</details>

#### POST request

```http
POST / HTTP/1.1
Host: covid-19-73586.herokuapp.com
Content-Type: application/json
Content-Length: 208

{"query":"query($where: EntriesWhereInput!) { entries(where: $where) { id combined_name population loc { type coordinates } date confirmed } }","variables":{"where":{"state":"Kentucky","county":"Jefferson"}}}
```

<details>
<summary>cURL</summary>

```sh
curl 'https://covid-19-73586.herokuapp.com/' \
  --request POST \
  --header 'Content-Type: application/json' \
  --data-raw '{"query":"query($where: EntriesWhereInput!) { entries(where: $where) { id combined_name population loc { type coordinates } date confirmed } }","variables":{"where":{"state":"Kentucky","county":"Jefferson"}}}'
```

</details>

<details>
<summary>JavaScript - Fetch</summary>

```javascript
const postHeaders = new Headers({ 'Content-Type': 'application/json' })

const graphql = JSON.stringify({
  query: `query($where: EntriesWhereInput!) {
    entries(where: $where) {
      id
      combined_name
      population
      loc {
        type
        coordinates
      }
      date
      confirmed
    }
  }`,
  variables: {
    where: {
      state: 'Kentucky',
      county: 'Jefferson',
    },
  },
})

var requestOptions = {
  method: 'POST',
  headers: postHeaders,
  body: graphql,
  redirect: 'follow',
}

fetch('https://covid-19-73586.herokuapp.com', requestOptions)
  .then((response) => response.text())
  .then((result) => console.log(result))
  .catch((error) => console.log('error', error))
```

</details>

## Local Setup & Development

### Requirements

- [Node.js](https://nodejs.org/) `v13.9.0` or later. But should work with `v12.18.2` or later (haven't tested it yet though).

- To run and test the database locally you will need [MongoDB](https://www.mongodb.com/try/download/community). I've been using `v4.2.8`.

### Clone and Install

Clone the repo and install the dependencies through npm.

```sh
git clone https://github.com/klazich/covid-19
cd covid-19
npm install
```

### Environment Variables

The graphql server and mongo database require certain environment variables to be set before startup. If they are not defined than the app will fail to start. Make a copy of the `.env-example` (located at project root, [here](.env.example)) and rename it to `.env` and place it in the root of the project.

```conf
PORT=4000
MONGODB_URL=mongodb://localhost:27017/covid-19
NODE_ENV=development
```

With [dotenv-safe](https://www.npmjs.com/package/dotenv-safe) the correct development environment variables will be set when starting up the server and database.

### Seeding the Database
> **If you use a free database service, such as mLab's free tier, inserting the full dataset WILL consume a large portion of your quota. See below on how to limit the number of documents created.**

Seed the database with data by running:

```sh
npm run seed
```

This will initiate the fetching, parsing, transforming and inserting of the data into the mongo database.

You can pass a limit option to the script to limit how many documents are created and saved to the database. For example, to limit the number of documents created to the first ten thousand you would enter:

```sh
> npm run seed -- --limit=10000
```

> This can be helpful when debugging database connection issues as seeding the database with the full dataset will create over 500,000 documents and can take up to 30 seconds.

### Starting the GraphQL Server

To start the GraphQl server run:

```sh
> npm start
```

This will start up the development server locally (when `NODE_ENV` is `'development'`) at: `http://localhost:4000/`, and connect to the mongodb database.

> Be sure to seed the database ([see above](#seeding-the-database)) at some point. Otherwise queries will return empty.

The development server also spins up a graphql playground that can be accessed by navigating your browser to the endpoint ([http://localhost:4000/](http://localhost:4000/)). The playground will load with some example queries that you can go ahead and execute.

## The Data

The COVID-19 data is sourced from the [COVID-19 Data Repository by the Center for Systems Science and Engineering (CSSE) at Johns Hopkins University](https://github.com/CSSEGISandData/COVID-19). More specifically, the confirmed US cases time series csv table and the FIPS lookup table.

> See the database directory, [here](src/database/index.js) for the relaxant code.

### Fetching & Parsing

The data starts in a csv file with headers looking like this:

| UID      | iso2 | iso3 | code3 | FIPS    | Admin2    | Province_State | Country_Region | Lat         | Long\_       | Combined_Key              | ... | 7/16/20 | 7/17/20 | 7/18/20 | 7/19/20 | 7/20/20 | 7/21/20 | 7/22/20 | 7/23/20 | 7/24/20 | 7/25/20 | ... |
| -------- | ---- | ---- | ----- | ------- | --------- | -------------- | -------------- | ----------- | ------------ | ------------------------- | --- | ------- | ------- | ------- | ------- | ------- | ------- | ------- | ------- | ------- | ------- | --- |
| 84021111 | US   | USA  | 840   | 21111.0 | Jefferson | Kentucky       | US             | 38.18664655 | -85.65931031 | "Jefferson, Kentucky, US" | ... | 4778    | 4861    | 4962    | 5170    | 5263    | 5441    | 5519    | 5635    | 5836    | 6080    | ... |

Using [axios](https://github.com/axios/axios) to create an http data stream and [papaparse](https://www.papaparse.com/) to parse the csv data, each row is transformed into a javascript object:

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

### Transforming & Cleaning

From the above javascript object, we create a new object for each of the date keys along with a copy of all the county's information. These objects will eventually be the documents inserted into the MongoDB database collection. The keys are also cleaned and the values correctly typed. In the end the object conforms to the mongoose [schema](src/database/models/entry.js) and the graphql [schema](src/server/schema.js). Continuing from above, here is an example:

```javascript
{
  uid: 84021111,
  country_iso2: 'US',
  country_iso3: 'USA',
  country_code: 840,
  fips: 21111,
  county: 'Jefferson',
  state: 'Kentucky',
  country: 'US',
  combined_name: 'Jefferson, Kentucky, US',
  loc: {
    type: 'Point',
    coordinates: [ -85.65931031, 38.18664655 ]
  },
  population: 766757,
  date: 2020-07-25T04:00:00.000Z,
  confirmed: 6080,
}
```
