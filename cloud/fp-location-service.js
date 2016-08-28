
//======== REST api ==========// 
console.log("express");
var app = require("express")();
console.log("http");
var http = require('http').Server(app);


//======== load DB ==========// 
//using fs db
var FS_DB = require("./fs-db")
var DB_NAME = 'home_db';
var DB_FILE_NAME = DB_NAME + '.json';
var DB_PATH = "databases/" + DB_FILE_NAME ;
var dataBase = new FS_DB(DB_PATH);


//============= static server =================//
var PORT = 8080;
var bodyParser = require('body-parser');
app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({extended : true}));


//get room name from fingerprint
app.post('/fingerprint', function(req, res){
   var fingerPrint = req.body;//or something to get the request
   
   var roomName = getRoomName(fingerPrint);
   
   res.send(roomName); //or something like this
});

//add new room to the DB
app.post('/rooms/:roomName', function(req, res){
	var entry = req.body;//or something to get the new db entry
   
    dataBase.addEntry(req.params.roomName, entry);
	
	
	//TODO maybe check if adding was successful? maybe send somthing more informative?
	res.send() //or something like this
});

console.log("starting server");
http.listen(PORT, function(){
  console.log('listening on *:' + PORT);
});



//================ room match algorithm =================
function getRoomName(fingerPrint) {
    var bestScore = Number.MAX_VALUE;
    var bestRoom = null;
    var rooms = dataBase.getRoomsFromFp(fingerPrint);
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
    
    return bestRoom;
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
 