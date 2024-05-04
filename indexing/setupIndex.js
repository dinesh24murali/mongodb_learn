const { MongoClient } = require('mongodb');
const collections = require('./collections');
const dotenv = require('dotenv')
dotenv.config()

const createConnection = async () => {
    try {
        const client = new MongoClient(process.env.MONGO_DB_CONNECTION_URL);
        await client.connect();
        const db = client.db(process.env.DB_NAME);
        return { client, db };
    } catch (err) {
        process.exit(-1);
    }
}

const run = async () => {

    const { client, db } = await createConnection();

    const startTime = new Date();
    console.log(`Start time:  ${startTime.toISOString()}`)

    const result = await db.collection(collections.Locations).createIndex({ pop: 1240 });

    console.log(`Created index: ${JSON.stringify(result)}`)

    const endTime = new Date();
    console.log(`End time:  ${endTime.toISOString()}`);

    await client.close();

}

run();
