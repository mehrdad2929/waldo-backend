const prisma = require('../db/prisma');
require('@dotenvx/dotenvx').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const existingUsername = await prisma.user.findUnique({
            where: { username: username }
        });
        if (existingUsername) {
            return res.status(409).json({
                message: "User with this username already exists"
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword
            }
        });
        res.status(201).json({ message: 'User created successfully', userId: user.id });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const user = await prisma.user.findUnique({
            where: { username }
        });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.json({ token, userId: user.id });
    } catch (error) {
        next(error);
    }
};

exports.getProfile = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                username: true,
                createdAt: true,
            }
        });
        res.json(user);
    } catch (error) {
        next(error);
    }
};

exports.submitScore = async (req, res, next) => {
    const { levelId, timeMs } = req.body;
    const userId = req.user.id;

    if (!levelId || !timeMs) {
        return res.status(400).json({ error: 'levelId and timeMs are required' });
    }

    if (levelId < 1 || levelId > 5) {
        return res.status(400).json({ error: 'levelId must be between 1 and 5' });
    }

    if (typeof timeMs !== 'number' || timeMs < 0) {
        return res.status(400).json({ error: 'timeMs must be a positive number' });
    }

    try {
        const existingScore = await prisma.gameScore.findUnique({
            where: {
                userId_levelId: { userId, levelId }
            }
        });

        if (existingScore) {
            if (timeMs < existingScore.timeMs) {
                const updated = await prisma.gameScore.update({
                    where: { id: existingScore.id },
                    data: { timeMs }
                });
                return res.status(200).json({
                    message: 'Score updated! New best time!',
                    score: updated,
                    isNewBest: true
                });
            }
            return res.status(200).json({
                message: 'Score not improved',
                score: existingScore,
                isNewBest: false
            });
        }

        const newScore = await prisma.gameScore.create({
            data: {
                userId,
                levelId,
                timeMs
            }
        });

        res.status(201).json({
            message: 'Score submitted!',
            score: newScore,
            isNewBest: true
        });
    } catch (error) {
        next(error);
    }
};

exports.getLeaderboard = async (req, res, next) => {
    const { levelId } = req.params;

    if (!levelId || levelId < 1 || levelId > 5) {
        return res.status(400).json({ error: 'Valid levelId (1-5) is required' });
    }

    try {
        const scores = await prisma.gameScore.findMany({
            where: { levelId: parseInt(levelId) },
            include: {
                user: {
                    select: {
                        username: true,
                        name: true
                    }
                }
            },
            orderBy: { timeMs: 'asc' },
            take: 10
        });

        const leaderboard = scores.map((score, index) => ({
            rank: index + 1,
            username: score.user.username,
            name: score.user.name,
            timeMs: score.timeMs,
            timeFormatted: formatTime(score.timeMs)
        }));

        res.status(200).json({
            message: `Leaderboard for level ${levelId}`,
            leaderboard
        });
    } catch (error) {
        next(error);
    }
};

exports.getMyScores = async (req, res, next) => {
    const userId = req.user.id;

    try {
        const scores = await prisma.gameScore.findMany({
            where: { userId },
            orderBy: { levelId: 'asc' }
        });

        const scoresByLevel = {};
        scores.forEach(score => {
            scoresByLevel[score.levelId] = {
                timeMs: score.timeMs,
                timeFormatted: formatTime(score.timeMs),
                createdAt: score.createdAt
            };
        });

        for (let i = 1; i <= 5; i++) {
            if (!scoresByLevel[i]) {
                scoresByLevel[i] = { timeMs: null, timeFormatted: null, createdAt: null };
            }
        }

        res.status(200).json({
            message: 'Your scores',
            scores: scoresByLevel
        });
    } catch (error) {
        next(error);
    }
};

function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${seconds}.${milliseconds.toString().padStart(2, '0')}s`;
}
