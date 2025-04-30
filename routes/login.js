const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const pool = require('../config/db'); 
// GET /login route
router.get('/',  (req, res) => {
  console.log('GET /login accessed');
  res.render('login', {
    title: 'Login',
  });
});
// POST /login route
router.post('/',  (req, res) => {
  console.log('POST /login accessed with body:', req.body);
  const { email, password, redirectUrl } = req.body;
  if (!email || !password) {
    console.log('Validation failed: Missing email or password');
    return res.status(400).render('login', {
      title: 'Login',
      error: 'Email and password are required',
      csrfToken: req.csrfToken(),
      redirectUrl
    });
  }
  pool.query('SELECT id, username, email, password, isAdmin FROM users WHERE email = ?', [email], async (error, results) => {
    if (error) {
      console.error('Database error during login:', error);
      return res.status(500).render('login', {
        title: 'Login',
        error: 'Database error',
        csrfToken: req.csrfToken(),
        redirectUrl
      });
    }
    console.log('User query result:', results);
    if (results.length === 0) {
      console.log('No user found with this email.');
      return res.status(401).render('login', {
        title: 'Login',
        error: 'Invalid email or password',
        csrfToken: req.csrfToken(),
        redirectUrl
      });
    }
    const user = results[0];
    try {
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        console.log('Password mismatch for user:', user.email);
        return res.status(401).render('login', {
          title: 'Login',
          error: 'Invalid email or password',
          csrfToken: req.csrfToken(),
          redirectUrl
        });
      }
      console.log('Password matched. Regenerating session for user:', user.email);
      req.session.regenerate((err) => {
        if (err) {
          console.error('Session regeneration error:', err);
          return res.status(500).render('login', {
            title: 'Login',
            error: 'Session error',
            csrfToken: req.csrfToken(),
            redirectUrl
          });
        }
        req.session.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin || false
        };
        console.log('Session set. Redirecting...');
        res.redirect(redirectUrl || '/user_dashboard');
      });
    } catch (err) {
      console.error('Bcrypt comparison error:', err);
      return res.status(500).render('login', {
        title: 'Login',
        error: 'Server error during login',
        csrfToken: req.csrfToken(),
        redirectUrl
      });
    }
  });
});
module.exports = router;
