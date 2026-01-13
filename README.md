# BluT - Custom Video Streaming Platform

A modern video streaming platform built with React and Node.js, featuring unique interactions like scene-based comments and creator-focused tools.

## 🚀 Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Mongoose
- **Database**: MongoDB (local)
- **Authentication**: JWT + bcrypt

## 📋 Current Status

**Vertical Slice 1: User Authentication** ✅ In Progress
- User registration & login
- JWT token-based auth
- Password hashing

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB installed locally
- npm or yarn

### Installation

1. **Clone & Navigate**
   ```bash
   cd c:\DEV\BluT
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create .env file with your configuration
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Start MongoDB** (Windows)
   ```bash
   # Make sure MongoDB is installed
   net start MongoDB
   ```

### Environment Variables

Create `backend/.env`:
```
MONGO_URI=mongodb://localhost:27017/blut
JWT_SECRET=your-secret-key-change-this
PORT=5000
```

## 📖 Development Roadmap

See [myplan.md](./myplan.md) for the complete 200-day development roadmap.

## 🎯 Vertical Slices

1. ✅ **Authentication** - Register, Login, JWT
2. 🔜 **Video Browsing** - List, watch, search videos
3. 🔜 **User Profiles** - Follow creators, view profiles
4. 🔜 **Video Upload** - Local file uploads
5. 🔜 **Engagement** - Likes, comments
6. 🔜 **Scene Markers** - Time-based navigation
7. 🔜 **Creator Dashboard** - Analytics, management
8. 🔜 **Advanced Features** - Watch history, moderation

## 📝 License

MIT
