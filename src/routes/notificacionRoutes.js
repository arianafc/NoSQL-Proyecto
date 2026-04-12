const express = require('express');
const router = express.Router();
const notificacionController = require('../controllers/notificacionController');

router.get('/notificaciones', notificacionController.vistaNotificaciones);
router.post('/notificaciones', notificacionController.crearNotificacion);
router.post('/notificaciones/actualizar', notificacionController.actualizarNotificacion);
router.post('/notificaciones/leido', notificacionController.marcarLeido);
router.post('/notificaciones/eliminar', notificacionController.eliminarNotificacion);
router.get('/notificacionesUsuario', notificacionController.obtenerNotificacionesUsuario);

module.exports = router;