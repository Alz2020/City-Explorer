const express = require('express');
const axios = require('axios');
const router = express.Router();
const pool = require('../config/db');
const { isAuthenticated } = require('../middleware/auth');
// GET: List all cities
router.get('/', isAuthenticated, (req, res) => {
  console.log('GET /cityApi accessed');
  pool.query('SELECT * FROM cities ORDER BY name', (err, cities) => {
    if (err) {
      console.error('Error fetching cities:', err);
      return res.status(500).json({ error: 'Server error: ' + err.message });
    }
    res.json(cities);
  });
});
// POST: Create a new city
router.post('/', isAuthenticated, (req, res) => {
  console.log('POST /cityApi accessed with body:', req.body);
  const { name, country, population, flag, unicode_flag, dial_code, lat, lng } = req.body;
  if (!name || !country) {
    console.log('Validation failed: Missing required fields');
    return res.status(400).json({ error: 'Name and country are required' });
  }
  if (population && (isNaN(population) || population < 0)) {
    console.log('Validation failed: Invalid population');
    return res.status(400).json({ error: 'Population must be a positive number' });
  }
  if (lat && isNaN(lat)) {
    console.log('Validation failed: Invalid latitude');
    return res.status(400).json({ error: 'Latitude must be a number' });
  }
  if (lng && isNaN(lng)) {
    console.log('Validation failed: Invalid longitude');
    return res.status(400).json({ error: 'Longitude must be a number' });
  }
  pool.query(
    'INSERT INTO cities (name, country, population, flag, unicode_flag, dial_code, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [name, country, population || null, flag || null, unicode_flag || null, dial_code || null, lat || null, lng || null],
    (err, result) => {
      if (err) {
        console.error('Error creating city:', err);
        return res.status(500).json({ error: 'Server error: ' + err.message });
      }
      res.status(201).json({ id: result.insertId, name, country, population, flag, unicode_flag, dial_code, lat, lng });
    }
  );
});
// PUT: Update a city
router.put('/:id', isAuthenticated, (req, res) => {
  console.log('PUT /cityApi/:id accessed with id:', req.params.id, 'body:', req.body);
  const { id } = req.params;
  const { name, country, population, flag, unicode_flag, dial_code, lat, lng } = req.body;
  if (!name || !country) {
    console.log('Validation failed: Missing required fields');
    return res.status(400).json({ error: 'Name and country are required' });
  }
  if (population && (isNaN(population) || population < 0)) {
    console.log('Validation failed: Invalid population');
    return res.status(400).json({ error: 'Population must be a positive number' });
  }
  if (lat && isNaN(lat)) {
    console.log('Validation failed: Invalid latitude');
    return res.status(400).json({ error: 'Latitude must be a number' });
  }
  if (lng && isNaN(lng)) {
    console.log('Validation failed: Invalid longitude');
    return res.status(400).json({ error: 'Longitude must be a number' });
  }
  pool.query(
    'UPDATE cities SET name = ?, country = ?, population = ?, flag = ?, unicode_flag = ?, dial_code = ?, lat = ?, lng = ? WHERE id = ?',
    [name, country, population || null, flag || null, unicode_flag || null, dial_code || null, lat || null, lng || null, id],
    (err, result) => {
      if (err) {
        console.error('Error updating city:', err);
        return res.status(500).json({ error: 'Server error: ' + err.message });
      }
      if (result.affectedRows === 0) {
        console.log('City not found:', id);
        return res.status(404).json({ error: 'City not found' });
      }
      res.json({ id, name, country, population, flag, unicode_flag, dial_code, lat, lng });
    }
  );
});
// DELETE: Delete a city
router.delete('/:id', isAuthenticated, (req, res) => {
  console.log('DELETE /cityApi/:id accessed with id:', req.params.id);
  const { id } = req.params;
  pool.query('DELETE FROM cities WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error deleting city:', err);
      return res.status(500).json({ error: 'Server error: ' + err.message });
    }
    if (result.affectedRows === 0) {
      console.log('City not found:', id);
      return res.status(404).json({ error: 'City not found' });
    }
    res.json({ message: 'City deleted successfully' });
  });
});
router.get('/fetch-store-data', isAuthenticated, (req, res) => {
  console.log('GET /cityApi/fetch-store-data accessed');
  Promise.all([
    axios.get('https://countriesnow.space/api/v0.1/countries/population/cities'),
    axios.get('https://countriesnow.space/api/v0.1/countries/info?returns=currency,flag,unicodeFlag,dialCode'),
    axios.get('https://countriesnow.space/api/v0.1/countries/positions')
  ])
    .then(([popRes, flagRes, posRes]) => {
      const popData = popRes.data.data;
      const flagData = flagRes.data.data;
      const posData = posRes.data.data;
      console.log('Pop data length:', popData.length);
      let insertedCount = 0;
      let skippedCount = 0;
      const processCity = (index) => {
        if (index >= popData.length) {
          console.log(`Inserted ${insertedCount} cities, skipped ${skippedCount} duplicates`);
          return res.json({
            message: `Data fetched: ${insertedCount} cities inserted, ${skippedCount} duplicates skipped.`
          });
        }
        const city = popData[index];
        const name = city.city;
        const population = city.populationCounts?.[0]?.value || null;
        const country = city.country;
        pool.query(
          'SELECT id FROM cities WHERE name = ? AND country = ?',
          [name, country],
          (err, existing) => {
            if (err) {
              console.error(`Error checking city ${name}:`, err);
              return processCity(index + 1); 
            }
            if (existing.length > 0) {
              skippedCount++;
              return processCity(index + 1); 
            }
            const flag = flagData.find(f => f.name === country);
            const pos = posData.find(p => p.name === country);
            pool.query(
              'INSERT INTO cities (name, country, population, flag, unicode_flag, dial_code, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
              [
                name,
                country,
                population,
                flag?.flag || null,
                flag?.unicodeFlag || null,
                flag?.dialCode || null,
                pos?.lat || null,
                pos?.long || null
              ],
              (err) => {
                if (err) {
                  console.error(`Error inserting ${name}:`, err);
                } else {
                  insertedCount++;
                }
                processCity(index + 1); 
              }
            );
          }
        );
      };
      processCity(0); 
    })
    .catch(err => {
      console.error('Fetch & DB Error:', err.message);
      res.status(500).json({ error: 'Failed to fetch or insert data.' });
    });
});
module.exports = router;