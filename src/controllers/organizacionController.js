const connectDB = require('../config/db');
const { ObjectId } = require('mongodb');

exports.vistaOrganizaciones = async (req, res) => {
  try {
    const db = await connectDB();

    const organizaciones = await db
      .collection('organizaciones')
      .find()
      .toArray();

    res.render('pages/admin-organizaciones', {
      organizaciones,
      error: null,
      exito: null
    });

  } catch (error) {
    console.error(error);

    res.render('pages/admin-organizaciones', {
      organizaciones: [],
      error: 'Error al obtener organizaciones',
      exito: null
    });
  }
};


exports.crearOrganizacion = async (req, res) => {
  try {
    const { nombre, tipo, descripcion, correo, telefono, direccion } = req.body;

    if (!nombre || !tipo || !correo) {
      return res.status(400).send('Nombre, tipo y correo son obligatorios');
    }

    const db = await connectDB();

    await db.collection('organizaciones').insertOne({
      nombre,
      tipo,
      descripcion,
      correo,
      telefono,
      direccion,
      verificado: false,
      fecha_creacion: new Date()
    });

    res.redirect('/admin/organizaciones');

  } catch (error) {
    console.error(error);

    const db = await connectDB();
    const organizaciones = await db.collection('organizaciones').find().toArray();

    res.render('pages/admin-organizaciones', {
      organizaciones,
      error: 'Error al crear la organización',
      exito: null
    });
  }
};

exports.verificarOrganizacion = async (req, res) => {
  try {
    const { id } = req.body;

    const db = await connectDB();

    await db.collection('organizaciones').updateOne(
      { _id: new ObjectId(id) },
      { $set: { verificado: true } }
    );

    res.redirect('/admin/organizaciones');

  } catch (error) {
    console.error(error);

    const db = await connectDB();
    const organizaciones = await db.collection('organizaciones').find().toArray();

    res.render('pages/admin-organizaciones', {
      organizaciones,
      error: 'Error al verificar la organización',
      exito: null
    });
  }
};

exports.eliminarOrganizacion = async (req, res) => {
  try {
    const { id } = req.body;

    const db = await connectDB();

    await db.collection('organizaciones').deleteOne({
      _id: new ObjectId(id)
    });

    res.redirect('/admin/organizaciones');

  } catch (error) {
    console.error(error);

    const db = await connectDB();
    const organizaciones = await db.collection('organizaciones').find().toArray();

    res.render('pages/admin-organizaciones', {
      organizaciones,
      error: 'Error al eliminar la organización',
      exito: null
    });
  }
};

exports.obtenerOrganizaciones = async (req, res) => {
  try {
    const db = await connectDB();
    
    const organizaciones = await db
      .collection("organizaciones")
      .find({ verificado: true })
      .toArray();

    res.json(organizaciones);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.vistaOrganizacionesUs = async (req, res) => {
  try {
    const db = await connectDB();

    const organizaciones = await db
      .collection('organizaciones')
      .find({ verificado: true })
      .toArray();

    res.render('pages/organizaciones', {
      organizaciones,
      error: null,
      exito: null
    });

  } catch (error) {
    console.error(error);

    res.render('pages/organizaciones', {
      organizaciones: [],
      error: 'Error al obtener organizaciones',
      exito: null
    });
  }
};