// data base from file

var fs = require('fs');
var Promise = require("bluebird");
Promise.promisifyAll(fs);
var DB_PATH = "databases/"

 //constructor
 function FS_DB(fileName){
     this.filePath = DB_PATH + fileName;
      console.log("loading DB from file: " + fileName);
      if (fs.existsSync(this.filePath)) {
          this.dataBase = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
          console.log("loaded file: " + fileName + ". size: " + this.dataBase.size);
      }
      else {
          this.dataBase = createNewDB(fileName);
          saveDBToFileAsync(this);
          console.log("file '" + fileName + "' does not exist. created new empty database");
      } 
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
        this.dataBase.size++;
         console.log("room " + roomName + " was added to the db");
    }
    else{
        console.log("room " + roomName + " was overwritten");
    }
    this.dataBase.rooms[roomName] = entry;
    return saveDBToFileAsync(this);
}
 
function saveDBToFileAsync(db){
    if(!db.filePath){
        db.filePath = DB_PATH + db.dataBase.name;
    }
    return fs.writeFileAsync(db.filePath, JSON.stringify(db.dataBase, db, 4));
}

//get rooms
FS_DB.prototype.getRoomsFromFp = function(fingerPrint){
    //not really optimizing here...
    return Promise.resolve(this.dataBase.rooms);
}


 module.exports = FS_DB;