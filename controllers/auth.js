const User = require('../models/User');
const bcrypt = require('bcrypt');

module.exports = {

    // GET LOGIN - Rendering the login form
   
getLogin: (req, res) => {
        res.render('auth/login', {
            error: null,
            username: '',
            email: '' // Added email field for consistency
        });
    },

   
    // POST LOGIN - Handle login authentication pseudo code
    // 1. Extract username/email and password from request
    // 2. Find user by username or email
    // 3. If user not found → show error
    // 4. Compare passwords
    // 5. If mismatch → show error
    // 6. Set session and redirect
  
    postLogin: async (req, res) => {
      const { usernameOrEmail, password } = req.body;
  
      try {
          // 1. Find user by username OR email
          const user = await User.findOne({
              $or: [
                  { username: usernameOrEmail },
                  { email: usernameOrEmail }
              ]
          });
  
          // 2. Check if user exists
          if (!user) {
              return res.render('auth/login', {
                  error: 'Invalid credentials',
                  username: usernameOrEmail || '',
                  email: usernameOrEmail && usernameOrEmail.includes('@') ? usernameOrEmail : ''
              });
          }
  
          // 3. Compare passwords
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
              return res.render('auth/login', {
                  error: 'Incorrect credentials',
                  username: user.username,
                  email: user.email
              });
          }
  
          // 4. Set up session
          req.session.user = {
              id: user._id,
              username: user.username,
              email: user.email
          };
  
          // 5. Redirect to books page
          res.redirect('/books');
  
      } catch (err) {
          console.error('Login error:', err);
  
          const safeUsername = usernameOrEmail || '';
          const safeEmail = usernameOrEmail && usernameOrEmail.includes('@') ? usernameOrEmail : '';
  
          res.render('auth/login', {
              error: 'Login failed. Please try again.',
              username: safeUsername,
              email: safeEmail
          });
      }
  },

    // GET REGISTER - Rendering the  registration form
  
getRegister: (req, res) => {
        res.render('auth/register', { 
            error: null,
            username: '',
            email: '' // Added email field
        });
    },
    // POST REGISTER - Handle user registration Pseudo-code:
    // 1. Validate password match
    // 2. Check for existing username/email
    // 3. Hash password
    // 4. Create new user
    // 5. Set session and redirect
   
postRegister: async (req, res) => {
      const { username, email, password, confirmPassword } = req.body;
      
      try {
          // 1. Validate passwords match
          if (password !== confirmPassword) {
              return res.render('auth/register', {
                  error: 'Passwords do not match',
                  user: { username, email }
              });
          }
  
          // 2. Check if username or email exists
          const existingUser = await User.findOne({ 
              $or: [{ username }, { email }] 
          });
          
          if (existingUser) {
              const field = existingUser.username === username ? 'Username' : 'Email';
              return res.render('auth/register', {
                  error: `${field} already exists`,
                  user: { username, email }
              });
          }
  
          // 3. Hash password (default salt rounds)
          const hashedPassword = await bcrypt.hash(password, 10);
  
          // 4. Create and save new user
          const user = new User({ 
              username, 
              email,
              password: hashedPassword 
          });
          await user.save();
  
          // 5. Log user in immediately
          req.session.user = {
              id: user._id,
              username: user.username,
              email: user.email
          };
          
          // 6. Redirect to books page
          res.redirect('/books');
          
      } catch (err) {
          console.error('Registration error:', err);
          
          // Handle duplicate key error specifically
          if (err.code === 11000) {
              return res.render('auth/register', {
                  error: 'Registration failed due to system error',
                  user: { username, email }
              });
          }
          
          res.render('auth/register', {
              error: 'Registration failed: ' + err.message.replace('User validation failed: ', ''),
              user: { username, email }
          });
      }
  },
    // LOGOUT - Terminate user session Pseudo-code:
    // 1. Destroy session
    // 2. Clear cookie
    // 3. Redirect to home
   
logout: (req, res) => {
        req.session.destroy(err => {
            if (err) {
                console.error('Logout error:', err);
                return res.redirect('/books');
            }
            res.clearCookie('connect.sid');
            res.redirect('/');
        });
    },
  }