
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'http://localhost:5000/api';
const LOG_FILE = 'verify_comments_log.txt';

const log = (msg) => {
    console.log(`[TEST] ${msg}`);
    fs.appendFileSync(LOG_FILE, `[TEST] ${msg}\n`);
};
const error = (msg, err) => {
    console.error(`[ERROR] ${msg}`, err);
    fs.appendFileSync(LOG_FILE, `[ERROR] ${msg} ${err}\n`);
};

async function runTests() {
    try {
        fs.writeFileSync(LOG_FILE, '');
        log('Starting Comments Verification...');

        // 1. Register/Login User
        const userEmail = `commenter_${Date.now()}@test.com`;
        const userPass = 'password123';
        log(`Registering user ${userEmail}...`);

        let token;
        let userId;

        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'Commenter', email: userEmail, password: userPass })
        });
        const regData = await regRes.json();

        if (regData.success) {
            token = regData.token;
            userId = regData.user._id;
            log('User registered and authenticated.');
        } else {
            throw new Error(`Registration failed: ${regData.message}`);
        }

        // 2. Upload a video (or find existing, but uploading is safer)
        log('Uploading a video for comment test...');
        const formData = new FormData();
        const videoContent = 'fake video content';
        const thumbContent = 'fake thumb content';

        // Create dummy files for test
        const vidPath = path.join(__dirname, 'temp_vid.mp4');
        const thumbPath = path.join(__dirname, 'temp_thumb.jpg');
        fs.writeFileSync(vidPath, videoContent);
        fs.writeFileSync(thumbPath, thumbContent);

        // We can't use native fetch FormData easily with files in Node without extra libs or constructing body manually
        // But our backend accepts multipart/form-data.
        // Simplified: Let's assume there is at least ONE video in the DB and use that ID.
        // OR better: Create a video via a direct DB call if possible? No, stick to API.
        // Since verify_interactions.js worked, I can reuse that logic or simpler:
        // Get all videos, pick first one.

        log('Fetching existing videos to comment on...');
        const vidRes = await fetch(`${API_URL}/videos`);
        const vidData = await vidRes.json();

        let videoId;
        if (vidData.success && vidData.data.length > 0) {
            videoId = vidData.data[0]._id;
            log(`Using video ID: ${videoId}`);
        } else {
            // If no videos, we must upload one?
            // For now, fail if no videos (assuming previous steps created some)
            throw new Error('No videos found. Please run verify_interactions.js first or ensure DB has data.');
        }

        // 3. Add Comment
        const commentText = `Test Comment ${Date.now()}`;
        log(`Adding comment: "${commentText}"...`);
        const commentRes = await fetch(`${API_URL}/videos/${videoId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content: commentText })
        });
        const commentData = await commentRes.json();

        if (commentData.success) {
            log('Comment added successfully.');
            if (commentData.data.content !== commentText) throw new Error('Comment content mismatch');
        } else {
            throw new Error(`Add comment failed: ${commentData.message}`);
        }

        const commentId = commentData.data._id;

        // 4. Get Comments
        log('Fetching comments...');
        const getRes = await fetch(`${API_URL}/videos/${videoId}/comments`);
        const getData = await getRes.json();

        if (getData.success) {
            log(`Fetched ${getData.count} comments.`);
            const found = getData.data.find(c => c._id === commentId);
            if (found) {
                log('Verified new comment exists in list.');
            } else {
                throw new Error('New comment not found in list.');
            }
        } else {
            throw new Error('Get comments failed.');
        }

        // 5. Delete Comment
        log('Deleting comment...');
        const delRes = await fetch(`${API_URL}/videos/comments/${commentId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const delData = await delRes.json();

        if (delData.success) {
            log('Comment deleted successfully.');
        } else {
            throw new Error(`Delete comment failed: ${delData.message}`);
        }

        // 6. Verify Deletion
        const finalGetRes = await fetch(`${API_URL}/videos/${videoId}/comments`);
        const finalGetData = await finalGetRes.json();
        if (finalGetData.data.find(c => c._id === commentId)) {
            throw new Error('Comment still exists after deletion!');
        }
        log('Deletion verified.');

        log('ALL COMMENT TESTS PASSED!');

    } catch (e) {
        error('Test failed:', e);
        process.exit(1);
    }
}

runTests();
