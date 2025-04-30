const express = require('express');
const router = express.Router();
const db = require('../config/db');
router.get('/register', (req, res) => {
    res.render('register', { title: 'Register' });
});
router.post('/register', async (req, res) => {
    res.redirect('/login');
});
router.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});
router.post('/login', async (req, res) => {
    // Placeholder for login logic
    res.redirect('/');
});
module.exports = router;