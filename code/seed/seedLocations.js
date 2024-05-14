const mongoose = require("mongoose");
const dotenv = require("dotenv");
const records = require("../../data/locations.json");
const {
    Location
} = require('../constants/schemas')

dotenv.config();

const seed = async () => {
  await mongoose
    .connect(process.env.MONGO_DB_CONNECTION_URL)
    .then(() => {
      console.log(" MongoDB connection Success ");
    })
    .catch(() => {
      console.log(" MongoDB connection Error ");
    });

  const newData = [];

  for (const item of records.data) {
    delete item._id;
    newData.push({
      ...item,
      loc: [Math.floor(Math.random() * 20), Math.floor(Math.random() * 20)],
    });
  }
  console.log({ newData: newData.length });

  const startTime = new Date();
  console.log(`Start time:  ${startTime.toISOString()}`);
  await Location.insertMany(newData)
    .then(function () {
      console.log("Data inserted"); // Success
    })
    .catch(function (error) {
      console.log({ error }); // Failure
    });
  const endTime = new Date();
  console.log(`End time:  ${endTime.toISOString()}`);

  await mongoose.disconnect();
};

seed();
