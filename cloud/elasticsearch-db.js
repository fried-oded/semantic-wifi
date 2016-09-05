// data base from elastic search
var ES_HOST = 'localhost:9200';
var elasticsearch = require('elasticsearch');


var client = new elasticsearch.Client({
  host: 'localhost:9200'
});

// var client = new elasticsearch.Client({
//   host: ES_HOST
// });

 //constructor
 function ES_DB(indexName){
     this.indexName = indexName;
}


var ENDTRY_TYPE_NAME = "name-mac-pair"
//add entry
ES_DB.prototype.addEntry = function(roomName, entry){
    //TODO first delete all previously stored entries for this room
    var bulkPostCommand = { index : { _index: this.indexName, _type: ENDTRY_TYPE_NAME } }
            
    var bulkBody = []; 
    for (var mac in entry) {
        if (entry.hasOwnProperty(mac)) {
            var newPair = entry[mac];
            newPair.mac = mac;
            newPair.room_name = roomName;
            
            newPairs.push(bulkPostCommand);
            newPairs.push(newPair);
        }
    }
    
    client.bulk({
       body : bulkBody 
    })
    //test
    .then(consol.log)
    .catch(consol.log)
    //----
    ;
}

//get rooms
ES_DB.prototype.getRoomsFromFp = function(fingerPrint){
    //not really optimizing here...
    return this.dataBase.rooms;
}


 module.exports = ES_DB;