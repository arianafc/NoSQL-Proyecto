const connectDB = require('../config/db');
const { ObjectId } = require('mongodb');
const Usuario = require('../models/usuarioModel');
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");

function generarPasswordTemporal() {
  return Math.random().toString(36).slice(-8); 
}


// REGISTRAR USUARIO
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


// LOGIN
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
        passwordTemporal: usuario.passwordTemporal || false,
        cedula: usuario.cedula,
        telefono: usuario.telefono,
        voluntario: usuario.voluntario || false,
        habilidades: usuario.habilidades || [],
        disponibilidad: usuario.disponibilidad || ''
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//ACTUALIZAR CONTRASEÑA

exports.actualizarPassword = async (req, res) => {
  try {
    const { userId, nuevoPassword } = req.body;

    const db = await connectDB();
    const hash = await bcrypt.hash(nuevoPassword, 10)
    await db.collection('usuarios').updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          password: hash,
          passwordTemporal: false
        }
      }
    );

    res.json({ message: 'Contraseña actualizada correctamente' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// SER VOLUNTARIO
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


exports.desactivarVoluntariado = async (req, res) => {
   try {
    const { userId } = req.body;

    const db = await connectDB();

    await db.collection('usuarios').updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          voluntario: false,
         
        }
      }
    );

    res.json({ message: 'Ya no eres voluntario de FaunaLink' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

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


// CAMBIAR ROL
exports.updateRol = async (req, res) => {
  try {
    const db = await connectDB();
    const { rol } = req.body;

    const rolesValidos = ['admin', 'usuario'];

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


// CAMBIAR ESTADO
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


exports.actualizarPerfil = async (req, res) => {
  try {
    const { userId, nombre, email, telefono, cedula, direccion, provincia, pais } = req.body;

    const db = await connectDB();

    await db.collection('usuarios').updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          nombre,
          email,
          telefono,
          cedula,
          direccion,
          provincia,
          pais
        }
      }
    );  

    res.json({ message: 'Perfil actualizado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error actualizando perfil' });
  } 
};

exports.validarCorreoRecuperacion = async (req, res) => {
  try {
    const { correo } = req.body;

    if (!correo) {
      return res.status(400).json({
        message: "El correo es requerido"
      });
    }

    const db = await connectDB();

    const usuario = await db
      .collection("usuarios")
      .findOne({ email: correo });

    if (!usuario) {
      return res.json({
        existe: false,
        message: "Si el correo existe, se enviará una contraseña temporal"
      });
    }

    const passwordTemporal = generarPasswordTemporal();

    const hash = await bcrypt.hash(passwordTemporal,10);

    
 await db.collection("usuarios").updateOne(
      { _id: usuario._id },
      {
        $set: {
          password: hash,
          passwordTemporal: true
        }
      }
    );

    await enviarCorreoTemporal(correo, passwordTemporal);
    
      res.json({
        message: "Se ha generado una contraseña temporal. Asegurate de cambiarla"
      });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al validar el correo"
    });
  }
};


async function enviarCorreoTemporal(correo, passwordTemporal) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "faunalink4@gmail.com",        // 🔴 tu correo
      pass: "czce oxke srio zyhg"      // 🔴 contraseña de aplicación
    }
  });

  await transporter.sendMail({
    from: '"FaunaLink" <tucorreo@gmail.com>',
    to: correo,
    subject: "Contraseña temporal - FaunaLink",
    html: `
      <p>Hola,</p>
      <p>Se ha generado una contraseña temporal para tu cuenta.</p>
      <p><strong>Contraseña temporal:</strong></p>
      <h2>${passwordTemporal}</h2>
      <p>Te recomendamos iniciar sesión y cambiarla lo antes posible.</p>
      <br>
      <p>FaunaLink</p>
    `
  });
}
