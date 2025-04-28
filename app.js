const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const passUserToView = require('./middleware/passUserToView');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 3000;

// Database connection to MongoDB
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('connected', () => {
  console.log(`Connected to ${mongoose.connection.name}`);
});
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passUserToView);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressLayouts);
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main');

// Local variables middleware
app.use((req, res, next) => {
  res.locals.title = 'Book Tracker';
  res.locals.currentUser = req.session.user || null;
  next();
});

// Routes
const authRouter = require('./routes/auth');
const bookRouter = require('./routes/books');

app.get('/', (req, res) => {
  res.render('home', {
    title: 'Book Tracker Home',
    currentUser: req.session.user
  });
});

app.use('/auth', authRouter);
app.use('/books', bookRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

// 500 Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).render('error', {
    title: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`app running on port ${PORT}`);
});
