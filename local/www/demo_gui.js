/**
 * Created by gilkor on 7/12/2016.
 */
var socket = io();

console.log("dlvdfkvmdfkvmdfv");

$(function(){
   var location = $('#location');
   var scan = $('#scan');
   location.on("click", function(){
       location.val("");
   });
   
   //====== scan panel ======//
   var currentScanResult = null;
   
   scan.on("click", function(){
           socket.emit("startScan");
           //TODO write "scanning..." in status bar.
   });
   
   socket.on('scanResult', function(scanResult){
        //test
        console.log("scan completed:");
        console.log(scanResult);
        currentScanResult = scanResult;
        //TODO write "scan complete (n networks)" in status bar
        
        //TODO show results in result as text in some panel
   });
   
   $('#stop').on('click', function(){
       socket.emit('stopScan');
   });
   
   
   $('#upload_b').on('click', function(){
       console.log(location.val());
       //check room name is valid
       if (location.val() === ""){
           $('#upload_message').empty().append($('<p>').text("please enter a room name"));
       }
       //check there is a fingerprint to send
       else if(currentScanResult == null){
            $('#upload_message').empty().append($('<p>').text("please scan to room first"));
       }
       else {
           //send fingerprint to server
           socket.emit('uploadFP', location.val(), currentScanResult);

           //update current location to the given name
           $('#current_location_p').text(location.val());
           location.val("");           
       }
   });
   
   
    //==== current location panel ====//
    $('#update_location_b').on('click', function(){
        socket.emit('getCurrentRoom');
    });
    

    socket.on("currentRoomUpdate", function(roomName){
        console.log("ddd");
        console.log(roomName);
        $('#current_location_p').text(roomName);
    });
});