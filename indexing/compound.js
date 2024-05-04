const mongoose = require('mongoose'),
    Schema = mongoose.Schema;
const dotenv = require('dotenv')
dotenv.config()

const LocationSchema = new Schema({
    city: { type: Schema.Types.String },
    state: { type: Schema.Types.String },
    pop: { type: Schema.Types.Number, required: true },
    loc: { type: [Schema.Types.Decimal128], required: true },
});


const Location = mongoose.model('location', LocationSchema);

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
    const temp = await Location.find({ state: "MA", pop: { $gt: 1000 } }).exec();
    console.log({
        noOfRecords: temp.length
    })
    const endTime = new Date();
    console.log(`End time:  ${endTime.toISOString()}`);

    await mongoose.disconnect();
}

run();
