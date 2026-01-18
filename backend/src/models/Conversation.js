import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
        ],
        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
        },
        unreadCount: {
            type: Map,
            of: Number,
            default: new Map(),
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to ensure unique conversations and fast lookups
conversationSchema.index({ participants: 1 });

// Method to increment unread count for a user
conversationSchema.methods.incrementUnread = function (userId) {
    const currentCount = this.unreadCount.get(userId.toString()) || 0;
    this.unreadCount.set(userId.toString(), currentCount + 1);
    return this.save();
};

// Method to reset unread count for a user
conversationSchema.methods.resetUnread = function (userId) {
    this.unreadCount.set(userId.toString(), 0);
    return this.save();
};

// Method to get unread count for a user
conversationSchema.methods.getUnreadCount = function (userId) {
    return this.unreadCount.get(userId.toString()) || 0;
};

// Static method to find or create conversation
conversationSchema.statics.findOrCreateConversation = async function (user1Id, user2Id) {
    // Sort participant IDs to ensure consistent ordering
    const participants = [user1Id.toString(), user2Id.toString()].sort();

    let conversation = await this.findOne({
        participants: { $all: participants, $size: 2 },
    })
        .populate('participants', 'username avatar')
        .populate({
            path: 'lastMessage',
            populate: {
                path: 'sender receiver',
                select: 'username avatar',
            },
        });

    if (!conversation) {
        conversation = await this.create({
            participants,
            unreadCount: new Map([
                [user1Id.toString(), 0],
                [user2Id.toString(), 0],
            ]),
        });

        // Populate after creation
        conversation = await conversation.populate('participants', 'username avatar');
    }

    return conversation;
};

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
