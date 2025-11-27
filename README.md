# Banco de Alimentos — Aplicación

Fullstack app: Frontend (Vite + React + Tailwind), Backend (Node + Express), DB (MySQL).

This README documents required environment variables (including email), how to seed the first admin user, and short run instructions (local / docker). Do not commit any `.env` or secrets.

---

## Required environment variables

### Backend (`./Backend/.env`)
Minimum set (adjust values for your environment):

```env
# App / security
NODE_ENV=development
JWT_SECRET=replace_with_secure_random_string
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_DAYS=30
TOKEN_VERSION=0

# Database
DB_HOST=localhost        # 'mysql' when using docker-compose
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=bamx

# Frontend URL (used to build links in emails)
FRONTEND_URL=http://localhost:5173

# CORS (comma separated). Use exact origins used by browsers, avoid '*' in production
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3001

# Email - choose one method below

# Option A: SMTP username/password
EMAIL_TRANSPORT=smtp              # optional flag used by code if present
EMAIL_USER=you@example.com
EMAIL_PASS=your_smtp_password
EMAIL_HOST=smtp.gmail.com         # optional, defaults depend on code
EMAIL_PORT=587
EMAIL_SECURE=false                # true for 465

# Option B: Gmail OAuth2 (preferred for Gmail automation)
# If using OAuth2 the code uses CLIENT_ID/CLIENT_SECRET/REFRESH_TOKEN with EMAIL_USER
CLIENT_ID=your_google_oauth_client_id
CLIENT_SECRET=your_google_oauth_client_secret
REFRESH_TOKEN=your_google_refresh_token
EMAIL_USER=you@example.com        # same email address used for OAuth2

# Invite / account management
UNCONFIRMED_DELETE_DAYS=30
TEST_CLEANUP=false
TEST_CLEANUP_INTERVAL_MS=60000
```

Notes:
- The backend supports both basic SMTP (EMAIL_PASS) and OAuth2 (CLIENT_ID/CLIENT_SECRET/REFRESH_TOKEN). Provide either set accordingly.
- FRONTEND_URL must match the public URL users will open (used in confirmation/invite email links).
- CORS_ALLOWED_ORIGINS must include the Vite dev host (usually `http://localhost:5173`) and any static frontend container host/port.

---

### Frontend (`./Frontend/bamx/.env`)

```env
# Runtime / build
VITE_API_URL=http://localhost:3000/api    # API base used by client at runtime (includes /api)
# Dev server proxy used by Vite (so /api requests are proxied to backend)
VITE_API_PROXY=http://localhost:3000
```

- VITE_API_PROXY is used by `vite.config.ts` during `npm run dev`.
- VITE_API_URL is used by the app at runtime (build or dev).

---

## Seeding the first admin user

The repo includes `./db_init/init.sql` which creates schema and inserts one admin user automatically when MySQL container initializes (docker mode). If you run locally or need to seed manually, follow one of these:

1) Use provided init SQL (docker)
- When running MySQL container with `./db_init` mounted, `init.sql` runs automatically on first start.

2) Manual import (local MySQL)
```powershell
# from project root
mysql -u root -p -P 3306 bamx < ./db_init/init.sql
```

3) Create admin manually (one-time)
- Generate a bcrypt hash (example using Node + bcryptjs):
```bash
node -e "console.log(require('bcryptjs').hashSync('YourSecurePassword!', 12))"
# copy printed hash into SQL below
```
- Insert the admin:
```sql
INSERT INTO users (email, password, username, role, is_confirmed, created_at)
VALUES ('admin@example.org', '<bcrypt-hash>', 'Initial Admin', 'ADMIN', 1, NOW());
```

Security note: Keep the seeded admin credentials secure and rotate/reset after first login. Prefer using the invite flow for adding additional admin accounts.

---

## Quick run (local, no Docker)

1. Start MySQL (local) and import schema:
```powershell
mysql -u root -p -P 3306 bamx < ./db_init/init.sql
```

2. Backend
```powershell
cd ./Backend
npm install
# create ./Backend/.env as documented above
npm run dev
```

3. Frontend
```powershell
cd ./Frontend/bamx
npm install
# create ./Frontend/bamx/.env as documented above
npm run dev
```

Open the Vite URL (usually `http://localhost:5173`).

---

## Quick run with Docker Compose

1. Edit compose env overrides in `docker-compose.yml` if needed (CORS_ALLOWED_ORIGINS, FRONTEND_URL).
2. From project root:
```powershell
docker-compose down
docker-compose build --no-cache
docker-compose up
```
- Frontend static container default: `http://localhost:3001`
- Backend API: `http://localhost:3000`
- MySQL host mapped to `3308` (container `3306`) per compose.

---

## Email troubleshooting

- If emails do not send:
  - Confirm correct EMAIL_* env values.
  - For Gmail OAuth2: ensure CLIENT_ID/CLIENT_SECRET and REFRESH_TOKEN are valid and the Google account permits sending.
  - Check backend logs for nodemailer errors.
- For SMTP with Gmail and username/password, Google often blocks less-secure logins; prefer OAuth2.

---

## Security & production recommendations

- Never commit `.env` files or secrets.
- Use exact CORS origins (avoid `*` in production).
- Use HTTPS and strong JWT secrets.
- Use a persistent store (Redis) for rate-limiters in multi-instance deployments.
- Use a secrets manager for production credentials.

---