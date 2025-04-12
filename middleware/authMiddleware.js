const jwt = require('jsonwebtoken');
require('dotenv').config();

function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) return next();
    return res.redirect('/auth/login');
}
  
function isAdmin(req, res, next) {
    if (req.session && req.session.userRole === 'admin') return next();
    return res.status(403).send('Forbidden: Admins only');
}
module.exports = { isAuthenticated, isAdmin }; 