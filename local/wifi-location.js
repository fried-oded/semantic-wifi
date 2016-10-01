console.log("importing module");
var Promise = require("bluebird");
var rp = require('request-promise');

var WiFiControl = require('wifi-control');
 
WiFiControl.scanForWiFiAsync = Promise.promisify(WiFiControl.scanForWiFi);

console.log("initializing wifi scanner");
 
  //  Initialize wifi-control package with verbose output 
WiFiControl.init({
    debug: true,
});

//============ scan ============// 
var DEFAULT_SCAN_TIME = 30000;
var TIME_BETWEEN_SCANS = 1000;
var runningScan = null; //timer
var stopTimer = null;
var scanDict = {}; //mac is the key
var scanSuccess = null; //call this when scan is done
var scanFail = null; //call this when the scan failed


/**
 * initiates a scan
 * get fingerprint every second and combine all results over a period of time
 * call cb with the final result when done
 */
function startScan(timeToRun){
    if(runningScan != null){
      stopScan();
    }
    //test
    var count = 0;
    //----

    //start scannig every interval
    runningScan = setInterval(function(){
        WiFiControl.scanForWiFiAsync()
        .then(addToScan)
        //test delete this. this thing fakes a finger print because I don't have a wifi adapter on my pc
        .catch(function(err){
            console.log("ERROR: could not scan networks");
			console.log(err);
            console.log('faking fp instead!!!!!!!!!');
            addToScan(FAKE_SCAN);
        });
        //----
        
        //.catch(console.log);
        
        
        //test
        console.log(count++);
        //----
    }, TIME_BETWEEN_SCANS);

    //set default time to scan
    if(!timeToRun){
        timeToRun = DEFAULT_SCAN_TIME;
    }

    //set timeout for scan
    stopTimer = setTimeout(stopScan, timeToRun);

    return new Promise(function(resolve, reject){
      scanSuccess = resolve;
      scanFail = reject;
    });
}

/**
 * add given networks to the scan record 
 */
function addToScan(scan){
    scan.networks.forEach(function(network){
        networkEntry = scanDict[network.mac];
        //mac already exist in dict
        if(networkEntry){
            networkEntry.signal_levels.push(network.signal_level); 
        }
        //first time we encounter this mac
        else{
            scanDict[network.mac] = {
                ssid : network.ssid,
                signal_levels : [network.signal_level],
                channel : network.channel,
            }
        }
    })
}


/**
 * stops on going scan
 * either called by user or called after scan time expires
 * calls cb with the final result
 */
function stopScan(){
    if(runningScan != null){
        //clear the timeouts
        clearTimeout(stopTimer);
        clearInterval(runningScan);
        
        stopTimer = null;
        runningScan = null;

        //create a new finger print from the scan result
        var newDBEntry = {};
        var foundSomeEntry = false;
        
        for (var mac in scanDict) {
            if (scanDict.hasOwnProperty(mac)) {
                var entry = scanDict[mac];
                newDBEntry[mac] = {
                    ssid : entry.ssid,
                    signal_level : arrayAvarage(entry.signal_levels),
                    channel : entry.channel,
                }
                
                foundSomeEntry = true;
            }
        }
        
        scanDict = {};
        
        //call the callback with the final result
        if(foundSomeEntry){
            scanSuccess(newDBEntry);
        }
        else{
            scanFail("there were ne successful scans");
        }
    }
}
 
 function arrayAvarage(arr) {
     var sum = 0.0;
     arr.forEach(function(element){
         sum += element;
     })
     
     return sum / arr.length; 
 }
 
//============== service api ==============//
var SERVER_URI = 'http://localhost:8080/';
var UPLOAD_URI = SERVER_URI + 'rooms/'
var GET_NAME_URI = SERVER_URI + 'fingerprint/';

function uploadFingerPrint(roomName, DBEntry){
	
        var uploadOptions = {
            method: 'POST',
            uri: UPLOAD_URI + roomName,
            body: DBEntry,
            json: true,
        };
        
        return rp(uploadOptions);
}

function getCurrentRoom(){
    return WiFiControl.scanForWiFiAsync()
        .then(getRoomName)
        //test - delete this. this thing fakes a finger print because I don't have a wifi adapter on my pc
        // .catch(function(err){
		// 	console.log("ERROR: could not scan networks");
		// 	console.log(err);
        //     console.log('faking fp instead!!!!!!!!!');
        //     return getRoomName(FAKE_SCAN);
        // })
        //----
        ;
}

function getRoomName(wifiScan){    
        var getNameOptions = {
            method: 'POST',
            uri: GET_NAME_URI,
            body: wifiScan.networks,
            json: true,
        };
        
        return rp(getNameOptions);
}
 
 //scan api
 module.exports.startScan = startScan;
 module.exports.stopScan = stopScan;
 
 //online service api
 module.exports.uploadFingerPrint = uploadFingerPrint;
 module.exports.getCurrentRoom = getCurrentRoom;
 
 //delete this
var FAKE_SCAN = {
    "success":  true,
    "networks":
      [ { "mac": "AA:BB:CC:DD:EE:FF",
          "channel": "1",
          "signal_level": "-43",
          "ssid": "Home 2.4Ghz" } ],
    "msg":"Nearby WiFi APs successfully scanned (1 found)."
  };
