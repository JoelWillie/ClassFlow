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

#### GitHub Pages
1. Push code to a GitHub repository
2. Go to Settings > Pages
3. Select branch (usually `main`) and root folder
4. Save - your site will be live at `https://username.github.io/repo-n

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
