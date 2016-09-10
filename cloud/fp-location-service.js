
//======== REST api ==========// 
console.log("importing: express");
var app = require("express")();
console.log("importing: http");
var http = require('http').Server(app);


//======== load DB ==========// 
//using fs db
//var FS_DB = require("./fs-db");
var ES_DB = require("./elasticsearch-db");

var DB_NAME = 'home_db';
var DB_FILE_NAME = DB_NAME + '.json';

//var dataBase = new FS_DB(DB_FILE_NAME);
var dataBase = new ES_DB(DB_NAME);


//============= static server =================//
var PORT = 8080;
var bodyParser = require('body-parser');
app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({extended : true}));


//get room name from fingerprint
app.post('/fingerprint', function(req, res){
   //test
   console.log("got finger print");
   //----
   
   var fingerPrint = req.body;//or something to get the request
   
   getRoomName(fingerPrint)
   .then(function(msg){
       console.log(msg);
       res.send();
   })
   .catch(function(err){
       console.log(err);
       res.status(500).send(err);
   });
   
    //or something like this
});

//add new room to the DB
app.post('/rooms/:roomName', function(req, res){
	var entry = req.body;//or something to get the new db entry
   
    dataBase.addEntry(req.params.roomName, entry)
    .then(function(msg){
       console.log(msg);
       res.send();
   })
   .catch(function(err){
       console.log(err);
       res.status(500).send(err);
   });
});

console.log("starting server");
http.listen(PORT, function(){
  console.log('listening on *:' + PORT);
});



//================ room match algorithm =================
function getRoomName(fingerPrint) {
    var bestScore = Number.MAX_VALUE;
    var bestRoom = null;
    var promise = dataBase.getRoomsFromFp(fingerPrint)
    .then(function(rooms){
        for (var roomName in rooms) {
            if (rooms.hasOwnProperty(roomName)) {
                //test
                console.log("calculating room: " + roomName);
                //----
                
                var currentScore = getFingerPrintScore(rooms[roomName], fingerPrint);
                if(currentScore < bestScore){
                    bestScore = currentScore;
                    bestRoom = roomName;
                }
                
                //test
                console.log("room: " + roomName + ", score: " + currentScore);
                //----
            }
        }
        
        //test
        console.log("best room is " + bestRoom + " score: " + bestScore);
        //----
        return bestRoom;
    });
    
    return promise;
}

function getFingerPrintScore(room, fingerPrint) {
    score = 0;
    fingerPrint.forEach(function(fpNetwork){
        var roomNetwork = room[fpNetwork.mac];
        var roomSignal;
        if(roomNetwork){
            roomSignal = roomNetwork.signal_level;
        }
        else{
            roomSignal = -100;
        }
    //console.log(fpNetwork.ssid)
    //console.log("rm: " + (-roomSignal) + ", fp:" +  (-fpNetwork.signal_level) + ", total: " + Math.abs(roomSignal - fpNetwork.signal_level));
        score += Math.abs(roomSignal - fpNetwork.signal_level)
    });
    return score;
}
 