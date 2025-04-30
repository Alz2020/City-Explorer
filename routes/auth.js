const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');
// GET login form
router.get('/login', (req, res) => {
  console.log('GET /login accessed');
  res.render('login', { error: null });
});
// POST login credentials
router.post('/login', (req, res) => {
  console.log('POST /login accessed with body:', req.body);
  const { email, password } = req.body;
  pool.query('SELECT * FROM users WHERE email = ?', [email], (err, rows) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).render('login', { error: 'Server error' });
    }
    if (rows.length > 0) {
      const user = rows[0];
      bcrypt.compare(password, user.password, (err, passwordMatch) => {
        if (err) {
          console.error('Password compare error:', err);
          return res.status(500).render('login', { error: 'Server error' });
        }
        if (passwordMatch) {
          // Store user session
          req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin
          };
          console.log('Login successful, user:', req.session.user);
          return res.redirect(user.isAdmin ? '/admin' : '/user_dashboard');
        } else {
          res.render('login', { error: 'Invalid email or password.' });
        }
      });
    } else {
      res.render('login', { error: 'Invalid email or password.' });
    }
  });
});
// Logout route
router.get('/logout', (req, res) => {
  console.log('GET /logout accessed');
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).send('Logout error');
    }
    res.redirect('/login');
  });
});
module.exports = router;