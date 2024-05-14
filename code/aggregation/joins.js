const mongoose = require('mongoose');
const { Location, Marks, Ranks } = require('../constants/schemas');
const dotenv = require('dotenv')
dotenv.config()

/**
 * Reference link:
 * 
 * https://www.analyticsvidhya.com/blog/2023/07/simple-techniques-to-perform-join-operations-in-mongodb/
 */

const run = async () => {

    await mongoose.connect(process.env.MONGO_DB_CONNECTION_URL)
        .then(() => {
            console.log(" MongoDB connection Success ");
        })
        .catch(() => {
            console.log(" MongoDB connection Error ");
        });

    const startTime = new Date();
    console.log(`Start time:  ${startTime.toISOString()}`)
    const temp = await Location.aggregate([
        {
            $match: { state: "MA" }
        },
        {
            $group: { _id: "$city", totalPopulation: { $sum: "$pop" } }
        }
    ]);
    console.log({
        noOfRecords: temp.length,
        result: temp,
    })
    const endTime = new Date();
    console.log(`End time:  ${endTime.toISOString()}`);

    await mongoose.disconnect();
}

const leftOuterJoin = async () => {
    await mongoose.connect(process.env.MONGO_DB_CONNECTION_URL)
        .then(() => {
            console.log(" MongoDB connection Success ");
        })
        .catch(() => {
            console.log(" MongoDB connection Error ");
        });

    const startTime = new Date();
    console.log(`Start time:  ${startTime.toISOString()}`)
    const temp = await Marks.aggregate([{
        $lookup: {
            from: "ranks", localField: "rollNo",
            foreignField: "rollNo", as: "Ranks"
        }
    }]);
    console.log({
        noOfRecords: temp.length,
        result: JSON.stringify(temp),
    })
    const endTime = new Date();
    console.log(`End time:  ${endTime.toISOString()}`);

    await mongoose.disconnect();
}
/**
 * Now one thing to remember, in MongoDB $lookup can only perform left joins and 
 * there is no specific syntax available for other types of joins. So we need to 
 * derive the other joins by using different tricks and operations
 */
leftOuterJoin();

module.exports = {
    run,
    leftOuterJoin,
}