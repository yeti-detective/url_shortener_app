var mongo = require("mongodb").MongoClient;
var db;

mongo.connect('mongodb://quote-app:Quote-App@ds157278.mlab.com:57278/yetis_first_db', function(err, database){
    if(err) throw err;
    db = database; // elevate database scope for use in handlers

    db.collection('urls').find({}, {_id: 0, master: 1}).toArray((err, result) => {
        if(err) return console.log(err);
        urlRegister = parseInt(result[0].master);
        console.log(urlRegister);
    })

});

db.collection('urls').updateOne(
  {"_id": 0},
  { $set: {"master": key+1} }
);

db.collection('urls').find({}, {_id:0}).toArray((err, result)=>{
  if(err) console.error(err)
  console.log(result[0])
})
