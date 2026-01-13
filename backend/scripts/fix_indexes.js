import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert import.meta.url to __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from parent directory (backend root)
dotenv.config({ path: path.join(__dirname, '../.env.fixed') });

const connectDB = async () => {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Drop indexes on videos collection
        try {
            const result = await mongoose.connection.db.collection('videos').dropIndexes();
            console.log('Indexes dropped successfully:', result);
        } catch (err) {
            console.log('Error dropping indexes (might not exist):', err.message);
        }

        process.exit(0);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();
