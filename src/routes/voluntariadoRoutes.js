const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/voluntariadoController');

// Admin — renderiza la vista EJS del admin
router.get('/',                 ctrl.renderVoluntariados);
router.post('/',                ctrl.crearVoluntariado);
router.put('/:id',              ctrl.editarVoluntariado);
router.patch('/:id/estado',     ctrl.cambiarEstado);

// Usuario — renderiza la vista EJS del usuario
router.get('/usuario',          ctrl.renderVoluntariadosUsuario);

// API pública — devuelve JSON (para el fetch del EJS de usuario)
router.get('/activos',          ctrl.getVoluntariadosActivos);

router.post('/:id/inscribir',       ctrl.inscribirseVoluntariado);
router.get('/mis/:userId',          ctrl.getMisVoluntariados);
router.post('/:id/desinscribir', ctrl.desinscribirseVoluntariado);
router.get('/:id/inscritos', ctrl.getInscritosVoluntariado);

module.exports = router;