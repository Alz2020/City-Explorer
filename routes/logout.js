const express = require('express');
const router = express.Router();
router.get('/', (req, res) => {
  console.log('Logout route accessed');
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destroy error:', err);
      return res.status(500).render('error', {
        message: 'Server error',
        error: { status: 500 }
      });
    }
    res.render('logout', {
      title: 'Logout'
    });
  });
});
module.exports = router;