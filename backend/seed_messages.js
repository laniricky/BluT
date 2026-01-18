import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Message from './src/models/Message.js';
import Conversation from './src/models/Conversation.js';

dotenv.config();

const seedMessages = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Find some existing users (assuming you have seeded users)
        const users = await User.find().limit(5);

        if (users.length < 2) {
            console.log('⚠️  Need at least 2 users to seed messages. Run seed.js first.');
            process.exit(1);
        }

        console.log(`Found ${users.length} users`);

        // Clear existing messages and conversations
        await Message.deleteMany({});
        await Conversation.deleteMany({});
        console.log('🗑️  Cleared existing messages and conversations');

        // Create conversations and messages between users
        const conversations = [];
        const messages = [];

        // Conversation 1: User[0] <-> User[1]
        if (users[0] && users[1]) {
            const conv1 = await Conversation.findOrCreateConversation(
                users[0]._id,
                users[1]._id
            );
            conversations.push(conv1);

            const msg1 = await Message.create({
                conversationId: conv1._id,
                sender: users[0]._id,
                receiver: users[1]._id,
                content: 'Hey! I just watched your latest video. It was amazing! 🎥',
                read: true,
                readAt: new Date(Date.now() - 3600000), // 1 hour ago
                createdAt: new Date(Date.now() - 7200000), // 2 hours ago
            });

            const msg2 = await Message.create({
                conversationId: conv1._id,
                sender: users[1]._id,
                receiver: users[0]._id,
                content: 'Thank you so much! That means a lot to me. What did you like most about it?',
                read: true,
                readAt: new Date(Date.now() - 3000000), // 50 min ago
                createdAt: new Date(Date.now() - 3600000), // 1 hour ago
            });

            const msg3 = await Message.create({
                conversationId: conv1._id,
                sender: users[0]._id,
                receiver: users[1]._id,
                content: 'The editing was superb! How long did it take you?',
                read: false,
                createdAt: new Date(Date.now() - 1800000), // 30 min ago
            });

            messages.push(msg1, msg2, msg3);

            // Update conversation
            conv1.lastMessage = msg3._id;
            await conv1.incrementUnread(users[1]._id);
            await conv1.save();
        }

        // Conversation 2: User[0] <-> User[2]
        if (users[0] && users[2]) {
            const conv2 = await Conversation.findOrCreateConversation(
                users[0]._id,
                users[2]._id
            );
            conversations.push(conv2);

            const msg4 = await Message.create({
                conversationId: conv2._id,
                sender: users[2]._id,
                receiver: users[0]._id,
                content: 'Are you going to upload a new video soon?',
                read: true,
                readAt: new Date(Date.now() - 600000), // 10 min ago
                createdAt: new Date(Date.now() - 1200000), // 20 min ago
            });

            const msg5 = await Message.create({
                conversationId: conv2._id,
                sender: users[0]._id,
                receiver: users[2]._id,
                content: 'Yes! Working on something exciting. Should be ready by next week 🚀',
                read: false,
                createdAt: new Date(Date.now() - 300000), // 5 min ago
            });

            messages.push(msg4, msg5);

            // Update conversation
            conv2.lastMessage = msg5._id;
            await conv2.incrementUnread(users[2]._id);
            await conv2.save();
        }

        // Conversation 3: User[1] <-> User[2]
        if (users[1] && users[2]) {
            const conv3 = await Conversation.findOrCreateConversation(
                users[1]._id,
                users[2]._id
            );
            conversations.push(conv3);

            const msg6 = await Message.create({
                conversationId: conv3._id,
                sender: users[1]._id,
                receiver: users[2]._id,
                content: 'Hey, want to collaborate on a video?',
                read: false,
                createdAt: new Date(Date.now() - 86400000), // 1 day ago
            });

            messages.push(msg6);

            // Update conversation
            conv3.lastMessage = msg6._id;
            await conv3.incrementUnread(users[2]._id);
            await conv3.save();
        }

        console.log(`✅ Created ${conversations.length} conversations`);
        console.log(`✅ Created ${messages.length} messages`);
        console.log('\n📊 Seed Summary:');
        console.log(`   - Users involved: ${users.length}`);
        console.log(`   - Conversations: ${conversations.length}`);
        console.log(`   - Messages: ${messages.length}`);

        console.log('\n✅ Message seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding messages:', error);
        process.exit(1);
    }
};

seedMessages();
