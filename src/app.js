const express = require('express');
const connectDB = require('./config/db');
const usuarioRoutes = require('./routes/usuarioRoutes');
const cors = require('cors');
const expressLayouts = require('express-ejs-layouts');

const app = express();

app.use(cors());
app.use(express.json());

const path = require('path');


// 🔥 EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// 🔥 archivos estáticos
app.use(express.static(path.join(__dirname, '../Public')));
// 🔥 rutas
app.get('/', (req, res) => {
  res.render('pages/login', { layout: false });
});

app.get('/perfil', (req, res) => {
  res.render('pages/perfil');
});

app.get('/registro', (req, res) => {
  res.render('pages/registro', { layout: false });
});

app.get('/index', (req, res) => {
  res.render('pages/index');
});

app.get('/RecuperarAcceso', (req, res) => {
  res.render('pages/RecuperarAcceso', { layout: false });
});

// DB
let database;
connectDB().then(db => {
  database = db;
});

// API
app.use('/api/usuarios', usuarioRoutes);

// servidor
app.listen(3000, () => console.log('Servidor corriendo 🚀'));