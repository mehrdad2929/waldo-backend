// Simple test script without supertest
const http = require('http');

function makeRequest(options, body = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(data) });
                } catch {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function runTests() {
    console.log('Starting manual tests...\n');
    let token = '';

    // 1. Signup
    console.log('1. Testing signup...');
    const signupRes = await makeRequest({
        hostname: '127.0.0.1',
        port: 3000,
        path: '/api/signup',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, { username: 'testplayer2', email: 'test2@example.com', password: 'pass123' });
    console.log('   Status:', signupRes.status);
    console.log('   Body:', signupRes.body);

    // 2. Login
    console.log('\n2. Testing login...');
    const loginRes = await makeRequest({
        hostname: '127.0.0.1',
        port: 3000,
        path: '/api/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, { username: 'testplayer2', password: 'pass123' });
    console.log('   Status:', loginRes.status);
    token = loginRes.body.token;
    console.log('   Token received:', !!token);

    // 3. Submit score
    console.log('\n3. Testing submit score...');
    const scoreRes = await makeRequest({
        hostname: '127.0.0.1',
        port: 3000,
        path: '/api/score/1',
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    }, { levelId: 1, timeMs: 45000 });
    console.log('   Status:', scoreRes.status);
    console.log('   Body:', scoreRes.body);

    // 4. Get leaderboard
    console.log('\n4. Testing leaderboard...');
    const leaderboardRes = await makeRequest({
        hostname: '127.0.0.1',
        port: 3000,
        path: '/api/leaderboard/1',
        method: 'GET'
    });
    console.log('   Status:', leaderboardRes.status);
    console.log('   Leaderboard:', leaderboardRes.body);

    // 5. Submit better score
    console.log('\n5. Testing better score...');
    const betterScoreRes = await makeRequest({
        hostname: '127.0.0.1',
        port: 3000,
        path: '/api/score/1',
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    }, { levelId: 1, timeMs: 30000 });
    console.log('   Status:', betterScoreRes.status);
    console.log('   Body:', betterScoreRes.body);

    // 6. Get my scores
    console.log('\n6. Testing my scores...');
    const myScoresRes = await makeRequest({
        hostname: '127.0.0.1',
        port: 3000,
        path: '/api/my-scores',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('   Status:', myScoresRes.status);
    console.log('   My scores:', myScoresRes.body);

    console.log('\n✅ All tests completed!');
}

runTests().catch(console.error);
