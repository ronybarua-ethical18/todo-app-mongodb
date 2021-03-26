const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config()
const app = express();


app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));


const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.akkku.mongodb.net/tasks?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const toDoList = client.db("tasks").collection("todos");

    // create data 
    app.post('/addToList', (req, res) => {
        const todo = req.body;
        toDoList.insertOne(todo)
            .then(result => {
                console.log('data stored successfully');
                res.redirect('/');
            })
    })

    //retrieve or read data from database
    app.get('/todos', (req, res) => {
        toDoList.find({})
            .toArray((error, documents) => {
                res.send(documents);
            })
    })

    // delete data from database
    app.delete('/delete/:id', (req, res) => {
        toDoList.deleteOne({ _id: ObjectId(req.params.id) })
            .then(result => {
                res.send(result.deletedCount > 0);
            })
    })

    // load data for updating 
    app.get('/todo/:id', (req, res) => {
        toDoList.find({ _id: ObjectId(req.params.id) })
            .toArray((error, documents) => {
                res.send(documents[0]);
                console.log(documents);
            })
    })

    //update data in database
    app.patch(`/update/:id`, (req, res) => {
        toDoList.updateOne({ _id: ObjectId(req.params.id) },
            {
                $set: { plan: req.body.plan }
            })
            .then(result => {
                res.send(result.modifiedCount > 0);
                console.log(result);
            });
    })
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})

app.listen(3000);