require('dotenv').config();
const { MongoClient } = require('mongodb');

const url = 'mongodb+srv://muhammedfazilchengapra:zYKGGlzU5MTIwj04@cluster0.vfe0oe4.mongodb.net/?retryWrites=true&w=majority';
const dbname = 'products'

const state = {
    db: null,
};

module.exports.connect = async function () {

    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        state.db = client.db(dbname);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        throw err;
    } finally {
        // Close the client when done
        // await client.close();
    }
};

module.exports.get = function () {
    return state.db;
};

