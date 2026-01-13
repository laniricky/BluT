
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'http://localhost:5000/api';
const LOG_FILE = 'verify_search_log.txt';

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
        // Clear log
        fs.writeFileSync(LOG_FILE, '');

        log('Starting Search Verification...');

        // 1. Search for known keyword (assuming "Test Video" exists from previous steps)
        const keyword = "Test";
        log(`Searching for "${keyword}"...`);

        const res = await fetch(`${API_URL}/videos?search=${encodeURIComponent(keyword)}`);
        const data = await res.json();

        if (data.success) {
            log(`Found ${data.data.length} results.`);
            if (data.data.length > 0) {
                const firstTitle = data.data[0].title;
                log(`First result title: "${firstTitle}"`);
                if (firstTitle.toLowerCase().includes(keyword.toLowerCase())) {
                    log('Search relevance verified.');
                } else {
                    log('Warning: First result does not contain keyword (could be description match).');
                }
            } else {
                log('No results found. (Make sure videos exist with this keyword)');
            }
        } else {
            throw new Error('Search API failed.');
        }

        // 2. Search for empty/random string
        const randomKey = "hz89g79sdf8g7";
        log(`Searching for non-existent "${randomKey}"...`);
        const res2 = await fetch(`${API_URL}/videos?search=${randomKey}`);
        const data2 = await res2.json();

        if (data2.success && data2.data.length === 0) {
            log('Empty search verified (0 results).');
        } else {
            throw new Error('Empty search failed (found results?).');
        }

        log('ALL SEARCH TESTS PASSED!');

    } catch (e) {
        error('Test failed:', e);
        process.exit(1);
    }
}

runTests();
