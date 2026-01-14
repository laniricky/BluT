
const API_URL = 'http://127.0.0.1:5000/api';
let userToken = '';
let userId = '';

async function runTests() {
    console.log('🚀 Starting Verification Tests...');

    try {
        // 1. Register User 1
        const username1 = `Owner_${Date.now()}`;
        console.log(`\nTesting Registration (Owner: ${username1})...`);
        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username1,
                email: `${username1}@test.com`,
                password: 'password123'
            })
        });

        const regData = await regRes.json();
        if (!regRes.ok) throw new Error(regData.message || 'Registration failed');

        userToken = regData.token;
        userId = regData.user._id;
        console.log('✅ User 1 Registered');

        console.log('\nTesting Rate Limiting (Auth)...');
        let blocked = false;
        // The first registration was attempt 1.
        // We need 5 attempts in 15 mins to block.
        // So we need 5 more attempts (total 6) to hit limit (limit is 5).

        for (let i = 0; i < 6; i++) {
            process.stdout.write(`Attempt ${i + 2}... `);
            const loginRes = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: `${username1}@test.com`,
                    password: 'password123'
                })
            });

            if (loginRes.status === 429) {
                console.log('✅ Rate Limit Hit (429 Too Many Requests)');
                blocked = true;
                break;
            } else {
                console.log('Success (' + loginRes.status + ')');
            }
        }
        if (!blocked) console.error('❌ Rate Limiting Failed: Did not block after attempts');

    } catch (err) {
        console.error('❌ Test Setup Failed:', err.message);
    }
}

runTests();
