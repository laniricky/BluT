# Quick MongoDB Start Guide

MongoDB is installed but needs to be started. Here are your options:

## Option 1: Start MongoDB Service (Recommended)

**Run PowerShell or Command Prompt as Administrator**, then:

```bash
net start MongoDB
```

## Option 2: Start MongoDB Manually

If the service isn't configured, start MongoDB manually:

```bash
# Create data directory if it doesn't exist
mkdir C:\data\db

# Start MongoDB (find mongod.exe in your MongoDB installation)
"C:\Program Files\MongoDB\Server\{version}\bin\mongod.exe" --dbpath "C:\data\db"
```

Replace `{version}` with your MongoDB version (e.g., `7.0`, `8.0`).

## Option 3: Use MongoDB Compass (GUI)

If you installed MongoDB Compass, it can manage the MongoDB server for you.

---

## Verify MongoDB is Running

Once started, open a new terminal and test the connection:

```bash
# If MongoDB is in PATH
mongo --version

# Or try connecting
mongosh
```

You should see a MongoDB shell prompt.

---

## Next: Test the Application

Once MongoDB is running:

1. **Backend** should auto-reconnect (already running with nodemon)
   - Watch for: `✅ MongoDB Connected: localhost`

2. **Start Frontend**:
   ```bash
   cd c:\DEV\BluT\frontend
   npm run dev
   ```

3. **Test in Browser** (`http://localhost:3000`):
   - Click "Get Started"
   - Register a new account
   - Verify you're logged in
   - Logout and login again

---

**Need Help?**

If MongoDB still doesn't start, check:
- Windows Services (search "Services" in Start menu)
- Look for "MongoDB" service
- Right-click → Start
