module.exports = {  
  init: (db) => {
db.createModel("AngelSquad"); 
db.connect();
db.on("ready", async () => console.log("Database Bağlantısı Başlatıldı.."));
  } 
};