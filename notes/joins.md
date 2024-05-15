# Joins in MongoDB

Types of joins in SQL

1. Inner Join
2. Outer Join
3. Right Join
4. Left Join

MongoDB doesn't natively support join. We use a combination of Aggregation Operators to achieve join. This [blog](https://www.analyticsvidhya.com/blog/2023/07/simple-techniques-to-perform-join-operations-in-mongodb/) explains this nicely. `Full outer join` is a bit complicated. There are working examples of all the joins in `code/aggregation/joins.js`

### Full outer join:

full outer join is not straight forward. We need a temporary / new collection to calculate.
Steps for performing a full outer join using Ranks and Marks collections.

1.  Perform left join (Marks in the left), this adds Ranks as Arrays.
    Along with this add an empty array called "Marks", export to new collection
2.  Perform right join (Ranks in the left), this will add Marks as Array.
    Merge this output into the same collection
    Now the new collection, lets call it J2, will have the result of both
    Left join and right join, there will be duplicate records.

3.  To get the unique list of records:
    - We know that in the result of right join (Ranks in the left),
      the rollNo that are present only in Ranks collection and not in
      Marks collection will have an empty Marks Array
    - We can use this empty Marks Array as a key to filter out
      the unique records (unique rollNo).
    - This is possible because we added a empty Marks array to
      all the records when we did the left join (Marks in the left).
      Any records that has the empty Marks Array the right join means
      that, that rollNo does not exist in Marks collection.
    - So if we get all the records which has the empty Marks Array
      We will get the list of unique RollNos. Then in the next step
      we can remove the empty Marks Array as it is empty

I hope I could explain it as understandable as possible, check the following
blog and run the following script to getter a better understanding

## Resources for join

https://www.analyticsvidhya.com/blog/2023/07/simple-techniques-to-perform-join-operations-in-mongodb/
