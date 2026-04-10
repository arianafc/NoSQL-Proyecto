const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');


router.post('/', upload.array('evidencias', 5), reporteController.crearReporte);
