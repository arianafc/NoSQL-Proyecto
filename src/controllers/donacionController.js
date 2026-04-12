const connectDB = require('../config/db');
const { ObjectId } = require('mongodb');

// GET — todas las donaciones con info del usuario
exports.getDonaciones = async (req, res) => {
  try {
    const db = await connectDB();
    const donaciones = await db.collection('donaciones')
      .find({})
      .sort({ fecha: -1 })
      .toArray();

    // Obtener nombres de usuarios
    const userIds = [...new Set(donaciones.map(d => d.usuarioId).filter(Boolean))];
    const usuarios = await db.collection('usuarios')
      .find({ _id: { $in: userIds.map(id => { try { return new ObjectId(id); } catch(e) { return null; } }).filter(Boolean) } })
      .project({ nombre: 1, email: 1 })
      .toArray();

    const userMap = {};
    usuarios.forEach(u => { userMap[u._id.toString()] = u; });

    const resultado = donaciones.map(d => ({
      ...d,
      _id: d._id.toString(),
      usuario: userMap[d.usuarioId] || { nombre: d.nombreDonante || 'Anónimo', email: '—' }
    }));

    res.json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo donaciones' });
  }
};

// POST — crear donación
exports.crearDonacion = async (req, res) => {
  try {
    const db = await connectDB();
    const { usuarioId, nombreDonante, monto, tipo, organizacion, descripcion, anonima } = req.body;

    if (!monto || monto <= 0) {
      return res.status(400).json({ message: 'El monto debe ser mayor a 0' });
    }

    const nueva = {
      usuarioId:      usuarioId || null,
      nombreDonante:  anonima ? 'Anónimo' : (nombreDonante || 'Anónimo'),
      monto:          parseFloat(monto),
      tipo:           tipo || 'economica',      // 'economica' | 'especie'
      organizacion:   organizacion || 'FaunaLink General',
      descripcion:    descripcion || '',
      anonima:        !!anonima,
      estado:         'confirmada',
      fecha:          new Date()
    };

    await db.collection('donaciones').insertOne(nueva);
    res.json({ message: 'Donación registrada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar donación' });
  }
};

// GET — resumen estadístico
exports.getResumen = async (req, res) => {
  try {
    const db = await connectDB();

    const [resumen] = await db.collection('donaciones').aggregate([
      {
        $group: {
          _id: null,
          totalMonto:    { $sum: '$monto' },
          totalDonaciones: { $sum: 1 },
          promedioMonto: { $avg: '$monto' },
          maxMonto:      { $max: '$monto' }
        }
      }
    ]).toArray();

    const porTipo = await db.collection('donaciones').aggregate([
      { $group: { _id: '$tipo', total: { $sum: '$monto' }, cantidad: { $sum: 1 } } }
    ]).toArray();

    const porOrganizacion = await db.collection('donaciones').aggregate([
      { $group: { _id: '$organizacion', total: { $sum: '$monto' }, cantidad: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ]).toArray();

    res.json({ resumen: resumen || {}, porTipo, porOrganizacion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo resumen' });
  }
};

// GET — donaciones agrupadas por periodo
exports.getPorPeriodo = async (req, res) => {
  try {
    const db  = await connectDB();
    const { periodo } = req.query; // 'dia' | 'mes' | 'anio'

    const groupId = periodo === 'dia'
      ? { anio: { $year: '$fecha' }, mes: { $month: '$fecha' }, dia: { $dayOfMonth: '$fecha' } }
      : periodo === 'anio'
      ? { anio: { $year: '$fecha' } }
      : { anio: { $year: '$fecha' }, mes: { $month: '$fecha' } };

    const datos = await db.collection('donaciones').aggregate([
      { $group: { _id: groupId, total: { $sum: '$monto' }, cantidad: { $sum: 1 } } },
      { $sort: { '_id.anio': 1, '_id.mes': 1, '_id.dia': 1 } }
    ]).toArray();

    res.json(datos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo datos por periodo' });
  }
};

// PATCH — cambiar estado
exports.cambiarEstado = async (req, res) => {
  try {
    const db = await connectDB();
    const { estado } = req.body;

    await db.collection('donaciones').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { estado } }
    );

    res.json({ message: 'Estado actualizado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error actualizando estado' });
  }
};

// GET — donaciones del usuario autenticado
exports.getMisDonaciones = async (req, res) => {
  try {
    const db = await connectDB();
    const userId = req.params.userId;

    const donaciones = await db.collection('donaciones')
      .find({ usuarioId: userId })
      .sort({ fecha: -1 })
      .toArray();

    res.json(donaciones.map(d => ({ ...d, _id: d._id.toString() })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo tus donaciones' });
  }
};

// POST — crear donación de usuario (con comprobante)
exports.crearDonacionUsuario = async (req, res) => {
  try {
    const db = await connectDB();
    const { usuarioId, nombreDonante, monto, metodoPago, comprobante, descripcion } = req.body;

    if (!monto || monto <= 0)       return res.status(400).json({ message: 'El monto debe ser mayor a 0' });
    if (!comprobante)                return res.status(400).json({ message: 'El número de comprobante es requerido' });
    if (!metodoPago)                 return res.status(400).json({ message: 'El método de pago es requerido' });

    const nueva = {
      usuarioId,
      nombreDonante:  nombreDonante || 'Usuario',
      monto:          parseFloat(monto),
      tipo:           'economica',
      metodoPago,     // 'transferencia' | 'sinpe'
      comprobante,
      organizacion:   'FaunaLink General',
      descripcion:    descripcion || '',
      anonima:        false,
      estado:         'pendiente', // admin debe confirmar
      fecha:          new Date()
    };

    await db.collection('donaciones').insertOne(nueva);
    res.json({ message: 'Donación registrada. Será verificada por el equipo de FaunaLink.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar donación' });
  }
};