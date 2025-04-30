const isAuthenticated = (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).redirect('/login');
    }
        try {
      if (!req.session.user.id || !req.session.user.username) {
        throw new Error('Invalid session data');
      }
      return next();
    } catch (error) {
      console.error('Authentication error:', error);
      req.session.destroy(() => {
        return res.status(401).redirect('/login');
      });
    }
  };  
  const isAdmin = (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).redirect('/login');
    }
    try {
      const isAdminUser = req.session.user.isAdmin === 1 || 
                          req.session.user.is_admin === 1;
      if (!isAdminUser) {
        return res.status(403).render('error', {
          message: 'Access denied: Administrator privileges required',
          status: 403
        });
      }
      return next();
    } catch (error) {
      console.error('Admin authorization error:', error);
      return res.status(403).render('error', {
        message: 'Authorization error occurred',
        status: 403
      });
    }
  };
  const isAuthenticatedAdmin = [isAuthenticated, isAdmin];
  module.exports = {
    isAuthenticated,
    isAdmin,
    isAuthenticatedAdmin
  };