const connectDB = require('../config/db');
const { ObjectId } = require('mongodb');
const Reporte = require('../models/reporteModel');


//CREAR NUEVO REPORTE

exports.crearReporte = async (req, res) => {
  try {
    const { descripcion, ubicacion, urgencia, provincia, usuarioId } = req.body;

    const db = await connectDB();

    const evidencias = req.files
      ? req.files.map(file => `/uploads/${file.filename}`)
      : [];

    const nuevoReporte = new Reporte({
      descripcion,
      ubicacion,
      urgencia,
      provincia,
      evidencias,
      usuarioId: new ObjectId(usuarioId)
    });

    await db.collection('reportes').insertOne(nuevoReporte);

    res.json({ message: 'Reporte creado con evidencias 🐾📸🎥' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};