const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const authRoutes = require('./routes/auth');
const cityRoutes = require('./routes/cities');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

// Initialize app
const app = express();

// MySQL connection
const mysql = require('mysql');
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'city_explorer'
});

db.connect((err) => {
  if (err) {
    console.error(' Error connecting to MySQL:', err.message);
    return;
  }
  console.log(' Connected to MySQL database');
});

// Session setup
const sessionStore = new MySQLStore({}, db);

app.use(session({
  key: 'user_sid',
  secret: 'somesecretvalue',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    maxAge: 1000 * 60 * 60, 
    httpOnly: true,
    secure: false
  }
}));

// Routes
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Route handling
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRoutes);
app.use('/api/cities', cityRoutes);

// Catch 404
app.use((req, res, next) => {
  next(createError(404));
});

// Error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));

module.exports = app;
