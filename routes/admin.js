const express = require('express');
const router = express.Router();
const db = require('../db');
const  { isAdmin } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// view all users
router.get('/users', isAdmin, ( req, res)=>{
    db.query('SELECT id,username, role FROM users', (err, results) =>{
        if(err) return res.status(500).send(err);
        res.render('admin/users',{users:results});
    });
});

//add user
router.post('/users/add', isAdmin, async (req, res) => {
    const {username, password, role} = req.body;
    const hashed = await bcrypt.hash(password, 10);
    db.query(`INSERT INTO users (username, password, role) VALUES (?, ?,?)`,
        [username, hashed, role], err=>{
            if(err) return res.status(500).send(err);
            res.redirect('/admin/users');
        });
});

// Update user 

router.post('/users/delete/:id', isAdmin, (req, res)=>{
    db.query(`DELETE FROM users WHERE id =?`, [req.params.id], err => {
        if(err) return res.status(500).send(err);
        res.redirect('/admin/users');
    });
});

module.exports = router;