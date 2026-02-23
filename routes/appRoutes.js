const { Router } = require("express");
const appController = require('../controllers/appController');
const authRoutes = require('./authRoutes');
const { loginValidation, validate, signupValidation } = require("../middlewares/validation");
const { authenticateToken } = require("../middlewares/auth");
const appRouter = Router();

appRouter.use('/', authRoutes);

appRouter.post('/api/signup',
    signupValidation,
    validate,
    appController.signup
);

appRouter.post('/api/login',
    loginValidation,
    validate,
    appController.login
);

appRouter.get('/api/profile',
    authenticateToken,
    appController.getProfile
);

//update score for a level (player in the jwt)
appRouter.put('/api/score/:levelId',
    authenticateToken,
    appController.submitScore
)

appRouter.get('/api/leaderboard/:levelId',
    appController.getLeaderboard
)

appRouter.get('/api/my-scores',
    authenticateToken,
    appController.getMyScores
)
//add new level
// appRouter.put('api/level/:levelId',
//     authenticateToken,
//     appController.addLevel
// )
module.exports = appRouter;
