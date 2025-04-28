
const User = require('../models/User');  
const bcrypt = require('bcrypt');

module.exports = {
    // GET LOGIN
    getLogin: (req, res) => {
        res.render('auth/login', {
            error: null,
            username: ''
        });
    },

    // POST LOGIN
    postLogin: async (req, res) => {
        const { username, password } = req.body;

        try {
            const user = await User.findOne({ username });

            if (!user) {
                return res.render('auth/login', {
                    error: 'Invalid username or password',
                    username
                });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            
            if (!isMatch) {
                return res.render('auth/login', {
                    error: 'Invalid username or password',
                    username
                });
            }

            req.session.user = {
                id: user._id,
                username: user.username
            };

            res.redirect('/books');

        } catch (err) {
            console.error('Login error:', err);
            res.render('auth/login', {
                error: 'Login failed. Please try again.',
                username
            });
        }
    },

    // GET REGISTER
    getRegister: (req, res) => {
        res.render('auth/register', {
            error: null,
            username: ''
        });
    },

    // POST REGISTER
    postRegister: async (req, res) => {
        const { username, password, confirmPassword } = req.body;

        try {
            if (password !== confirmPassword) {
                return res.render('auth/register', {
                    error: 'Passwords do not match',
                    username
                });
            }

            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.render('auth/register', {
                    error: 'Username already exists',
                    username
                });
            }

            const user = new User({ username, password });
            await user.save();

            req.session.user = {
                id: user._id,
                username: user.username
            };
            res.redirect('/books');

        } catch (err) {
            console.error('Registration error:', err);
            res.render('auth/register', {
                error: 'Registration failed. Please try again.',
                username
            });
        }
    },

    // LOGOUT
    logout: (req, res) => {
        req.session.destroy(err => {
            if (err) {
                console.error('Logout error:', err);
                return res.redirect('/books');
            }
            res.clearCookie('connect.sid');
            res.redirect('/');
        });
    }
};