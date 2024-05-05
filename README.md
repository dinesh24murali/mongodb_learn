# mongodb_learn
This repo contains examples and documents related to some Advanced concepts in MongoDB. The documents in the `./notes` folder will have details on how to run the modules

## How to run this:

1. Start mongoDB docker container from the root of the repo
```
docker compose up
```
2. Do docker inspect and get the IP address for the mongoDB container and add that to the .env file.
```
docker inspect <container id>
```
It will be something like below
```
MONGO_DB_CONNECTION_URL=mongodb://admin:admin@172.27.0.2:27017/mongolearn?authSource=admin
```
3. There will scripts to seed the data to the DB in the `./code` folders


## Userful commands

Enter mongoDB contaner using bash to access mongo shell

```sh
docker exec -it <container id> mongosh "mongodb://admin:admin@localhost:27017/mongolearn?authSource=admin"
```

Enter container with Bash

```sh
docker exec -it <container id> bash
```
