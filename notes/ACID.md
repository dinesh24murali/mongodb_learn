# ACID

ACID stands for **Atomicity, Consistency, Isolation, Durability**. These properties guarantee that **database transactions behave reliably**, even when multiple operations happen concurrently or when failures occur.

MongoDB historically focused on performance and flexibility, but since **MongoDB 4.0**, it supports **ACID transactions** (initially for replica sets, later for sharded clusters).

Let’s go through each property with **MongoDB-specific examples**.

---

## 1. Atomicity

**Atomicity means:**
A transaction either **completes fully or not at all**. There is **no partial update**.

### Example

Imagine transferring money between two accounts.

```javascript
session.startTransaction()

db.accounts.updateOne(
  { name: "Alice" },
  { $inc: { balance: -500 } },
  { session }
)

db.accounts.updateOne(
  { name: "Bob" },
  { $inc: { balance: 500 } },
  { session }
)

session.commitTransaction()
```

If something fails after deducting from Alice but before crediting Bob:

* MongoDB **rolls back the entire transaction**
* Alice's balance remains unchanged.

So the system never ends up with **half a transfer**.

**Important MongoDB detail**

* **Single document operations are atomic by default**, even without transactions.

Example:

```javascript
db.products.updateOne(
  { _id: 1 },
  { $inc: { stock: -1 } }
)
```

This update happens **atomically**.

---

## 2. Consistency

**Consistency means:**
After a transaction finishes, the database must remain in a **valid state according to its rules**.

For example:

* Schema validation rules
* Unique indexes
* Data constraints

### Example

Suppose MongoDB has a **unique index** on email.

```javascript
db.users.createIndex({ email: 1 }, { unique: true })
```

Now inside a transaction:

```javascript
db.users.insertOne({ email: "sam@test.com" })
db.users.insertOne({ email: "sam@test.com" })
```

This violates the **unique constraint**.

MongoDB will:

* Reject the transaction
* Roll back all operations

The database **never ends up in an invalid state**.

---

## 3. Isolation

**Isolation means:**
Transactions do not interfere with each other.

While one transaction is running:

* Other transactions **cannot see partial changes**.

MongoDB uses **snapshot isolation**.

### Example

Transaction A:

```javascript
session.startTransaction()

db.orders.updateOne(
  { _id: 1 },
  { $set: { status: "paid" } },
  { session }
)
```

Before the transaction commits:

Transaction B reads the order:

```javascript
db.orders.findOne({ _id: 1 })
```

Transaction B will see:

```
status: "pending"
```

It **cannot see the uncommitted update**.

Only after `commitTransaction()` will other queries see the change.

---

## 4. Durability

**Durability means:**
Once a transaction commits, the data **will not be lost**, even if the server crashes.

MongoDB ensures durability through:

* **Write-ahead logging**
* **Replication to replica set members**

### Example

Transaction commits:

```javascript
session.commitTransaction()
```

MongoDB writes the data to the **journal**.

Even if the server crashes immediately afterward:

* MongoDB can **recover the committed data from the journal**.

So committed data is **permanent**.

---

# MongoDB ACID Summary

| Property    | Meaning                                | MongoDB Implementation                        |
| ----------- | -------------------------------------- | --------------------------------------------- |
| Atomicity   | All operations succeed or none         | Transactions + atomic single-document updates |
| Consistency | DB remains valid                       | Indexes, schema validation                    |
| Isolation   | Transactions don't see partial results | Snapshot isolation                            |
| Durability  | Committed data survives crashes        | Journaling + replication                      |

---

💡 **Important design insight**

MongoDB was designed with the idea:

> **“Most operations should fit within a single document.”**

Because **single document writes are already atomic**, many applications **don't need multi-document transactions**.
