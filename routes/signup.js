const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const pool = require('../config/db');
function query(sql, params) {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (err, results, fields) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}
router.get('/', (req, res) => {
  console.log('GET /signup accessed');
  res.render('signup', {
    title: 'Sign Up',
    error: null
  });
});
router.post('/', async (req, res) => {
  console.log('POST /signup accessed with body:', req.body);
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    console.log('Validation failed: Missing required fields');
    return res.status(400).render('signup', {
      title: 'Sign Up',
      error: 'All fields are required',
      csrfToken: req.csrfToken()
    });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.log('Validation failed: Invalid email format');
    return res.status(400).render('signup', {
      title: 'Sign Up',
      error: 'Invalid email format',
      csrfToken: req.csrfToken()
    });
  }
  if (password.length < 8) {
    console.log('Validation failed: Password too short');
    return res.status(400).render('signup', {
      title: 'Sign Up',
      error: 'Password must be at least 8 characters long',
      csrfToken: req.csrfToken()
    });
  }
  if (username.length < 3) {
    console.log('Validation failed: Username too short');
    return res.status(400).render('signup', {
      title: 'Sign Up',
      error: 'Username must be at least 3 characters long',
      csrfToken: req.csrfToken()
    });
  }
  try {
    console.log('Checking for existing user with email:', email);
    const existingUsers = await query('SELECT id FROM users WHERE email = ?', [email]);
    console.log('Existing user query result:', existingUsers);
    if (existingUsers.length > 0) {
      console.log('User already exists with email:', email);
      return res.status(400).render('signup', {
        title: 'Sign Up',
        error: 'Email already registered',
        csrfToken: req.csrfToken()
      });
    }
    // Hash password
    console.log('Hashing password');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');
    // Insert new user
    console.log('Inserting new user');
    const insertResult = await query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    console.log('User inserted, ID:', insertResult.insertId);
    //  session
    console.log('Regenerating session for new user');
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regeneration error:', err);
        return res.status(500).render('signup', {
          title: 'Sign Up',
          error: 'Server error during session setup',
          csrfToken: req.csrfToken()
        });
      }
      req.session.user = {
        id: insertResult.insertId,
        username,
        email,
        isAdmin: false
      };
      console.log('Session set, redirecting to /user_dashboard');
      res.redirect('/user_dashboard');
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).render('signup', {
      title: 'Sign Up',
      error: 'Server error: ' + err.message,
      csrfToken: req.csrfToken()
    });
  }
});
module.exports = router;
