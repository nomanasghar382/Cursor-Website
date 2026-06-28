# Railway pe backend deploy (Render ki jagah)

Render credits khatam? **Railway** pe same NOVAEX backend deploy karein — Docker local ki zaroorat nahi.

Railway har mahine **$5 free credit** deta hai (trial ke baad bhi limited free tier hota hai).

---

## Step 1 — Railway account

1. [railway.com](https://railway.com) kholein
2. **Login with GitHub**
3. GitHub repo access allow karein

---

## Step 2 — Naya project

1. **New Project**
2. **Deploy from GitHub repo**
3. Repo select karein: **`nomanasghar382/Cursor-Website`**
4. Branch: **`main`** (ya latest working branch)

Railway `railway.toml` read karega aur **Docker** se backend build karega.

---

## Step 3 — Database (pgvector zaroori)

NOVAEX AI search ke liye **pgvector** extension chahiye. Normal Railway Postgres mein ye nahi hota.

1. Project mein **+ New** → **Template**
2. Search karein: **Postgres with pgVector** (ya **pgvector-pg18**)
3. Deploy karein
4. Us service ka naam note karein, maslan: **`Postgres`**

> Agar migration `vector` extension pe fail ho, to ye step skip mat karein — seed template use karein.

Template deploy hone ke baad **Variables** tab se `DATABASE_URL` copy ho jayega.

---

## Step 4 — Redis add karein

1. **+ New** → **Database** → **Redis**
2. Service ka naam note karein, maslan: **`Redis`**
3. `REDIS_URL` automatically ban jayega

---

## Step 5 — Backend service configure karein

Apni **backend** GitHub service kholein → **Variables** tab.

### Auto-linked variables (reference syntax)

Railway mein **Raw Editor** kholein aur ye add karein (service names apne project ke mutabiq):

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
```

> `Postgres` aur `Redis` ki jagah apne service names likhein (Variables tab mein left side pe naam dikhta hai).

### Secrets (khud generate karein — 32+ characters)

| Key | Value |
|-----|--------|
| `JWT_ACCESS_SECRET` | random long string |
| `JWT_REFRESH_SECRET` | random long string |
| `COOKIE_SECRET` | random long string |
| `BETTER_AUTH_SECRET` | random long string |

PowerShell se generate karne ke liye:

```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 48 | ForEach-Object {[char]$_})
```

### CORS + frontend (Vercel URL)

| Key | Value (example) |
|-----|------------------|
| `FRONTEND_URL` | `https://cursor-website.vercel.app` |
| `WEB_ORIGINS` | `https://cursor-website.vercel.app,http://localhost:3000` |

### Optional — auto backend URL

Railway khud domain deta hai. Ye variables **optional** hain — agar na set karein to `RAILWAY_PUBLIC_DOMAIN` se auto ho jata hai:

| Key | Value |
|-----|--------|
| `APP_BASE_URL` | `https://${{novaex-backend.RAILWAY_PUBLIC_DOMAIN}}` |
| `BETTER_AUTH_URL` | `https://${{novaex-backend.RAILWAY_PUBLIC_DOMAIN}}` |

> `novaex-backend` ki jagah apni backend service ka naam likhein.

### Pehli deploy — seed chalana

| Key | Value |
|-----|--------|
| `RUN_SEED` | `true` |

Pehli successful deploy ke baad `RUN_SEED` ko **`false`** kar dein taake har redeploy pe seed dubara na chale.

---

## Step 6 — Public domain

1. Backend service → **Settings** → **Networking**
2. **Generate Domain** dabayein
3. URL milegi, maslan: `https://novaex-backend-production.up.railway.app`

---

## Step 7 — API check

Browser ya terminal:

```
https://YOUR-BACKEND.up.railway.app/api/v1/health/ready
```

Response mein `"status":"ok"` aana chahiye.

Root URL `/` pe **Not Found** normal hai — ye sirf API hai.

---

## Step 8 — Vercel frontend update

Vercel project → **Settings** → **Environment Variables**:

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_API_URL` | `https://YOUR-BACKEND.up.railway.app/api/v1` |

Phir **Redeploy** karein.

---

## Login (seed ke baad)

| Role | Email | Password |
|------|-------|----------|
| Customer | `maya.chen@example.com` | `NOVAEX-Customer-2026!` |
| Admin | `admin@novaex.ai` | `NOVAEX-Admin-2026!` |

---

## Common errors

| Problem | Fix |
|---------|-----|
| Migration `vector` extension fail | **pgvector template** use karein, normal Postgres nahi |
| Redis `ENOTFOUND redis.railway.internal` | `REDIS_URL=${{Redis.REDIS_URL}}` set karein (code `family=0` handle karta hai) |
| Login "Failed to fetch" | Vercel `NEXT_PUBLIC_API_URL` + Railway `WEB_ORIGINS` check karein |
| Images nahi dikhte | `RUN_SEED=true` se ek deploy karein |
| Build slow / fail | Railway logs dekhein; pehli build 5–10 min le sakti hai |

---

## Render vs Railway

| | Render (free) | Railway |
|--|---------------|---------|
| Sleep on idle | Haan (~50 sec) | Nahi (credit use hota hai) |
| Monthly free | Limited hours | ~$5 credit |
| Blueprint | `render.yaml` | Manual: Postgres + Redis + GitHub service |
| Docker | Haan | Haan (`railway.toml`) |

---

## Local Docker (optional)

Jab chahein wapas try kar sakte hain:

```powershell
docker compose down -v
docker compose up --build
```

Cloud pe backend chal raha ho to local Docker zaroori nahi.
