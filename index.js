const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 4000;

require('dotenv').config();
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fworm.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const userCollection = client.db('userCollection').collection('user');
        const referCollection = client.db('userCollection').collection('refer');
        const packageCollection = client.db('packageCollection').collection('package');
        const usersPackageCollection = client.db('packageCollection').collection('usersPackage');
        const orderCollection = client.db('packageCollection').collection('orders');
        const taskCollection = client.db('taskCollection').collection('tasks');
        const completeTaskCollection = client.db('taskCollection').collection('complete');
        const withdrawCollection = client.db('withdrawCollection').collection('withdraw');
        const successWithdrawCollection = client.db('withdrawCollection').collection('successWithdraw');
        const allWithdrawCollection = client.db('withdrawCollection').collection('allWithdraw');
        const heroSliderCollection = client.db('homePage').collection('heroSlider');

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
            // const referFilter = await { referedBy: filter.refCode };
            // const totalrefer = await userCollection.find(referFilter).toArray();
            // const result = { filter, totalrefer };
            res.send(filter);
        });

        app.get('/getUser/:email', async (req, res) => {
            const user = req.params.email;
            const filter = { email: user };
            const result = await userCollection.findOne(filter);
            res.send(result);
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

        app.get('/packages', async (req, res) => {
            const packages = await packageCollection.find({});
            const result = await packages.toArray();
            res.send(result);
        });

        app.get('/purchase/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await packageCollection.findOne(filter);
            res.send(result);
        });
        app.post('/purchase', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        });

        app.get('/packageInfo/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { buyer: email }
            const result = await orderCollection.findOne(filter);
            res.send(result);
        });

        app.get('/packageInfo', async (req, res) => {
            const result = await orderCollection.find().toArray();
            res.send(result);
        });
        app.get('/purchased', async (req, res) => {
            // const query = { status: "pending" };
            const filter = await orderCollection.find({ status: "pending" });
            const result = await filter.toArray();
            res.send(result);
        });

        app.put('/getInfo/:id', async (req, res) => {
            const id = req.params.id;
            const state = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: state.newValue,
                }
            };
            const result = await orderCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });
        app.get('/tasks', async (req, res) => {
            const result = await taskCollection.find().toArray();
            res.send(result);
        });

        app.post('/successBuy', async (req, res) => {
            const info = req.body;
            const result = await usersPackageCollection.insertOne(info);
            res.send(result);
        });
        app.get('/checkPackage/:email', async (req, res) => {
            const userEmail = req.params.email;
            const result = await usersPackageCollection.findOne({ buyer: userEmail });
            res.send(result);
        });

        app.put('/completeTask/:email', async (req, res) => {
            const email = req.params.email;
            const info = req.body;
            // user: user.email, taskId: id, date
            // const information = {
            //     date: info.date, information: {
            //         taskId: info.taskId, user: info.user
            //     }
            // };
            const newDate = info.date;
            const filter = { information: info.taskId };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    newDate: newDate,
                    user: info.user,
                    information: {
                        taskId: info.taskId, user: info.user, date: info.date
                    }
                }
            };
            const result = await completeTaskCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        app.get('/checkCompleted/:email', async (req, res) => {
            const date = new Date().toISOString().slice(0, 10);
            // const date = "2022-06-19";
            const email = req.params.email;
            const filter = { newDate: date, user: email };
            const result = await completeTaskCollection.find(filter).toArray();
            res.send(result);
        });

        app.put('/updateBalance/:email', async (req, res) => {
            const email = req.params.email;
            const newBalance = req.body;
            console.log(newBalance);
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    balance: newBalance.newBalance,
                }
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        app.post('/postWithdraw', async (req, res) => {
            const withdraw = req.body;
            const result = await withdrawCollection.insertOne(withdraw);
            res.send(result);
        });

        app.get('/getWithdraw', async (req, res) => {
            const result = await withdrawCollection.find().toArray();
            res.send(result);
        });
        app.get('/getWithdraw/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const result = await withdrawCollection.find(filter).toArray();
            res.send(result);
        });

        app.put('/cutBalanceforWithdraw/:email', async (req, res) => {
            const email = req.params.email;
            const newBalance = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    balance: newBalance.newBalance,
                }
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        app.put('/completedWithdraw/:id', async (req, res) => {
            const id = req.params.id;
            const state = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: state.newValue,
                }
            };
            const result = await withdrawCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        app.post('/successWithdraw', async (req, res) => {
            const data = req.body;
            const result = await successWithdrawCollection.insertOne(data);
            res.send(result);
        });

        app.post('/allWithdrawResult', async (req, res) => {
            const body = req.body;
            const result = await allWithdrawCollection.insertOne(body);
            res.send(result);
        });

        app.post('/addAds', async (req, res) => {
            const ads = req.body;
            const result = await taskCollection.insertOne(ads);
            res.send(result);
        });

    }
    finally {

    }
};
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('App is running');
});

app.listen(port);