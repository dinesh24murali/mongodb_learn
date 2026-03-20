# Sharding config files

Here's a complete sample setup. A sharded cluster needs three separate config files because it has three different types of processes: config servers, `mongos` routers, and the shard members themselves.

## The three config file types---

## Config file 1 — Config server (`mongod-configsvr.conf`)

Run this on each of the 3 config server nodes. The key flag is `clusterRole: configsvr`.

```yaml
# /etc/mongod-configsvr.conf

net:
  port: 27019
  bindIp: 127.0.0.1,192.168.1.10   # replace with this node's IP

storage:
  dbPath: /var/lib/mongodb-configsvr

systemLog:
  destination: file
  path: /var/log/mongodb/configsvr.log
  logAppend: true

replication:
  replSetName: "configrs"           # must match on all 3 config nodes

sharding:
  clusterRole: configsvr            # this is what makes it a config server

security:
  authorization: enabled
  keyFile: /etc/mongodb-keyfile     # shared across entire cluster
```

Start it: `systemctl start mongod-configsvr`

Then initiate the config server replica set once (connect to any config node):

```js
rs.initiate({
  _id: "configrs",
  configsvr: true,
  members: [
    { _id: 0, host: "192.168.1.10:27019" },
    { _id: 1, host: "192.168.1.11:27019" },
    { _id: 2, host: "192.168.1.12:27019" }
  ]
})
```

---

## Config file 2 — `mongos` router (`mongos.conf`)

`mongos` is a completely different binary from `mongod`. Notice there is no `storage.dbPath` — the router holds no data at all. It only needs to know where the config servers are.

```yaml
# /etc/mongos.conf

net:
  port: 27017
  bindIp: 127.0.0.1,192.168.1.20   # the mongos server's own IP

systemLog:
  destination: file
  path: /var/log/mongodb/mongos.log
  logAppend: true

sharding:
  configDB: "configrs/192.168.1.10:27019,192.168.1.11:27019,192.168.1.12:27019"
  # format is:  replicaSetName/host1:port,host2:port,host3:port

security:
  keyFile: /etc/mongodb-keyfile     # same keyfile as the rest of the cluster
```

Start it with the `mongos` binary, not `mongod`:

```bash
mongos --config /etc/mongos.conf
```

Or as a systemd service using `ExecStart=/usr/bin/mongos --config /etc/mongos.conf`.

---

## Config file 3 — Shard member (`mongod-shard.conf`)

Run this on each node of each shard replica set. The key flag is `clusterRole: shardsvr`. If you have two shards, you have two separate replica sets — each with its own `replSetName` — but they all use this same config file template, just with different values.

```yaml
# /etc/mongod-shard.conf

net:
  port: 27018
  bindIp: 127.0.0.1,192.168.1.30   # replace with this node's IP

storage:
  dbPath: /var/lib/mongodb-shard

systemLog:
  destination: file
  path: /var/log/mongodb/shard.log
  logAppend: true

replication:
  replSetName: "shard1rs"           # shard2 nodes would use "shard2rs"

sharding:
  clusterRole: shardsvr             # this is what marks it as a shard

security:
  authorization: enabled
  keyFile: /etc/mongodb-keyfile     # same keyfile as the rest of the cluster
```

Then initiate each shard's replica set (connect to any member of that shard):

```js
// On shard 1
rs.initiate({
  _id: "shard1rs",
  members: [
    { _id: 0, host: "192.168.1.30:27018" },
    { _id: 1, host: "192.168.1.31:27018" },
    { _id: 2, host: "192.168.1.32:27018" }
  ]
})
```

---

## Final step — register shards with the cluster

Once everything is running, connect to the `mongos` router (port 27017) and add the shards:

```js
// Connect to mongos, then:
sh.addShard("shard1rs/192.168.1.30:27018,192.168.1.31:27018,192.168.1.32:27018")
sh.addShard("shard2rs/192.168.1.40:27018,192.168.1.41:27018,192.168.1.42:27018")

// Verify everything looks right
sh.status()
```

---

## Quick reference — what differs between the three files

| Setting | Config server | mongos | Shard |
|---|---|---|---|
| Binary | `mongod` | `mongos` | `mongod` |
| `clusterRole` | `configsvr` | — | `shardsvr` |
| `replSetName` | `configrs` | — | `shard1rs` etc. |
| `dbPath` | yes | **no** | yes |
| Default port convention | 27019 | 27017 | 27018 |
| `configDB` line | no | **yes** | no |

The ports (27017/27018/27019) are just conventions — you can use any ports you like as long as they are consistent and open in your firewall.