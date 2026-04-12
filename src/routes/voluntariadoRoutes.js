const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/voluntariadoController');

// Agrega aquí tu middleware de verificación de admin, igual que en tus otras rutas
// Ejemplo: const { verificarAdmin } = require('../middlewares/auth');

router.get('/',         /* verificarAdmin, */ ctrl.renderVoluntariados);
router.post('/',        /* verificarAdmin, */ ctrl.crearVoluntariado);
router.put('/:id',      /* verificarAdmin, */ ctrl.editarVoluntariado);
router.patch('/:id/estado', /* verificarAdmin, */ ctrl.cambiarEstado);

module.exports = router;