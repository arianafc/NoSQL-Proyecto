const connectDB = require('../config/db');
const { ObjectId } = require('mongodb');

// GET — render página admin
exports.renderVoluntariados = async (req, res) => {
  try {
    const db = await connectDB();

    const [voluntariados, voluntarios] = await Promise.all([
      db.collection('voluntariados').find({}).sort({ fechaRegistro: -1 }).toArray(),
      db.collection('usuarios').find({ voluntario: true }).toArray()
    ]);

    const vads = voluntariados.map(v => ({
      ...v,
      _id:       v._id.toString(),
      inscritos: (v.inscritos || []) // ← aseguramos que siempre exista
    }));

    const vols = voluntarios.map(u => ({
      ...u,
      _id: u._id.toString()
    }));

    res.render('pages/admin-voluntariados', {
      voluntariados: vads,
      voluntarios:   vols
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
      canton:       canton      || '',
      direccion,
      descripcion,
      fechaInicio:  fechaInicio ? new Date(fechaInicio) : null,
      fechaFin:     fechaFin    ? new Date(fechaFin)    : null,
      cupoMaximo:   cupoMaximo  ? Number(cupoMaximo)    : null,
      contacto:     contacto    || '',
      requisitos:   requisitos  || '',
      inscritos:    [],          // ← inicializar vacío
      estado:       'activo',
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
          nombre, organizacion, provincia,
          canton:      canton      || '',
          direccion,   descripcion,
          fechaInicio: fechaInicio ? new Date(fechaInicio) : null,
          fechaFin:    fechaFin    ? new Date(fechaFin)    : null,
          cupoMaximo:  cupoMaximo  ? Number(cupoMaximo)    : null,
          contacto:    contacto    || '',
          requisitos:  requisitos  || ''
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

// PATCH — cambiar estado
exports.cambiarEstado = async (req, res) => {
  try {
    const db = await connectDB();
    const { estado } = req.body;

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

// GET — render vista usuario
exports.renderVoluntariadosUsuario = async (req, res) => {
  try {
    res.render('pages/voluntariados-usuario');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error cargando la página de voluntariados');
  }
};

// GET API — voluntariados activos con conteo de inscritos
exports.getVoluntariadosActivos = async (req, res) => {
  try {
    const db = await connectDB();
    const voluntariados = await db
      .collection('voluntariados')
      .find({ estado: 'activo' })
      .sort({ fechaRegistro: -1 })
      .toArray();

    res.json(voluntariados.map(v => ({
      ...v,
      _id:       v._id.toString(),
      inscritos: (v.inscritos || [])
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo voluntariados' });
  }
};

// POST — inscribirse
exports.inscribirseVoluntariado = async (req, res) => {
  try {
    const db    = await connectDB();
    const { userId } = req.body;
    const volId = new ObjectId(req.params.id);

    const voluntariado = await db.collection('voluntariados').findOne({ _id: volId });
    if (!voluntariado) return res.status(404).json({ message: 'Voluntariado no encontrado' });

    const inscritos = voluntariado.inscritos || [];

    if (inscritos.includes(userId))
      return res.status(400).json({ message: 'Ya estás inscrito en este voluntariado' });

    if (voluntariado.cupoMaximo && inscritos.length >= voluntariado.cupoMaximo)
      return res.status(400).json({ message: 'No hay cupos disponibles' });

    await db.collection('voluntariados').updateOne(
      { _id: volId },
      { $addToSet: { inscritos: userId } }
    );

    res.json({ message: 'Inscripción exitosa' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al inscribirse' });
  }
};

// GET — mis voluntariados
exports.getMisVoluntariados = async (req, res) => {
  try {
    const db     = await connectDB();
    const userId = req.params.userId;

    const lista = await db.collection('voluntariados')
      .find({ inscritos: userId })
      .sort({ fechaInicio: 1 })
      .toArray();

    res.json(lista.map(v => ({
      ...v,
      _id:       v._id.toString(),
      inscritos: (v.inscritos || [])
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo tus voluntariados' });
  }
};

// POST — desinscribirse
exports.desinscribirseVoluntariado = async (req, res) => {
  try {
    const db = await connectDB();
    const { userId } = req.body;

    const result = await db.collection('voluntariados').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $pull: { inscritos: userId } }
    );

    if (result.matchedCount === 0)
      return res.status(404).json({ message: 'Voluntariado no encontrado' });

    res.json({ message: 'Te has salido del voluntariado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al salir del voluntariado' });
  }
};

exports.getInscritosVoluntariado = async (req, res) => {
  try {
    const db  = await connectDB();
    const vol = await db.collection('voluntariados').findOne({ _id: new ObjectId(req.params.id) });

    if (!vol) return res.status(404).json({ message: 'Voluntariado no encontrado' });

    const inscritos = vol.inscritos || [];
    if (!inscritos.length) return res.json([]);

    // Buscar tanto por ObjectId como por string para cubrir ambos casos
    const objectIds = inscritos
      .map(id => { try { return new ObjectId(id); } catch(e) { return null; } })
      .filter(Boolean);

    const usuarios = await db.collection('usuarios').find({
      $or: [
        { _id: { $in: objectIds } },
        { _id: { $in: inscritos } }
      ]
    })
    .project({ nombre: 1, email: 1, telefono: 1, cedula: 1, habilidades: 1, disponibilidad: 1 })
    .toArray();

    res.json(usuarios.map(u => ({ ...u, _id: u._id.toString() })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo inscritos' });
  }
};