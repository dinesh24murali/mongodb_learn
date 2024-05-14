const mongoose = require("mongoose");
const { Location } = require("../constants/schemas");

const dotenv = require("dotenv");
dotenv.config();

/**
 * Test the performance by comparing the time it took for running the query before and after
 * setting up indexing
 */

const run = async () => {
  await mongoose
    .connect(process.env.MONGO_DB_CONNECTION_URL)
    .then(() => {
      console.log(" MongoDB connection Success ");
    })
    .catch(() => {
      console.log(" MongoDB connection Error ");
    });

  const startTime = new Date();
  console.log(`Start time:  ${startTime.toISOString()}`);
  /**
   * Single key indexing:
   */
  const temp = await Location.find({ pop: 1240 }).exec();
  //   const temp = await Location.find({ pop: { $gt: 1000 } }).exec();

  /**
   * Multi key indexing:
   */
//   const temp = await Location.find({ "loc": 7 }).exec();

  console.log({
    noOfRecords: temp.length,
  });
  const endTime = new Date();
  console.log(`End time:  ${endTime.toISOString()}`);

  await mongoose.disconnect();
};

run();
