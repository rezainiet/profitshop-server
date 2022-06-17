const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
const { query } = require('express');
const app = express();
const port = process.env.PORT || 4000;

require('dotenv').config()
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fworm.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    await client.connect();
    const userCollection = client.db('userCollection').collection('user');
    const referCollection = client.db('userCollection').collection('refer');
    const packageCollection = client.db('packageCollection').collection('package');

    // Get all packages
    app.get('/packages', async (req, res) => {
        const query = {};
        const packages = packageCollection.find(query);
        const result = await packages.toArray();
        res.send(result);
    });


    // Get all users
    app.get('/users', async (req, res) => {
        const query = {};
        const users = userCollection.find(query);
        const result = await users.toArray();
        res.send(result);
    });

    app.post('/users', async (req, res) => {
        const user = req.body;
        console.log(user);
        const result = await userCollection.insertOne(user);
        res.send(result);
    });

    app.get('/users/:email', async (req, res) => {
        const email = req.params.email;
        const query = { email: email }
        const filter = await userCollection.findOne(query);
        console.log(filter);
        res.send(filter);
    });

    app.put('/claim/:email', async (req, res) => {
        const email = req.params.email;
        const bonus = req.body;
        const balance = bonus.balance;
        const filter = { email: email };
        const updateDoc = {
            $set: {
                claimed: bonus.claimed,
                balance: balance,
            }
        }
        const result = await userCollection.updateOne(filter, updateDoc);
        res.send(result);

    });

    app.post('/register/:id', async (req, res) => {
        const email = req.params.id;
        console.log(email);
        // const refID = req.params.id;
        // const user = req.body;
        // console.log(refID, user);
        // const filter = { refCode: refID };
        // const refererEmail = await filter.email;
        // const details = { referredBy: refererEmail, userEmail: user }
        // const result = await referCollection.insertOne(details);
        // res.send(result);
    })
};
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('App is running');
});

app.listen(port);