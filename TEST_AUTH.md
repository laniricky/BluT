# BluT Authentication Test Script

This script will help you test if MongoDB is running and the auth system is working.

## Quick MongoDB Status Check

### Option 1: Check if MongoDB Service is Running

```powershell
# Run in PowerShell
Get-Service -Name MongoDB
```

If it shows "Running" - you're good! Skip to "Test the Application" below.

If it shows "Stopped" or errors:

### Option 2: Start MongoDB Service

**Run PowerShell as Administrator**, then:

```powershell
# Start the service
Start-Service MongoDB

# Or use net command
net start MongoDB

# Verify it's running
Get-Service -Name MongoDB
```

### Option 3: Manual MongoDB Start

If the service doesn't exist, start MongoDB manually:

1. Find your MongoDB installation:
   - Usually: `C:\Program Files\MongoDB\Server\{version}\bin\mongod.exe`
   
2. Create data directory:
   ```powershell
   New-Item -ItemType Directory -Path "C:\data\db" -Force
   ```

3. Start MongoDB:
   ```powershell
   & "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath "C:\data\db"
   ```
   (Keep this terminal open)

---

## Test the Application

Once MongoDB is running, your backend should auto-connect!

### 1. Verify Backend is Connected

Check the backend terminal. You should see:
```
✅ MongoDB Connected: localhost
🚀 Server running on port 5000
📍 Environment: development
```

### 2. Test API Endpoint

Open a new terminal and test the health endpoint:

```powershell
# Using Invoke-WebRequest (PowerShell)
Invoke-WebRequest -Uri http://localhost:5000/api/health | Select-Object -Expand Content

# Or use curl if available
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "BluT API is running",
  "timestamp": "..."
}
```

### 3. Test Registration in Browser

1. Open browser: `http://localhost:3000`
2. Click "Get Started"
3. Fill in the form:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `password123`
   - Confirm: `password123`
4. Click "Create Account"

**Expected:** You should be logged in and see your username on the homepage!

### 4. Test Logout and Login

1. Click "Logout" button
2. Click "Login"
3. Enter your email and password
4. Click "Login"

**Expected:** You should be logged in again!

---

## Troubleshooting

### Backend shows "MongoDB connection error"
- Ensure MongoDB service is running
- Check if MongoDB is on port 27017
- Verify `backend/.env` has correct MONGO_URI

### Frontend shows network errors
- Check backend is running on port 5000
- Check CORS is enabled
- Verify `frontend/src/api/axios.js` has correct base URL

### Registration fails
- Check backend terminal for errors
- Open browser DevTools (F12) → Console tab
- Look for error messages

---

## Success Criteria ✅

If all tests pass, you should be able to:
- [x] Register a new user
- [x] See user info on homepage after registration
- [x] Logout successfully
- [x] Login with existing credentials
- [x] See JWT token stored in localStorage (DevTools → Application → Local Storage)

**If everything works** → Vertical Slice 1 is COMPLETE! 🎉

---

## What's Next?

Once authentication is verified:
- **Vertical Slice 2**: Video Browsing
  - Video model with sample data
  - Homepage video grid
  - Video watch page
  - Search functionality

See the roadmap in [task.md](file:///C:/Users/rucom/.gemini/antigravity/brain/b6392760-c76c-4c8a-837c-785e62e2ddbc/task.md)!
