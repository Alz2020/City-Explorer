const express = require('express');
const router = express.Router();
const db = require('../config/db');
router.get('/createUser', (req, res) => {
    res.render('createUser', { title: 'Create User' });
});
router.post('/createUser', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        await db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password]);
        res.redirect('/users/login');
    } catch (err) {
        console.error(err);
        res.redirect('/createUser');
    }
});
module.exports = router;