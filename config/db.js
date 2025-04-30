const mysql = require('mysql');
const util = require('util');
require('dotenv').config();
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});
pool.query = util.promisify(pool.query).bind(pool);
pool.getConnection((err, connection) => {
    if (err) {
        console.error('MySQL connection failed:', err.message);
    } else {
        console.log(' MySQL connected successfully!');
        connection.release();
    }
});
module.exports = pool;