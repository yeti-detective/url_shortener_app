var port = process.env.PORT || 8080;
var express = require('express');
var app = express();
var validUrl = require('valid-url');
var path = require('path');

var mongo = require("mongodb").MongoClient;
var db;
var urlRegister;

function shortener(key, url, response){
    db.collection('urls').save({"key": key, "url": url});
    db.collection('urls').updateOne(
        {"master": key},
        { $set: {"master": key+1} }
    );
    urlRegister++;
    db.collection('urls').find({"key": key}, {_id: 0, key: 1, url: 1}).toArray((err, result) => {
            if(err) return console.log(err);
            var finalAnswer = { "original_url": result[0].url, "short_url": "https://yetis-url-shortener.herokuapp.com/" + result[0].key};
            response.send(JSON.stringify(finalAnswer));
    });
}

function failure(bogusURL, response){
    response.send(bogusURL.toString() + " is not a valid URL. Make sure it starts with http:// or https:// & try again");
}

mongo.connect('mongodb://quote-app:Quote-App@ds157278.mlab.com:57278/yetis_first_db', function(err, database){
    if(err) throw err;
    db = database; // elevate database scope for use in handlers

    app.listen(port,function(){
        console.log('server listening on port ' + port);
    });
    db.collection('urls').find({}, {_id: 0, master: 1}).toArray((err, result) => {
        if(err) return console.log(err);
        urlRegister = parseInt(result[0].master);
    })
});

app.get("/:key", function(req, res){
    if (Boolean(parseInt(req.params.key))){
        db.collection('urls').find({"key": parseInt(req.params.key)}).toArray((err, result) => {
            if(err) throw err;
            if (result.length < 1){
                res.send(req.params.key.toString() + ' doesn\'t match a stored URL. Try adding something like: "/https://www.freecodecamp.com" to the end of this site\'s URL & hitting "Enter"');
            }else{
                res.redirect(result[0].url);
            }

        })
    }else{
        failure(req.params.key, res);
    }

});

app.get('/http:\//:url', function(req, res){
    if(Boolean(validUrl.isUri('http://' + req.params.url))){
        console.log('this happened!');
        shortener(urlRegister, 'http://' + req.params.url, res);
    }else{
        failure(req.params.url.toString(), res);
    }
});

app.get('/https:\//:urlSSH', function(req, res){
    if(Boolean(validUrl.isUri('https://' + req.params.urlSSH))){
        shortener(urlRegister, 'https://' + req.params.urlSSH, res);
    }else{
        failure(req.params.url.toString(), res);
    }

});

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname + '/index.html'));
});
