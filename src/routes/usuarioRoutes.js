const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

//REGISTRO DE USUARIO

router.post('/registro', usuarioController.registrarUsuario);
router.post('/login', usuarioController.loginUsuario);
router.put('/voluntario', usuarioController.serVoluntario);
router.put('/perfil/', usuarioController.actualizarPerfil);

//OBTENER Y EDITAR USUARIOS DESDE ADMIN

router.get('/', usuarioController.getUsuarios);
router.put('/rol/:id', usuarioController.updateRol);
router.put('/estado/:id', usuarioController.updateEstado);


//RECUPERAR ACCESO
router.post('/recuperarContrasenna', usuarioController.validarCorreoRecuperacion);
router.post('/actualizarPassword', usuarioController.actualizarPassword);


module.exports = router;