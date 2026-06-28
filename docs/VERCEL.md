# Frontend Vercel pe deploy

## Step 1 — Vercel account

1. [vercel.com](https://vercel.com) kholein
2. **Sign up with GitHub**
3. GitHub access allow karein

---

## Step 2 — Naya project

1. **Add New…** → **Project**
2. Repo select karein: **`nomanasghar382/Cursor-Website`**
3. **Configure Project** screen pe ye settings:

| Setting | Value |
|---------|--------|
| **Framework Preset** | Next.js (auto) |
| **Root Directory** | `frontend` ← **zaroori** |
| **Build Command** | `npm run build` (default) |
| **Output Directory** | *(default — khali chhor dein)* |

> Root Directory set karne ke liye **Edit** dabayein → `frontend` type karein → **Continue**

---

## Step 3 — Environment Variables

**Environment Variables** section mein ye add karein:

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_API_URL` | `https://YOUR-BACKEND.up.railway.app/api/v1` |

> Backend URL apne host se replace karein — **Railway** (`*.up.railway.app`) ya **Render** (`*.onrender.com`). End pe `/` mat lagayein.

**`NEXT_PUBLIC_APP_URL`** abhi skip kar sakte hain — Vercel URL auto detect ho jati hai.

---

## Step 4 — Deploy

1. **Deploy** dabayein
2. 2–5 minute wait
3. **Congratulations** screen pe URL milegi, maslan:
   ```
   https://cursor-website.vercel.app
   ```

Ye hi aapki **FRONTEND_URL** hai.

---

## Step 5 — Backend (Railway ya Render) update karein

Backend service → **Environment / Variables** → ye values update karein:

| Key | Value |
|-----|--------|
| `FRONTEND_URL` | `https://cursor-website.vercel.app` |
| `WEB_ORIGINS` | `https://cursor-website.vercel.app,http://localhost:3000` |
| `APP_BASE_URL` | `https://your-backend.up.railway.app` |
| `BETTER_AUTH_URL` | same backend URL |

Railway guide: [`docs/RAILWAY.md`](./RAILWAY.md)

Phir backend pe redeploy karein.

---

## Step 6 — Test

1. Vercel URL kholein → homepage aani chahiye
2. **Login** try karein:
   - Email: `maya.chen@example.com`
   - Password: `NOVAEX-Customer-2026!`

---

## Branch note

Agar latest Vercel config repo mein nahi hai, branch use karein:
`cursor/vercel-frontend-deploy-11fe`

Ya `main` pe merge hone ka wait karein.

---

## Common errors

| Error | Fix |
|-------|-----|
| Build fail — wrong folder | Root Directory = `frontend` set karein |
| API calls fail / CORS | Backend pe `WEB_ORIGINS` mein Vercel URL add karein |
| Login nahi hota | Backend `RUN_SEED=true` se deploy ho + `NEXT_PUBLIC_API_URL` sahi ho |

---

## Local development (baad mein)

```powershell
cd frontend
cp .env.example .env
# .env mein Render backend URL likhein
npm run dev
```
