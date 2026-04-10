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

    res.json({ message: 'Muchas gracias por ayudar! Tu reporte se ha creado con éxito 🐾📸🎥' });

  } catch (error) {
    if (error.message === 'Tipo de archivo no permitido') {
      return res.status(400).json({ message: error.message });
    }

    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Archivo demasiado grande (máx 10MB)' });
    }

    res.status(500).json({ error: error.message });
  }
};


exports.ObtenerMisReportes = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'usuarioId es requerido' });
    }

    const db = await connectDB();

    const reportes = await db.collection('reportes')
      .find({ usuarioId: new ObjectId(id) })
      .sort({ _id: -1 }) 
      .toArray();

    res.json(reportes);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.ObtenerReportePorId = async (req, res) => {
  try {
    const db = await connectDB();

     const reporte = await db.collection('reportes').findOne({
      _id: new ObjectId(req.params.id)
    });

    res.json(reporte);

  } catch (error) {
    res.status(500).json({ error: error.message });
  } 
};

exports.CancelarReporte = async (req, res) => {
  try {
    const db = await connectDB();

    await db.collection('reportes').updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: { estado: "Cancelado" }
      }
    );

    res.json({ message: "Reporte cancelado" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.ActualizarReporte = async (req, res) => {
  try {
    const db = await connectDB();
    const id = req.params.id;

    const eliminar = req.body.eliminar
      ? JSON.parse(req.body.eliminar)
      : [];

    const reporte = await db.collection('reportes').findOne({
      _id: new ObjectId(id)
    });

    // Filtrar evidencias eliminadas
    let evidencias = reporte.evidencias.filter(ev => !eliminar.includes(ev));

    // Agregar nuevas
    if (req.files && req.files.length > 0) {
      const nuevas = req.files.map(file => `/uploads/${file.filename}`);
      evidencias = evidencias.concat(nuevas);
    }

    await db.collection('reportes').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          descripcion: req.body.descripcion,
          ubicacion: req.body.ubicacion,
          provincia: req.body.provincia,
          urgencia: req.body.urgencia,
          evidencias: evidencias
        }
      }
    );

    res.json({ message: "Reporte actualizado correctamente" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};