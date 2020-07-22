# covid-19

A GraphQL server for COVID-19 time series data for counties in the United States.

## The Data

The COVID-19 data is sourced from the [COVID-19 Data Repository by the Center for Systems Science and Engineering (CSSE) at Johns Hopkins University](https://github.com/CSSEGISandData/COVID-19). More specifically, the confirmed US cases time series csv table and the FIPS lookup table.

## Querying the Production Server

### GET request

```http
GET /?query={entries(where:{fips:21111}){id,combined_name,loc{coordinates},date,confirmed}} HTTP/1.1
Host: covid-19-73586.herokuapp.com
Content-Type: application/json
```

### POST request with variables

```http
POST / HTTP/1.1
Host: covid-19-73586.herokuapp.com
Content-Type: application/json

{
    "query": "query entries($input: EntriesWhereInput!) {
        entries(where: $input) {
            id
            combined_name
            loc {
                coordinates
            }
            date
            confirmed
        }
    }",
    "variables": {
        "input": {
            "state": "Kentucky",
            "county":"Jefferson"
        }
    }
}
```

## Local Setup

### Requirements

- [Node.js](https://nodejs.org/) `v13.9.0` or later. But should work with `v12.18.2` or later (haven't tested it yet though).

- To run and test the database locally you will need [MongoDB](https://www.mongodb.com/try/download/community). I've been using `v4.2.8`.

### Clone and Install

Clone the repo and install the dependencies through npm.

```shell
> git clone https://github.com/klazich/covid-19
> cd covid-19
> npm install
```

### Environment Variables

The graphql server and mongo database require certain environment variables to be set before startup. If they are not defined than the app will fail to start. ~~After running `npm install` a `.env` file should have been created in the project root. Check that it was and that the contents match with text below.~~ Make a copy of the `.env-example` and rename it to `.env` and place it in the root of the project.

```
PORT=3000
MONGODB_URL=mongodb://localhost:27017/covid-19
NODE_ENV=development
```

With [dotenv-safe](https://www.npmjs.com/package/dotenv-safe) the correct development environment variables will be set when starting up the server and database.

### Seeding the Database

Seed the database with data by running:

```shell
> npm run seed
```

This will initiate the fetching, parsing, transforming and inserting of the data into the mongo database.

You can pass a limit option to the script to limit how many documents are created and saved to the database. For example, to limit the number of documents created to the first ten thousand you would enter:

```shell
> npm run seed -- --limit=10000
```

> This can be helpful when debugging database connection issues as seeding the database with the full dataset will create over 500,000 documents and can take up to 30 seconds.

### Starting the GraphQL Server

To start the GraphQl server run:

```shell
> npm start
```

This will start up a local server with an HTTP endpoint at:

-
