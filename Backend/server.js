// Modulos Requeridos
const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');
require('dotenv').config(); // Cargar variables de entorno


// Iniciar Express
const app = express();
app.use(express.json()); // Middleware para parsear JSON
app.use(cors()); // Middleware para habilitar CORS

// Health Check
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Archivos de rutas
const loginRoute = require('./routes/loginRoute')
const userRoute = require('./routes/userRoute')


// Usar rutas
app.use(cors({origin: 'http://localhost:5173'}));
app.use(cors({origin: 'http://localhost:4173'}));
app.use('/api/users', userRoute);
app.use('/api/signup', loginRoute);

// Iniciar el servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});