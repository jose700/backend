const { Router } = require('express');


const {
    getInscripciones,
    getInscripcionesPorTutor,
    getMateriasPorEstudiante,
    inscribirEstudiante,
    eliminarInscripcionEstudiante,
    actualizarEstadoInscripcion
} = require('../../../controllers/seguimientos-academicos/asignaturas/inscripcion');

const router = Router();

router.get('/inscripciones', getInscripciones);
router.get('/inscripciones/tutor/:usuariotutor',getInscripcionesPorTutor);
router.get('/inscripciones/estudiante/:cedula',getMateriasPorEstudiante); // Corregido aquí
router.post('/inscripciones',inscribirEstudiante);
router.delete('/inscripciones/:idinscripcion', eliminarInscripcionEstudiante);
router.put('/inscripciones/:idinscripcion', actualizarEstadoInscripcion);

module.exports = router;
