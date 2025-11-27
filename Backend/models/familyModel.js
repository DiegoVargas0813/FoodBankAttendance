const db = require('../connection'); // Your DB connection

//Family model, handles all DB interactions with users beneficiaries.
//Family in this context can even be a single person, so we use this table to store all beneficiaries of aid.
exports.createFamilyForUser = (idusers) => {
    return new Promise((resolve, reject) => {
        if (!idusers) {
            return reject(new Error('Missing required field: idusers'));
        }

        db.query('INSERT INTO families (idusers) VALUES (?)',
            [idusers], (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
    });
};

exports.insertFormJSON = (idusers, form_data) => {
    return new Promise((resolve,reject) => {
        if(!idusers || !form_data){
            return reject(new Error('Missing required fields: idusers or form_data'));
        }

        db.query('UPDATE families SET form_data = ? WHERE idusers = ?',
        [form_data, idusers], (err, result) => {
            if(err){
                return reject(err);
            }
            resolve(result);
        });
    });
};

exports.getPendingFamilies = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT f.idfamilies, f.idusers, f.status, f.form_data,
             u.username, u.email
      FROM families f
      JOIN users u ON f.idusers = u.idusers
      WHERE f.status = 'submitted' AND f.form_data IS NOT NULL
      ORDER BY f.idfamilies DESC
    `;
    db.query(sql, (err, results) => {
      if (err) return reject(err);
      // parse JSON field
      const parsed = (results || []).map(r => {
        let form_data = null;
        try { form_data = r.form_data ? JSON.parse(r.form_data) : null; } catch (e) { form_data = r.form_data; }
        return { ...r, form_data };
      });
      resolve(parsed);
    });
  });
};

exports.getApprovedFamilies = (q = '') => {
  return new Promise((resolve, reject) => {
    const like = `%${q}%`;
    const sql = `
      SELECT f.idfamilies, f.idusers, f.status, f.form_data,
             u.username, u.email
      FROM families f
      JOIN users u ON f.idusers = u.idusers
      WHERE f.status = 'approved'
        AND (u.username LIKE ? OR u.email LIKE ?)
      ORDER BY f.idfamilies DESC
    `;
    db.query(sql, [like, like], (err, results) => {
      if (err) return reject(err);
      const parsed = (results || []).map(r => {
        try { r.form_data = r.form_data ? JSON.parse(r.form_data) : null; } catch (e) { /* keep raw */ }
        return r;
      });
      resolve(parsed);
    });
  });
};

exports.getApprovedFamiliesPaged = (q = '', page = 1, pageSize = 10) => {
  return new Promise((resolve, reject) => {
    const like = `%${q}%`;
    const offset = (page - 1) * pageSize;

    const countSql = `
      SELECT COUNT(*) AS total
      FROM families f
      JOIN users u ON f.idusers = u.idusers
      WHERE f.status = 'approved'
        AND (u.username LIKE ? OR u.email LIKE ?)
    `;
    const dataSql = `
      SELECT f.idfamilies, f.idusers, f.status, f.form_data,
             u.username, u.email
      FROM families f
      JOIN users u ON f.idusers = u.idusers
      WHERE f.status = 'approved'
        AND (u.username LIKE ? OR u.email LIKE ?)
      ORDER BY f.idfamilies DESC
      LIMIT ? OFFSET ?
    `;

    db.query(countSql, [like, like], (err, countRows) => {
      if (err) return reject(err);
      const total = (countRows && countRows[0] && countRows[0].total) ? Number(countRows[0].total) : 0;
      db.query(dataSql, [like, like, pageSize, offset], (err2, results) => {
        if (err2) return reject(err2);
        const parsed = (results || []).map(r => {
          try { r.form_data = r.form_data ? JSON.parse(r.form_data) : null; } catch (e) { /* keep raw */ }
          return r;
        });
        resolve({ rows: parsed, total });
      });
    });
  });
};

exports.updateFamilyStatus = (idfamilies, status) => {
  return new Promise((resolve, reject) => {
    if (!idfamilies || !status) return reject(new Error('Missing idfamilies or status'));
    db.query('UPDATE families SET status = ? WHERE idfamilies = ?', [status, idfamilies], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

exports.getFamilyById = (idfamilies) => {
  return new Promise((resolve, reject) => {
    if (!idfamilies) return resolve(null);
    const sql = `
      SELECT f.idfamilies, f.idusers, f.status, f.form_data,
             u.username, u.email
      FROM families f
      JOIN users u ON f.idusers = u.idusers
      WHERE f.idfamilies = ? LIMIT 1
    `;
    db.query(sql, [idfamilies], (err, rows) => {
      if (err) return reject(err);
      if (!rows || rows.length === 0) return resolve(null);
      const r = rows[0];
      try { r.form_data = r.form_data ? JSON.parse(r.form_data) : null; } catch (e) { /* keep raw */ }
      resolve(r);
    });
  });
};

exports.getFamilyByUser = (idusers) => {
  return new Promise((resolve, reject) => {
    if (!idusers) return resolve(null);
    const sql = `
      SELECT f.idfamilies, f.idusers, f.status, f.form_data,
             u.username, u.email
      FROM families f
      JOIN users u ON f.idusers = u.idusers
      WHERE f.idusers = ? LIMIT 1
    `;
    db.query(sql, [idusers], (err, rows) => {
      if (err) return reject(err);
      if (!rows || rows.length === 0) return resolve(null);
      const r = rows[0];
      try { r.form_data = r.form_data ? JSON.parse(r.form_data) : null; } catch (e) { /* keep raw */ }
      resolve(r);
    });
  });
};

exports.updateFamilyStatusByUser = (idusers, status) => {
  return new Promise((resolve, reject) => {
    if (!idusers || !status) return reject(new Error('Missing idusers or status'));
    const sql = 'UPDATE families SET status = ? WHERE idusers = ?';
    db.query(sql, [status, idusers], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};