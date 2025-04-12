const mysql = require('mysql');
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'city_explorer'
});

db.connect((err) =>{
    if(err) {
        console.log('Error connecting to database');
        return;
    }
    console.log('Connected to database');
});

module.exports = db;