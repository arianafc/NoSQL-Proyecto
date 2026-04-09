const connectDB = require('../config/db');
const { ObjectId } = require('mongodb');

exports.vistaNotificaciones = async (req, res) => {
  try {
    const db = await connectDB();

    const notificaciones = await db
      .collection('notificaciones')
      .find()
      .toArray();

    res.render('pages/admin-notificaciones', {
      notificaciones,
      error: null,
      exito: null
    });

  } catch (error) {
    console.error(error);

    res.render('pages/admin-notificaciones', {
      notificaciones: [],
      error: 'Error al obtener notificaciones',
      exito: null
    });
  }
};

exports.crearNotificacion = async (req, res) => {
  try {
    const { titulo, mensaje, tipo } = req.body;

    if (!titulo || !mensaje || !tipo) {
      return res.status(400).send('Todos los campos son obligatorios');
    }

    const db = await connectDB();

    await db.collection('notificaciones').insertOne({
      titulo,
      mensaje,
      tipo,
      leido: false,
      fecha_creacion: new Date()
    });

    res.redirect('/admin/notificaciones');

  } catch (error) {
    console.error(error);

    const db = await connectDB();
    const notificaciones = await db.collection('notificaciones').find().toArray();

    res.render('pages/admin-notificaciones', {
      notificaciones,
      error: 'Error al crear la notificación',
      exito: null
    });
  }
};
exports.actualizarNotificacion = async (req, res) => {
  try {
    const { id, titulo, mensaje, tipo, leido } = req.body;

    const db = await connectDB();

    await db.collection('notificaciones').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          titulo,
          mensaje,
          tipo,
          leido: leido === 'true'
        }
      }
    );

    res.redirect('/admin/notificaciones');

  } catch (error) {
    console.error(error);

    const db = await connectDB();
    const notificaciones = await db.collection('notificaciones').find().toArray();

    res.render('pages/admin-notificaciones', {
      notificaciones,
      error: 'Error al actualizar la notificación',
      exito: null
    });
  }
};

exports.marcarLeido = async (req, res) => {
  try {
    const { id } = req.body;

    const db = await connectDB();

    await db.collection('notificaciones').updateOne(
      { _id: new ObjectId(id) },
      { $set: { leido: true } }
    );

    res.redirect('/admin/notificaciones');

  } catch (error) {
    console.error(error);

    const db = await connectDB();
    const notificaciones = await db.collection('notificaciones').find().toArray();

    res.render('pages/admin-notificaciones', {
      notificaciones,
      error: 'Error al marcar como leído',
      exito: null
    });
  }
};

exports.eliminarNotificacion = async (req, res) => {
  try {
    const { id } = req.body;

    const db = await connectDB();

    await db.collection('notificaciones').deleteOne({
      _id: new ObjectId(id)
    });

    res.redirect('/admin/notificaciones');

  } catch (error) {
    console.error(error);

    const db = await connectDB();
    const notificaciones = await db.collection('notificaciones').find().toArray();

    res.render('pages/admin-notificaciones', {
      notificaciones,
      error: 'Error al eliminar la notificación',
      exito: null
    });
  }
};