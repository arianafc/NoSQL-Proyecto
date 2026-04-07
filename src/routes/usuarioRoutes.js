const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

//REGISTRO DE USUARIO

router.post('/registro', usuarioController.registrarUsuario);
router.post('/login', usuarioController.loginUsuario);
router.put('/voluntario', usuarioController.serVoluntario);

module.exports = router;