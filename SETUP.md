# BluT Setup Guide

## 📋 Prerequisites

Before starting, ensure you have:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (Local installation) - [Download](https://www.mongodb.com/try/download/community)
- **npm** (comes with Node.js)

## 🚀 Quick Start

### 1. Install Backend Dependencies

```bash
cd c:\DEV\BluT\backend
npm install
```

### 2. Configure Environment

Copy the example environment file and update if needed:

```bash
# In c:\DEV\BluT\backend\
copy .env.example .env
```

The `.env` file should contain:
```
MONGO_URI=mongodb://localhost:27017/blut
JWT_SECRET=blut-secret-key-change-in-production-2026
PORT=5000
NODE_ENV=development
```

### 3. Start MongoDB

**Option A: Windows Service**
```bash
net start MongoDB
```

**Option B: Manual Start**
```bash
mongod --dbpath "C:\data\db"
```

### 4. Start Backend Server

```bash
# In c:\DEV\BluT\backend\
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost
🚀 Server running on port 5000
```

### 5. Install Frontend Dependencies

Open a new terminal:

```bash
cd c:\DEV\BluT\frontend
npm install
```

### 6. Start Frontend Development Server

```bash
# In c:\DEV\BluT\frontend\
npm run dev
```

The browser should automatically open at `http://localhost:3000`

## ✅ Verification

### Test the Backend API

Open a browser or use curl/Postman:

**Health Check:**
```
http://localhost:5000/api/health
```

Should return:
```json
{
  "success": true,
  "message": "BluT API is running",
  "timestamp": "..."
}
```

### Test the Frontend

1. Navigate to `http://localhost:3000`
2. Click "Get Started" to register
3. Fill in the registration form
4. After successful registration, you should be logged in automatically
5. Try logging out and logging back in

## 🔧 Troubleshooting

### MongoDB Connection Error

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution:**
- Ensure MongoDB is running: `net start MongoDB`
- Check if MongoDB is installed
- Verify MONGO_URI in `.env` matches your MongoDB installation

### Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
- Change PORT in `backend/.env` to a different port (e.g., 5001)
- Or kill the process using port 5000

### CORS Errors

If you see CORS errors in the browser console:
- Ensure backend is running on port 5000
- Check that `frontend/src/api/axios.js` has the correct base URL

### Module Not Found Errors

If you get "Cannot find module" errors:
- Delete `node_modules` folder
- Run `npm install` again

## 📱 Testing the Auth Flow

1. **Register a new user:**
   - Go to `/register`
   - Enter username, email, password
   - Submit the form

2. **Verify registration:**
   - You should be automatically logged in
   - Homepage should show your username

3. **Logout:**
   - Click the "Logout" button
   - You should see the public homepage again

4. **Login:**
   - Click "Login"
   - Enter your email and password
   - You should be logged in again

## 🎯 Next Steps

Once authentication is working:
- Vertical Slice 2: Video Browsing
- Vertical Slice 3: User Profiles & Following
- And more...

See [task.md](../../../.gemini/antigravity/brain/b6392760-c76c-4c8a-837c-785e62e2ddbc/task.md) for the full roadmap!
