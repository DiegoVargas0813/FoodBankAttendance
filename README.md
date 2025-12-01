# Banco de Alimentos — Aplicación

Fullstack app: Frontend (Vite + React + Tailwind), Backend (Node + Express), DB (MySQL).

This README documents the environment variables required (OAUTH2 email), how to seed the first admin user, and quick run instructions (local / Docker). Do not commit any `.env` files or secrets.

Important: restart services after changing `.env`.

---

## Environment variables — overview

All backend envs -> `./Backend/.env`  
All frontend envs -> `./Frontend/bamx/.env`

Notes:
- The application uses OAuth2 (recommended) for sending confirmation/invite emails.
- FRONTEND_URL is used to build links sent by email.
- CORS_ALLOWED_ORIGINS must include any browser-origin (Vite/PWA/static host) that will call the API.

### Backend (`./Backend/.env`) — required / recommended

App / security
```env
NODE_ENV=development
PORT=3000
JWT_SECRET=replace_with_secure_random_string       # REQUIRED
JWT_EXPIRES_IN=1h                                  # e.g. "1h"
REFRESH_TOKEN_EXPIRES_DAYS=30                      # int
TOKEN_VERSION=0                                    # integer used to invalidate refresh tokens
```

Database
```env
DB_HOST=localhost        # use `mysql` when running via docker-compose
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=bamx
```

Frontend / CORS / links
```env
FRONTEND_URL=http://localhost:5173                # used to generate links in emails
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3001
                                                  # comma-separated list of allowed browser origins (do not use "*" in production)
```

OAuth2 email (Gmail recommended) — OAUTH2 only
```env
# Use OAuth2 credentials to send mail via nodemailer
EMAIL_USER=you@gmail.com          # FROM address
CLIENT_ID=your_google_oauth_client_id
CLIENT_SECRET=your_google_oauth_client_secret
REFRESH_TOKEN=google_oauth_refresh_token
```

Invite / account management / limits
```env
UNCONFIRMED_DELETE_DAYS=30
```

Security note: the backend code prefers OAuth2 when CLIENT_ID/CLIENT_SECRET/REFRESH_TOKEN are present. Ensure the Google OAuth client and refresh token have the right scopes to send mail on behalf of EMAIL_USER.

---

### Frontend (`./Frontend/bamx/.env`)

```env
VITE_API_URL=http://localhost:3000/api     # API base used by client at runtime (includes /api)
VITE_API_PROXY=http://localhost:3000       # Vite dev proxy (so /api requests are proxied to backend in dev)
```

Note: Vite reads VITE_API_PROXY on dev server startup. Restart Vite after editing.

---

## Seeding the first admin user (bootstrap)

Options: automatic via `./db_init/init.sql` (Docker) or manual.

1) Automatic (Docker)
- `./db_init/init.sql` is mounted into the MySQL container and executed on first initialization. It typically creates schema and seeds an initial admin.

2) Manual import (local MySQL)
```powershell
# from project root
mysql -u root -p -P 3306 bamx < ./db_init/init.sql
```

3) Manual insert (one-time) — preferred when not using init SQL:
- Generate a bcrypt hash (use Node + bcryptjs). From project root:
```bash
node -e "console.log(require('bcryptjs').hashSync('YourSecurePassword!', 12))"
```
- Use the printed hash in SQL:
```sql
INSERT INTO users (email, password, username, role, is_confirmed, created_at)
VALUES ('admin@example.org', '<bcrypt-hash>', 'Initial Admin', 'ADMIN', 1, NOW());
```
- Ensure `is_confirmed = 1` so the admin can log in immediately.

Security note: keep seeded admin credentials secure and rotate after first login. Prefer the invite/accept flow to add more admins.

---

## Password rules (accept-invite / registration)
- Minimum 8 characters
- Maximum 64 characters
- At least one letter
- At least one number
- At least one symbol (e.g. !@#$%)

These are enforced server-side by the accept-invite endpoint and should be enforced/validated client-side for better UX.

---

## Quick run (local, no Docker)

1) Prepare DB (local MySQL) and import schema:
```powershell
mysql -u root -p -P 3306 bamx < ./db_init/init.sql
```

2) Backend
```powershell
cd ./Backend
npm install
# create ./Backend/.env as documented above (include OAuth2 vars)
npm run dev
```

3) Frontend
```powershell
cd ./Frontend/bamx
npm install
# create ./Frontend/bamx/.env as documented above
npm run dev
```

Open the Vite URL (usually `http://localhost:5173`).

---

## Quick run with Docker Compose

1) Edit `docker-compose.yml` env overrides if needed (`CORS_ALLOWED_ORIGINS`, `FRONTEND_URL`).

2) From project root:
```powershell
docker-compose down
docker-compose build --no-cache
docker-compose up
```

- Frontend static container default: `http://localhost:3001`
- Backend API: `http://localhost:3000`
- MySQL host mapped to `3308` (container 3306) per compose.

Notes:
- When backend runs in Docker, set `DB_HOST=mysql` in `./Backend/.env` or rely on compose environment.
- Rebuild/recreate containers after env changes.

---

## Invite / accept flow (summary)

- Admins create invites via `POST /api/invites` (admin-only). Invite email contains one-time token link to public accept page.
- Invite acceptance endpoint: `POST /api/invites/accept` with `{ token, username, password }`.
- Accept flow requires token, validates password rules, creates user, marks invite used.

---

## Email troubleshooting (OAuth2)

- Ensure CLIENT_ID, CLIENT_SECRET and REFRESH_TOKEN are valid for the EMAIL_USER account.
- The Google OAuth client must have proper scopes and consent to send mail on behalf of EMAIL_USER.
- If nodemailer reports token/permission errors, refresh the token or check Google Cloud OAuth settings.
- Check backend logs for nodemailer stack traces.

---

## Security & production recommendations

- Never commit `.env` files or secrets.
- Use exact CORS origins (avoid `*`) in production.
- Use HTTPS and strong JWT secrets.
- Use a secrets manager for production credentials.
- Use Redis or another shared store for rate-limiters in multi-instance deployments.
- Prefer invite-based admin onboarding; keep manual DB seed as an emergency bootstrap method.