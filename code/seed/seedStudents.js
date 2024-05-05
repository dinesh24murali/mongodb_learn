const mongoose = require('mongoose');
const dotenv = require('dotenv')
const marksData = require('../../data/marks.json');
const rankData = require('../../data/ranks.json');
const {
    Marks,
    Ranks,
} = require('../constants/schemas')

dotenv.config()

const seed = async () => {

    await mongoose.connect(process.env.MONGO_DB_CONNECTION_URL)
        .then(() => {
            console.log(" MongoDB connection Success ");
        })
        .catch(() => {
            console.log(" MongoDB connection Error ");
        });

    await Marks.insertMany(
        marksData.data
    ).then(function () {
        console.log("Marks Data inserted") // Success 
    }).catch(function (error) {
        console.log({ error })     // Failure 
    });
    await Ranks.insertMany(
        rankData.data
    ).then(function () {
        console.log("Ranks Data inserted") // Success 
    }).catch(function (error) {
        console.log({ error })     // Failure 
    });
    const endTime = new Date();
    console.log(`End time:  ${endTime.toISOString()}`);

    await mongoose.disconnect();
}

seed();
