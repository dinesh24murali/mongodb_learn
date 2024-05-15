const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv')
dotenv.config()

const connect = async () => {

    await mongoose.connect(process.env.MONGO_DB_CONNECTION_URL)
        .then(() => {
            console.log(" MongoDB connection Success ");
        })
        .catch(() => {
            console.log(" MongoDB connection Error ");
        });
}


const createMongoClientConnection = async () => {
    try {
        const client = new MongoClient(process.env.MONGO_DB_CONNECTION_URL);
        await client.connect();
        const db = client.db(process.env.DB_NAME);
        return { client, db };
    } catch (err) {
        process.exit(-1);
    }
}

module.exports = {
    connect,
    createMongoClientConnection,
}
