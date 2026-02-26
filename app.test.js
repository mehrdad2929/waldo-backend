// Use DATABASE_URL (set by CI via env or from .env for local)
const dbUrl = process.env.DATABASE_URL || process.env.DATABASE_TEST_URL;
if (dbUrl) {
    process.env.DATABASE_URL = dbUrl;
}

const request = require('supertest');
const app = require('./app');
const { PrismaClient } = require('@prisma/client');

const testPrisma = new PrismaClient();

beforeAll(async () => {
    await testPrisma.$connect();
    console.log('✅ Connected to test database: waldo_db_test');
    await testPrisma.gameScore.deleteMany({});
    await testPrisma.user.deleteMany({});
    console.log('✅ Test database cleaned');
});

afterEach(async () => {
    await testPrisma.gameScore.deleteMany({});
    await testPrisma.user.deleteMany({});
});

afterAll(async () => {
    await testPrisma.$disconnect();
    console.log('✅ Disconnected from test database');
});

describe('Waldo Game API Workflow', () => {
    it('should complete: signup -> login -> submit score -> get leaderboard -> get my scores', async () => {
        // 1. Signup
        await request(app)
            .post('/api/signup')
            .send({
                username: 'testplayer',
                email: 'test@example.com',
                password: 'Pass123'
            })
            .expect(201);

        console.log('✅ Player signed up');

        // 2. Login
        const loginRes = await request(app)
            .post('/api/login')
            .send({
                username: 'testplayer',
                password: 'Pass123'
            })
            .expect(200);

        const token = loginRes.body.token;
        expect(token).toBeDefined();
        console.log('✅ Player logged in');

        // 3. Submit score for level 1
        const scoreRes = await request(app)
            .put('/api/score/1')
            .set('Authorization', `Bearer ${token}`)
            .send({
                levelId: 1,
                timeMs: 45000
            })
            .expect(201);

        expect(scoreRes.body.isNewBest).toBe(true);
        console.log('✅ Score submitted');

        // 4. Get leaderboard for level 1
        const leaderboardRes = await request(app)
            .get('/api/leaderboard/1')
            .expect(200);

        expect(leaderboardRes.body.leaderboard.length).toBe(1);
        expect(leaderboardRes.body.leaderboard[0].username).toBe('testplayer');
        expect(leaderboardRes.body.leaderboard[0].timeMs).toBe(45000);
        console.log('✅ Leaderboard retrieved');

        // 5. Submit better score (lower time)
        const betterScoreRes = await request(app)
            .put('/api/score/1')
            .set('Authorization', `Bearer ${token}`)
            .send({
                levelId: 1,
                timeMs: 30000
            })
            .expect(200);

        expect(betterScoreRes.body.isNewBest).toBe(true);
        console.log('✅ Better score submitted');

        // 6. Get my scores
        const myScoresRes = await request(app)
            .get('/api/my-scores')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(myScoresRes.body.scores[1].timeMs).toBe(30000);
        console.log('✅ My scores retrieved');

        console.log('✅ Workflow completed successfully!');
    });
});
