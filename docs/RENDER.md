# Render pe backend deploy (Docker ki zaroorat nahi)

Local Docker errors se tang aa gaye? Backend **Render** pe chalayein — build cloud pe hoti hai.

## Option A — Blueprint (sabse aasaan)

1. Code GitHub pe push ho (branch `main` ya aapki working branch).
2. [render.com](https://render.com) → **Sign up** (GitHub se login).
3. **New +** → **Blueprint**.
4. Apna repo select karein (`Cursor-Website`).
5. Render `render.yaml` read karega → **Apply**.
6. Deploy complete hone ke baad **novaex-backend** service kholein.
7. Upar URL copy karein, maslan: `https://novaex-backend-xxxx.onrender.com`
8. **Environment** tab mein ye 3 values set karein (apni URL se):

| Key | Value (example) |
|-----|-------------------|
| `APP_BASE_URL` | `https://novaex-backend-xxxx.onrender.com` |
| `BETTER_AUTH_URL` | `https://novaex-backend-xxxx.onrender.com` |
| `WEB_ORIGINS` | `https://your-frontend.vercel.app,http://localhost:3000` |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` |

9. **Manual Deploy** → **Deploy latest commit**.

### Pehli dafa seed

Blueprint `RUN_SEED=true` set karta hai — pehli deploy pe demo users ban jayenge.

Baad mein seed dubara na chale, Environment mein `RUN_SEED=false` kar dein.

### API check

Browser ya terminal:

```
https://YOUR-BACKEND.onrender.com/api/v1/health/ready
```

`"status":"ok"` aana chahiye.

---

## Option B — Sirf backend manually

1. Render → **New Web Service**.
2. Repo connect karein.
3. **Runtime:** Docker  
4. **Dockerfile path:** `backend/Dockerfile`  
5. **Docker context:** `.` (repo root)
6. **Health check path:** `/api/v1/health/live`
7. Postgres + Redis alag se banayein (Render Dashboard):
   - **New PostgreSQL** → `DATABASE_URL` copy karein
   - **New Key Value (Redis)** → `REDIS_HOST` + `REDIS_PORT` copy karein
8. Environment variables: `backend/.env.example` se copy karein + upar wali URLs.

---

## Login (seed ke baad)

| Role | Email | Password |
|------|-------|----------|
| Customer | `maya.chen@example.com` | `NOVAEX-Customer-2026!` |
| Admin | `admin@novaex.ai` | `NOVAEX-Admin-2026!` |

---

## Agar migration `vector` extension pe fail ho

NOVAEX AI search ke liye **pgvector** chahiye. Render free Postgres pe kabhi-kabhi extension issue hota hai.

**Fix:** [Neon](https://neon.tech) (free) pe database banayein → `DATABASE_URL` copy karein → Render backend **Environment** mein paste karein → redeploy.

Neon console mein ye chalayein:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

---

## Frontend connect karna

Frontend (Vercel / local) mein:

```
NEXT_PUBLIC_API_URL=https://YOUR-BACKEND.onrender.com/api/v1
```

---

## Free plan note

Render free backend **~50 sec** mein sleep ho jata hai jab koi use na kare. Pehli request slow ho sakti hai — ye normal hai.

---

## Local Docker (baad mein)

Jab chahein wapas try kar sakte hain:

```powershell
git pull
docker compose down -v
docker compose up --build
```

Render pe backend chal raha ho to local Docker ab zaroori nahi.
