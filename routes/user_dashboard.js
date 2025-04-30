const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { isAuthenticated } = require('../middleware/auth');
router.get('/', isAuthenticated, (req, res) => {
  console.log('GET /user_dashboard accessed');
  pool.query('SELECT * FROM cities ORDER BY name LIMIT 50', (err, cities) => {
    if (err) {
      console.error('Error fetching cities:', err);
      return res.status(500).render('error', {
        message: 'Server error: ' + err.message,
        error: { status: 500 }
      });
    }
    res.render('user_dashboard', {
      title: 'User Dashboard',
      user: req.session.user,
      cities
    });
  });
});
router.get('/cities/search', isAuthenticated, (req, res) => {
  console.log('GET /user_dashboard/cities/search accessed with query:', req.query);
  const { q = '', page = 1 } = req.query;
  const limit = 10;
  const offset = (page - 1) * limit;
  const searchTerm = `%${q}%`;
  pool.query(
    'SELECT id, name FROM cities WHERE name LIKE ? ORDER BY name LIMIT ? OFFSET ?',
    [searchTerm, limit, offset],
    (err, cities) => {
      if (err) {
        console.error('Error searching cities:', err);
        return res.status(500).json({ error: 'Server error: ' + err.message });
      }
      pool.query(
        'SELECT COUNT(*) as count FROM cities WHERE name LIKE ?',
        [searchTerm],
        (err, countResult) => {
          if (err) {
            console.error('Error counting cities:', err);
            return res.status(500).json({ error: 'Server error: ' + err.message });
          }
          const total = countResult[0].count;
          res.json({
            cities,
            more: offset + limit < total
          });
        }
      );
    }
  );
});
router.get('/city/:id', isAuthenticated, (req, res) => {
  console.log('GET /user_dashboard/city/:id accessed with id:', req.params.id);
  const { id } = req.params;
  pool.query('SELECT * FROM cities WHERE id = ?', [id], (err, cities) => {
    if (err) {
      console.error('Error fetching city:', err);
      return res.status(500).json({ error: 'Server error: ' + err.message });
    }
    if (!cities || cities.length === 0) {
      console.log('City not found:', id);
      return res.status(404).json({ error: 'City not found' });
    }
    res.json(cities[0]);
  });
});
module.exports = router;