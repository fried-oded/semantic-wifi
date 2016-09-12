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
   var scanStatus = $('#scan_status');
   var uploadMessage = $('#upload_message');
   
   scan.on("click", function(){
           socket.emit("startScan");
           scanStatus.text("scanning...");
   });
   
   socket.on('scanSuccsess', function(scanResult){
        console.log("scan completed:");
        console.log(scanResult);
        currentScanResult = scanResult;
        scanStatus.text("scan complete. found " + scanResult.networks.length + " networks");
        uploadMessage.text("");
   });
   
   socket.on('scanFailed', function(err){
        console.log("scan failed:");
        console.log(err);
        currentScanResult = null;
        scanStatus.text("scan failed. click scan to try again");
   });
   
   $('#stop').on('click', function(){
       socket.emit('stopScan');
   });
   
   //====== upload panel ======//
   $('#upload_b').on('click', function(){
       console.log(location.val());
       //check room name is valid
       if (location.val() === ""){
           scanStatus.text("please enter a room name");
       }
       //check there is a fingerprint to send
       else if(currentScanResult == null){
             scanStatus.text("please scan to room first");
       }
       else {
           //send fingerprint to server
           socket.emit('uploadFP', location.val(), currentScanResult);
          
       }
   });
   
   socket.on('uploadSuccsess', function(msg){
        console.log("upload success:");
        console.log(msg);
        scanStatus.text("ppload complete");
        
        //update current location to the given name
        $('#current_location_p').text(location.val());
        location.val(""); 
   });
   
   socket.on('uploadFailed', function(err){
        console.log("upload failed:");
        console.log(err);
        scanStatus.text("upload failed");
   });
   
   
    //==== current location panel ====//
    $('#update_location_b').on('click', function(){
        socket.emit('getCurrentRoom');
    });
    

    socket.on("updateSuccess", function(roomName){
        console.log("got room:");
        console.log(roomName);
        $('#current_location_p').text(roomName);
    });
    
    socket.on("updateFailed", function(err){
        console.log("update failed");
        console.log(err);
    });
});