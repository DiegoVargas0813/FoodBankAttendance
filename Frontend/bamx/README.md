# Banco de Alimentos — Aplicación

Fullstack app: Frontend (Vite + React + Tailwind), Backend (Node + Express), DB (MySQL).

This README documents required environment variables (OAuth2 email only), seeding the first admin user, and quick run instructions (local / Docker). Do not commit any `.env` files or secrets.

---

## Overview

- Project root: .
- Backend folder: ./Backend
- Frontend folder: ./Frontend/bamx
- The app uses OAuth2 (Google) for sending confirmation/invite emails. Do not use SMTP credentials here — the code expects OAuth2 tokens/credentials.

Restart services after changing any `.env`.

---

## Backend environment — required / recommended (`./Backend/.env`)

App / security
```env
NODE_ENV=development
PORT=3000
JWT_SECRET=replace_with_strong_random_string           # REQUIRED
JWT_EXPIRES_IN=1h                                      # e.g. "1h"
REFRESH_TOKEN_EXPIRES_DAYS=30                          # integer
TOKEN_VERSION=0                                        # integer used to invalidate refresh tokens
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
FRONTEND_URL=http://localhost:5173                    # used to generate links in emails
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3001
                                                      # comma-separated allowed browser origins (avoid '*' in production)
```

Email (OAuth2 only — required for account management)
```env
# Use OAuth2 transport (nodemailer). Do not supply SMTP username/password here.
EMAIL_TRANSPORT=oauth2
EMAIL_USER=you@example.com            # the email address that will appear as From:
CLIENT_ID=your_google_oauth_client_id
CLIENT_SECRET=your_google_oauth_client_secret
REFRESH_TOKEN=oauth_refresh_token     # long-lived refresh token for the OAuth2 client
EMAIL_FROM_NAME="Banco de Alimentos BAMX"  # optional display name
```

Invite / account management / rate limits
```env
INVITE_DEFAULT_HOURS=72                       # default invite expiry in hours
UNCONFIRMED_DELETE_DAYS=30
LOGIN_RATE_LIMIT_WINDOW_MIN=15                # minutes window for login rate limiter
LOGIN_RATE_LIMIT_MAX=5                         # max login attempts per window
ACCEPT_INVITE_RATE_LIMIT_MAX=5                 # max accept-invite attempts per window
```

Notes for OAuth2:
- The OAuth2 client must have the correct scopes to send email (e.g., Gmail send scopes).
- The REFRESH_TOKEN should be obtained via OAuth2 consent flow for the EMAIL_USER account.
- If nodemailer reports permission errors, refresh tokens or verify OAuth client configuration in Google Cloud Console.
- FRONTEND_URL must be the public URL users will open (used in invite/confirmation links).

---

## Frontend environment (`./Frontend/bamx/.env`)
```env
VITE_API_URL=http://localhost:3000/api   # runtime API base used by client
VITE_API_PROXY=http://localhost:3000     # Vite dev proxy for /api requests (dev only)
```
- Restart Vite dev server after editing these values.

---

## Seeding the first admin user

Options:
- Automatic: `./db_init/init.sql` included in the repo will run when MySQL container initializes and inserts a seeded admin.
- Manual (recommended when running locally or for resets):

1) Generate bcrypt hash (from project root)
```bash
# requires node and bcryptjs installed (or run inside ./Backend)
node -e "console.log(require('bcryptjs').hashSync('YourSecurePassword!', 12))"
```
Copy the printed hash.

2) Insert admin into DB (run against your MySQL instance)
```sql
INSERT INTO users (email, password, username, role, is_confirmed, created_at)
VALUES ('admin@example.org', '<bcrypt-hash>', 'Initial Admin', 'ADMIN', 1, NOW());
```
- Mark `is_confirmed = 1` so the admin is active immediately.
- Rotate/change password on first login. Prefer invite/accept flow for creating further admins.

---

## Invite / Accept flow (summary)

- Admin creates invites: `POST /api/invites` (admin-only). Server records token + expiry and sends invite email.
- Invite email contains link: `${FRONTEND_URL}/accept-invite?token=...`
- Public accept endpoint: `POST /api/invites/accept` with JSON `{ token, username, password }`.
- The accept endpoint enforces password rules and marks the invite used.

Password rules enforced on accept:
- Min 8 characters, max 64
- At least one letter and one number
- At least one symbol (e.g., !@#$%)

---

## Quick run (local, no Docker)

1) Prepare DB and import schema:
```powershell
# from project root
mysql -u root -p -P 3306 bamx < ./db_init/init.sql
```

2) Backend
```powershell
cd ./Backend
npm install
# create ./Backend/.env as documented above
npm run dev
```

3) Frontend
```powershell
cd ./Frontend/bamx
npm install
# create ./Frontend/bamx/.env as documented above
npm run dev
```
Open Vite URL (usually http://localhost:5173).

---

## Quick run with Docker Compose

1) Edit docker-compose env overrides if needed (`CORS_ALLOWED_ORIGINS`, `FRONTEND_URL`) or set vars in `./Backend/.env`.

2) From project root:
```powershell
docker-compose down
docker-compose build --no-cache
docker-compose up
```
- Frontend static container default: http://localhost:3001
- Backend API: http://localhost:3000
- MySQL mapped host port: 3308 (container 3306, per compose)

---

## Security & production notes

- Never commit `.env` files or secrets.
- In production:
  - Use exact CORS origins (avoid `*`).
  - Use HTTPS and strong JWT secret.
  - Store secrets in a secret manager.
  - Use Redis or similar for shared rate-limiter state if scaling horizontally.
  - Prefer invite-based admin onboarding; keep manual seed as emergency bootstrap.

---

## Troubleshooting (email and CORS)

- Email issues: check CLIENT_ID/CLIENT_SECRET/REFRESH_TOKEN and that the Google OAuth client has correct scopes/consent.
- CORS errors: ensure `CORS_ALLOWED_ORIGINS` contains the full origin (protocol + host + port) that the browser uses.
- After changing `.env`, always restart backend/frontend processes.

---