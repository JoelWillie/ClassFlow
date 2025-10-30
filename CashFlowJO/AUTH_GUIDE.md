# 🔐 ClassFlow Authentication Guide

## Overview

ClassFlow now features a **complete authentication system** with secure login, signup, and guest mode - all running **100% client-side** with no server required!

---

## 🚀 Getting Started

### First-Time Users

1. Open `intro.html` in your browser
2. See the animated welcome screen with floating papers
3. Click **"Get Started"**
4. Choose one of three options:
   - **Login** - If you have an account
   - **Sign Up** - Create a new account
   - **Guest** - Try without signing up

---

## 🎭 Three Ways to Use ClassFlow

### 1. 👤 **Create an Account** (Recommended)
**Best for:** Long-term use, multiple devices

**Steps:**
1. Click "Sign Up" tab
2. Enter display name (optional)
3. Enter email
4. Create password (min 6 characters)
5. Confirm password
6. Click "Create Account"

**Benefits:**
- ✅ Data saved permanently
- ✅ Secure password protection
- ✅ Export/import to other devices
- ✅ Full feature access

### 2. 🔑 **Login** (Returning Users)
**For:** Users who already have an account

**Steps:**
1. Click "Login" tab
2. Enter your email
3. Enter your password
4. Click "Login"

**Your Data:**
- All your assignments, notes, courses load automatically
- Theme preferences restored
- Continues where you left off

### 3. 👻 **Guest Mode** (Quick Try)
**For:** Testing the app, temporary use

**Steps:**
1. Click "Guest" tab
2. Enter nickname (optional)
3. Click "Continue as Guest"

**⚠️ Important:**
- Data is **temporary** (session-only)
- Lost when you close the tab
- Can convert to account anytime to save everything!

---

## 🔐 Security Features

### Password Hashing
- Uses **Web Crypto API** with SHA-256
- Passwords are **never stored** in plain text
- Each password has a unique salt
- Impossible to reverse-engineer

### Local Storage
- All data stored **only on your device**
- Never sent to any server
- Browser IndexedDB isolation
- Each user's data is completely separate

### Multi-User Support
- Multiple people can use ClassFlow on same computer
- Each account is completely isolated
- No cross-user data access

---

## 🔄 Converting Guest to Account

**Scenario:** You started as guest and want to keep your data

**Steps:**
1. Click the 👤 icon (top-right)
2. Click "Convert to Account"
3. Enter your details (name, email, password)
4. Click "Create Account & Save Data"
5. Done! Your guest data is now permanent

**What Gets Saved:**
- All assignments
- All courses
- All notes
- Timetable photo
- Attendance records
- Grades
- Theme preferences

---

## 👥 Multi-User Scenarios

### Family Computer
- Mom creates account: mom@email.com
- Son creates account: son@email.com
- Each sees only their own assignments
- Completely separate workspaces

### Student Sharing Device
- Log out when done
- Next person logs in
- Zero data mixing

### Personal Devices
- Export data from school computer
- Import on home computer
- Seamless transfer

---

## 📊 User Management

### View Account Info
Click 👤 icon to see:
- Your display name
- Your email
- Guest status (if applicable)

### Export Your Data
1. Click 👤 icon
2. Click "Export All Data"
3. JSON file downloads with all your data

### Import Data
1. Click 👤 icon
2. Click "Import Data"
3. Select exported JSON file
4. All data restored!

### Logout
1. Click 👤 icon
2. Click "Logout"
3. Returns to login screen

---

## 🎨 User-Specific Preferences

Each user has their own:
- **Theme preference** - Saved per account
- **Notification settings** - Independent
- **Filter preferences** - Remembered per session

---

## 🔒 Data Isolation

### How It Works
```
Browser IndexedDB
├── user:joe@email.com
│   ├── assignments
│   ├── courses
│   ├── notes
│   └── files
├── user:jane@email.com
│   ├── assignments
│   ├── courses
│   ├── notes
│   └── files
└── guest-123456789
    ├── assignments (temporary)
    └── courses (temporary)
```

Each user's data is **completely separate** and **secure**.

---

## 🎬 Animated Intro

### What You'll See
1. **Floating Papers** - Animated background
2. **ClassFlow Logo** - Bouncing book emoji
3. **Typewriter Effect** - Title types out
4. **Fade In** - Smooth entrance
5. **Get Started Button** - Hover effects

### Design
- Beautiful gradient purple background
- Professional animations
- Mobile-friendly
- Sets the tone for the app

---

## ⚡ Quick Tips

### Password Safety
- Use a strong password (6+ characters)
- Don't share your password
- Export backups regularly

### Guest Mode Best For
- Trying the app first time
- Temporary projects
- Demo purposes
- Quick task tracking

### Account Mode Best For
- Long-term use
- Important assignments
- Multiple courses
- Data you want to keep

### Converting Guest Data
- Do it BEFORE closing the tab!
- All your work transfers instantly
- No data loss

---

## 🛡️ Privacy & Security

### What We Store
- Hashed passwords (not plain text)
- User email (for login only)
- All your ClassFlow data

### What We DON'T Store
- Plain text passwords
- Personal information beyond name/email
- Browsing history
- Analytics or tracking data

### Where It's Stored
- **Your device only** (IndexedDB)
- Never on any server
- Never in the cloud (unless you manually export)

---

## 🔧 Technical Details

### Password Hashing
- **Algorithm**: SHA-256 via Web Crypto API
- **Salt**: 16-byte random per user
- **Hash**: Stored as hex string
- **Validation**: Constant-time comparison

### Session Management
- **CurrentUser**: Stored in sessionStorage
- **Cleared**: On logout or tab close
- **Guest Sessions**: Temporary ID generation

### User ID Generation
```javascript
uid-{timestamp}-{random}
// Example: uid-1730217600000-a4k9j2m1p
```

---

## 📱 Mobile Usage

### Login on Phone
- Fully touch-friendly
- Auto-complete email
- Password reveal button (browser native)
- Responsive forms

### Multiple Devices
- Use Export/Import to sync
- Each device needs separate login
- Data transfer via JSON file

---

## ❓ FAQ

**Q: Can I use the same account on multiple browsers?**  
A: Yes! Export your data from one browser, import in another.

**Q: What happens if I forget my password?**  
A: Passwords are stored locally only. If forgotten, you'll need to create a new account. Export data regularly as backup!

**Q: Is guest mode safe?**  
A: Yes, but temporary. Convert to account before closing the tab.

**Q: Can others see my assignments?**  
A: No - each account is completely isolated. Multi-user safe!

**Q: Where is my password stored?**  
A: In your browser's IndexedDB as a hashed value. Never in plain text.

**Q: Can I delete my account?**  
A: Just stop using it. Clear browser data to remove all traces.

---

## 🎯 Recommended Workflow

### New Users
1. Start as **Guest** to try it out
2. Add a few assignments
3. **Convert to Account** if you like it
4. Continue using with full confidence

### Existing Users
1. **Sign Up** right away
2. Set strong password
3. Import any exported data
4. Export backups monthly

---

## 🚨 Important Reminders

**For Guest Users:**
- ⚠️ Data deleted when tab closes
- ⚠️ Convert before leaving!
- ⚠️ Or export as backup

**For Account Users:**
- ✅ Data saved permanently
- ✅ Export monthly for safety
- ✅ Use strong passwords

---

## 🎉 Success States

### After Signup
- Automatically logged in
- Redirected to dashboard
- Empty workspace ready to use

### After Login
- All your data loads
- Theme restored
- Filters remembered

### After Guest Conversion
- All temp data becomes permanent
- Full account created
- Seamless transition

---

## 🌐 Starting ClassFlow

### Two Entry Points

**1. intro.html** (First time)
- Animated welcome
- Login/Signup/Guest choice
- Beautiful onboarding

**2. index.html** (Direct)
- Redirects to intro.html if not logged in
- Loads dashboard if authenticated
- Smart routing

**Recommendation:** Bookmark `intro.html` for easy access!

---

## 💡 Pro Tips

1. **Export Weekly** - Backup your data regularly
2. **Strong Passwords** - Protect your grades and assignments
3. **Guest → Account** - Convert before closing if you like it
4. **Multi-Device** - Export from school, import at home
5. **Family Sharing** - Each person gets their own account

---

**Ready to get started?**

Open [intro.html](file:///c:/Users/joelw/OneDrive/Documents/CashFlowJO/intro.html) and create your account! 🚀

---

**ClassFlow v2.0** - Now with Multi-User Support! 📚✨
