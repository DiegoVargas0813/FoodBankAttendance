# Banco de Alimentos — Aplicación

Fullstack app: Frontend (Vite + React + Tailwind), Backend (Node + Express), DB (MySQL).

This README documents the environment variables required (OAuth2 email-only), how to seed the first admin user, and quick run instructions (local / Docker). Do not commit any `.env` files or secrets.

---

## Required environment variables (OAuth2 email only)

All backend envs -> `./Backend/.env`  
All frontend envs -> `./Frontend/bamx/.env`

Important: restart services after changing `.env`.

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
DB_HOST=localhost        # 'mysql' when using docker-compose
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

OAuth2 email (Gmail preferred)
```env
# set EMAIL_TRANSPORT=oauth2 in code or include these vars; code prefers OAuth2 when CLIENT_ID/CLIENT_SECRET/REFRESH_TOKEN present
EMAIL_TRANSPORT=oauth2
EMAIL_USER=you@gmail.com          # address that will appear in From:
CLIENT_ID=your_google_oauth_client_id
CLIENT_SECRET=your_google_oauth_client_secret
REFRESH_TOKEN=google_oauth_refresh_token

# Optional email sending name/brand
EMAIL_FROM_NAME="Banco de Alimentos BAMX"
```

Invite / account management / limits
```env
INVITE_DEFAULT_HOURS=72                 # hours until invite expires (default)
UNCONFIRMED_DELETE_DAYS=30
LOGIN_RATE_LIMIT_WINDOW_MIN=15          # minutes for login rate limiter window
LOGIN_RATE_LIMIT_MAX=5                  # max attempts per window
ACCEPT_INVITE_RATE_LIMIT_MAX=5          # max accept-invite attempts per window
```

Notes:
- The backend expects OAuth2 credentials (CLIENT_ID / CLIENT_SECRET / REFRESH_TOKEN) to send confirmation/invite emails. Do not provide SMTP username/password here — this README focuses on OAuth2 only.
- FRONTEND_URL must match the URL users open (used in confirmation/invite email links).
- CORS_ALLOWED_ORIGINS must include the dev host (e.g. `http://localhost:5173`) and any static frontend host/port you serve.

---

### Frontend (`./Frontend/bamx/.env`)

```env
VITE_API_URL=http://localhost:3000/api     # API base used by client at runtime (includes /api)
VITE_API_PROXY=http://localhost:3000       # Vite dev proxy (so /api requests are proxied to backend in dev)
```

Notes:
- Vite reads VITE_API_PROXY at dev server startup. Restart Vite after editing.

---

## Seeding the first admin user (bootstrap)

Options: automatic via `./db_init/init.sql` (Docker), or manual SQL import / manual insert.

1) Automatic (Docker)
- `./db_init/init.sql` runs automatically the first time the MySQL container initializes (when mounted into the official MySQL image). It typically inserts an initial admin row.

2) Manual import (local MySQL)
```powershell
# from project root
mysql -u root -p -P 3306 bamx < ./db_init/init.sql
```

3) Manual insert (one-time) — preferred when not using the init SQL:
- Generate a bcrypt hash (use Node with bcryptjs). From project root:
```bash
node -e "console.log(require('bcryptjs').hashSync('YourSecurePassword!', 12))"
```
- Copy the printed hash and run SQL (replace `<bcrypt-hash>` and email/username):
```sql
INSERT INTO users (email, password, username, role, is_confirmed, created_at)
VALUES ('admin@example.org', '<bcrypt-hash>', 'Initial Admin', 'ADMIN', 1, NOW());
```
- Mark `is_confirmed = 1` so the admin is active immediately.

Security note: keep the seeded admin credentials secure and rotate/reset after first login. Prefer the invite flow for adding further admins.

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

1) Edit `docker-compose.yml` env overrides if needed (`CORS_ALLOWED_ORIGINS`, `FRONTEND_URL`). Ensure `Backend/.env` values align with compose overrides if both are used.

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

Password rules (enforced on accept)
- Minimum 8 chars, maximum 64
- At least one letter, one number, and one symbol

---

## Email troubleshooting (OAuth2)

- Ensure CLIENT_ID, CLIENT_SECRET and REFRESH_TOKEN are valid for the EMAIL_USER account.
- The Google account must allow sending (OAuth consent & scopes configured).
- If nodemailer reports token/permission errors, refresh the token or check Google Cloud OAuth client settings.
- Check backend logs for the nodemailer stack trace.

---

## Security & production recommendations

- Never commit `.env` files or secrets.
- Use exact CORS origins (avoid `*` in production).
- Use HTTPS and strong JWT secrets.
- Use a secrets manager for production credentials.
- Use Redis or another shared store for rate-limiters in multi-instance deployments.
- Prefer invite-based admin onboarding; keep manual DB seed as an emergency bootstrap method.
