const connectDB = require('../config/db');
const Usuario = require('../models/usuarioModel');
const bcrypt = require('bcrypt');


exports.registrarUsuario = async (req, res) => {
  try {
    const { nombre, email, password, telefono, cedula, rol } = req.body;

    if (!nombre || !email || !password || !telefono || !cedula) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario = new Usuario({
      nombre,
      email,
      cedula,
      password: hashedPassword,
      telefono,
      rol: 'usuario',
      estado: true
    });

    const db = await connectDB();

    await db.collection('usuarios').insertOne(nuevoUsuario);

    res.json({ message: 'Usuario registrado correctamente 🎉' });

  } catch (error) {
      if (error.code === 11000) {
    return res.status(400).json({ message: 'El email ya está registrado' });
  }

    res.status(500).json({ error: error.message });
  }
};

exports.loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;   
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son obligatorios' });
    }
    const db = await connectDB();
    const usuario = await db.collection('usuarios').findOne({ email });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }   
    const passwordMatch = await bcrypt.compare(password, usuario.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }   
    res.json({ message: 'Bienvenido a FaunaLink', usuario: { nombre: usuario.nombre, email: usuario.email, id: usuario._id, rol: usuario.rol } }); 
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};