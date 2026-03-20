# Cluster Management

MongoDB cluster management covers two distinct deployment topologies — Replica Sets and Sharded Clusters — plus the tooling to operate, observe, and secure them. Let me walk through each layer.

---

## Replica Sets — the foundation of high availability

A Replica Set is a group of `mongod` instances that hold identical copies of the same data. It is the baseline HA unit in MongoDB; even a sharded cluster is built from replica sets underneath.**Key replica set concepts:**

Every write goes to the primary, which records it to its **oplog** (a capped collection in the `local` database). Secondaries tail this oplog and replay operations to stay in sync. When the primary becomes unreachable, the remaining members hold an **election** — the member with the most up-to-date oplog and the highest priority wins.

Special member types beyond the standard secondary:

- **Arbiter** — votes in elections but holds no data. Useful when you need an odd vote count but can't afford a full data-bearing node. However, arbiters cannot become primary and add no read capacity.
- **Hidden member** (`priority: 0, hidden: true`) — replicates data but is invisible to the driver. Useful for dedicated analytics or backup nodes that shouldn't attract application traffic.
- **Delayed member** — replicates with a configured lag (e.g. 1 hour). Acts as a rolling backup against accidental data deletion.

**Write concern** (`w`) and **read concern** (`r`) are how you tune the durability vs. latency trade-off. `w: "majority"` means the write is confirmed by a majority of data-bearing nodes before the driver receives acknowledgement — the safest option. `readConcern: "majority"` ensures you only read data that has been durably replicated.

---

## Sharded Clusters — horizontal scaling

When a single replica set can no longer handle the data volume or write throughput, you shard. A sharded cluster distributes data across multiple replica sets called **shards**.A sharded cluster has three component types:

**`mongos` (router)** — the entry point for all client connections. It has no data of its own; it consults the config servers to know which shard owns which chunk, then routes or merges results. You typically run multiple `mongos` instances behind a load balancer for availability.

**Config servers** — a dedicated replica set (the CSRS) that stores the cluster's metadata: the chunk map, shard topology, and balancer state. They must always be a replica set (3 members minimum). Losing the config servers without a backup is catastrophic — treat them like primary infrastructure.

**Shards** — each is a full replica set. Data is divided into **chunks** (default 128 MB ranges) based on the shard key. The **balancer** process (runs on the primary config server) monitors chunk counts per shard and migrates chunks when imbalance exceeds a threshold.

**Shard key selection** is the single most important architectural decision in a sharded cluster. A bad shard key creates hotspots (all writes routing to one shard) or scatter-gather queries (every query hitting all shards). Good shard keys have high cardinality, even write distribution, and ideally match common query patterns.

---

## Cluster management operations

Once a cluster is running, the day-to-day operational surface covers these areas:

**Elections and failover.** In a replica set, elections happen automatically when the primary misses heartbeats for `electionTimeoutMillis` (default 10 s). You can force a stepdown with `rs.stepDown()`, adjust member priorities to influence who gets elected, and freeze a member (`rs.freeze(seconds)`) to prevent it from seeking election during maintenance.

**Rolling maintenance.** To upgrade or patch nodes without downtime: stepdown each secondary, update it, bring it back, then finally stepdown the primary. The `maintenance` mode flag (`replSetMaintenance`) tells the primary not to elect the node during the window.

**Chunk management (sharded clusters).** The balancer runs automatically but can be paused (`sh.stopBalancer()`) during backup windows or migrations. You can manually split oversized chunks with `sh.splitAt()` or pre-split before a bulk load to avoid the balancer scrambling during ingestion.

**Zone sharding.** You can pin chunk ranges to specific shards using zones — useful for data residency requirements (e.g. EU customer data stays on EU-region shards) or for tiered storage (hot data on NVMe shards, cold data on HDD shards).

---

## Cluster-level roles and privileges

Returning to the security angle — these roles are all scoped to the `admin` database:

| Role | What it can do |
|---|---|
| `clusterAdmin` | Full cluster control: add/remove shards, run `shutdown`, reconfig replica sets, enable/disable the balancer |
| `clusterManager` | Management without shutdown: `addShard`, `removeShard`, `replSetReconfig`, `flushRouterConfig` |
| `clusterMonitor` | Read-only observability: `serverStatus`, `replSetGetStatus`, `connPoolStats`, `top` |
| `hostManager` | OS-level interactions: `killOp`, `fsync`, `resync`, `logRotate` |
| `backup` | Read all data for `mongodump` |
| `restore` | Write all data for `mongorestore` |

`clusterAdmin` combines all of the above. In practice you should prefer `clusterManager` for automation scripts and `clusterMonitor` for observability agents (Prometheus exporters, Ops Manager agents), reserving `clusterAdmin` for human operators only.

---

## Key operational commands

```js
// Replica set status — who is primary, replication lag, health
rs.status()

// Current replica set config — priorities, hidden flags, delays
rs.conf()

// Add a new member to the replica set
rs.add("hostname:27017")

// Initiate a replica set (first time only)
rs.initiate({
  _id: "myReplSet",
  members: [
    { _id: 0, host: "node1:27017" },
    { _id: 1, host: "node2:27017" },
    { _id: 2, host: "node3:27017" }
  ]
})

// Sharding status — chunk distribution, balancer state, shard list
sh.status()

// Enable sharding on a database
sh.enableSharding("mydb")

// Shard a collection on a hashed key (even distribution)
sh.shardCollection("mydb.events", { userId: "hashed" })

// Pause balancer (e.g. during backup)
sh.stopBalancer()
sh.startBalancer()
```

---

## Things that catch people out in self-hosted setups

**Bind IP.** By default `mongod` only listens on localhost. For a replica set, every member must be reachable by the others — set `net.bindIp` to include the node's hostname/IP, and make sure the ports are open in your firewall.

**DNS or `/etc/hosts` consistency.** Replica set members identify each other by the hostnames in `rs.conf()`. If those hostnames don't resolve from every member, elections and replication break silently.

**Keyfile or x.509 for internal auth.** In a replica set or sharded cluster, members authenticate to each other using either a shared keyfile or x.509 certificates (`security.keyFile` or `security.clusterAuthMode`). Without this, any process that can reach your port can join your replica set.

**Oplog sizing.** The oplog is a fixed-size capped collection. If secondaries lag behind (e.g. during a large migration) and fall off the end of the oplog, they enter `RECOVERING` state and must be resynced from scratch. Size the oplog generously (`replication.oplogSizeMB` in the config) — a common rule of thumb is 5–10% of your available disk or at minimum enough to hold ~24 hours of write volume.