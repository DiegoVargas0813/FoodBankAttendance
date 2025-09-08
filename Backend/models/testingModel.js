const db = require('../connection'); // Your DB connection

exports.fetchTestData = () => {
  return new Promise((resolve, reject) => {
    console.log("Fetching test data from DB");
    db.query('SELECT * FROM testing', (err, rows) => {
      if (err) {
        console.error("DB error:", err);
        return reject(err);
      }
      resolve(rows);
    });
  });
};