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
                username: user.username,
                email: user.email
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
            username: '',
            email: ''
        });
    },

    // POST REGISTER
    postRegister: async (req, res) => {
        const { username, email, password, confirmPassword } = req.body;

        try {
            // Validation
            if (!email) {
                return res.render('auth/register', {
                    error: 'Email is required',
                    username,
                    email
                });
            }

            if (password !== confirmPassword) {
                return res.render('auth/register', {
                    error: 'Passwords do not match',
                    username,
                    email
                });
            }

            // Check for existing username or email
            const existingUser = await User.findOne({ $or: [{ username }, { email }] });
            if (existingUser) {
                let error = 'Username already exists';
                if (existingUser.email === email) {
                    error = 'Email already exists';
                }
                return res.render('auth/register', {
                    error,
                    username,
                    email
                });
            }

            const user = new User({ username, email, password });
            await user.save();

            req.session.user = {
                id: user._id,
                username: user.username,
                email: user.email
            };
            res.redirect('/books');

        } catch (err) {
            console.error('Registration error:', err);
            let errorMessage = 'Registration failed. Please try again.';
            
            if (err.code === 11000) {
                errorMessage = 'Email already exists';
            }

            res.render('auth/register', {
                error: errorMessage,
                username,
                email
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