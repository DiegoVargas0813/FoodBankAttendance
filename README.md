### Built With
* [Node.js](https://nodejs.org/) - JavaScript runtime
* [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript
* [Express](https://expressjs.com/) - Web framework for Node.js
* [React](https://reactjs.org/) - JavaScript library for building user interfaces
* [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling
* [MySQL](https://www.mysql.com/) - Relational database management system

### Installation

1. Clone the Repo
   ```sh
   git clone https://github.com/DiegoVargas0813/FoodBankAttendance.git
   ```
2. Install NPM packages in bamx and  backend

    ```sh
    npm install
    ```
3. Create a .env file in the backend folder and add the following variables.

    ```sh
    JWT_SECRET=your_jwt_secret_here
    DB_HOST=mysql
    DB_USER=root
    DB_PASSWORD=your_mysql_password
    DB_NAME=bamx
    ```
4. Create a .env file in the bamx folder and add the following variables.

    ```sh
    REACT_APP_API_URL=http://localhost:3000/api
    ```

5. Change git remote to your own repository

    ```sh
   git remote set-url origin github_username/repo_name
   git remote -v # confirm the changes
    ```