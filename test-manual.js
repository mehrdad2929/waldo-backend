// Manual test script for Waldo backend endpoints
const request = require('supertest');
const app = require('./app');

async function runTests() {
    console.log('Starting manual tests...\n');

    // 1. Signup
    console.log('1. Testing signup...');
    const signupRes = await request(app)
        .post('/api/signup')
        .send({ username: 'testplayer', password: 'pass123' });
    console.log('   Status:', signupRes.status);
    console.log('   Body:', signupRes.body);

    // 2. Login
    console.log('\n2. Testing login...');
    const loginRes = await request(app)
        .post('/api/login')
        .send({ username: 'testplayer', password: 'pass123' });
    console.log('   Status:', loginRes.status);
    const token = loginRes.body.token;
    console.log('   Token:', token ? 'received' : 'missing');

    // 3. Submit score
    console.log('\n3. Testing submit score...');
    const scoreRes = await request(app)
        .put('/api/score/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ levelId: 1, timeMs: 45000 });
    console.log('   Status:', scoreRes.status);
    console.log('   Body:', scoreRes.body);

    // 4. Get leaderboard
    console.log('\n4. Testing leaderboard...');
    const leaderboardRes = await request(app)
        .get('/api/leaderboard/1');
    console.log('   Status:', leaderboardRes.status);
    console.log('   Leaderboard:', leaderboardRes.body);

    // 5. Submit better score
    console.log('\n5. Testing better score...');
    const betterScoreRes = await request(app)
        .put('/api/score/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ levelId: 1, timeMs: 30000 });
    console.log('   Status:', betterScoreRes.status);
    console.log('   Body:', betterScoreRes.body);

    // 6. Get my scores
    console.log('\n6. Testing my scores...');
    const myScoresRes = await request(app)
        .get('/api/my-scores')
        .set('Authorization', `Bearer ${token}`);
    console.log('   Status:', myScoresRes.status);
    console.log('   My scores:', myScoresRes.body);

    console.log('\n✅ All tests completed!');
}

runTests().catch(console.error);
