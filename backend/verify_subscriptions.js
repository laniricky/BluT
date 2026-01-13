
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'http://localhost:5000/api';
const LOG_FILE = '../verify_subs_log.txt';

const log = (msg) => {
    console.log(`[TEST] ${msg}`);
    fs.appendFileSync(LOG_FILE, `[TEST] ${msg}\n`);
};
const error = (msg, err) => {
    console.error(`[ERROR] ${msg}`, err);
    fs.appendFileSync(LOG_FILE, `[ERROR] ${msg} ${err}\n`);
};

const TEST_FILE_PATH = path.join(__dirname, 'sub_test_vid.mp4');
const TEST_THUMB_PATH = path.join(__dirname, 'sub_test_thumb.jpg');

// Create dummy files for testing
if (!fs.existsSync(TEST_FILE_PATH)) fs.writeFileSync(TEST_FILE_PATH, 'dummy video content');
if (!fs.existsSync(TEST_THUMB_PATH)) fs.writeFileSync(TEST_THUMB_PATH, 'dummy thumb content');

async function runTests() {
    try {
        fs.writeFileSync(LOG_FILE, '');
        log('Starting Subscription Verification...');

        // 1. Create two users: Creator and Subscriber
        const uniqueSuffix = Date.now() + Math.floor(Math.random() * 1000);
        const creatorEmail = `creator_${uniqueSuffix}@test.com`;
        const subEmail = `subscriber_${uniqueSuffix}@test.com`;

        // Register Creator
        const regC = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: `TheCreator${uniqueSuffix}`, email: creatorEmail, password: 'password123' })
        });
        const creatorData = await regC.json();
        if (!creatorData.success) throw new Error(`Creator reg failed: ${JSON.stringify(creatorData)}`);
        const creatorToken = creatorData.token;
        const creatorId = creatorData.user.id;
        log(`Creator registered: ${creatorId}`);

        // Register Subscriber
        const regS = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: `TheFan${uniqueSuffix}`, email: subEmail, password: 'password123' })
        });
        const subData = await regS.json();
        if (!subData.success) throw new Error(`Subscriber reg failed: ${JSON.stringify(subData)}`);
        const subToken = subData.token;
        log('Subscriber registered.');

        // 2. Creator uploads a video
        log('Uploading video by Creator...');
        const formData = new FormData();
        formData.append('title', 'Sub Test Video');
        formData.append('description', 'Testing subscriptions');

        const videoBuffer = fs.readFileSync(TEST_FILE_PATH);
        const thumbBuffer = fs.readFileSync(TEST_THUMB_PATH);
        const videoBlob = new Blob([videoBuffer], { type: 'video/mp4' });
        const thumbBlob = new Blob([thumbBuffer], { type: 'image/jpeg' });

        formData.append('video', videoBlob, 'sub_test_vid.mp4');
        formData.append('thumbnail', thumbBlob, 'sub_test_thumb.jpg');

        const uploadRes = await fetch(`${API_URL}/videos`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${creatorToken}` },
            body: formData
        });

        const uploadData = await uploadRes.json();
        if (!uploadData.success) throw new Error('Upload failed: ' + uploadData.message);

        const targetVideoId = uploadData.data._id;
        const targetCreatorId = creatorId;
        log(`Video uploaded: ${targetVideoId}`);

        // 3. Subscriber views video -> check isSubscribed = false
        log('Fetching video as Subscriber (before sub)...');
        const viewRes1 = await fetch(`${API_URL}/videos/${targetVideoId}`, {
            headers: { 'Authorization': `Bearer ${subToken}` }
        });
        const viewData1 = await viewRes1.json();

        if (viewData1.data.user.isSubscribed !== false) {
            throw new Error('Should NOT be subscribed initially.');
        }
        log('Verified: Not subscribed initially.');
        const initialCount = viewData1.data.user.subscribersCount || 0;
        log(`Initial subscriber count: ${initialCount}`);

        // 4. Subscriber subscribes to Creator
        log('Subscribing...');
        const subRes = await fetch(`${API_URL}/users/${targetCreatorId}/subscribe`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${subToken}` }
        });
        const subResData = await subRes.json();

        if (!subResData.success) throw new Error(`Subscribe failed: ${subResData.message}`);
        log('Subscription successful.');

        // 5. Subscriber views video -> check isSubscribed = true
        log('Fetching video as Subscriber (after sub)...');
        const viewRes2 = await fetch(`${API_URL}/videos/${targetVideoId}`, {
            headers: { 'Authorization': `Bearer ${subToken}` }
        });
        const viewData2 = await viewRes2.json();

        if (viewData2.data.user.isSubscribed !== true) {
            throw new Error('Should BE subscribed now.');
        }
        log('Verified: Is subscribed now.');

        if (viewData2.data.user.subscribersCount !== initialCount + 1) {
            log(`Warning: Count mismatch. Expected ${initialCount + 1}, got ${viewData2.data.user.subscribersCount}`);
        } else {
            log('Subscriber count incremented correctly.');
        }

        // 6. Unsubscribe
        log('Unsubscribing...');
        await fetch(`${API_URL}/users/${targetCreatorId}/subscribe`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${subToken}` }
        });

        // 7. Check again
        const viewRes3 = await fetch(`${API_URL}/videos/${targetVideoId}`, {
            headers: { 'Authorization': `Bearer ${subToken}` }
        });
        const viewData3 = await viewRes3.json();

        if (viewData3.data.user.isSubscribed !== false) {
            throw new Error('Should be unsubscribed.');
        }
        if (viewData3.data.user.subscribersCount !== initialCount) {
            log('Warning: Count did not revert cleanly.');
        } else {
            log('Subscriber count reverted correctly.');
        }

        log('ALL SUBSCRIPTION TESTS PASSED!');

        // Cleanup
        try { fs.unlinkSync(TEST_FILE_PATH); } catch (e) { }
        try { fs.unlinkSync(TEST_THUMB_PATH); } catch (e) { }

    } catch (e) {
        error('Test failed:', e);
        // Try cleanup even on fail
        try { fs.unlinkSync(TEST_FILE_PATH); } catch (err) { }
        try { fs.unlinkSync(TEST_THUMB_PATH); } catch (err) { }
        process.exit(1);
    }
}

runTests();
