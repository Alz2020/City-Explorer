const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const { isAuthenticatedAdmin } = require('../middleware/auth');
const SALT_ROUNDS = 10;
router.get('/', isAuthenticatedAdmin, (req, res) => {
  console.log('GET /admin accessed');
  pool.query('SELECT id, username, email, isAdmin FROM users', (err, users) => {
    if (err) {
      console.error('Admin dashboard error:', err);
      return res.status(500).render('error', {
        message: 'Internal server error',
        error: { status: 500 }
      });
    }
    const message = req.session.message;
    delete req.session.message;
    res.render('admin', {
      title: 'Admin Panel',
      user: req.session.user,
      users,
      message
    });
  });
});
router.post('/create', isAuthenticatedAdmin, (req, res) => {
  console.log('POST /admin/create accessed with body:', req.body);
  const { username, email, password, isAdmin: isAdminCheckbox } = req.body;
  if (!username || username.length < 3 || username.length > 50) {
    req.session.message = { type: 'error', text: 'Username must be between 3 and 50 characters' };
    return res.redirect('/admin');
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    req.session.message = { type: 'error', text: 'Invalid email format' };
    return res.redirect('/admin');
  }
  if (!password || password.length < 8) {
    req.session.message = { type: 'error', text: 'Password must be at least 8 characters' };
    return res.redirect('/admin');
  }
  pool.query('SELECT id FROM users WHERE email = ?', [email], (err, existingUser) => {
    if (err) {
      console.error('Create user error:', err);
      req.session.message = { type: 'error', text: 'Error creating user' };
      return res.redirect('/admin');
    }
    if (existingUser.length > 0) {
      req.session.message = { type: 'error', text: 'Email already registered' };
      return res.redirect('/admin');
    }
    // Hash password and create user
    bcrypt.hash(password, SALT_ROUNDS, (err, hashedPassword) => {
      if (err) {
        console.error('Password hash error:', err);
        req.session.message = { type: 'error', text: 'Error creating user' };
        return res.redirect('/admin');
      }
      const adminFlag = isAdminCheckbox === 'on' ? 1 : 0;
      pool.query(
        'INSERT INTO users (username, email, password, isAdmin) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, adminFlag],
        (err) => {
          if (err) {
            console.error('Create user error:', err);
            req.session.message = { type: 'error', text: 'Error creating user' };
            return res.redirect('/admin');
          }
          req.session.message = { type: 'success', text: 'User created successfully!' };
          res.redirect('/admin');
        }
      );
    });
  });
});
//  Edit User 
router.get('/edit/:id', isAuthenticatedAdmin, (req, res) => {
  console.log('GET /admin/edit/:id accessed with id:', req.params.id);
  const userId = parseInt(req.params.id);
  pool.query('SELECT id, username, email, isAdmin FROM users WHERE id = ?', [userId], (err, results) => {
    if (err) {
      console.error('Edit user fetch error:', err);
      return res.status(500).render('error', {
        message: 'Error retrieving user',
        error: { status: 500 }
      });
    }
    if (results.length === 0) {
      return res.status(404).render('error', {
        message: 'User not found',
        error: { status: 404 }
      });
    }
    res.render('editUser', {
      title: 'Edit User',
      user: results[0],
      currentUser: req.session.user,
      error: req.session.message && req.session.message.type === 'error' ? req.session.message.text : null
    });
    delete req.session.message;
  });
});
// Handle Edit User
router.post('/edit/:id', isAuthenticatedAdmin, (req, res) => {
  console.log('POST /admin/edit/:id accessed with id:', req.params.id, 'body:', req.body);
  const userId = parseInt(req.params.id);
  const { username, email, isAdmin: isAdminCheckbox, password } = req.body;
  // Input validation
  if (!username || username.length < 3 || username.length > 50) {
    req.session.message = { type: 'error', text: 'Username must be between 3 and 50 characters' };
    return res.redirect(`/admin/edit/${userId}`);
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    req.session.message = { type: 'error', text: 'Invalid email format' };
    return res.redirect(`/admin/edit/${userId}`);
  }
  // Check if email is taken by another user
  pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId], (err, existingUser) => {
    if (err) {
      console.error('Edit user error:', err);
      req.session.message = { type: 'error', text: 'Error updating user' };
      return res.redirect(`/admin/edit/${userId}`);
    }
    if (existingUser.length > 0) {
      req.session.message = { type: 'error', text: 'Email already registered by another user' };
      return res.redirect(`/admin/edit/${userId}`);
    }
    const adminFlag = isAdminCheckbox === 'on' ? 1 : 0;
    // Prevent last admin from losing admin status
    if (req.session.user.id === userId && adminFlag === 0) {
      pool.query('SELECT COUNT(*) as count FROM users WHERE isAdmin = 1', (err, countResult) => {
        if (err) {
          console.error('Edit user error:', err);
          req.session.message = { type: 'error', text: 'Error updating user' };
          return res.redirect(`/admin/edit/${userId}`);
        }
        if (countResult[0].count === 1) {
          req.session.message = { type: 'error', text: 'Cannot remove admin status from the last administrator' };
          return res.redirect(`/admin/edit/${userId}`);
        }
        updateUser();
      });
    } else {
      updateUser();
    }
    function updateUser() {
      let query = 'UPDATE users SET username = ?, email = ?, isAdmin = ?';
      let params = [username, email, adminFlag];
      if (password && password.length >= 8) {
        bcrypt.hash(password, SALT_ROUNDS, (err, hashedPassword) => {
          if (err) {
            console.error('Password hash error:', err);
            req.session.message = { type: 'error', text: 'Error updating user' };
            return res.redirect(`/admin/edit/${userId}`);
          }
          query += ', password = ?';
          params.push(hashedPassword);
          executeUpdate();
        });
      } else if (password && password.length > 0) {
        req.session.message = { type: 'error', text: 'Password must be at least 8 characters' };
        return res.redirect(`/admin/edit/${userId}`);
      } else {
        executeUpdate();
      }
      function executeUpdate() {
        query += ' WHERE id = ?';
        params.push(userId);
        pool.query(query, params, (err, result) => {
          if (err) {
            console.error('Edit user error:', err);
            req.session.message = { type: 'error', text: 'Error updating user' };
            return res.redirect(`/admin/edit/${userId}`);
          }
          if (result.affectedRows === 0) {
            req.session.message = { type: 'error', text: 'User not found' };
            return res.redirect(`/admin/edit/${userId}`);
          }
          req.session.message = { type: 'success', text: 'User updated successfully!' };
          res.redirect('/admin');
        });
      }
    }
  });
});
router.post('/delete/:id', isAuthenticatedAdmin, (req, res) => {
  console.log('POST /admin/delete/:id accessed with id:', req.params.id);
  const userId = parseInt(req.params.id);
  if (req.session.user.id === userId) {
    req.session.message = { type: 'error', text: 'Cannot delete your own account' };
    return res.redirect('/admin');
  }
  pool.query('DELETE FROM users WHERE id = ?', [userId], (err, result) => {
    if (err) {
      console.error('Delete user error:', err);
      req.session.message = { type: 'error', text: 'Error deleting user' };
      return res.redirect('/admin');
    }
    if (result.affectedRows === 0) {
      req.session.message = { type: 'error', text: 'User not found' };
      return res.redirect('/admin');
    }
    req.session.message = { type: 'success', text: 'User deleted successfully!' };
    res.redirect('/admin');
  });
});
module.exports = router;