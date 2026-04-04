const express = require('express');
const connectDB = require('./config/db');

const usuarioRoutes = require('./routes/usuarioRoutes');

const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

let database;


connectDB().then(db => {
  database = db;
});



app.use('/api/usuarios', usuarioRoutes);
app.listen(3000, () => console.log('Servidor corriendo 🚀'));