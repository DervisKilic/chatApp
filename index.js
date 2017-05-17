var express = require('express');
var body = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var database;
var path = require('path');
var fs = require('fs-extra');
var app = express();
var multer  = require('multer');
var upload = multer({ dest: 'public/assets/images/'});

app.use(body.json());
app.use(body.json({limit: '10000mb'}));
app.use(body.urlencoded({limit: '5mb', extended: true}));
app.use(express.static(path.join(__dirname, 'public')));


MongoClient.connect('mongodb://localhost:27017/chatapp', function(error, database_){
    if(error) {
        console.error('Failed to connect to server!"');
        console.log(error);
    } else {
        console.log('Connected to server!"');
        database = database_;
    }
});

// Adds message to channel in DB
app.post('/messages', function(request, response) {
    database.collection('channels').updateOne({"name": request.body.name},
                                            { $push : {"messages": request.body.message}});
    console.log("Hepp!");
    response.send("It works");
});

// Gets all channels from DB
app.get('/channel', function(request, response) {
    database.collection('channels').find().toArray(function (err, result) {
        console.log(result, "channel get");
        response.send(result);
    });
});
  
// Adds channels to DB
app.post('/channel', function(request, response) {
    database.collection('channels').insert(request.body);
    console.log("Channel post works" + request.body);
    response.send("Channel post works" + request.body);
});

// Gets all users from DB  
app.get('/users', function (req, res) {
    database.collection('users').find().toArray(function (err, results) {
        res.send(results);
    });
});

// Adds users to DB
  //TODO need to add avatar and channels
app.post('/users', upload.single('avatar'), function(request, response) {
    var user = request.body;
    database.collection('users').insert({"username" : user.username, "email" : user.email,
        "password" : user.password, "avatar" : user.avatar});
    response.send();
    console.log("User created");
});

// Updates the users info in DB
app.put('/users', function(request, response) {
    var user = request.body;
    console.log(request.body.avatar);
    database.collection('users').update({"_id": ObjectId(user._id)}, {"username" : user.username, "email" : user.email,
        "password" : user.password, "avatar" : user.avatar});
});

app.post('/public/assets/images', upload.single('avatar'), function(req, res) {
    console.log("in Server");
    console.log(req);
});


app.listen(3000, function() {
    console.log("Starting new server");
});