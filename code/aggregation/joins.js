const mongoose = require("mongoose");
const { Location, Marks, Ranks } = require("../constants/schemas");
const { connect, createMongoClientConnection } = require("../helpers/connect");
const collections = require("../constants/collections");

/**
 * Reference link:
 *
 * https://www.analyticsvidhya.com/blog/2023/07/simple-techniques-to-perform-join-operations-in-mongodb/
 */

const run = async () => {
  await connect();

  const startTime = new Date();
  console.log(`Start time:  ${startTime.toISOString()}`);
  const temp = await Location.aggregate([
    {
      $match: { state: "MA" },
    },
    {
      $group: { _id: "$city", totalPopulation: { $sum: "$pop" } },
    },
  ]);
  console.log({
    noOfRecords: temp.length,
    result: temp,
  });
  const endTime = new Date();
  console.log(`End time:  ${endTime.toISOString()}`);

  await mongoose.disconnect();
};

const leftOuterJoin = async () => {
  await connect();

  const startTime = new Date();
  console.log(`Start time:  ${startTime.toISOString()}`);
  const temp = await Marks.aggregate([
    {
      $lookup: {
        from: "ranks",
        localField: "rollNo",
        foreignField: "rollNo",
        as: "Ranks",
      },
    },
  ]);
  console.log({
    noOfRecords: temp.length,
    result: JSON.stringify(temp),
  });
  const endTime = new Date();
  console.log(`End time:  ${endTime.toISOString()}`);

  await mongoose.disconnect();
};
/**
 * Now one thing to remember, in MongoDB $lookup can only perform left joins and
 * there is no specific syntax available for other types of joins. So we need to
 * derive the other joins by using different tricks and operations
 */
const rightOuterJoin = async () => {
  await connect();

  const startTime = new Date();
  console.log(`Start time:  ${startTime.toISOString()}`);
  const temp = await Ranks.aggregate([
    {
      $lookup: {
        from: "marks",
        localField: "rollNo",
        foreignField: "rollNo",
        as: "Marks",
      },
    },
  ]);
  console.log({
    noOfRecords: temp.length,
    result: JSON.stringify(temp),
  });
  const endTime = new Date();
  console.log(`End time:  ${endTime.toISOString()}`);

  await mongoose.disconnect();
};

const innerJoin = async () => {
  await connect();

  const startTime = new Date();
  console.log(`Start time:  ${startTime.toISOString()}`);
  const temp = await Ranks.aggregate([
    {
      $lookup: {
        from: "marks",
        localField: "rollNo",
        foreignField: "rollNo",
        as: "Marks_Students",
      },
    },
    { $match: { Marks_Students: { $ne: [] } } },
  ]);
  console.log({
    noOfRecords: temp.length,
    result: JSON.stringify(temp),
  });
  const endTime = new Date();
  console.log(`End time:  ${endTime.toISOString()}`);

  await mongoose.disconnect();
};
/**
 * full outer join is not straight forward. We need a temporary / new collection to calculate 
 * Steps for performing a full outer join
 *
 * 1. Perform left join (Marks in the left), this add Ranks as Arrays.
 *    Along with this add an empty array called "Marks", export to new collection
 * 2. Perform right join (Ranks in the left), this will add Marks as Array.
 *    Merge this output into the same collection
 *    Now the new collection, lets call it J2, will have the result of both
 *    Left join and right join, there will be duplicate records.
 *
 * 3. To get the unique list of records:
 *    - We know that in the result of right join (Ranks in the left),
 *    the rollNo that are present only in Ranks collection and not in
 *    Marks collection will have an empty Marks Array
 *    - We can use this empty Marks Array as a key to filter out
 *    the unique records (unique rollNo).
 *    - This is possible because we added a empty Marks array to
 *    all the records when we did the left join (Marks in the left).
 *    Any records that has the empty Marks Array the right join means
 *    that, that rollNo does not exist in Marks collection.
 *    - So if we get all the records which has the empty Marks Array
 *    We will get the list of unique RollNos. Then in the next step
 *    we can remove the empty Marks Array as it is empty
 *
 *  I hope I could explain it as understandable as possible, check the following
 *  blog and run the following script to getter a better understanding
 * 
 *  https://www.analyticsvidhya.com/blog/2023/07/simple-techniques-to-perform-join-operations-in-mongodb/
 */
const fullOuterJoin = async () => {
  await connect();
  const { client, db } = await createMongoClientConnection();

  const startTime = new Date();
  console.log(`Start time:  ${startTime.toISOString()}`);
  await Marks.aggregate([
    {
      $lookup: {
        from: "ranks",
        localField: "rollNo",
        foreignField: "rollNo",
        as: "Ranks",
      },
    },
    { $addFields: { Marks: [] } },
    { $out: collections.Join },
  ]);
  await Ranks.aggregate([
    {
      $lookup: {
        from: "marks",
        localField: "rollNo",
        foreignField: "rollNo",
        as: "Marks",
      },
    },
    { $merge: collections.Join },
  ]);
  const coll = await db.collection(collections.Join);
  const result = await coll
    .aggregate([
      { $redact: { $cond: [{ $eq: ["$Marks", []] }, "$$KEEP", "$$PRUNE"] } },
      { $unset: "Marks" },
    ])
    .toArray();
  console.log({
    noOfRecords: result.length,
    result: JSON.stringify(result),
  });
  const endTime = new Date();
  console.log(`End time:  ${endTime.toISOString()}`);

  await mongoose.disconnect();
  await client.close();
};

run();

module.exports = {
  run,
  leftOuterJoin,
  rightOuterJoin,
  fullOuterJoin,
  innerJoin,
};
