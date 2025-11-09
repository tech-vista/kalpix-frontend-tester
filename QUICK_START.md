# ⚡ Quick Start - Connect to Railway Backend

## 🎯 **3 Steps to Connect**

### **Step 1: Create .env file**

```bash
cd uno-react-tester
cp .env.example .env
```

### **Step 2: Edit .env with your Railway URL**

Open `.env` and replace with your Railway domain:

```bash
REACT_APP_NAKAMA_HOST=kalpix-backend-production.up.railway.app
REACT_APP_NAKAMA_PORT=443
REACT_APP_NAKAMA_USE_SSL=true
REACT_APP_NAKAMA_SERVER_KEY=defaultkey
```

**Get your Railway URL:**
- Go to Railway Dashboard
- Click your backend service
- Settings → Networking
- Copy the domain (without `https://`)

### **Step 3: Start the app**

```bash
npm start
```

---

## 🌐 **Access Admin Dashboard**

**URL:** `https://kalpix-backend-production-7351.up.railway.app`

**Login:**
- Username: `admin`
- Password: `loginkro`

---

## 🔄 **Switch to Local Development**

Edit `.env`:
```bash
REACT_APP_NAKAMA_HOST=localhost
REACT_APP_NAKAMA_PORT=7350
REACT_APP_NAKAMA_USE_SSL=false
```

Restart: `npm start`

---

## ✅ **Verify Connection**

Open browser console, you should see:
```
✅ Nakama client initialized: {
  host: "kalpix-backend-production.up.railway.app",
  port: "443",
  useSSL: true
}
```

---

**That's it! You're connected!** 🚀

For detailed instructions, see `RAILWAY_SETUP.md`

