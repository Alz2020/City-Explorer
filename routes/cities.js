const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { isAuthenticated } = require('../middleware/auth');
// GET: List all cities
router.get('/', isAuthenticated, (req, res) => {
  console.log('GET /cities accessed');
  pool.query('SELECT * FROM cities ORDER BY name', (err, cities) => {
    if (err) {
      console.error('Error fetching cities:', err);
      return res.status(500).render('error', {
        message: 'Server error: ' + err.message,
        error: { status: 500 }
      });
    }
    res.render('cities/index', {
      title: 'Manage Cities',
      cities,
      user: req.session.user
    });
  });
});
router.get('/create', isAuthenticated, (req, res) => {
  console.log('GET /cities/create accessed');
  res.render('cities/create', {
    title: 'Create City',
    user: req.session.user,
    error: null
  });
});
router.post('/create', isAuthenticated, (req, res) => {
  console.log('POST /cities/create accessed with body:', req.body);
  const { name, country, population, flag, unicode_flag, dial_code, lat, lng } = req.body;
  if (!name || !country) {
    console.log('Validation failed: Missing required fields');
    return res.status(400).render('cities/create', {
      title: 'Create City',
      error: 'Name and country are required',
      user: req.session.user
    });
  }
  if (population && (isNaN(population) || population < 0)) {
    console.log('Validation failed: Invalid population');
    return res.status(400).render('cities/create', {
      title: 'Create City',
      error: 'Population must be a positive number',
      user: req.session.user
    });
  }
  if (lat && isNaN(lat)) {
    console.log('Validation failed: Invalid latitude');
    return res.status(400).render('cities/create', {
      title: 'Create City',
      error: 'Latitude must be a number',
      user: req.session.user
    });
  }
  if (lng && isNaN(lng)) {
    console.log('Validation failed: Invalid longitude');
    return res.status(400).render('cities/create', {
      title: 'Create City',
      error: 'Longitude must be a number',
      user: req.session.user
    });
  }
  pool.query(
    'INSERT INTO cities (name, country, population, flag, unicode_flag, dial_code, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [name, country, population || null, flag || null, unicode_flag || null, dial_code || null, lat || null, lng || null],
    (err, result) => {
      if (err) {
        console.error('Error creating city:', err);
        return res.status(500).render('cities/create', {
          title: 'Create City',
          error: 'Server error: ' + err.message,
          user: req.session.user
        });
      }
      console.log('City created successfully');
      res.redirect('/cities');
    }
  );
});
router.get('/edit/:id', isAuthenticated, (req, res) => {
  console.log('GET /cities/edit/:id accessed with id:', req.params.id);
  const { id } = req.params;
  pool.query('SELECT * FROM cities WHERE id = ?', [id], (err, cities) => {
    if (err) {
      console.error('Error fetching city:', err);
      return res.status(500).render('error', {
        message: 'Server error: ' + err.message,
        error: { status: 500 }
      });
    }
    if (!cities || cities.length === 0) {
      console.log('City not found:', id);
      return res.status(404).render('error', {
        message: 'City not found',
        error: { status: 404 }
      });
    }
    res.render('cities/edit', {
      title: 'Edit City',
      city: cities[0],
      user: req.session.user,
      error: null
    });
  });
});
router.post('/edit/:id', isAuthenticated, (req, res) => {
  console.log('POST /cities/edit/:id accessed with id:', req.params.id, 'body:', req.body);
  const { id } = req.params;
  const { name, country, population, flag, unicode_flag, dial_code, lat, lng } = req.body;
  if (!name || !country) {
    console.log('Validation failed: Missing required fields');
    return res.status(400).render('cities/edit', {
      title: 'Edit City',
      city: { id, name, country, population, flag, unicode_flag, dial_code, lat, lng },
      error: 'Name and country are required',
      user: req.session.user
    });
  }
  if (population && (isNaN(population) || population < 0)) {
    console.log('Validation failed: Invalid population');
    return res.status(400).render('cities/edit', {
      title: 'Edit City',
      city: { id, name, country, population, flag, unicode_flag, dial_code, lat, lng },
      error: 'Population must be a positive number',
      user: req.session.user
    });
  }
  if (lat && isNaN(lat)) {
    console.log('Validation failed: Invalid latitude');
    return res.status(400).render('cities/edit', {
      title: 'Edit City',
      city: { id, name, country, population, flag, unicode_flag, dial_code, lat, lng },
      error: 'Latitude must be a number',
      user: req.session.user
    });
  }
  if (lng && isNaN(lng)) {
    console.log('Validation failed: Invalid longitude');
    return res.status(400).render('cities/edit', {
      title: 'Edit City',
      city: { id, name, country, population, flag, unicode_flag, dial_code, lat, lng },
      error: 'Longitude must be a number',
      user: req.session.user
    });
  }
  pool.query(
    'UPDATE cities SET name = ?, country = ?, population = ?, flag = ?, unicode_flag = ?, dial_code = ?, lat = ?, lng = ? WHERE id = ?',
    [name, country, population || null, flag || null, unicode_flag || null, dial_code || null, lat || null, lng || null, id],
    (err, result) => {
      if (err) {
        console.error('Error updating city:', err);
        return res.status(500).render('cities/edit', {
          title: 'Edit City',
          city: { id, name, country, population, flag, unicode_flag, dial_code, lat, lng },
          error: 'Server error: ' + err.message,
          user: req.session.user
        });
      }
      if (result.affectedRows === 0) {
        console.log('City not found:', id);
        return res.status(404).render('error', {
          message: 'City not found',
          error: { status: 404 }
        });
      }
      console.log('City updated successfully');
      res.redirect('/cities');
    }
  );
});
router.post('/delete/:id', isAuthenticated, (req, res) => {
  console.log('POST /cities/delete/:id accessed with id:', req.params.id);
  const { id } = req.params;
  pool.query('DELETE FROM cities WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error deleting city:', err);
      return res.status(500).render('error', {
        message: 'Server error: ' + err.message,
        error: { status: 500 }
      });
    }
    if (result.affectedRows === 0) {
      console.log('City not found:', id);
      return res.status(404).render('error', {
        message: 'City not found',
        error: { status: 404 }
      });
    }
    console.log('City deleted successfully');
    res.redirect('/cities');
  });
});
module.exports = router;