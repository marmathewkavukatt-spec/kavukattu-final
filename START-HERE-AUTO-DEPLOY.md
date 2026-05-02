# 🚨 START HERE - Fix Auto-Deploy 404 Errors

## What's Happening?

Your Hostinger is pulling code from Git automatically, but **NOT building it**. That's why you're getting 404 errors - the `.next` folder (with all your CSS/JS files) doesn't exist on the server.

---

## ⚡ QUICK FIX (Right Now - 5 minutes)

SSH to your server and build manually:

```bash
ssh your-username@your-server.hostinger.com
cd /domains/marmathewkavukatt.org/public_html
npm run build
pm2 restart all
```

**This fixes it immediately!** ✅

---

## 🔧 PERMANENT FIX (10 minutes)

### Use GitHub Actions (Recommended)

I've created everything you need. Just follow these steps:

#### 1. Add Secrets to GitHub (5 min)

Go to: **GitHub Repo → Settings → Secrets and variables → Actions**

Click "New repository secret" and add:

| Name | Value | Where to find it |
|------|-------|------------------|
| `HOSTINGER_HOST` | `srv123.hostinger.com` | Hostinger Dashboard → SSH Access |
| `HOSTINGER_USERNAME` | Your SSH username | Hostinger Dashboard → SSH Access |
| `HOSTINGER_PASSWORD` | Your SSH password | Hostinger Dashboard → SSH Access |
| `HOSTINGER_PORT` | `22` | Usually 22 |

#### 2. Commit and Push (2 min)

```bash
git add .github/workflows/deploy-hostinger.yml
git add .hostinger-deploy.sh
git commit -m "Add automated deployment"
git push origin main
```

#### 3. Watch It Work (3 min)

- Go to **GitHub → Actions** tab
- You'll see "Deploy to Hostinger" running
- Wait for green checkmark ✅
- Test your site!

---

## ✅ Test It's Fixed

1. Open: https://marmathewkavukatt.org/spiritual-legacy
2. Press **F12** (DevTools)
3. Check **Console** - should see **NO red errors**
4. Check **Network** - all files should load with **200** status

---

## 📚 More Help

- **FIX-AUTO-DEPLOY-NOW.md** - Complete step-by-step guide
- **HOSTINGER-AUTO-DEPLOY-FIX.md** - Detailed troubleshooting

---

## 🎯 What Happens Now?

**After setup**:
1. You push code to GitHub
2. GitHub Actions automatically:
   - SSHs to your server
   - Pulls latest code
   - Runs `npm install`
   - Runs `npm run build`
   - Restarts application
3. Your site is updated with NO 404 errors! 🎉

**No more manual building!**

---

## 🆘 Need Help?

### Can't find SSH details?
- Hostinger Dashboard → SSH Access
- Or contact Hostinger support

### GitHub Actions failing?
- Check the Actions tab for error logs
- Verify secrets are correct
- Make sure SSH access is enabled

### Still seeing 404s?
- Run the immediate fix (SSH and build manually)
- Check server logs: `pm2 logs`
- Verify `.next` folder exists: `ls -la .next/`

---

**Ready? Start with the Quick Fix, then set up GitHub Actions!** 🚀
