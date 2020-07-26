# covid-19

A GraphQL server for COVID-19 time series data for counties in the United States.

## The Data

The COVID-19 data is sourced from the [COVID-19 Data Repository by the Center for Systems Science and Engineering (CSSE) at Johns Hopkins University](https://github.com/CSSEGISandData/COVID-19). More specifically, the confirmed US cases time series csv table and the FIPS lookup table.

> More information on how the data is processed see the database directory and it's [readme](src/database/seed/README.md).

## Querying the Production Server

A production version of the GraphQL server is hosted on [Heroku](https://www.heroku.com/platform). The endpoint is at: `https://covid-19-73586.herokuapp.com/`. A scheduler add-on runs the [seed](#Seeding-the-Database) script once a day to update the MongoDB Atlas database cluster.

If you have [Postman](https://www.postman.com/) feel free to import the collection and play around with the different ways to send requests.

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/e47bb7daee6dae75f1cd)

### Additional Methods & Examples for Querying Server

#### GET request

```http
GET /?query={entries(where:{fips:21111}){id,combined_name,population,loc{type,coordinates},date,confirmed}} HTTP/1.1
Host: covid-19-73586.herokuapp.com
Content-Type: application/json
```

<details>
  <summary><b>cURL</b></summary>

```sh
> curl --location --request GET 'https://covid-19-73586.herokuapp.com/?query={entries(where:{fips:21111}){id,combined_name,population,loc{type,coordinates},date,confirmed}}' \
  --header 'Content-Type: application/json'
```

</details>

<details>
  <summary><b>JavaScript - Fetch</b></summary>

```javascript
const myHeaders = new Headers()
myHeaders.append('Content-Type', 'application/json')

const requestOptions = {
  method: 'GET',
  headers: myHeaders,
  redirect: 'follow',
}

fetch(
  'https://covid-19-73586.herokuapp.com/?query={entries(where:{fips:21111}){id,combined_name,population,loc{type,coordinates},date,confirmed}}',
  requestOptions
)
  .then((response) => response.text())
  .then((result) => console.log(result))
  .catch((error) => console.log('error', error))
```

</details>

<details>
  <summary><b>NodeJs - Axios</b></summary>

```javascript
import axios from 'axios

const config = {
  method: 'get',
  url:
    'https://covid-19-73586.herokuapp.com/?query={entries(where:{fips:21111}){id,combined_name,population,loc{type,coordinates},date,confirmed}}',
  headers: {
    'Content-Type': 'application/json',
  },
}

axios(config)
  .then((response) => {
    console.log(JSON.stringify(response.data))
  })
  .catch((error) => {
    console.log(error)
  })
```

</details>

#### POST request using variables

```http
POST / HTTP/1.1
Host: covid-19-73586.herokuapp.com
Content-Type: application/json

{
  "query": "query entries($where: EntriesWhereInput!) {
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
  }",
  "variables": {
    "where": {
      "state": "Kentucky",
      "county":"Jefferson"
    }
  }
}
```

<details>
  <summary><b>cURL</b></summary>

```sh
> curl --location --request POST 'https://covid-19-73586.herokuapp.com/' \
  --header 'Content-Type: application/json' \
  --data-raw '{"query":"query entries($where: EntriesWhereInput!) {entries(where: $where) {id,combined_name,population,loc{coordinates},date,confirmed}\r\n}","variables":{"where":{"state":"Kentucky","county":"Jefferson"}}}'
```

</details>

<details>
  <summary><b>JavaScript - Fetch</b></summary>

```javascript
const myHeaders = new Headers()
myHeaders.append('Content-Type', 'application/json')

const query = `query entries ($where: EntriesWhereInput!) {
  entries (where: $where) {
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
}`

const variables = {
  where: {
    state: 'Kentucky',
    county: 'Jefferson',
  },
}

const graphql = JSON.stringify({
  query,
  variables,
})

const requestOptions = {
  method: 'POST',
  headers: myHeaders,
  body: graphql,
  redirect: 'follow',
}

fetch('https://covid-19-73586.herokuapp.com/', requestOptions)
  .then((response) => response.text())
  .then((result) => console.log(result))
  .catch((error) => console.log('error', error))
```

</details>

<details>
  <summary><b>NodeJs - Axios</b></summary>

```javascript
import axios from 'axios'

const query = `query entries ($where: EntriesWhereInput!) {
  entries (where: $where) {
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
}`

const variables = {
  where: {
    state: 'Kentucky',
    county: 'Jefferson',
  },
}

const config = {
  method: 'post',
  url: 'https://covid-19-73586.herokuapp.com/',
  headers: {
    'Content-Type': 'application/json',
  },
  data: JSON.stringify({
    query,
    variables,
  }),
}

axios(config)
  .then((response) => {
    console.log(JSON.stringify(response.data))
  })
  .catch((error) => {
    console.log(error)
  })
```

</details>

## Local Setup

### Requirements

- [Node.js](https://nodejs.org/) `v13.9.0` or later. But should work with `v12.18.2` or later (haven't tested it yet though).

- To run and test the database locally you will need [MongoDB](https://www.mongodb.com/try/download/community). I've been using `v4.2.8`.

### Clone and Install

Clone the repo and install the dependencies through npm.

```sh
> git clone https://github.com/klazich/covid-19
> cd covid-19
> npm install
```

### Environment Variables

The graphql server and mongo database require certain environment variables to be set before startup. If they are not defined than the app will fail to start. Make a copy of the `.env-example` (located at project root) and rename it to `.env` and place it in the root of the project.

```conf
PORT=3000
MONGODB_URL=mongodb://localhost:27017/covid-19
NODE_ENV=development
```

With [dotenv-safe](https://www.npmjs.com/package/dotenv-safe) the correct development environment variables will be set when starting up the server and database.

### Seeding the Database

Seed the database with data by running:

```sh
> npm run seed
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

This will start up a local server with an HTTP endpoint at:

-
