const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');
const upload = require('../config/multer');

router.post('/', upload.array('evidencias', 5), reporteController.crearReporte);
router.get('/misReportes/:id', reporteController.ObtenerMisReportes);
router.get('/:id', reporteController.ObtenerReportePorId);
router.put('/cancelar/:id', reporteController.CancelarReporte);
router.put('/:id', upload.array('evidencias', 5), reporteController.ActualizarReporte);

module.exports = router;