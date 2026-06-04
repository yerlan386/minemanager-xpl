# MineManager XPL — Setup Guide
**Celestium Corporate Ltd | Dande, Zimbabwe**

---

## Step 1 — Install Node.js

Download from **https://nodejs.org** — choose the LTS version (v20+).
After installing, open a new terminal and confirm:
```
node --version
npm --version
```

---

## Step 2 — Install Dependencies

Open a terminal in this folder (`C:\Users\LENOVO\MineManager XPL`) and run:
```
npm install
```

This downloads React, Tailwind, Supabase, jsPDF, Recharts, and all other packages (~2 minutes).

---

## Step 3 — Run in Demo Mode (No Supabase needed)

```
npm run dev
```

Open **http://localhost:5173** in your browser.

The app runs fully in **Demo Mode** — all data is stored in the browser's localStorage.
Log in with any demo account (password: `demo1234`):

| Name | Email | Role |
|------|-------|------|
| Earl | earl@celestium.zw | Owner |
| Piyo Chiradza | piyo@celestium.zw | Mine Manager |
| Kenneth | kenneth@celestium.zw | Shift Supervisor |
| Thomas | thomas@celestium.zw | HSE Officer |
| Tirika | tirika@celestium.zw | Metallurgist |
| Cloudias | cloudias@celestium.zw | HR/Admin |

---

## Step 4 — Connect Supabase (Production)

1. Create a free project at **https://supabase.com**
2. In the Supabase SQL editor, paste and run the contents of `supabase/schema.sql`
3. Copy this file: `.env.example` → `.env.local`
4. Fill in your Supabase URL and anon key from **Project Settings → API**
5. Create user accounts via **Supabase Dashboard → Authentication → Users**
   - Add matching rows in the `user_profiles` table with the correct `role` value

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

6. Restart the dev server — the app will now sync to Supabase.

---

## Step 5 — Build for Production (PWA)

```
npm run build
```

The `dist/` folder contains the installable PWA. Deploy to:
- **Netlify** (drag-and-drop the dist folder)
- **Vercel** (`vercel --prod`)
- Or any static web host

Once deployed, users can install it to their home screen on Android/iOS.

---

## PWA Icons

Replace the placeholder files in `public/icons/` with real PNG icons:
- `icon-192.png` — 192×192px, navy background with gold M
- `icon-512.png` — 512×512px, same design

---

## Module Summary

| Module | Path | Access |
|--------|------|--------|
| Dashboard | `/` | All roles |
| Shift Handover | `/shift` | All roles |
| Production Log | `/shift` → Production tab | Owner, Mine Mgr, Shift Sup |
| HR | `/hr` | Owner, Mine Mgr, HR/Admin |
| Operations | `/operations` | Owner, Mine Mgr, Shift Sup |
| Compliance | `/compliance` | Owner, Mine Mgr, HSE, Shift Sup |
| Gold Room | `/goldroom` | Owner, Mine Mgr, Metallurgist ONLY |

---

## Key Behaviours

- **Offline**: Works without internet — data auto-syncs when connection returns
- **Auto-save**: All forms save a draft every 30 seconds
- **SI 91**: Must be confirmed on the Dashboard before shift data entry
- **Voice Input**: Tap the microphone icon on any text field (Chrome/Android)
- **PDF Export**: Reports generated client-side, no server needed
- **Gold Room**: All records are locked on submission, no drafts allowed
