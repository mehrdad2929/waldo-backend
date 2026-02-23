const { Router } = require('express');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');
const authRouter = Router();

authRouter.get('/auth/google', authController.googleAuth);
authRouter.get('/auth/google/callback', authController.googleCallback);
authRouter.get('/auth/github', authController.githubAuth);
authRouter.get('/auth/github/callback', authController.githubCallback);
authRouter.get('/auth/check', authenticateToken, authController.checkAuth);

module.exports = authRouter;
