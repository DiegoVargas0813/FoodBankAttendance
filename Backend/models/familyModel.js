const db = require('../connection'); // Your DB connection

//Family model, handles all DB interactions with users beneficiaries.
//Family in this context can even be a single person, so we use this table to store all beneficiaries of aid.
exports.createFamilyForUser = (idusers, household_size = null, notes = null) => {
    return new Promise((resolve, reject) => {
        if (!idusers) {
            return reject(new Error('Missing required field: idusers'));
        }

        db.query('INSERT INTO families (idusers, household_size, notes) VALUES (?,?,?)',
            [idusers, household_size, notes], (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
    });
};