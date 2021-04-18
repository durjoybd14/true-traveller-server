const express = require('express');
const app = express();

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
require('dotenv').config();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World !')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ghclx.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    console.log('error', err);
    const adminCollection = client.db("dashboard").collection("admin");
    const reviewCollection = client.db("dashboard").collection("review");
    const serviceCollection = client.db("dashboard").collection("service");
    const ordersCollection = client.db("dashboard").collection("order");

    // make admin
    app.post('/addAdmin', (req, res) => {
        const email = req.body.email;
        console.log(email);
        adminCollection.insertOne({ email })
            .then(result => {
                console.log(result.insertedCount);
                res.send(result.insertedCount > 0)
            })
    })

    // post reviews
    app.post('/addReview', (req, res) => {
        const newReview = req.body;
        reviewCollection.insertOne(newReview)
            .then(result => {
                console.log(result.insertedCount);
                res.send(result.insertedCount > 0);
            })

    })

    //get reviews
    app.get('/review', (req, res) => {
        reviewCollection.find()
            .toArray((err, result) => {
                res.send(result);
            })
    })

    // post service
    app.post('/addService', (req, res) => {
        const newService = req.body;
        serviceCollection.insertOne(newService)
            .then(result => {
                console.log(result.insertedCount);
                res.send(result.insertedCount > 0);
            })

    })

    //get service
    app.get('/service', (req, res) => {
        serviceCollection.find()
            .toArray((err, result) => {
                res.send(result);
            })
    })

    // get service by _id
    app.get('/service/:id', (req, res) => {
        serviceCollection.find({ _id: ObjectId(req.params.id) })
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    //delete service
    app.delete('/deleteService/:id', (req, res) => {
        serviceCollection.deleteOne({ _id: ObjectId(req.params.id) })
            .then(result => {
                res.send(result.deletedCount > 0);
            })
    })

    //post order
    app.post('/addOrder', (req, res) => {
        const order = req.body;
        ordersCollection.insertOne(order)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    app.get('/orders', (req, res) => {
        ordersCollection.find({ email: req.query.email })
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    //get all orders
    app.get('/allOrders', (req, res) => {
        ordersCollection.find()
            .toArray((err, result) => {
                res.send(result);
            })
    })

    // update Status
    app.patch('/update/:id', (req, res) => {
        ordersCollection.updateOne({ _id: ObjectId(req.params.id) },

            {
                $set: { status: req.body }
            })
            .then(result => {
                res.send(result.modifiedCount > 0)
            })

    })

    //admin confirmation
    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, totalAdmin) => {
                res.send(totalAdmin.length > 0);
            })
    })

})


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})