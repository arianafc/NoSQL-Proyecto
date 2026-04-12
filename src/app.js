const express = require('express');
const connectDB = require('./config/db');
const usuarioRoutes = require('./routes/usuarioRoutes');
const organizacionRoutes = require('./routes/organizacionRoutes');
const notificacionRoutes = require('./routes/notificacionRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const cors = require('cors');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const voluntariadoRoutes = require('./routes/voluntariadoRoutes');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const donacionRoutes = require('./routes/donacionRoutes');


// Middlewares
app.use(cors());
app.use(express.json());

// EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Archivos estáticos
app.use(express.static(path.join(__dirname, '../Public')));
app.use('/uploads', express.static('public/uploads'));

//  RUTAS (SIN PROTECCIÓN)
app.get('/', (req, res) => {
  res.render('pages/login', { layout: false });
});

app.get('/reportes', (req, res) => {
  res.render('pages/reportes-usuario');
});

const organizacionController = require('./controllers/organizacionController');

app.get('/organizaciones', organizacionController.vistaOrganizacionesUs);

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

app.get('/admin', (req, res) => {
  res.render('pages/admin-dashboard');
});

app.get('/admin/usuarios', (req, res) => {
  res.render('pages/admin-usuarios');
});

app.get('/admin/reportes', (req, res) => {
  res.render('pages/admin-reportes');
});

app.use('/admin/voluntariados', voluntariadoRoutes);

app.get('/voluntariados', (req, res) => {
  res.render('pages/voluntariados-usuario');
});

app.use('/api/voluntariados', voluntariadoRoutes);

app.get('/admin/donaciones', (req, res) => res.render('pages/admin-donaciones'));
app.use('/api/donaciones', donacionRoutes);
app.get('/donaciones', (req, res) => res.render('pages/donaciones-usuario'));

//  DB
connectDB()
  .then(() => console.log(' Conectado a MongoDB Atlas'))
  .catch(err => console.error(' Error conectando DB:', err));

// API
app.use('/api/reportes', reporteRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api', notificacionRoutes);
app.use('/api/organizaciones', organizacionRoutes);
app.use('/admin', organizacionRoutes);
app.use('/admin', notificacionRoutes);

//  Servidor
app.listen(3000, () => console.log('Servidor corriendo 🚀'));