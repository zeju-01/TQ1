const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('data/inventory.db');

db.all("SELECT name, sql FROM sqlite_master WHERE type='table' AND name='inventory'", (err, rows) => {
  if (err) {
    console.error(err);
  } else {
    console.log(rows[0].sql);
  }
  db.close();
});