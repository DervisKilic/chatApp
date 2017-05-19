var express = require('express');
var body = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var database;
var path = require('path');
var app = express();
var multer  = require('multer');
var mime = require('mime-types');
//const del = require('del');
// del(['public/assets/images/github.png']);
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/assets/images');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.' + mime.extension(file.mimetype));
    }
});
var upload = multer({ storage: storage });
app.use(body.json());
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
    database.collection('messages').insert(request.body);
    console.log("Message saved: " , request.body);
    response.send(request.body);
});
// fetches message from Db
app.get('/messages', function(request, response) {
    database.collection('messages').find({'channel': request.query.channel}).toArray(function (err, result) {
        response.send(result);
        //console.log("Messages from ", request.query.channel, ": ", result);
    });
});

// gets all channels for user from DB
app.get('/channels', function(request, response) {
    if (request.query.user) {
        var user = request.query.user;
        database.collection('channels').find(
            { $or: [ {'accessability' : 'public'},
                     { $and: [ {'accessability' : 'private'}, 
                               {'users' : {$in: [user]}} ] }
            ]})
        .toArray(function(error, result) {
            if (error) {
                response.send(error);
            } else {
                response.send(result);
            }
        });
    } else {
        database.collection('channels').find().toArray(function (err, result) {
            response.send(result);
        });
    }
});

// gets specific channel from Db
app.get('/channel', function(request, response){
    console.log('GET /channel', request.query.id);
    database.collection('channels').findOne({'_id' : ObjectId(request.query.id)}, function(err, result){
        response.send(result);
    });
});
  
// Adds channels to DB
app.post('/channel', function(request, response) {
    database.collection('channels').insert(request.body, function(error, documents) {
        if (error) {
            response.send(error);
        } else {
            response.send(documents.ops);
        }
    });
});

//updates channels timestamp
app.put('/channel', function(request,response) {
    database.collection('channels').update({"_id": ObjectId(request.body._id)}, {$set:{"timestamp": Date.now()}});
    response.send(request.body);
});

app.get('/channel/direct', function(request, response) {
    var sender = request.query.sender;
    var recipient = request.query.recipient;
    console.log('sender recipient', sender, recipient);
    database.collection('channels').findOne( 
        { $and: [ {'accessability' : 'direct'}, 
                  {'users' : {$in: [sender]}}, 
                  {'users' : {$in: [recipient]}} ] },
        function(error, result) {
            console.log('channel/direct', result);
            response.send(result);
        });
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
        "password" : user.password, "avatar" : user.avatar, "status" : user.status});
    response.send();
    console.log("User created");
});

// Updates the users info in DB
app.put('/users', function(request, response) {
    var user = request.body;
    database.collection('users').update({"_id": ObjectId(user._id)}, {"username" : user.username, "email" : user.email,
        "password" : user.password, "avatar" : user.avatar, "status" : user.status});
    response.send();
});

// adds avatar image to localhost
app.post('/upload',upload.single('avatar'), function(req, res) {
    res.send(req.file.path);
});

// used port
app.listen(3000, function() {
    console.log("Starting new server");
});
