module.exports = (req, res, next) => {
    if (!req.session.user) {
        req.session.returnTo = req.originalUrl;
        return res.redirect('/auth/login');
    }
    next();
  };