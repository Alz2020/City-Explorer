const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
require('dotenv').config();

const router = express.Router();

// Register 
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashed = await bcrypt.hash(password, 10);

        db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashed], (err) => {
            if (err) return res.status(500).json({ error: err });
            res.status(201).json({ message: 'User registered' });
        });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login 
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({ error: 'User not found' });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Save user info in session
        req.session.userId = user.id;
        req.session.userRole = user.role;

        // Optionally generate a token (JWT)
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: 'Logged in', token });
    });
});

// Logout 
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ error: 'Logout failed' });
        res.clearCookie('user_sid');
        res.json({ message: 'Logged out' });
    });
});

module.exports = router;
