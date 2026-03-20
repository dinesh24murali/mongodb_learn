# Group

Here's a simple example of `$group` in MongoDB aggregation:

**Scenario:** You have an `orders` collection and want to find total sales per customer.

**Sample documents:**
```json
{ "customer": "Alice", "amount": 50 }
{ "customer": "Bob",   "amount": 30 }
{ "customer": "Alice", "amount": 80 }
{ "customer": "Bob",   "amount": 20 }
```

**Aggregation query:**
```js
db.orders.aggregate([
  {
    $group: {
      _id: "$customer",        // group by this field
      totalSales: { $sum: "$amount" },
      orderCount: { $sum: 1 }
    }
  }
])
```

**Result:**
```json
{ "_id": "Alice", "totalSales": 130, "orderCount": 2 }
{ "_id": "Bob",   "totalSales": 50,  "orderCount": 2 }
```

---

**Key points:**

- `_id` is **required** — it defines the grouping key. Use `_id: null` to group everything into one document.
- Accumulator operators like `$sum`, `$avg`, `$min`, `$max`, `$push` compute values across grouped documents.
- You can group by multiple fields: `_id: { customer: "$customer", status: "$status" }`

**Common accumulators:**

| Operator | Description |
|----------|-------------|
| `$sum` | Total / count |
| `$avg` | Average |
| `$min` / `$max` | Smallest / largest value |
| `$push` | Collect values into an array |
| `$first` / `$last` | First or last value in group |