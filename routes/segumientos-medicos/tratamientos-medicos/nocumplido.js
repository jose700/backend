const { Router } = require('express');
const {
    getNoCumplidos,
    getNoCumplidosPorTutor,
    crearNoCumplidos,
    eliminarNoCumplido,
    actualizarNoCumplido
} = require('../../../controllers/seguimientos-medicos/tratamientos-medicos/nocumplido');

const router = Router();

router.get('/nocumplidos', getNoCumplidos);
router.get('/nocumplidos/tutor/:usuarioTutor', getNoCumplidosPorTutor);
router.post('/nocumplidos', crearNoCumplidos);
router.delete('/nocumplidos/:idnocumplido', eliminarNoCumplido);
router.put('/nocumplidos/:idnocumplido',actualizarNoCumplido);

module.exports = router;
