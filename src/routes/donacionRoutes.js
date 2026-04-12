const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/donacionController');

router.get('/',                 ctrl.getDonaciones);
router.post('/',                ctrl.crearDonacion);
router.get('/resumen',          ctrl.getResumen);
router.get('/por-periodo',      ctrl.getPorPeriodo);
router.patch('/:id/estado',     ctrl.cambiarEstado);
router.get('/mis/:userId',      ctrl.getMisDonaciones);
router.post('/usuario',         ctrl.crearDonacionUsuario);

module.exports = router;