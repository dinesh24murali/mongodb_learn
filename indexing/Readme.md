# Indexing

These are the different types of indexing available in MongoDB

1. [Single Field Indexes](https://www.mongodb.com/docs/v5.3/core/index-single/#single-field-indexes)
2. [Compound Indexes](https://www.mongodb.com/docs/v5.3/core/index-compound/#compound-indexes)
3. [Multikey Index](https://www.mongodb.com/docs/v5.3/indexes/#multikey-index)
4. [Geospatial Index](https://www.mongodb.com/docs/v5.3/indexes/#geospatial-index)
5. [Text Indexes](https://www.mongodb.com/docs/v5.3/indexes/#text-indexes)
6. [Hashed Indexes](https://www.mongodb.com/docs/v5.3/indexes/#hashed-indexes)
7. [Clustered Indexes](https://www.mongodb.com/docs/v5.3/indexes/#clustered-indexes)

We will be working with the following schema in these examples
```json
{
  "_id": "01001",
  "city": "AGAWAM",
  "loc": [
    -72.622739,
    42.070206
  ],
  "pop": 15338,
  "state": "MA"
}
```
## Single field indexing

Check query execution statics

```bash
db.locations.find({ pop: 1240 }).explain('executionStats')
```
you will get some thing like this:
```js
{
  explainVersion: '1',
  queryPlanner: {
    namespace: 'mongolearn.locations',
    indexFilterSet: false,
    parsedQuery: { pop: { '$eq': 1240 } },
    queryHash: 'E69D05BB',
    planCacheKey: 'E69D05BB',
    maxIndexedOrSolutionsReached: false,
    maxIndexedAndSolutionsReached: false,
    maxScansToExplodeReached: false,
    winningPlan: {
      stage: 'COLLSCAN',
      filter: { pop: { '$eq': 1240 } },
      direction: 'forward'
    },
    rejectedPlans: []
  },
  executionStats: {
    executionSuccess: true,
    nReturned: 108, // <-------------------- no of records that are retrieved
    executionTimeMillis: 223,
    totalKeysExamined: 0,
    totalDocsExamined: 528359, // <-------------------- no of records that the DB went through
    executionStages: {
      stage: 'COLLSCAN',
      filter: { pop: { '$eq': 1240 } },
      nReturned: 108,
      executionTimeMillisEstimate: 16,
      works: 528360,
      advanced: 108,
      needTime: 528251,
      needYield: 0,
      saveState: 528,
      restoreState: 528,
      isEOF: 1,
      direction: 'forward',
      docsExamined: 528359
    }
  },
  command: { find: 'locations', filter: { pop: 1240 }, '$db': 'mongolearn' },
  ok: 1
}
```
The important thing to take note here is the no of records that we retrieved compared to the number of records that the DB searched. In this example the total amount of record retrieved is 108, and the number of records that the DB checked is 5,28,359. This is before indexing.

The performance for the above was:
```bash
dinesh@dinesh-HP-Pavilion-Laptop-15-cc1xx ~/Work_dump/mongodb_dump/mongodb_learn/indexing (main) $ node index.js 
 MongoDB connection Success 
Start time:  2024-05-04T05:59:22.517Z
{ temp: 108 }
End time:  2024-05-04T05:59:22.770Z
```

Run the following command to setup indexing for this search query:
```bash
db.locations.createIndex({ pop: 1240 })
```

If we run the executionStats now:
```
{
  explainVersion: '1',
  queryPlanner: {
    namespace: 'mongolearn.locations',
    indexFilterSet: false,
    parsedQuery: { pop: { '$eq': 1240 } },
    queryHash: 'E69D05BB',
    planCacheKey: '71A53E96',
    maxIndexedOrSolutionsReached: false,
    maxIndexedAndSolutionsReached: false,
    maxScansToExplodeReached: false,
    winningPlan: {
      stage: 'FETCH',
      inputStage: {
        stage: 'IXSCAN',
        keyPattern: { pop: 1240 },
        indexName: 'pop_1240',
        isMultiKey: false,
        multiKeyPaths: { pop: [] },
        isUnique: false,
        isSparse: false,
        isPartial: false,
        indexVersion: 2,
        direction: 'forward',
        indexBounds: { pop: [ '[1240, 1240]' ] }
      }
    },
    rejectedPlans: []
  },
  executionStats: {
    executionSuccess: true,
    nReturned: 108,    // <---------- The total number of Documents retrieved and examined are the same
    executionTimeMillis: 3,
    totalKeysExamined: 108,
    totalDocsExamined: 108,    // <---------- The total number of Documents retrieved and examined are the same
    executionStages: {
      stage: 'FETCH',
      nReturned: 108,
      executionTimeMillisEstimate: 0,
      works: 109,
      advanced: 108,
      needTime: 0,
      needYield: 0,
      saveState: 0,
      restoreState: 0,
      isEOF: 1,
      docsExamined: 108,
      alreadyHasObj: 0,
      inputStage: {
        stage: 'IXSCAN',
        nReturned: 108,
        executionTimeMillisEstimate: 0,
        works: 109,
        advanced: 108,
        needTime: 0,
        needYield: 0,
        saveState: 0,
        restoreState: 0,
        isEOF: 1,
        keyPattern: { pop: 1240 },
        indexName: 'pop_1240',
        isMultiKey: false,
        multiKeyPaths: { pop: [] },
        isUnique: false,
        isSparse: false,
        isPartial: false,
        indexVersion: 2,
        direction: 'forward',
        indexBounds: { pop: [ '[1240, 1240]' ] },
        keysExamined: 108,
        seeks: 1,
        dupsTested: 0,
        dupsDropped: 0
      }
    }
  },
  command: { find: 'locations', filter: { pop: 1240 }, '$db': 'mongolearn' },
  ok: 1
}
```

Since we indexed this search query, the no of records that the DB Examined is the same as the result. The executing time has also reduced
```bash
dinesh@dinesh-HP-Pavilion-Laptop-15-cc1xx ~/Work_dump/mongodb_dump/mongodb_learn/indexing (main) $ node index.js 
 MongoDB connection Success 
Start time:  2024-05-04T06:00:55.705Z
{ temp: 108 }
End time:  2024-05-04T06:00:55.745Z
```

Later on if we add a new item with the same `pop` value (`1240`), it will automaticaly add it to the index.

## [Compound indexing](https://www.mongodb.com/docs/v5.3/core/index-compound/#compound-indexes)

- Compound indexing is done for more than one field

```js
db.locations.createIndex({ "state": 1, "pop": 1 })
```

The order of the fields listed in a compound index is important. The index will contain references to documents sorted first by the values of the `state` field and, within each value of the `state` field, sorted by values of the `pop` field.

```js
db.locations.find({ state: "MA", pop: { $gt: 1000 } }).explain('executionStats')
```
# How to run this:

1. Start mongoDB docker container from the root of the repo
```
docker compose up
```
2. Do docker inspect and get the IP address for the mongoDB container and add that to the .env file. It will be something like below
```
MONGO_DB_CONNECTION_URL=mongodb://admin:admin@172.27.0.2:27017/mongolearn?authSource=admin
```
3. Run the `seed.js` file, this will pick the `mocakdatajson` file from the `./data` directory and add it to the DB with a unique `_id`

We got the mock data from this [link](https://media.mongodb.org/zips.json?_ga=1.92708894.286077728.1426686247)


## Resources:

https://www.mongodb.com/docs/v5.3/indexes/#indexes

