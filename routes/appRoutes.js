const { Router } = require("express");
const appController = require('../controllers/appController');
const { loginValidation, validate, signupValidation } = require("../middlewares/validation");
const { authenticateToken, roleRequired } = require("../middlewares/auth");
const appRouter = Router();

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

// appRouter.put('/api/profile',
//     authenticateToken,
//     appController.updateProfile
// )

// appRouter.delete('/api/account',
//     authenticateToken,
//     appController.deleteAccount
// )
// scoreboard  routes:
// appRouter.get('api/scoreboard',
//     authenticateToken,
//     appController.getScoreboard
// )

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
