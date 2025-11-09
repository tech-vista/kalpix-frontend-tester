# 🔧 Troubleshooting Railway Connection

## 🚨 Common Issues and Solutions

### **Issue 1: "Failed to fetch" or CORS Error**

**Symptoms:**
```
Access to fetch at 'http://...:443/...' has been blocked by CORS policy
```

**Cause:** Using HTTP with port 443 (HTTPS port)

**Solution:**

Your `.env` should have:
```bash
REACT_APP_NAKAMA_HOST=kalpix-backend-production.up.railway.app
REACT_APP_NAKAMA_PORT=443
REACT_APP_NAKAMA_USE_SSL=true
REACT_APP_NAKAMA_SERVER_KEY=defaultkey
```

The updated `nakama.js` config will automatically handle port 443 correctly.

**After updating `.env`:**
1. Stop the app (Ctrl+C)
2. Restart: `npm start`
3. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)

---

### **Issue 2: Still Getting HTTP Instead of HTTPS**

**Check browser console logs:**

You should see:
```
🔧 Nakama Configuration: {
  host: "kalpix-backend-production.up.railway.app",
  port: "(default 443)",
  useSSL: true,
  url: "https://kalpix-backend-production.up.railway.app"
}
```

**If you see `http://` instead:**
1. Check `.env` file has `REACT_APP_NAKAMA_USE_SSL=true`
2. Restart the app
3. Hard refresh browser (Ctrl+Shift+R)

---

### **Issue 3: "Redirect is not allowed for a preflight request"**

**Cause:** Railway might be redirecting HTTP to HTTPS

**Solution:** Make sure you're using HTTPS from the start:
- `REACT_APP_NAKAMA_USE_SSL=true`
- Port `443` or empty

---

### **Issue 4: Connection Works But Authentication Fails**

**Check:**
1. Is your backend running? Check Railway logs
2. Do you see "Startup done" in Railway logs?
3. Are environment variables set in Railway?

**Test backend directly:**
```bash
# Test if backend is accessible
curl https://kalpix-backend-production.up.railway.app/

# Should return Nakama API response
```

---

### **Issue 5: Port Configuration Confusion**

**Railway exposes multiple ports:**

| Port | Purpose | How to Access |
|------|---------|---------------|
| 7350 | Main API | `https://your-app.railway.app` (port 443) |
| 7351 | Admin Console | `http://turntable.proxy.rlwy.net:15913` |
| 9100 | Metrics | Railway proxy |

**For your React app:**
- Use the **main domain** (port 7350 → HTTPS 443)
- Don't use the proxy URLs

---

## ✅ **Correct Configuration**

### **Your .env file:**
```bash
REACT_APP_NAKAMA_HOST=kalpix-backend-production.up.railway.app
REACT_APP_NAKAMA_PORT=443
REACT_APP_NAKAMA_USE_SSL=true
REACT_APP_NAKAMA_SERVER_KEY=defaultkey
```

### **Expected console output:**
```
🔧 Nakama Configuration: {
  host: "kalpix-backend-production.up.railway.app",
  port: "(default 443)",
  useSSL: true,
  url: "https://kalpix-backend-production.up.railway.app"
}
✅ Nakama client initialized
```

### **Expected network requests:**
```
POST https://kalpix-backend-production.up.railway.app/v2/rpc/...
```

**NOT:**
```
POST http://kalpix-backend-production.up.railway.app:443/v2/rpc/...  ❌
```

---

## 🔍 **Debug Steps**

### **1. Check .env file**
```bash
cat .env
```

Should show:
```
REACT_APP_NAKAMA_HOST=kalpix-backend-production.up.railway.app
REACT_APP_NAKAMA_PORT=443
REACT_APP_NAKAMA_USE_SSL=true
REACT_APP_NAKAMA_SERVER_KEY=defaultkey
```

### **2. Check browser console**

Open DevTools (F12) → Console

Look for:
```
🔧 Nakama Configuration: {...}
```

Verify:
- `useSSL: true`
- `url` starts with `https://`
- No port in URL (or `:443` is acceptable)

### **3. Check Network tab**

Open DevTools (F12) → Network

Try to authenticate, look for requests to:
```
https://kalpix-backend-production.up.railway.app/v2/rpc/...
```

**If you see `http://` instead of `https://`:**
- Your `.env` is wrong
- Restart the app

### **4. Test backend directly**

Open a new browser tab:
```
https://kalpix-backend-production.up.railway.app/
```

You should see a Nakama response (not an error page).

---

## 🎯 **Quick Fix Checklist**

```
✅ .env file exists in uno-react-tester/
✅ REACT_APP_NAKAMA_HOST is set (no https://)
✅ REACT_APP_NAKAMA_PORT is 443
✅ REACT_APP_NAKAMA_USE_SSL is true
✅ Restarted the app after changing .env
✅ Hard refreshed browser (Ctrl+Shift+R)
✅ Backend is running (check Railway logs)
✅ Backend shows "Startup done" in logs
✅ Browser console shows https:// URLs
```

---

## 🆘 **Still Not Working?**

### **Try Alternative Port Configuration:**

Some Railway deployments might need port 7350 explicitly:

```bash
REACT_APP_NAKAMA_HOST=kalpix-backend-production.up.railway.app
REACT_APP_NAKAMA_PORT=7350
REACT_APP_NAKAMA_USE_SSL=true
REACT_APP_NAKAMA_SERVER_KEY=defaultkey
```

Restart and test.

### **Check Railway Networking:**

1. Go to Railway Dashboard
2. Click your backend service
3. Settings → Networking
4. Verify the domain for Port 7350

### **Check Railway Logs:**

1. Go to Railway Dashboard
2. Click your backend service
3. Deployments → Active deployment
4. Check for errors

---

## 📞 **Get Help**

If still stuck, provide:
1. Your `.env` file content (hide sensitive keys)
2. Browser console logs
3. Railway deployment logs
4. Network tab screenshot showing the failed request

---

**Most common fix:** Restart the app after changing `.env`! 🔄

