# 100% Free Google Spreadsheet Automation & Live Charts Setup

This setup uses **Google Apps Script Web App** to automatically:
1. Log every registration row into the `Registrations` sheet.
2. Maintain a live summary table in the `Analytics & Charts` sheet.
3. Automatically generate and refresh two real-time visual charts:
   - **Department Distribution (Bar Chart)**
   - **Player Rating Categories (Donut / Pie Chart)**

Zero credit card, zero cloud subscription, completely free on Google's free tier.

> [!TIP]
> **You only need to do this ONCE!**  
> You do **NOT** need to create a new spreadsheet for every new tournament. The script automatically creates a dedicated new tab for each tournament name (e.g., `JGEC Rapid 2026`, `North Bengal Blitz`) and a master `All Registrations` tab inside this single spreadsheet!

## ⚡ 4-Step Setup Guide

### Step 1: Create a new Google Spreadsheet
1. Go to [sheets.new](https://sheets.new) in your browser.
2. Name your sheet: `Chaturanga JGEC - Tournament Registrations`.

---

### Step 2: Open Apps Script & Paste the Code
1. In your Google Sheet, click **Extensions** in the top navigation bar.
2. Select **Apps Script**.
3. Clear any existing placeholder code in `Code.gs`.
4. Copy the entire contents of [`Code.gs`](./Code.gs) and paste it into the editor.
5. Click the **Save** (💾 disk) icon or press `Ctrl + S`.

---

### Step 3: Deploy as a Free Web App
1. At the top-right of Apps Script, click **Deploy** > **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in the deployment details:
   - **Description**: `Tournament Registration Webhook`
   - **Execute as**: `Me (your_email@gmail.com)`
   - **Who has access**: `Anyone` *(Note: This allows submissions from your website without requiring players to log into Google)*
4. Click **Deploy**.
5. When prompted with "Authorization required", click **Authorize access**, select your Google account, click **Advanced** > **Go to Untitled project (unsafe)**, and click **Allow**.
6. Copy the **Web App URL** (it looks like: `https://script.google.com/macros/s/AKfycb.../exec`).

---

### Step 4: Add URL to your Next.js `.env.local`
1. In your `my-project` folder, open or create `.env.local`:
   ```bash
   GOOGLE_SHEET_WEBAPP_URL="https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"
   ```
2. Restart your development server (`npm run dev`) or redeploy to Vercel/production.

---

## 📊 Live Visual Charts Generated
Once configured, every registration on `/register` automatically:
- Formats headers with dark theme styling.
- Dynamically recalculates totals for each department and rating category.
- Embeds two live charts right inside the Google Sheet under the **Analytics & Charts** tab!
