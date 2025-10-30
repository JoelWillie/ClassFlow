# ClassFlow Deployment Guide

This guide explains how to deploy ClassFlow to various static hosting platforms.

## Quick Start (Local Testing)

Simply open `index.html` in your browser. For better performance, use a local server:

### Python
```bash
python -m http.server 8000
```
Visit: http://localhost:8000

### Node.js
```bash
npx http-server -p 8000
```
Visit: http://localhost:8000

### VS Code
Install the "Live Server" extension, then right-click `index.html` → "Open with Live Server"

---

## GitHub Pages (Free & Easy)

### Method 1: Direct Upload
1. Create a new repository on GitHub
2. Upload all files (or push via git)
3. Go to **Settings** → **Pages**
4. Under "Source", select your branch (usually `main`)
5. Select folder: `/ (root)`
6. Click **Save**
7. Your site will be live at: `https://username.github.io/repo-name/`

### Method 2: Git Push
```bash
git init
git add .
git commit -m "Initial commit - ClassFlow"
git branch -M main
git remote add origin https://github.com/username/classflow.git
git push -u origin main
```

Then enable GitHub Pages in repository settings.

---

## Netlify (Recommended for Drag & Drop)

### Option 1: Netlify Drop (Easiest)
1. Go to https://app.netlify.com/drop
2. Drag the entire `CashFlowJO` folder into the drop zone
3. Done! Your site is live with a random URL
4. (Optional) Change to a custom subdomain in Site Settings

### Option 2: Netlify CLI
```bash
npm install -g netlify-cli
cd CashFlowJO
netlify deploy
```

Follow the prompts. For production deployment:
```bash
netlify deploy --prod
```

### Option 3: Connect Git Repository
1. Push code to GitHub/GitLab/Bitbucket
2. Log into Netlify
3. Click "New site from Git"
4. Connect repository
5. Build settings:
   - Build command: (leave empty)
   - Publish directory: (leave empty or put `.`)
6. Deploy!

Auto-deploys on every push.

---

## Vercel (Similar to Netlify)

### Vercel CLI
```bash
npm i -g vercel
cd CashFlowJO
vercel
```

Follow prompts. For production:
```bash
vercel --prod
```

### Vercel Dashboard
1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your Git repository
4. No build configuration needed
5. Deploy!

---

## Cloudflare Pages

1. Log into Cloudflare Dashboard
2. Go to **Pages** → **Create a project**
3. Connect your Git repository
4. Build settings:
   - Build command: (leave empty)
   - Build output directory: `/`
5. Click **Save and Deploy**

---

## Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
```

When prompted:
- Public directory: `.` (current directory)
- Configure as single-page app: `No`
- Overwrite index.html: `No`

Deploy:
```bash
firebase deploy
```

---

## Custom Domain Setup

### GitHub Pages
1. Add a file named `CNAME` with your domain (e.g., `classflow.yourdomain.com`)
2. In your DNS settings, add a CNAME record pointing to `username.github.io`

### Netlify/Vercel
1. Go to **Domain Settings**
2. Add custom domain
3. Follow DNS configuration instructions

---

## Environment Checklist

Before deploying, verify:

- [x] All files are in the repository
- [x] `index.html` is in the root directory
- [x] CDN links are working (localForage, PDF.js, Chart.js)
- [x] No hardcoded localhost URLs
- [x] Browser console shows no errors
- [x] Mobile responsive design works

---

## Post-Deployment Testing

1. **Create a course** - Make sure it saves
2. **Add an assignment** - Verify all fields work
3. **Upload a file** - Test file storage
4. **Switch themes** - Check all 5 themes
5. **Export data** - Verify JSON download
6. **Calendar view** - Ensure events render
7. **Mobile test** - Check on phone/tablet

---

## Troubleshooting

### Issue: Site loads but is blank
- Check browser console for errors
- Verify CDN scripts are loaded (check Network tab)
- Ensure JavaScript is enabled

### Issue: Data doesn't persist
- Check if IndexedDB is enabled in browser
- Try incognito mode (some extensions block storage)
- Verify site is served over HTTPS (GitHub Pages/Netlify do this automatically)

### Issue: Notifications don't work
- HTTPS is required for Notification API
- User must grant permission

### Issue: "Module not found" errors
- This is a static site - no build step or modules needed
- Ensure all `.js` files are in the `js/` folder

---

## Performance Tips

1. **Enable HTTPS** (all platforms do this by default)
2. **Enable Gzip compression** (automatic on Netlify/Vercel)
3. **Set cache headers** (automatic on most platforms)
4. **Monitor storage usage** - Warn users about large file uploads

---

## Security Considerations

- ✅ No backend = No SQL injection, no server hacks
- ✅ All data stays in user's browser
- ✅ HTTPS encrypts data in transit
- ⚠️ Users should export backups regularly
- ⚠️ No multi-device sync (by design)

---

## Updating the Site

### GitHub Pages
Push updates to your repository - auto-deploys

### Netlify/Vercel (Git-connected)
Push to your branch - auto-deploys

### Netlify Drop
Drag and drop the updated folder again

### Manual
Re-upload files to your hosting platform

---

## Support & Maintenance

ClassFlow is maintenance-free because:
- No database to maintain
- No server to patch
- No dependencies to update (CDNs handle this)

Just deploy once and forget!

---

## License

MIT License - Deploy anywhere, for any purpose, commercial or personal.

Enjoy your ClassFlow deployment! 🚀📚
