# 🚀 Connect UNO React App to Railway Backend

This guide shows you how to configure your UNO React app to use your Railway-deployed Nakama backend.

---

## 📋 **Step 1: Get Your Railway URLs**

### **Find Your Backend URLs:**

1. Go to Railway Dashboard
2. Click on your **kalpix-backend** service
3. Go to **"Settings"** → **"Networking"**
4. You'll see domains like:

```
Main API (Port 7350):
https://kalpix-backend-production.up.railway.app

Admin Console (Port 7351):
https://kalpix-backend-production-7351.up.railway.app

Metrics (Port 9100):
https://kalpix-backend-production-9100.up.railway.app
```

### **Important: Extract the Host**

From the URL `https://kalpix-backend-production.up.railway.app`, extract:
- **Host:** `kalpix-backend-production.up.railway.app`
- **Port:** `443` (HTTPS default)
- **Use SSL:** `true`

---

## 📋 **Step 2: Create .env File**

In the `uno-react-tester` directory, create a `.env` file:

```bash
cd uno-react-tester
cp .env.example .env
```

### **Edit .env with your Railway URL:**

```bash
# Nakama Server Configuration - Railway Production
REACT_APP_NAKAMA_HOST=kalpix-backend-production.up.railway.app
REACT_APP_NAKAMA_PORT=443
REACT_APP_NAKAMA_USE_SSL=true
REACT_APP_NAKAMA_SERVER_KEY=defaultkey
```

**Replace `kalpix-backend-production.up.railway.app` with your actual Railway domain!**

---

## 📋 **Step 3: Install Dependencies (if not already done)**

```bash
cd uno-react-tester
npm install
```

---

## 📋 **Step 4: Start the React App**

```bash
npm start
```

The app will open at `http://localhost:3000`.

---

## 🎯 **Step 5: Test the Connection**

### **Option A: Using the Main App**

1. Open `http://localhost:3000`
2. You should see the login page
3. Try to authenticate with email/password
4. Check browser console for connection logs:
   ```
   ✅ Nakama client initialized: {
     host: "kalpix-backend-production.up.railway.app",
     port: "443",
     useSSL: true
   }
   ```

### **Option B: Using Auth Tester**

1. Edit `src/index.js` and change to auth mode (if needed)
2. Open the app
3. Click "Show Config" to verify server settings
4. Try authentication methods

---

## 🔧 **Configuration Files Updated**

The following files have been updated to use centralized configuration:

### **1. `src/config/nakama.js`** (NEW)
- Centralized Nakama configuration
- Reads from environment variables
- Provides helper functions

### **2. `src/App.js`**
- Updated to use `nakamaConfig`
- Removed hardcoded `localhost:7350`

### **3. `src/MainApp.js`**
- Updated to use `nakamaConfig`
- Removed hardcoded `localhost:7350`

### **4. `src/AuthTestApp.js`**
- Updated to use `nakamaConfig`
- Removed hardcoded `localhost:7350`

---

## 🌐 **Access Nakama Admin Dashboard**

### **URL:**
```
https://kalpix-backend-production-7351.up.railway.app
```

### **Login Credentials:**
- **Username:** `admin`
- **Password:** `loginkro`

### **What You Can Do:**
- View active users
- Monitor matches
- Check server status
- View runtime logs
- Manage storage
- Test RPCs

---

## 🔄 **Switch Between Local and Production**

### **For Local Development:**

Edit `.env`:
```bash
REACT_APP_NAKAMA_HOST=localhost
REACT_APP_NAKAMA_PORT=7350
REACT_APP_NAKAMA_USE_SSL=false
REACT_APP_NAKAMA_SERVER_KEY=defaultkey
```

### **For Production (Railway):**

Edit `.env`:
```bash
REACT_APP_NAKAMA_HOST=kalpix-backend-production.up.railway.app
REACT_APP_NAKAMA_PORT=443
REACT_APP_NAKAMA_USE_SSL=true
REACT_APP_NAKAMA_SERVER_KEY=defaultkey
```

### **Restart the app after changing .env:**
```bash
# Stop the app (Ctrl+C)
# Start again
npm start
```

---

## 🐛 **Troubleshooting**

### **Issue 1: "Failed to connect to server"**

**Cause:** Wrong host or port in `.env`

**Fix:**
1. Check Railway dashboard for correct URL
2. Make sure you're using the **host only** (no `https://`)
3. Use port `443` for HTTPS
4. Set `REACT_APP_NAKAMA_USE_SSL=true`

**Example:**
```bash
# ❌ WRONG
REACT_APP_NAKAMA_HOST=https://kalpix-backend-production.up.railway.app

# ✅ CORRECT
REACT_APP_NAKAMA_HOST=kalpix-backend-production.up.railway.app
```

### **Issue 2: "CORS error"**

**Cause:** Railway backend not allowing your frontend origin

**Fix:**
This shouldn't happen with Nakama, but if it does:
1. Check Nakama console logs
2. Verify your backend is running (check Railway logs)
3. Make sure port 7350 is exposed and accessible

### **Issue 3: "WebSocket connection failed"**

**Cause:** SSL mismatch or wrong port

**Fix:**
1. Make sure `REACT_APP_NAKAMA_USE_SSL=true` for Railway
2. Use port `443` (not `7350`) for HTTPS
3. Check browser console for detailed error

### **Issue 4: ".env changes not taking effect"**

**Cause:** React doesn't hot-reload .env changes

**Fix:**
1. Stop the app (Ctrl+C)
2. Start again: `npm start`
3. Clear browser cache if needed

### **Issue 5: "Authentication failed"**

**Cause:** Backend not running or database not connected

**Fix:**
1. Check Railway deployment logs
2. Make sure you see "Startup done" in logs
3. Verify environment variables are set in Railway
4. Check database is running

---

## 📊 **Verify Everything is Working**

### **1. Check Browser Console**

You should see:
```
✅ Nakama client initialized: {
  host: "kalpix-backend-production.up.railway.app",
  port: "443",
  useSSL: true
}
```

### **2. Test Authentication**

Try to login with email/password:
- Email: `test@example.com`
- Password: `Test123456`

### **3. Check Railway Logs**

In Railway dashboard, you should see:
```
{"level":"info","msg":"Session created","user_id":"..."}
```

### **4. Test Match Creation**

Try to create a UNO match and verify it appears in Nakama admin console.

---

## 🎯 **Production Deployment**

When you deploy your React app to production (e.g., Vercel, Netlify):

### **Option 1: Environment Variables in Hosting Platform**

Set these in your hosting platform (Vercel/Netlify):
```
REACT_APP_NAKAMA_HOST=kalpix-backend-production.up.railway.app
REACT_APP_NAKAMA_PORT=443
REACT_APP_NAKAMA_USE_SSL=true
REACT_APP_NAKAMA_SERVER_KEY=defaultkey
```

### **Option 2: Build with Production Config**

Before building:
```bash
# Update .env with production values
npm run build
```

The build will include the environment variables.

---

## 📚 **Summary**

**What you need to do:**

1. ✅ Create `.env` file in `uno-react-tester/`
2. ✅ Add your Railway URL to `.env`
3. ✅ Run `npm start`
4. ✅ Test authentication
5. ✅ Access admin dashboard at port 7351

**Configuration:**
```bash
REACT_APP_NAKAMA_HOST=kalpix-backend-production.up.railway.app
REACT_APP_NAKAMA_PORT=443
REACT_APP_NAKAMA_USE_SSL=true
REACT_APP_NAKAMA_SERVER_KEY=defaultkey
```

**Admin Dashboard:**
```
URL: https://kalpix-backend-production-7351.up.railway.app
Username: admin
Password: loginkro
```

---

**You're all set! Your React app is now connected to your Railway backend!** 🎉

