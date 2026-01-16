# BluT - Custom Video Streaming Platform

A modern video streaming platform built with React and Node.js, designed to provide a premium viewing experience with creator-focused tools and social features.

## 🚀 Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Mongoose
- **Database**: MongoDB
- **Containerization**: Docker + Docker Compose
- **Authentication**: JWT + bcrypt

## 📋 Features

- **Authentication**: Secure user registration and login with JWT.
- **Video Playback**: Custom video player with theater mode and quality controls.
- **Shorts**: TikTok-style vertical video feed with infinite scroll.
- **User Profiles**: 
    - Custom avatars and cover photos.
    - Follow system.
    - Channel pages with video lists.
- **Content Creation**:
    - Video upload with thumbnail generation.
    - Rich text description and tagging.
    - **Creator Notes** for timestamped annotations (replacing standard chapters).
- **Engagement**: 
    - Likes, dislikes, and threaded comments.
    - Watch history and resume playback.
    - Algorithmic and "Following" feeds.
- **Creator Dashboard**: Analytics for views, engagement, and follower growth.

## 🛠️ Getting Started (Docker)

The easiest way to run BluT is using Docker Compose.

### Prerequisites
- Docker Desktop installed and running.

### Installation & Run

1. **Clone the repository**
   ```bash
   cd c:\DEV\BluT
   ```

2. **Start the Application**
   ```bash
   docker-compose up -d --build
   ```

3. **Access the App**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:5000

4. **Stop the Application**
   ```bash
   docker-compose down
   ```

## 💻 Local Development (Manual Setup)

If you prefer to run locally without Docker:

1. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Ensure local MongoDB is running
   npm run dev
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 📖 Project Structure

- `/backend` - Express REST API and MongoDB models.
- `/frontend` - React SPA (Single Page Application).
- `docker-compose.yml` - Orchestration for App, API, and DB.

## 📝 License

MIT
