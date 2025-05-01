const express = require('express');
const router = express.Router();
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
module.exports = router;
