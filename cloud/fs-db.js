// data base from file

var fs = require('fs');


 //constructor
 function FS_DB(fileName){
      console.log("loading DB from file: " + fileName);
      if (fs.existsSync(fileName)) {
          this.dataBase = JSON.parse(fs.readFileSync(fileName, 'utf8'));
          console.log("loaded file: " + fileName + ". size: " + this.dataBase.size);
      }
      else {
          this.dataBase = createNewDB(fileName);
          console.log("file '" + fileName + "' does not exist. created new empty database");
      } 
      
      this.fileName = fileName;
 } 

function createNewDB(dbName){
 var newDB = {
     rooms : {},
     size : 0,
     name : dbName,
 }
 return newDB;
}

//add entry
FS_DB.prototype.addEntry = function(roomName, entry){
    if(!this.dataBase.rooms[roomName]){
        this.size++;
         console.log("room " + roomName + " was added to the db");
    }
    else{
        console.log("room " + roomName + " was overwritten");
    }
    this.dataBase.rooms[roomName] = entry;
    saveDBToFile(JSON.stringify(this, null, 4), this.fileName);
}
 
function saveDBToFile(db, filename){
    if(!filename){
        filename = db.name + ".json";
    }
    fs.writeFileSync(filename, db);
}

//get rooms
FS_DB.prototype.getRoomsFromFp = function(fingerPrint){
    //not really optimizing here...
    return this.dataBase.rooms;
}


 module.exports = FS_DB;