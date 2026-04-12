const connectDB = require('../config/db');
const { ObjectId } = require('mongodb');

// GET — render página con ambos conjuntos de datos
exports.renderVoluntariados = async (req, res) => {
  try {
    const db = await connectDB();

    const [voluntariados, voluntarios] = await Promise.all([
      db.collection('voluntariados').find({}).sort({ fechaRegistro: -1 }).toArray(),
      db.collection('usuarios').find({ voluntario: true }).toArray()
    ]);

    // Convertir ObjectIds a string para usarlos en el EJS/JS del cliente
    const vads = voluntariados.map(v => ({ ...v, _id: v._id.toString() }));
    const vols = voluntarios.map(u => ({ ...u, _id: u._id.toString() }));

    res.render('pages/admin-voluntariados', {
      voluntariados: vads,
      voluntarios: vols
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error cargando la página de voluntariados');
  }
};

// POST — crear voluntariado
exports.crearVoluntariado = async (req, res) => {
  try {
    const db = await connectDB();
    const { nombre, organizacion, provincia, canton, direccion,
            descripcion, fechaInicio, fechaFin, cupoMaximo, contacto, requisitos } = req.body;

    const nuevo = {
      nombre,
      organizacion,
      provincia,
      canton: canton || '',
      direccion,
      descripcion,
      fechaInicio: fechaInicio ? new Date(fechaInicio) : null,
      fechaFin:    fechaFin    ? new Date(fechaFin)    : null,
      cupoMaximo:  cupoMaximo  || null,
      contacto:    contacto    || '',
      requisitos:  requisitos  || '',
      estado: 'activo',
      fechaRegistro: new Date()
    };

    await db.collection('voluntariados').insertOne(nuevo);
    res.json({ message: 'Voluntariado creado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear voluntariado' });
  }
};

// PUT — editar voluntariado
exports.editarVoluntariado = async (req, res) => {
  try {
    const db = await connectDB();
    const { nombre, organizacion, provincia, canton, direccion,
            descripcion, fechaInicio, fechaFin, cupoMaximo, contacto, requisitos } = req.body;

    const result = await db.collection('voluntariados').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: {
          nombre, organizacion, provincia, canton, direccion, descripcion,
          fechaInicio: fechaInicio ? new Date(fechaInicio) : null,
          fechaFin:    fechaFin    ? new Date(fechaFin)    : null,
          cupoMaximo: cupoMaximo || null,
          contacto, requisitos
        }
      }
    );

    if (result.matchedCount === 0)
      return res.status(404).json({ message: 'Voluntariado no encontrado' });

    res.json({ message: 'Voluntariado actualizado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar voluntariado' });
  }
};

// PATCH — cambiar estado activo/inactivo
exports.cambiarEstado = async (req, res) => {
  try {
    const db = await connectDB();
    const { estado } = req.body; // 'activo' | 'inactivo'

    const result = await db.collection('voluntariados').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { estado } }
    );

    if (result.matchedCount === 0)
      return res.status(404).json({ message: 'Voluntariado no encontrado' });

    res.json({ message: 'Estado actualizado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar estado' });
  }
};