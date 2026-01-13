
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'http://localhost:5000/api';
const LOG_FILE = '../verify_profile_log.txt';

const log = (msg) => {
    console.log(`[TEST] ${msg}`);
    fs.appendFileSync(LOG_FILE, `[TEST] ${msg}\n`);
};
const error = (msg, err) => {
    console.error(`[ERROR] ${msg}`, err);
    fs.appendFileSync(LOG_FILE, `[ERROR] ${msg} ${err}\n`);
};

const TEST_FILE_PATH = path.join(__dirname, 'prof_test_vid.mp4');
const TEST_THUMB_PATH = path.join(__dirname, 'prof_test_thumb.jpg');

// Create dummy files for testing
if (!fs.existsSync(TEST_FILE_PATH)) fs.writeFileSync(TEST_FILE_PATH, 'dummy video content');
if (!fs.existsSync(TEST_THUMB_PATH)) fs.writeFileSync(TEST_THUMB_PATH, 'dummy thumb content');

async function runTests() {
    try {
        fs.writeFileSync(LOG_FILE, '');
        log('Starting Profile Verification...');

        const uniqueSuffix = Date.now() + Math.floor(Math.random() * 1000);
        const username = `ProfileTestUser${uniqueSuffix}`;
        const email = `profile${uniqueSuffix}@test.com`;

        // 1. Register User
        log('Registering user...');
        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password: 'password123' })
        });
        const regData = await regRes.json();
        if (!regData.success) throw new Error(`Registration failed: ${JSON.stringify(regData)}`);

        const token = regData.token;
        const userId = regData.user.id;
        log(`User registered: ${username} (${userId})`);

        // 2. Upload a video for this user
        log('Uploading video...');
        const formData = new FormData();
        formData.append('title', 'Profile Test Video');
        formData.append('description', 'Testing profile videos list');

        const videoBuffer = fs.readFileSync(TEST_FILE_PATH);
        const thumbBuffer = fs.readFileSync(TEST_THUMB_PATH);
        const videoBlob = new Blob([videoBuffer], { type: 'video/mp4' });
        const thumbBlob = new Blob([thumbBuffer], { type: 'image/jpeg' });

        formData.append('video', videoBlob, 'prof_test_vid.mp4');
        formData.append('thumbnail', thumbBlob, 'prof_test_thumb.jpg');

        const uploadRes = await fetch(`${API_URL}/videos`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        });

        const uploadData = await uploadRes.json();
        if (!uploadData.success) throw new Error('Upload failed: ' + JSON.stringify(uploadData));
        log('Video uploaded.');

        // 3. Fetch Profile by username (Public route)
        log('Fetching profile by username...');
        const profileRes = await fetch(`${API_URL}/users/${username}`);
        const profileData = await profileRes.json();

        if (!profileData.success) throw new Error('Fetch profile failed');
        if (profileData.user.username !== username) throw new Error('Username mismatch');
        log('Profile fetched successfully.');

        // 4. Fetch User Videos (using ID from profile)
        log(`Fetching videos for user ID: ${profileData.user._id}...`);
        const videosRes = await fetch(`${API_URL}/users/${profileData.user._id}/videos`);
        const videosData = await videosRes.json();

        if (!videosData.success) throw new Error('Fetch user videos failed');
        if (videosData.videos.length !== 1) throw new Error(`Expected 1 video, got ${videosData.videos.length}`);
        if (videosData.videos[0].title !== 'Profile Test Video') throw new Error('Video title mismatch');

        log('User videos fetched and verified.');
        log('ALL PROFILE TESTS PASSED!');

        // Cleanup
        try { fs.unlinkSync(TEST_FILE_PATH); } catch (e) { }
        try { fs.unlinkSync(TEST_THUMB_PATH); } catch (e) { }

    } catch (e) {
        error('Test failed:', e);
        try { fs.unlinkSync(TEST_FILE_PATH); } catch (err) { }
        try { fs.unlinkSync(TEST_THUMB_PATH); } catch (err) { }
        process.exit(1);
    }
}

runTests();
