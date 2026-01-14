import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Video from './src/models/Video.js';
import Analytics from './src/models/Analytics.js';
import connectDB from './src/config/database.js';

dotenv.config();

const seedData = async () => {
    try {
        await connectDB();
        console.log('Database connected');

        // Clear existing data
        await User.deleteMany({});
        await Video.deleteMany({});
        await Analytics.deleteMany({});
        console.log('Cleared old data');

        // Create User
        const user = await User.create({
            username: 'tester',
            email: 'tester@example.com',
            password: 'password123',
            role: 'creator'
        });
        console.log('User created:', user.username);

        // Create Public Video
        const publicVideo = await Video.create({
            title: 'My Public Video',
            description: 'This is a public video',
            videoUrl: 'http://example.com/video1.mp4',
            thumbnailUrl: 'https://via.placeholder.com/640x360',
            user: user._id,
            duration: '05:00',
            durationSec: 300,
            visibility: 'public',
            views: 10
        });

        // Create Private Video
        const privateVideo = await Video.create({
            title: 'My Private Video',
            description: 'This is a private video',
            videoUrl: 'http://example.com/video2.mp4',
            thumbnailUrl: 'https://via.placeholder.com/640x360',
            user: user._id,
            duration: '02:00',
            durationSec: 120,
            visibility: 'private',
            views: 2
        });
        console.log('Videos created');

        // Create Analytics Data
        const analyticsData = [];
        const today = new Date();

        // Generate last 7 days data
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            // Add some views
            for (let j = 0; j < Math.floor(Math.random() * 5) + 1; j++) {
                analyticsData.push({
                    video: publicVideo._id,
                    user: user._id,
                    type: 'view',
                    date: date
                });
            }
            // Add some likes
            if (i % 2 === 0) {
                analyticsData.push({
                    video: publicVideo._id,
                    user: user._id,
                    type: 'like',
                    date: date
                });
            }
        }

        await Analytics.insertMany(analyticsData);
        console.log(`Created ${analyticsData.length} analytics records`);

        console.log('Seeding completed!');
        process.exit();
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedData();
