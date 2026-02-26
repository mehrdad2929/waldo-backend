const jwt = require('jsonwebtoken');
if (process.env.NODE_ENV !== 'production') {
    require('@dotenvx/dotenvx').config();
}

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const initPassport = () => {
    if (!require('../config/passport').initialized) {
        require('../config/passport');
    }
};

exports.googleAuth = (req, res, next) => {
    initPassport();
    const passport = require('passport');
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
};

exports.googleCallback = (req, res, next) => {
    initPassport();
    const passport = require('passport');
    passport.authenticate('google', { session: false }, (err, user) => {
        if (err || !user) {
            return res.redirect(`${FRONTEND_URL}?error=oauth_failed`);
        }
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        res.redirect(`${FRONTEND_URL}?token=${token}`);
    })(req, res, next);
};

exports.githubAuth = (req, res, next) => {
    initPassport();
    const passport = require('passport');
    passport.authenticate('github', { scope: ['user:email'] })(req, res, next);
};

exports.githubCallback = (req, res, next) => {
    initPassport();
    const passport = require('passport');
    passport.authenticate('github', { session: false }, (err, user) => {
        if (err || !user) {
            return res.redirect(`${FRONTEND_URL}?error=oauth_failed`);
        }
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        res.redirect(`${FRONTEND_URL}?token=${token}`);
    })(req, res, next);
};

exports.checkAuth = (req, res) => {
    res.json({ authenticated: true, user: req.user });
};
