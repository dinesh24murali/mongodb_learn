# Mongosh

`Mongosh` is a command line utility to interact with the mongodb database

### Create database

```bash
use <db_name>
```

### Create user

```bash
use admin;
db.createUser(
  {
    user: "myUserAdmin",
    pwd: passwordPrompt(), // Prompts for a secure password
    roles: [ { role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase" ]
  }
)
# Specific DB
use learn_db // Switch to the target database
db.createUser(
  {
    user: "sample",
    pwd: passwordPrompt(),
    roles: [ { role: "dbOwner", db: "learn_db" } ]
  }
)
```

## CRUD a collection
Create
```bash
db.createCollection("<collection name>")
```
Read
```bash
db.runCommand({
    listCollections: 1
})
```
Drop collection
```bash
db.<collection_name>.drop()
```

## CRUD records
### Add
```
db.<collection_name>.insertOne({
    field1: <value>
})
db.<collection_name>.insertMany([{
    field1: <value>
},
{
    field1: <value>
},
...
])
```
Example
```
db.location.insertOne({
    city: "Chennai",
    state: "Tamil Nadu",
    pop: 40000000,
    loc: [12.3435,23.23244]
})
```
```
db.location.insertMany([
{
    city: "Bangalore",
    state: "Karnataka",
    pop: 40000000,
    loc: [72.3435,53.232]
},
{
    city: "Villupuram",
    state: "Tamil Nadu",
    pop: 400000,
    loc: [14.3435,13.23244]
},
]);
```
### Read
```
db.location.findOne({ city: "Bangalore" })
```
```
db.location.find({ state: "Tamil Nadu" })
```

### Update

```
db.location.updateOne({city:"Bangalore"}, {$set:{ "pop": 456783 }})
```
```
db.location.updateMany({state:"Tamil Nadu"}, {$set:{ "pop": 456783 }})
```



