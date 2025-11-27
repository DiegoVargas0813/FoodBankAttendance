# Banco de Alimentos — Aplicación

Fullstack app: Frontend (Vite + React + Tailwind), Backend (Node + Express), DB (MySQL).

This README describes two ways to run the app locally:
- Without Docker (install services locally)
- With Docker Compose (recommended for parity)

General notes
- Project root: . (this repository root)
- Frontend folder: ./Frontend/bamx
- Backend folder: ./Backend
- Default ports in examples:
  - Backend API: http://localhost:3000 (container: backend:3000)
  - Frontend (static container): http://localhost:3001 (Vite dev usually at http://localhost:5173)
  - MySQL (host mapped in compose): 3308 -> container 3306

Important env keys (examples — never commit secrets)
- Backend/.env
  - DB_HOST=mysql (when running in Docker) or localhost (local run)
  - DB_USER=root
  - DB_PASSWORD=...
  - DB_NAME=bamx
  - JWT_SECRET=...
  - FRONTEND_URL=http://localhost:5173 (URL used in emails)
  - CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3001
  - EMAIL_USER, CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN (for nodemailer OAuth2)
- Frontend/bamx/.env
  - VITE_API_URL=http://localhost:3000/api  (used at runtime)
  - VITE_API_PROXY=http://localhost:3000     (Vite dev server proxy)

---------------------------------------------------------------------------------------------------
RUNNING WITHOUT DOCKER (development)
---------------------------------------------------------------------------------------------------

1) Prepare DB
- Install MySQL 8 locally and start it.
- Create the database and import schema/seed (project ships ./db_init/init.sql).
  Example (from project root):
  ```powershell
  mysql -u root -p -P 3306 bamx < ./db_init/init.sql
  ```
  Adjust port if your MySQL uses a different port.

2) Backend
- Install deps and create .env
  ```powershell
  cd ./Backend
  npm install
  ```
- Create `./Backend/.env` — minimal example:
  ```env
  DB_HOST=localhost
  DB_USER=root
  DB_PASSWORD=your_db_password
  DB_NAME=bamx

  JWT_SECRET=change_this
  FRONTEND_URL=http://localhost:5173

  # Optional: configure CORS allowed origins
  CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3001

  # Mail (optional)
  EMAIL_USER=you@example.com
  CLIENT_ID=...
  CLIENT_SECRET=...
  REFRESH_TOKEN=...
  ```
- Start backend (dev):
  ```powershell
  npm run dev
  ```
  or production-like:
  ```powershell
  npm start
  ```
- Backend listens on port 3000 by default.

3) Frontend
- Install deps and set env
  ```powershell
  cd ./Frontend/bamx
  npm install
  ```
- Create `./Frontend/bamx/.env`:
  ```env
  VITE_API_URL=http://localhost:3000/api
  VITE_API_PROXY=http://localhost:3000
  ```
- Start dev server:
  ```powershell
  npm run dev
  ```
  Open URL reported by Vite (usually http://localhost:5173).

Notes for no-docker setup
- When running backend locally and frontend via Vite, VITE_API_PROXY ensures /api requests are proxied to backend in dev.
- Ensure BACKEND CORS_ALLOWED_ORIGINS includes Vite origin (port 5173) so browser requests are allowed.

---------------------------------------------------------------------------------------------------
RUNNING WITH DOCKER (recommended for parity)
---------------------------------------------------------------------------------------------------

1) What the compose file does (defaults in repo)
- mysql -> exposes host port 3308 mapped to container 3306
- backend -> exposes 3000:3000
- frontend -> builds static container and exposes 3001:3000
- Compose passes environment variables (CORS_ALLOWED_ORIGINS and FRONTEND_URL) to backend and VITE_API_PROXY to frontend.

2) Prepare envs
- Backend: edit `./Backend/.env` for DB credentials used by container (DB_HOST should be `mysql` when running in compose) OR rely on docker-compose env override. Example:
  ```env
  DB_HOST=mysql
  DB_USER=root
  DB_PASSWORD=RedBAMX2025!
  DB_NAME=bamx
  FRONTEND_URL=http://localhost:3001
  CORS_ALLOWED_ORIGINS=http://localhost:3001,http://localhost:5173
  ```
- Frontend: `./Frontend/bamx/.env` can remain as VITE_API_URL=http://backend:3000/api or use compose overrides.

3) Start with compose (Windows PowerShell)
  ```powershell
  cd .
  docker-compose down
  docker-compose build --no-cache
  docker-compose up
  ```
- Access frontend static container at http://localhost:3001
- Backend API at http://localhost:3000
- MySQL exposed at host port 3308 (use for local tools).

4) Notes for Docker
- If you change env vars in docker-compose.yml or Backend/.env, rebuild/recreate containers:
  ```powershell
  docker-compose up --build
  ```
- The compose includes a MySQL healthcheck; backend may still require a readiness wait script if your backend connects immediately on start. If you need robust start ordering, add a small wait-for script and entrypoints (see project suggestions earlier).

---------------------------------------------------------------------------------------------------
SEEDING FIRST ADMIN
---------------------------------------------------------------------------------------------------
- The repo includes ./db_init/init.sql to create schema and seed an initial admin. If you need to create or reset:
  - In Docker, the SQL files in ./db_init are executed automatically by the image at first startup.
  - Locally, import `./db_init/init.sql` into MySQL as shown above.

If you want to add an admin manually:
```sql
-- Example (one-time)
INSERT INTO users (email, password, username, role, is_confirmed, created_at)
VALUES ('admin@example.org', '<bcrypt-hash>', 'Initial Admin', 'ADMIN', 1, NOW());
```
- Use bcrypt to hash passwords (do not store plain text). Prefer invite/accept flow for adding admins.

---------------------------------------------------------------------------------------------------
COMMON TROUBLESHOOTING
---------------------------------------------------------------------------------------------------
- Backend CORS errors:
  - Make sure BACKEND env `CORS_ALLOWED_ORIGINS` contains the exact protocol+host+port you open in browser (e.g. http://localhost:5173).
  - After editing .env, restart backend.

- Frontend dev proxy not working:
  - Vite reads VITE_API_PROXY on startup. Restart `npm run dev` after changing `.env`.

- MySQL connection refused:
  - When using Docker, use DB_HOST=mysql inside backend container.
  - If running locally, ensure MySQL is listening on the expected port and your .env points to correct host/port.

- Invite/Email not sent:
  - Confirm EMAIL_* env vars are set and OAuth2 credentials valid.
  - Check backend logs for nodemailer errors.

- Rate limiting:
  - The backend includes request rate limits (global and specific endpoints). If you are blocked, wait the configured window (e.g., 15 min for login limiter) or adjust limits in `./Backend/server.js` / route-level middlewares.

---------------------------------------------------------------------------------------------------
USEFUL COMMANDS
---------------------------------------------------------------------------------------------------
Local development
```powershell
# Backend
cd ./Backend
npm install
npm run dev

# Frontend
cd ./Frontend/bamx
npm install
npm run dev
```

Docker
```powershell
cd .
docker-compose up --build
docker-compose down
docker-compose logs -f backend
```

Database
```powershell
# import schema locally (run from project root)
mysql -u root -p -P 3306 bamx < ./db_init/init.sql
```

---------------------------------------------------------------------------------------------------
SECURITY & PRODUCTION NOTES
---------------------------------------------------------------------------------------------------
- Never commit `.env` files or secrets.
- In production:
  - Use exact CORS origins (avoid '*').
  - Use a secrets manager for DB and email credentials.
  - Use HTTPS and strong JWT secrets.
  - Use persistent stores (Redis) for rate-limiter if multiple instances.
  - Consider using Kubernetes or a managed service for scaling.

---------------------------------------------------------------------------------------------------
NEXT STEPS / SUGGESTIONS
---------------------------------------------------------------------------------------------------
- Add a small wait-for script and entrypoints for containers to wait for DB/backend readiness (recommended for reliability).
- Consider adding example Kubernetes manifests for prod deployment.
- Add documentation for emergency admin account creation (CLI script).

If you want, I can:
- Add the wait-for script and Dockerfile entrypoint patches now.
- Add a short checklist for deploying to a cloud provider.
```// filepath: c:\Users\Diego\Documents\Banco De Alimentos\Aplicacion\README.md
# Banco de Alimentos — Aplicación

Fullstack app: Frontend (Vite + React + Tailwind), Backend (Node + Express), DB (MySQL).

This README describes two ways to run the app locally:
- Without Docker (install services locally)
- With Docker Compose (recommended for parity)

General notes
- Project root: . (this repository root)
- Frontend folder: ./Frontend/bamx
- Backend folder: ./Backend
- Default ports in examples:
  - Backend API: http://localhost:3000 (container: backend:3000)
  - Frontend (static container): http://localhost:3001 (Vite dev usually at http://localhost:5173)
  - MySQL (host mapped in compose): 3308 -> container 3306

Important env keys (examples — never commit secrets)
- Backend/.env
  - DB_HOST=mysql (when running in Docker) or localhost (local run)
  - DB_USER=root
  - DB_PASSWORD=...
  - DB_NAME=bamx
  - JWT_SECRET=...
  - FRONTEND_URL=http://localhost:5173 (URL used in emails)
  - CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3001
  - EMAIL_USER, CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN (for nodemailer OAuth2)
- Frontend/bamx/.env
  - VITE_API_URL=http://localhost:3000/api  (used at runtime)
  - VITE_API_PROXY=http://localhost:3000     (Vite dev server proxy)

---------------------------------------------------------------------------------------------------
RUNNING WITHOUT DOCKER (development)
---------------------------------------------------------------------------------------------------

1) Prepare DB
- Install MySQL 8 locally and start it.
- Create the database and import schema/seed (project ships ./db_init/init.sql).
  Example (from project root):
  ```powershell
  mysql -u root -p -P 3306 bamx < ./db_init/init.sql
  ```
  Adjust port if your MySQL uses a different port.

2) Backend
- Install deps and create .env
  ```powershell
  cd ./Backend
  npm install
  ```
- Create `./Backend/.env` — minimal example:
  ```env
  DB_HOST=localhost
  DB_USER=root
  DB_PASSWORD=your_db_password
  DB_NAME=bamx

  JWT_SECRET=change_this
  FRONTEND_URL=http://localhost:5173

  # Optional: configure CORS allowed origins
  CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3001

  # Mail (optional)
  EMAIL_USER=you@example.com
  CLIENT_ID=...
  CLIENT_SECRET=...
  REFRESH_TOKEN=...
  ```
- Start backend (dev):
  ```powershell
  npm run dev
  ```
  or production-like:
  ```powershell
  npm start
  ```
- Backend listens on port 3000 by default.

3) Frontend
- Install deps and set env
  ```powershell
  cd ./Frontend/bamx
  npm install
  ```
- Create `./Frontend/bamx/.env`:
  ```env
  VITE_API_URL=http://localhost:3000/api
  VITE_API_PROXY=http://localhost:3000
  ```
- Start dev server:
  ```powershell
  npm run dev
  ```
  Open URL reported by Vite (usually http://localhost:5173).

Notes for no-docker setup
- When running backend locally and frontend via Vite, VITE_API_PROXY ensures /api requests are proxied to backend in dev.
- Ensure BACKEND CORS_ALLOWED_ORIGINS includes Vite origin (port 5173) so browser requests are allowed.

---------------------------------------------------------------------------------------------------
RUNNING WITH DOCKER (recommended for parity)
---------------------------------------------------------------------------------------------------

1) What the compose file does (defaults in repo)
- mysql -> exposes host port 3308 mapped to container 3306
- backend -> exposes 3000:3000
- frontend -> builds static container and exposes 3001:3000
- Compose passes environment variables (CORS_ALLOWED_ORIGINS and FRONTEND_URL) to backend and VITE_API_PROXY to frontend.

2) Prepare envs
- Backend: edit `./Backend/.env` for DB credentials used by container (DB_HOST should be `mysql` when running in compose) OR rely on docker-compose env override. Example:
  ```env
  DB_HOST=mysql
  DB_USER=root
  DB_PASSWORD=RedBAMX2025!
  DB_NAME=bamx
  FRONTEND_URL=http://localhost:3001
  CORS_ALLOWED_ORIGINS=http://localhost:3001,http://localhost:5173
  ```
- Frontend: `./Frontend/bamx/.env` can remain as VITE_API_URL=http://backend:3000/api or use compose overrides.

3) Start with compose (Windows PowerShell)
  ```powershell
  cd .
  docker-compose down
  docker-compose build --no-cache
  docker-compose up
  ```
- Access frontend static container at http://localhost:3001
- Backend API at http://localhost:3000
- MySQL exposed at host port 3308 (use for local tools).

4) Notes for Docker
- If you change env vars in docker-compose.yml or Backend/.env, rebuild/recreate containers:
  ```powershell
  docker-compose up --build
  ```
- The compose includes a MySQL healthcheck; backend may still require a readiness wait script if your backend connects immediately on start. If you need robust start ordering, add a small wait-for script and entrypoints (see project suggestions earlier).

---------------------------------------------------------------------------------------------------
SEEDING FIRST ADMIN
---------------------------------------------------------------------------------------------------
- The repo includes ./db_init/init.sql to create schema and seed an initial admin. If you need to create or reset:
  - In Docker, the SQL files in ./db_init are executed automatically by the image at first startup.
  - Locally, import `./db_init/init.sql` into MySQL as shown above.

If you want to add an admin manually:
```sql
-- Example (one-time)
INSERT INTO users (email, password, username, role, is_confirmed, created_at)
VALUES ('admin@example.org', '<bcrypt-hash>', 'Initial Admin', 'ADMIN', 1, NOW());
```
- Use bcrypt to hash passwords (do not store plain text). Prefer invite/accept flow for adding admins.

---------------------------------------------------------------------------------------------------
COMMON TROUBLESHOOTING
---------------------------------------------------------------------------------------------------
- Backend CORS errors:
  - Make sure BACKEND env `CORS_ALLOWED_ORIGINS` contains the exact protocol+host+port you open in browser (e.g. http://localhost:5173).
  - After editing .env, restart backend.

- Frontend dev proxy not working:
  - Vite reads VITE_API_PROXY on startup. Restart `npm run dev` after changing `.env`.

- MySQL connection refused:
  - When using Docker, use DB_HOST=mysql inside backend container.
  - If running locally, ensure MySQL is listening on the expected port and your .env points to correct host/port.

- Invite/Email not sent:
  - Confirm EMAIL_* env vars are set and OAuth2 credentials valid.
  - Check backend logs for nodemailer errors.

- Rate limiting:
  - The backend includes request rate limits (global and specific endpoints). If you are blocked, wait the configured window (e.g., 15 min for login limiter) or adjust limits in `./Backend/server.js` / route-level middlewares.

---------------------------------------------------------------------------------------------------
USEFUL COMMANDS
---------------------------------------------------------------------------------------------------
Local development
```powershell
# Backend
cd ./Backend
npm install
npm run dev

# Frontend
cd ./Frontend/bamx
npm install
npm run dev
```

Docker
```powershell
cd .
docker-compose up --build
docker-compose down
docker-compose logs -f backend
```

Database
```powershell
# import schema locally (run from project root)
mysql -u root -p -P 3306 bamx < ./db_init/init.sql
```

---------------------------------------------------------------------------------------------------
SECURITY & PRODUCTION NOTES
---------------------------------------------------------------------------------------------------
- Never commit `.env` files or secrets.
- In production:
  - Use exact CORS origins (avoid '*').
  - Use a secrets manager for DB and email credentials.
  - Use HTTPS and strong JWT secrets.
  - Use persistent stores (Redis) for rate-limiter if multiple instances.
  - Consider using Kubernetes or a managed service for scaling.
