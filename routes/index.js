const express = require('express');
const router = express.Router();
const cityModel = require('../models/cityModel');
const db = require('../config/db')
// Define your cities array
const cities = [
  { name: "Tokyo", img: "tokyo.jpg" },
  { name: "Chicago", img: "chicago.jpg" },
  { name: "Sydney", img: "sydney.jpg" },
  { name: "Paris", img: "paris.jpg" },
  { name: "Singapore", img: "singapore.jpg" },
  { name: "Barcelona", img: "barcelona.jpg" },
  { name: "Bangkok", img: "bangkok.jpg" },
  { name: "Amsterdam", img: "amsterdam.jpg" }
];
router.get('/', async (req, res) => {
  res.render('index', { title: 'Home', cities }); 
});
// READ
router.get('/', async (req, res) => {
  const cities = await cityModel.getAll();
  const message = req.query.message;
  res.render('index', { cities,message });
});
// Add/save
router.post('/add', async (req, res) => {
  const { name, img, country, population, flag, unicode_flag, dial_code } = req.body;
  await cityModel.create({ name, img, country, population, flag, unicode_flag, dial_code });
  res.redirect('/?message=City+saved+successfully');
});
// UPDATE
router.post('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { name, img, country, population, flag, unicode_flag, dial_code } = req.body;
  await cityModel.update(id, { name, img, country, population, flag, unicode_flag, dial_code });
  res.redirect('/?message=City+updated+successfully');
});
// DELETE
router.post('/delete/:id', async (req, res) => {
  const { id } = req.params;
  await cityModel.delete(id);
  res.redirect('/?message=City+deleted+successfully');
});
// API routes
router.post('/api/cities', async (req, res) => {
  const { city, country, img, population, flag, unicodeFlag, dialCode } = req.body;
  try {
    const mysql = require('../config/db');
    const sql = `
      INSERT INTO cities (name, country, population, flag, unicode_flag, dial_code)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await mysql.query(sql, [city, country, img, population, flag, unicodeFlag, dialCode]);
    res.status(201).json({ message: "City saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});
module.exports = router;