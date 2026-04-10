const express = require('express');
const router = express.Router();
const organizacionController = require('../controllers/organizacionController');

router.get('/organizaciones', organizacionController.vistaOrganizaciones);
router.post('/organizaciones', organizacionController.crearOrganizacion);
router.post('/organizaciones/verificar', organizacionController.verificarOrganizacion);
router.post('/organizaciones/eliminar', organizacionController.eliminarOrganizacion);
router.get('/organizacionesAsignar', organizacionController.obtenerOrganizaciones);

module.exports = router;