import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './src/config/database.js';
import User from './src/models/User.js';
import Video from './src/models/Video.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const sampleVideos = [
    {
        title: 'Big Buck Bunny',
        description: 'Big Buck Bunny tells the story of a giant rabbit with a heart bigger than himself. When one sunny day three rodents rudely harass him, something snaps... and the bunny goes bad.',
        videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/800px-Big_buck_bunny_poster_big.jpg',
        duration: '9:56'
    },
    {
        title: 'Elephant Dream',
        description: 'The first open movie from Blender Foundation.',
        videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Elephants_Dream_s5_both.jpg',
        duration: '10:53'
    },
    {
        title: 'For Bigger Blazes',
        description: 'HBO GO now works with Chromecast -- the easiest way to enjoy online video on your TV.',
        videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnailUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
        duration: '0:15'
    },
    {
        title: 'For Bigger Escapes',
        description: 'Introducing Chromecast. The easiest way to enjoy online video and music on your TV.',
        videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        thumbnailUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg',
        duration: '0:15'
    },
    {
        title: 'Sintel',
        description: 'Sintel is an independently produced short film, initiated by the Blender Foundation.',
        videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Sintel_poster.jpg/800px-Sintel_poster.jpg',
        duration: '14:48'
    },
    {
        title: 'Tears of Steel',
        description: 'Tears of Steel was realized with crowd-funding support of users of the open source 3D creation tool Blender.',
        videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Tears_of_Steel_poster.jpg/800px-Tears_of_Steel_poster.jpg',
        duration: '12:14'
    }
];

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await Video.deleteMany({});
        await User.deleteMany({ email: 'creator@blut.test' });

        console.log('🧹 Cleared existing data');

        // Create a creator user
        const creator = await User.create({
            username: 'BlutCreator',
            email: 'creator@blut.test',
            password: 'password123',
            role: 'creator',
            bio: 'Official content creator for BluT platform demo.',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BlutCreator'
        });

        console.log(`👤 Created creator: ${creator.username}`);

        // Create videos linked to creator
        // Generate more videos by duplicating the sample list with slight variations
        const videosToInsert = [];

        // Add original samples
        sampleVideos.forEach(v => {
            videosToInsert.push({
                ...v,
                user: creator._id,
                views: Math.floor(Math.random() * 10000)
            });
        });

        // Add some duplicates with different titles to fill the grid
        sampleVideos.forEach((v, i) => {
            videosToInsert.push({
                ...v,
                title: `${v.title} (Remix)`,
                user: creator._id,
                views: Math.floor(Math.random() * 5000)
            });
        });

        sampleVideos.forEach((v, i) => {
            videosToInsert.push({
                ...v,
                title: `${v.title} - Behind the Scenes`,
                user: creator._id,
                views: Math.floor(Math.random() * 2000)
            });
        });

        await Video.insertMany(videosToInsert);

        console.log(`📹 Seeded ${videosToInsert.length} videos`);
        console.log('✅ Seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
};

seedData();
