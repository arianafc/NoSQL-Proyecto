const connectDB = require('../config/db');
const { ObjectId } = require('mongodb');
const Reporte = require('../models/reporteModel');


function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")                 
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}


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

    const db = await connectDB();

    const reportes = await db.collection("reportes").aggregate([
      {
        $match: {
          usuarioId: new ObjectId(id)
        }
      },
      {
        $sort: { _id: -1 }
      },
      {
        $lookup: {
          from: "organizaciones",
          localField: "asignado",      
          foreignField: "_id",
          as: "organizacion"
        }
      },
      {
        $unwind: {
          path: "$organizacion",
          preserveNullAndEmptyArrays: true
        }
      }
    ]).toArray();

    console.log("TOTAL REPORTES:", reportes.length);

    res.json(reportes);

  } catch (error) {
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
          evidencias: evidencias,
          estado: req.body.estado
        }
      }
    );

    res.json({ message: "Reporte actualizado correctamente" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.ObtenerReportes = async (req, res) => {
  try {
    const db = await connectDB();

    const reportes = await db.collection("reportes").aggregate([
      {
        $sort: { _id: -1 }
      },

     
      {
        $lookup: {
          from: "usuarios",
          localField: "usuarioId",
          foreignField: "_id",
          as: "usuario"
        }
      },
      {
        $unwind: {
          path: "$usuario",
          preserveNullAndEmptyArrays: true
        }
      },


      {
        $lookup: {
          from: "organizaciones",
          localField: "asignado",
          foreignField: "_id",
          as: "organizacion"
        }
      },
      {
        $unwind: {
          path: "$organizacion",
          preserveNullAndEmptyArrays: true
        }
      }

    ]).toArray();

    res.json(reportes);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.AgregarNotas = async (req, res) => {

      try {
    
const db = await connectDB();
        
 const { idReporte, nota, autorId, autorNombre } = req.body;

    if (!idReporte || !nota) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const nuevaNota = {
      mensaje: nota,
      autor: {
        id: new ObjectId(autorId),
        nombre: autorNombre
      },
      fecha: new Date()
    };

    await db.collection("reportes").updateOne(
      { _id: new ObjectId(idReporte) },
      {
        $push: { notas: nuevaNota }
      }
    );


    res.json({ message: "Nota agregada correctamente" });


    res.json({ message: "Nota agregada correctamente" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }




};

exports.obtenerNotas = async (req, res) => {
  try {
    const db = await connectDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID de reporte inválido" });
    }

    const reporte = await db.collection("reportes").findOne(
      { _id: new ObjectId(id) },
      { projection: { notas: 1 } }
    );

    if (!reporte) {
      return res.status(404).json({ error: "Reporte no encontrado" });
    }

    // ✅ Si no tiene notas, devolver array vacío
    const notas = reporte.notas || [];

    // ✅ Ordenar por fecha (más reciente primero)
    notas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    res.json(notas);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.obtenerSugeridasPorReporte = async (req, res) => {
  try {
    const db = await connectDB();
    const { idReporte } = req.params;

    if (!ObjectId.isValid(idReporte)) {
      return res.status(400).json({ error: "ID de reporte inválido" });
    }

    const reporte = await db.collection("reportes").findOne({
      _id: new ObjectId(idReporte)
    });

    if (!reporte) {
      return res.status(404).json({ error: "Reporte no encontrado" });
    }

    if (!reporte.provincia) {
      return res.status(400).json({
        error: "El reporte no tiene provincia asignada"
      });
    }

    const provinciaNormalizada = normalizarTexto(reporte.provincia);


    const organizaciones = await db
      .collection("organizaciones")
      .find({ verificado: true })
      .toArray();

    const sugeridas = organizaciones.filter(org => {
      if (!org.direccion) return false;

      const direccionNormalizada = normalizarTexto(org.direccion);

      return direccionNormalizada.includes(provinciaNormalizada);
    });

    res.json({
      provincia: reporte.provincia,
      sugeridas
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.asignarOrganizacion = async (req, res) => {
  const db = await connectDB();
  const { idReporte, idOrganizacion } = req.body;

  await db.collection("reportes").updateOne(
    { _id: new ObjectId(idReporte) },
    { $set: { asignado: new ObjectId(idOrganizacion) } }
  );

  res.json({ message: "Organización asignada" });
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