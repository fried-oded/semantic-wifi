console.log("initializing modules");
console.log("express");
var app = require("express")();
console.log("http");
var http = require('http').Server(app);
console.log("socket");
var io = require('socket.io')(http);

var wifi_scanner = require("./wifi-location");
//============= static server =================//
var DEMO_PORT = 3000;

//TODO make it return all files in www instead of listing them one by one (like you supposed to do)
app.get('/', function(req, res){
   res.sendFile(__dirname + '/www/demo_gui.html');
});

app.get('/wifi-controller.js', function(req, res){
   res.sendFile(__dirname + '/www/demo_gui.js');
});

app.get('/style.css', function(req, res){
   res.sendFile(__dirname + '/www/style.css');
});


//interface

io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('startScan', function(timeToRun){
        wifi_scanner.startScan(timeToRun)
        .then(function(scanResult){
              socket.emit('scanSuccess', scanResult);
        })
        .catch(function(err){
              console.log(err);
              socket.emit('scanFailed', err);
              
        });
  });
  
  socket.on('stopScan', function(){
        wifi_scanner.stopScan();
  });
  
  socket.on('uploadFP', function(roomName, fingerPrint){
        wifi_scanner.uploadFingerPrint(roomName, fingerPrint)
        .then(function(msg){
              socket.emit('uploadSuccess', msg);
        })
        .catch(function(err){
              console.log(err);
              socket.emit('uploadFailed', err);
              
        });
  });
  
  socket.on('getCurrentRoom', function(){
        wifi_scanner.getCurrentRoom()
            .then(function(roomName){
                //test
                console.log("got room name " + roomName);
                //----
                socket.emit('updateSuccess', roomName);
            })
            //test
            .catch(function(err){
                console.log("could not get name");  
                console.log(err);  
                socket.emit('updateFailed', err);
            })
            //----
            ;
  });
  
});

console.log("starting server");
http.listen(DEMO_PORT, function(){
  console.log('listening on *:' + DEMO_PORT);
});