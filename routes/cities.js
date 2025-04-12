const express = require('express');
const db = require('../db');
const auth = require('../middleware/authMiddleware');

const router = express.Router();
router.get('/protected', auth,(req,res)=>{
    db.query('SELECT * FROM cities', (err, results) => {
        if (err) return res.status(500).json({ error: err});
        res.json(results);
    });
});

module.exports = router;  