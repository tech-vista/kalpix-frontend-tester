# Authentication System Tester

A comprehensive React-based testing interface for the Kalpix authentication system.

## 🚀 Quick Start

### 1. Start the Backend

```bash
cd kalpix-backend
go run src/main.go
```

The backend should be running on `localhost:7350`.

### 2. Start the React App

```bash
cd uno-react-tester
npm install  # If not already installed
npm start
```

The app will open at `http://localhost:3000`.

### 3. Switch to Auth Tester Mode

The app is already configured to run in auth mode. If you need to switch:

Edit `src/index.js` and change:
```javascript
const APP_MODE = 'auth'; // or 'uno' for UNO game tester
```

---

## 📋 Features

### Authentication Methods

#### 1. **Guest Login** 👤
- Quick login with device ID
- Auto-generated username (e.g., `lightning-legend`)
- Unsecured account (data lost on logout)

**Test Flow:**
1. Click "Guest Login" tab
2. Use the pre-filled device ID or enter your own
3. Click "Login as Guest"
4. ✅ You're logged in!

#### 2. **Email Registration** 📝
- Register with username, email, and password
- OTP verification via email
- Secure account after verification

**Test Flow:**
1. Click "Register" tab
2. Enter username (check availability automatically)
3. Enter email and password
4. Click "Send OTP"
5. Check your email for the 6-digit OTP
6. Enter OTP and click "Verify & Register"
7. ✅ Account created and logged in!

#### 3. **Email Login** 🔑
- Login with existing email account
- OTP verification for security

**Test Flow:**
1. Click "Email Login" tab
2. Enter your registered email and password
3. Click "Send OTP"
4. Check your email for the 6-digit OTP
5. Enter OTP and click "Verify & Login"
6. ✅ Logged in!

#### 4. **Google OAuth** 🔵
- Login with Google account
- Auto-generated username
- Secure account automatically

**Test Flow:**
1. Click "Google" tab
2. Get your Google ID token (from Google OAuth flow)
3. Paste the token
4. Click "Login with Google"
5. ✅ Logged in!

---

## 🔐 Authenticated Features

Once logged in, you can test:

### Profile Management 👤

**View Profile:**
- Click "Load Profile" to see all user data
- Shows: username, email, account type, security status, social stats, etc.

**Update Profile:**
- Change display name
- Update bio
- Set country code
- Click "Update Profile" to save

### Account Linking 🔗

**For Guest Accounts Only:**
- If you logged in as guest, you'll see a warning banner
- Link an email to upgrade to a secure account
- Enter email and password
- Verify with OTP
- ✅ Account is now secure!

### Session Management 🔄

- Click "Refresh Session" to renew your session token
- WebSocket connection controls
- Logout button

---

## 🧪 Testing Scenarios

### Scenario 1: Guest to Secure Account Upgrade

1. Login as guest
2. Load profile - see `isSecure: false`
3. Click "Link Email" in the warning banner
4. Enter email and password
5. Verify OTP
6. Load profile again - see `isSecure: true`
7. ✅ Account upgraded!

### Scenario 2: Email Registration Flow

1. Click "Register" tab
2. Enter username "testuser123"
3. Check if available (should show ✅ Available)
4. Enter email "test@example.com"
5. Enter password "SecurePass123"
6. Click "Send OTP"
7. Check email for OTP
8. Enter OTP and verify
9. ✅ Account created!

### Scenario 3: Profile Update

1. Login with any method
2. Click "Load Profile"
3. Update display name to "Test User"
4. Update bio to "Testing the auth system"
5. Set country to "US"
6. Click "Update Profile"
7. Load profile again to verify changes
8. ✅ Profile updated!

### Scenario 4: Multiple Accounts

1. Open app in normal window - login as guest
2. Open app in incognito window - register with email
3. Compare profiles
4. Guest account: `isSecure: false`
5. Email account: `isSecure: true`
6. ✅ Different account types working!

---

## 🎨 UI Features

### Status Messages
- ✅ **Success** (green) - Operation completed
- ❌ **Error** (red) - Operation failed
- ℹ️ **Info** (blue) - Information message

### Real-time Validation
- Username availability check on blur
- Password strength indicator
- Email format validation

### Responsive Design
- Works on desktop and mobile
- Adaptive layout
- Touch-friendly buttons

---

## 🔧 Configuration

### Server Settings

Click "Show Config" to modify:
- **Host**: Default `localhost`
- **Port**: Default `7350`
- **Server Key**: Default `defaultkey`
- **Use SSL**: Enable for HTTPS

### Environment Variables

For production, update:
```javascript
const serverConfig = {
  host: 'your-production-server.com',
  port: '443',
  useSSL: true,
  serverKey: 'your-production-key'
};
```

---

## 📊 Testing Checklist

### Guest Login
- [ ] Login with device ID
- [ ] Auto-generated username
- [ ] Profile shows `isSecure: false`
- [ ] Warning banner appears

### Email Registration
- [ ] Username availability check
- [ ] OTP sent to email
- [ ] OTP verification works
- [ ] Account created with `isSecure: true`
- [ ] Auto-login after registration

### Email Login
- [ ] OTP sent to email
- [ ] OTP verification works
- [ ] Login successful
- [ ] Session created

### Google OAuth
- [ ] Login with Google token
- [ ] Auto-generated username
- [ ] Account created with `isSecure: true`

### Account Linking
- [ ] Guest account shows warning
- [ ] Link email form appears
- [ ] OTP sent to email
- [ ] OTP verification works
- [ ] Account upgraded to secure
- [ ] Warning banner disappears

### Profile Management
- [ ] Load profile shows all data
- [ ] Update display name works
- [ ] Update bio works
- [ ] Update country works
- [ ] Changes persist after reload

### Session Management
- [ ] Refresh session works
- [ ] WebSocket connection works
- [ ] Logout clears session

---

## 🐛 Troubleshooting

### "Failed to connect to server"
- Check if backend is running on `localhost:7350`
- Verify server configuration
- Check firewall settings

### "OTP not received"
- Check email spam folder
- Verify email service is configured in backend
- Check backend logs for email sending errors

### "Username already taken"
- Try a different username
- Check if username was used in previous test

### "Invalid OTP"
- OTP expires after 10 minutes
- Maximum 3 attempts per OTP
- Request a new OTP if expired

### "Session expired"
- Click "Refresh Session"
- Or logout and login again

---

## 📝 API Endpoints Tested

This tester covers all 12 authentication RPC endpoints:

1. `auth/device_login` - Guest login
2. `auth/register_email` - Email registration
3. `auth/verify_registration_otp` - Verify registration
4. `auth/check_username_available` - Check username
5. `auth/send_otp` - Send login OTP
6. `auth/verify_otp` - Verify login OTP
7. `auth/google_login` - Google OAuth
8. `auth/link_email` - Link email to guest
9. `auth/verify_email_link` - Verify email link
10. `auth/get_profile` - Get user profile
11. `auth/update_profile` - Update profile
12. `auth/refresh_session` - Refresh session

---

## 🎯 Next Steps

After testing the authentication system:

1. **Test Social Features** - Switch to UNO mode to test social RPCs
2. **Test Game Features** - Play UNO games to test game logic
3. **Integration Testing** - Test auth + social + game together
4. **Performance Testing** - Test with multiple concurrent users
5. **Production Deployment** - Deploy to production environment

---

## 💡 Tips

- Use different browser windows/incognito for testing multiple accounts
- Keep backend logs open to see server-side activity
- Use browser DevTools Network tab to inspect RPC calls
- Check browser console for detailed error messages
- Test on different devices (desktop, mobile, tablet)

---

## 📞 Support

If you encounter issues:
1. Check backend logs
2. Check browser console
3. Verify server configuration
4. Review API documentation in `kalpix-backend/API_USAGE_GUIDE.md`

---

**Happy Testing! 🚀**

