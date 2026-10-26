# WA & SPV - Deployment Guide

## Progressive Web App (PWA) Deployment

This application is designed as a PWA that can be installed on any device (Windows, Mac, Android, iOS) and works completely offline.

## Quick Deployment Options

### Option 1: Vercel (Recommended - Easiest)

1. **Create a Vercel Account**
   - Go to https://vercel.com and sign up for free

2. **Connect GitHub Repository**
   - Push your code to GitHub: `https://github.com/davybl/wasppv`
   - In Vercel, click "Add New Project"
   - Import from GitHub
   - Select `wasppv` repository

3. **Deploy**
   - Vercel will auto-detect Next.js
   - Click "Deploy"
   - Your app will be live at `https://wasppv.vercel.app` (or your custom domain)

4. **Environment Variables** (None needed - app is fully local)

### Option 2: GitHub Pages (Free, Static)

1. **Update next.config.ts**
   ```typescript
   output: 'export',
   images: { unoptimized: true }
   ```

2. **Build and Deploy**
   ```bash
   npm run build
   # Copy contents of 'out' folder to gh-pages branch
   ```

**Note**: GitHub Pages requires static export, which doesn't support API routes. Use Vercel instead.

### Option 3: Self-Hosted (Your Own Server)

1. **Build the App**
   ```bash
   npm run build
   npm start
   ```

2. **Use PM2 for Production**
   ```bash
   npm install -g pm2
   pm2 start npm --name "wasppv" -- start
   pm2 save
   pm2 startup
   ```

3. **Reverse Proxy with Nginx**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
       }
   }
   ```

## PWA Installation Instructions for Users

### Installing on Desktop (Windows/Mac/Linux)

**Chrome/Edge:**
1. Open the app in Chrome or Edge browser
2. Click the install icon in the address bar (📥 or ⊕)
3. Click "Install" or "Add to desktop"
4. The app will launch as a standalone window

**Firefox:**
1. Open the app in Firefox
2. Click the menu (☰) → "Install this site as an application"
3. Follow the prompts

### Installing on Android

**Chrome:**
1. Open the app in Chrome on Android
2. Tap the menu (⋮) → "Add to Home Screen" or "Install App"
3. Confirm installation
4. The app will appear on your home screen like a native app

**Edge:**
1. Open the app in Edge on Android
2. Tap the menu (⋮) → "Add to phone"
3. Confirm installation

### Installing on iOS

**Safari:**
1. Open the app in Safari on iPhone/iPad
2. Tap the Share button (↑ in a square)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" in the top right
5. The app will appear on your home screen

## Data Sync Between Devices

Since the app is fully offline with no cloud dependencies, users can manually sync data:

### Export Data (From Device A)
1. Open the Dashboard
2. Click "Export All Data" button
3. A JSON file will download: `wasppv_backup_YYYY-MM-DD.json`

### Import Data (To Device B)
1. Copy the JSON file to Device B
2. Open the Dashboard on Device B
3. Click "Import Data" button
4. Select the JSON file
5. Confirm the import (this will overwrite existing data)
6. The app will refresh with the imported data

## Icon Requirements

For proper PWA installation with app icons, add these files to the `public/` folder:

- `icon-192.png` - 192x192 pixels
- `icon-512.png` - 512x512 pixels
- `favicon.ico` - For browser tab

Generate icons at:
- https://www.favicon-generator.org/
- https://realfavicongenerator.net/

## GitHub Release Management

To create releases with deployment instructions:

1. **Tag a Release**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Create GitHub Release**
   - Go to https://github.com/davybl/wasppv/releases
   - Click "Draft a new release"
   - Tag: `v1.0.0`
   - Title: "WA & SPV v1.0.0 - Production Ready"
   - Description: Include deployment instructions

3. **Release Notes Template**
   ```markdown
   ## Installation

   ### Web App
   Visit: https://wasppv.vercel.app

   ### Install as PWA
   - Desktop: Chrome/Edge → Click install icon in address bar
   - Android: Chrome → Menu → "Add to Home Screen"
   - iOS: Safari → Share → "Add to Home Screen"

   ## Data Sync
   Use "Export All Data" / "Import Data" buttons in Dashboard to transfer data between devices.

   ## Features
   - Full offline support
   - Character Vault with CRUD
   - 3D Model Library
   - Chapter & Script Editor
   - Shot List with drag-and-drop
   - Blender Script Exporter
   - 100% local data storage
   ```

## Environment-Specific Notes

### Development
```bash
npm run dev
# Runs on http://localhost:3000
```

### Production Build
```bash
npm run build
npm start
# Runs optimized server on http://localhost:3000
```

### Linting
```bash
npm run lint
```

## Troubleshooting

**PWA Not Installing:**
- Ensure the app is served over HTTPS (required for PWA)
- Check that icons exist in `public/` folder
- Verify manifest.json is accessible at `/manifest.json`

**Data Not Persisting:**
- Ensure `/data` folder exists and has write permissions
- Check browser console for errors
- Verify API routes are responding correctly

**Service Worker Issues:**
- Clear browser cache and reload
- Unregister old service workers in DevTools → Application → Service Workers
