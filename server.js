// Import dependencies modules 
const express = require('express')
const cors = require('cors');
const path = require("path");
const fs = require("fs");

// Create an Express.js instance
const app = express();

//config Express.js
app.use(express.json())
app.set('port', 3000)
app.use((req, res, next) =>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
})

app.use(cors());

// connect to MongoDB
const MongoClient = require('mongodb').MongoClient;

let db;
MongoClient.connect('mongodb+srv://Khadija:Middle%402020@cluster0.pak3b2v.mongodb.net', (err, client) => {
    db = client.db('after_school_activities')
})

app.use(function(req, res, next){
    console.log("Request IP: "+ req.url);
    console.log("Request date: "+ new Date());
    next();
});

// display a message for root path to show that API is working 
app.get('/', (req, res, next) => {
    res.send('Select a collection, e.g., /collection/messages')
})

// get collection name 
app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName)
    return next()
})

app.get('/collection/:collectionName', (req, res, next) => {
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e)
        res.send(results)
    })
})

app.post('/collection/:collectionName', (req,res,next) => {
    req.collection.insertOne(req.body, (e, results) => {
        // if any errors
        if (e) return next(e) 
        //return unique id along with results ops(object identifier)
        res.send(results)
    })
})

const ObjectID = require('mongodb').ObjectId;
app.get('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.findOne({_id: new ObjectID(req.params.id)}, (e, result) => {
        if(e) return next(e)
        res.send(result)
    })
})

app.put('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.updateOne(
        //update for id
        {_id: new ObjectID(req.params.id)},
        // it happens in the body 
        {$set: req.body}, 
        // will only enable one update and therefore multi is set to false 
        {safe: true, multi: false},
        (e, result) => {
            if (e) return next(e)
            // checks for each update and returns the outcome 
            res.send((result) ? {msg: 'success'} : {msg: 'error'})
        })
})

// get a specific item from a collection (lessons)
app.get('/lesson/:search', (req, res, next) => {
    db.collection('lesson').find({}).toArray((e, results) => {
        if (e) return next(e);
        let searchResults = results.filter((item) => {
            return (
                item.subject.toLowerCase().match(req.params.search.toLowerCase()) || item.location.toLowerCase().match(req.params.search.toLowerCase())
            );
        });
        res.send(searchResults);
    });
})

app.use(function(req, res, next){
    var filePath = path.join(__dirname, "static", req.url);
    fs.stat(filePath, function(err, fileInfo){
        if(err){
            next();
            return;
        }

        if(fileInfo.isFile()){
            res.sendFile(filePath);
        }else{
            next();
        }
    });
});

app.use(function(req, res){
    res.status(404);
    res.send("File not found!");
});

// the server will run on port 3000
app.listen(3000, () => {
    console.log('Express.js server running at 3000!');
  });
  