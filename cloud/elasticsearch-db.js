// data base from elastic search
var ES_USER = "elasticuser";
var ES_PASS = "1qaz2wsx#EDC$RFV";
var ES_ADDR = '10.0.0.5:9200';
var ES_HOST = ES_USER + ":" + ES_PASS + "@" + ES_HOST;
console.log("importing: elasticsearch");

var elasticsearch = require('elasticsearch');

console.log("creating ES client with address " + ES_HOST);

var client = new elasticsearch.Client({
    host: ES_HOST
});

console.log("client created successfully");

//default parameters for db indicies.mapping for mac-name pair 
var DB_INDEX_DEFAULTS = {
    mappings : {
        'name-mac-pair' : {
            properties : {
                "ssid"          : { "type" : "string"},
                "signal_level"  : { "type" : "double"},
                "channel"       : { "type" : "integer"},
                "room_name"     : { "type" : "string"},
                "mac"           : { "type" : "string", "index" : "not_analyzed" },
            }
        }
    }
}

 //constructor
function ES_DB(indexName){
    this.indexName = indexName;
    
    //create the index with correct mapping if it does not exist
    client.indices.exists({index : indexName})
        .then(function(exists){
            if(!exists){
                client.indices.create({
                    index : indexName,
                    body : DB_INDEX_DEFAULTS
                })//test
                .then(console.log);
                //----
                
                console.log("creating new index: " + indexName);
            }
            else {
                console.log("loaded existing index: " + indexName);
            } 
        });
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
            
            bulkBody.push(bulkPostCommand);
            bulkBody.push(newPair);
        }
    }
    
    var promise = client.bulk({
       body : bulkBody 
    })
    //test
    .then(console.log)
    .catch(console.log)
    //----
    ;
    
    return promise;
}

//get rooms
ES_DB.prototype.getRoomsFromFp = function(fingerPrint){
    //prepare all the macs for the request
    var macs = [];
    fingerPrint.forEach(function(network){
        macs.push(network.mac)
    });
    
    //query all the pairs that contains 
    return client.search({
        index: this.indexName,
        type : "name-mac-pair",
        body : {
            "query": {
                "constant_score" : {
                    "filter" : {
                        "terms" : { "mac" : macs}
                    }
                }
            }
        }
    // parse the query results
    }).then(function(searchResults){
        //test
        console.log(searchResults);
        //----
        
        //group results by room
        var rooms = {};
        searchResults.hits.hits.forEach(function(macRoomPair){
            var mac =  macRoomPair._source.mac;
            var name = macRoomPair._source.room_name;
            var newEntry = {
                'ssid' : macRoomPair._source.ssid,
                'signal_level' : macRoomPair._source.signal_level,
                'channel' : macRoomPair._source.channel,
            };
            rooms[name] = {};
            rooms[name][mac] = newEntry;
        });
        
        return rooms;
    });
}


 module.exports = ES_DB;
