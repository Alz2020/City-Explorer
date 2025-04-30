const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const csurf = require('csurf');
require('dotenv').config();

const app = express();

// Routers
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const loginRouter = require('./routes/login');
const signupRouter = require('./routes/signup');
const logoutRouter = require('./routes/logout');
const userDashboardRouter = require('./routes/user_dashboard');
const cityApiRouter = require('./routes/cityApi');
const citiesRouter = require('./routes/cities');
const createUserRouter = require('./routes/createUser');

const { isAuthenticated, isAdmin } = require('./middleware/auth');

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || '',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 1000 * 60 * 60
  }
}));



app.use((req, res, next) => {
  if (!req.session.user && process.env.NODE_ENV !== 'production') {
    req.session.user = {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      isAdmin: true
    };
  }
  next();
});

// Direct logout route
app.get('/logout', (req, res) => {
  console.log('Direct logout route accessed');
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

// Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/login', loginRouter);
app.use('/signup', signupRouter);
app.use('/user_dashboard', userDashboardRouter);
app.use('/cityApi', cityApiRouter);
app.use('/cities', citiesRouter);
app.use('/createUser', createUserRouter);
app.use('/admin', isAuthenticated, isAdmin, adminRouter);

// 404 Handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error Handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  
  if (err.code === 'EBADCSRFTOKEN') {
    console.error('CSRF token error:', err);
    res.status(403).render('login', {
      title: 'Login',
      error: 'Invalid CSRF token. Please try again.',
      csrfToken: req.csrfToken()
    });
  } else {
    console.error('Server error:', err);
    res.status(err.status || 500).render('error', {
      message: err.message,
      error: err
    });
  }
});

module.exports = app;