const connectDB = require('../config/db');
const { ObjectId } = require('mongodb');
const Usuario = require('../models/usuarioModel');
const bcrypt = require('bcrypt');


// 🔥 REGISTRAR USUARIO
exports.registrarUsuario = async (req, res) => {
  try {
    const { nombre, email, password, telefono, cedula } = req.body;

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
      rol: 'Usuario',
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


// 🔥 LOGIN
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

    // 🚫 BLOQUEAR SI ESTÁ INACTIVO
    if (!usuario.estado) {
      return res.status(403).json({ message: 'Usuario inactivo, contacte al administrador' });
    }

    const passwordMatch = await bcrypt.compare(password, usuario.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    res.json({
      message: 'Bienvenido a FaunaLink',
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        cedula: usuario.cedula,
        telefono: usuario.telefono
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// 🔥 SER VOLUNTARIO
exports.serVoluntario = async (req, res) => {
  try {
    const { userId, habilidades, disponibilidad } = req.body;

    const db = await connectDB();

    await db.collection('usuarios').updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          voluntario: true,
          habilidades,
          disponibilidad
        }
      }
    );

    res.json({ message: 'Usuario actualizado como voluntario' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// 🔥 OBTENER USUARIOS
exports.getUsuarios = async (req, res) => {
  try {
    const db = await connectDB();

    const usuarios = await db.collection('usuarios').find().toArray();

    res.json(usuarios);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo usuarios' });
  }
};


// 🔥 CAMBIAR ROL
exports.updateRol = async (req, res) => {
  try {
    const db = await connectDB();
    const { rol } = req.body;

    const rolesValidos = ['Admin', 'Usuario', 'Organizacion'];

    if (!rolesValidos.includes(rol)) {
      return res.status(400).json({ message: 'Rol inválido' });
    }

    const result = await db.collection('usuarios').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { rol } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Rol actualizado correctamente' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error actualizando rol' });
  }
};


// 🔥 CAMBIAR ESTADO
exports.updateEstado = async (req, res) => {
  try {
    const db = await connectDB();
    const { estado } = req.body;

    if (typeof estado !== 'boolean') {
      return res.status(400).json({ message: 'Estado inválido' });
    }

    const result = await db.collection('usuarios').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { estado } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Estado actualizado correctamente' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error actualizando estado' });
  }
};