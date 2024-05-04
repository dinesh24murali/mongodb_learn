const mongoose = require('mongoose'),
    Schema = mongoose.Schema;
const dotenv = require('dotenv')
const records = require('../data/mockdata.json');

dotenv.config()

const LocationSchema = new Schema({
    city: { type: Schema.Types.String },
    state: { type: Schema.Types.String },
    pop: { type: Schema.Types.Number, required: true },
    loc: { type: [Schema.Types.Decimal128], required: true },
});

const Location = mongoose.model('location', LocationSchema);

const seed = async () => {

    await mongoose.connect(process.env.MONGO_DB_CONNECTION_URL)
        .then(() => {
            console.log(" MongoDB connection Success ");
        })
        .catch(() => {
            console.log(" MongoDB connection Error ");
        });

    const newData = [];


    for (const item of records.data) {
        delete item._id;
        newData.push({ ...item });
    }
    console.log({ newData: newData.length })

    const startTime = new Date();
    console.log(`Start time:  ${startTime.toISOString()}`)
    await Location.insertMany(
        newData
    ).then(function () {
        console.log("Data inserted") // Success 
    }).catch(function (error) {
        console.log({ error })     // Failure 
    });
    const endTime = new Date();
    console.log(`End time:  ${endTime.toISOString()}`);

    await mongoose.disconnect();
}

seed();
