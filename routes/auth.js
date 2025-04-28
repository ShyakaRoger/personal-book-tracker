const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

// Login routes
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

// Register routes
router.get('/register', authController.getRegister);
router.post('/register', authController.postRegister);

// Logout route
router.post('/logout', authController.logout);

module.exports = router;