# Roles and Permissions in Mongo DB

MongoDB's role and permission system is layered across several levels — from the entire deployment down to individual collections. Here's a structured breakdown.## The three levels of scope

**Deployment level** — roles assigned here (in the `admin` database) span the entire mongod instance. A user with `root` or `userAdminAnyDatabase` in `admin` can reach every database on the server. This is where your first admin user must be created, using the **localhost exception** (which lets you connect without auth on first boot, before any user exists).

**Database level** — roles scoped to a specific database. A user created in `myAppDB` with `readWrite` can only touch that database. This is the standard level for application service accounts.

**Collection level** — fine-grained control via custom roles. You can grant `find` on `orders` but not on `payments` within the same database, by specifying the privilege against a specific namespace (`db.collection`).

---

## Practical setup tips for self-hosted MongoDB

1. **Always start mongod with `--auth`** (or `security.authorization: enabled` in the config file). Without it, anyone who can connect has full access.
2. **Create your first user via the localhost exception** — connect without credentials on first boot, create a user in `admin` with `userAdminAnyDatabase`, then restart and use that account for all further setup.
3. **Never use `root` for applications** — create a dedicated service account with the minimum role needed (`readWrite` on the specific database is usually enough).
4. **Use `userAdmin` carefully** — a user with `userAdmin` on a database can grant themselves `dbOwner`, effectively escalating to full database control.
5. **Audit with `clusterMonitor`** for monitoring agents so they can read cluster state without any write permissions.

---

## Built-in roles reference

**Superuser / all-access**
- `root` — combines all built-in roles. Use only for break-glass scenarios.
- `__system` — internal use by replica set and sharded cluster members. Never assign to users.

**Database administration (scoped per db or "AnyDatabase")**
- `dbOwner` — combines `dbAdmin` + `userAdmin` + `readWrite`. Full control of that database.
- `dbAdmin` — schema management: `createCollection`, `dropCollection`, `createIndex`, `collStats`, `dbStats`, `validate`. No data read/write.
- `userAdmin` — create and modify users and roles within that database. Careful: this user can grant themselves any role on the database.

**Data access**
- `read` — `find`, `listCollections`, `listIndexes`, `dbStats` (read-only).
- `readWrite` — everything in `read` plus `insert`, `update`, `delete`, `createCollection`, `dropCollection`.
- `readAnyDatabase` / `readWriteAnyDatabase` — same as above but across all databases (assigned in `admin` db).

**Cluster management** (assigned in `admin` db)
- `clusterAdmin` — full cluster control including `shutdown`, `replSetReconfig`, and sharding commands.
- `clusterManager` — manage and monitor: `replSetGetStatus`, `addShard`, `removeShard`, but not shutdown.
- `clusterMonitor` — read-only access to cluster state (good for monitoring agents like Prometheus exporters).

**Operational roles**
- `backup` — `mongodump`-compatible access: reads all data including system collections.
- `restore` — `mongorestore`-compatible access: writes to all collections.

---

## Custom roles

You define custom roles using `db.createRole()`, specifying explicit privilege actions on specific resources (database + collection namespace). They can also inherit from built-in roles.

```js
db.createRole({
  role: "orderReader",
  privileges: [
    {
      resource: { db: "shop", collection: "orders" },
      actions: [ "find" ]
    }
  ],
  roles: []  // no inheritance
})
```

This role can only run `find` on `shop.orders` — nothing else.

---


