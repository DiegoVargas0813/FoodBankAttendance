### Built With
* [Node.js](https://nodejs.org/) - JavaScript runtime
* [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript
* [Express](https://expressjs.com/) - Web framework for Node.js
* [React](https://reactjs.org/) - JavaScript library for building user interfaces
* [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling
* [MySQL](https://www.mysql.com/) - Relational database management system

---

## Installation (Local Development)

1. **Clone the Repo**
   ```sh
   git clone https://github.com/DiegoVargas0813/FoodBankAttendance.git
   ```

2. **Install NPM packages in both backend and frontend**
   ```sh
   cd Aplicacion/Backend
   npm install
   cd ../Frontend/bamx
   npm install
   ```

3. **Create environment variable files**

   **Backend/.env**
   ```
   JWT_SECRET=your_jwt_secret_here
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=bamx
   ```

   **Frontend/bamx/.env**
   ```
   VITE_API_URL=http://localhost:3000/api
   ```

4. **Change git remote to your own repository (optional)**
   ```sh
   git remote set-url origin github_username/repo_name
   git remote -v
   ```

---

## Docker Setup

1. **Make sure you have Docker and Docker Compose installed.**

2. **Navigate to the root directory of the project where the `docker-compose.yml` file is located.**

3. **Create environment variable files for Docker:**

   - Edit `Backend/.env` and set:
     ```
     JWT_SECRET=your_jwt_secret_here
     DB_HOST=mysql
     DB_USER=root
     DB_PASSWORD=your_mysql_password
     DB_NAME=bamx
     ```
   - Edit `Frontend/bamx/.env` and set:
     ```
     VITE_API_URL=http://backend:3000/api
     ```

   - Make sure `DB_PASSWORD` in `.env` matches the password in `docker-compose.yml` under `MYSQL_ROOT_PASSWORD`.

4. **Build and start the containers:**
   ```sh
   docker-compose up --build
   ```

5. **Access the application:**
   - Frontend: [http://localhost:3001](http://localhost:3001)
   - Backend API: [http://localhost:3000](http://localhost:3000)
   - MySQL: `localhost:3308` (for external tools)

6. **Stopping the application:**
   ```sh
   docker-compose down
   ```

7. **(Optional) Resetting the database:**
   ```sh
   docker-compose down
   docker volume rm aplicacion_db_data
   docker-compose up --build
   ```

---
