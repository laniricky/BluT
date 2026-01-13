
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'http://localhost:5000/api';
const TEST_FILE_PATH = path.join(__dirname, 'test-video.mp4');
const TEST_THUMB_PATH = path.join(__dirname, 'test-thumb.jpg');

// Create dummy files for testing
if (!fs.existsSync(TEST_FILE_PATH)) fs.writeFileSync(TEST_FILE_PATH, 'dummy video content');
if (!fs.existsSync(TEST_THUMB_PATH)) fs.writeFileSync(TEST_THUMB_PATH, 'dummy thumb content');

let token;
let videoId;

const log = (msg) => {
    console.log(`[TEST] ${msg}`);
    fs.appendFileSync('verify_log.txt', `[TEST] ${msg}\n`);
};
const error = (msg, err) => {
    console.error(`[ERROR] ${msg}`, err);
    fs.appendFileSync('verify_log.txt', `[ERROR] ${msg} ${err}\n`);
};

async function runTests() {
    try {
        // 1. Register/Login
        log('Registering test user...');
        const uniqueSuffix = Date.now();
        const userCreds = {
            username: `testuser${uniqueSuffix}`,
            email: `test${uniqueSuffix}@example.com`,
            password: 'password123'
        };

        const authResponse = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userCreds)
        });

        let authData = await authResponse.json();

        if (!authData.success) {
            // Try login
            const loginResponse = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userCreds.email, password: userCreds.password })
            });
            authData = await loginResponse.json();
            if (!authData.success) throw new Error('Login failed: ' + authData.message);
        }

        token = authData.token;
        log('Authenticated.');

        const headers = { Authorization: `Bearer ${token}` };

        // 2. Upload Video
        log('Uploading video...');
        const formData = new FormData();
        formData.append('title', 'Test Video Interactions');
        formData.append('description', 'Testing likes and views');

        // Node.js native fetch FormData needs Blob or File
        const videoBuffer = fs.readFileSync(TEST_FILE_PATH);
        const thumbBuffer = fs.readFileSync(TEST_THUMB_PATH);

        const videoBlob = new Blob([videoBuffer], { type: 'video/mp4' });
        const thumbBlob = new Blob([thumbBuffer], { type: 'image/jpeg' });

        formData.append('video', videoBlob, 'test-video.mp4');
        formData.append('thumbnail', thumbBlob, 'test-thumb.jpg');

        const uploadRes = await fetch(`${API_URL}/videos`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }, // FormData sets its own content-type boundary
            body: formData
        });

        const uploadData = await uploadRes.json();
        if (!uploadData.success) throw new Error('Upload failed: ' + uploadData.message);

        videoId = uploadData.data._id;
        log(`Video uploaded: ${videoId}`);

        // 3. Test View Increment
        log('Testing View Increment...');
        await fetch(`${API_URL}/videos/${videoId}/view`, { method: 'POST' });
        await fetch(`${API_URL}/videos/${videoId}/view`, { method: 'POST' });

        const viewRes = await fetch(`${API_URL}/videos/${videoId}`);
        const viewData = await viewRes.json();

        if (viewData.data.views >= 2) {
            log(`Views verified: ${viewData.data.views}`);
        } else {
            throw new Error(`Views verification failed. Expected >= 2, got ${viewData.data.views}`);
        }

        // 4. Test Like
        log('Testing Like...');
        const likeRes1 = await fetch(`${API_URL}/videos/${videoId}/like`, {
            method: 'POST',
            headers
        });
        const likeData1 = await likeRes1.json();

        if (likeData1.isLiked && likeData1.message === 'Video liked') {
            log('Like successful.');
        } else {
            throw new Error('Like failed: ' + JSON.stringify(likeData1));
        }

        // Verify count
        const likeCheck1 = await fetch(`${API_URL}/videos/${videoId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const likeCheckData1 = await likeCheck1.json();

        if (likeCheckData1.data.likesCount === 1 && likeCheckData1.data.isLiked) {
            log('Like count verified (1).');
        } else {
            throw new Error(`Like count verification failed (1). Got ${likeCheckData1.data.likesCount}`);
        }

        // 5. Test Unlike
        log('Testing Unlike...');
        const likeRes2 = await fetch(`${API_URL}/videos/${videoId}/like`, {
            method: 'POST',
            headers
        });
        const likeData2 = await likeRes2.json();

        if (!likeData2.isLiked && likeData2.message === 'Video unliked') {
            log('Unlike successful.');
        } else {
            throw new Error('Unlike failed.');
        }

        // Verify count
        const likeCheck2 = await fetch(`${API_URL}/videos/${videoId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const likeCheckData2 = await likeCheck2.json();

        if (likeCheckData2.data.likesCount === 0 && !likeCheckData2.data.isLiked) {
            log('Like count verified (0).');
        } else {
            throw new Error(`Like count verification failed (0). Got ${likeCheckData2.data.likesCount}`);
        }

        // 6. Test Delete
        log('Testing Delete...');
        const deleteRes = await fetch(`${API_URL}/videos/${videoId}`, {
            method: 'DELETE',
            headers
        });
        const deleteData = await deleteRes.json();

        if (deleteData.success) {
            log('Delete successful.');
        } else {
            throw new Error('Delete failed.');
        }

        // Verify deletion
        const verifyDelete = await fetch(`${API_URL}/videos/${videoId}`);
        if (verifyDelete.status === 404) {
            log('Video 404 verified.');
        } else {
            throw new Error('Video still exists after delete!');
        }

        log('ALL TESTS PASSED!');

        // Cleanup dummy files
        try { fs.unlinkSync(TEST_FILE_PATH); } catch (e) { }
        try { fs.unlinkSync(TEST_THUMB_PATH); } catch (e) { }

    } catch (e) {
        error('Test failed:', e);
        process.exit(1);
    }
}

runTests();
