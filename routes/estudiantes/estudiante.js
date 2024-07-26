const {Router} = require('express');
const { checkRole } = require('../../middleware/authenticateToken');

const {crearEstudiante, getEstudianteCedula,
    eliminarEstudiante,
actualizarEstudiante, 

obtenerEstudiantes,
obtenerEstudiantesPorTutor,
obtenerTodosLosEstudiantesTutores
} = require('../../controllers/estudiantes/estudiante');

const { loginEstudiante,obtenerIdEstudiante  } = require('../../controllers/estudiantes/loginEstudiante');

const router = Router();

router.get('/estudiantes/:cedula', getEstudianteCedula);
router.post('/loginEstudiante', loginEstudiante);
router.get('/obtener-id', obtenerIdEstudiante);
router.post('/estudiantes', crearEstudiante);
router.delete('/estudiantes/:idEstudiante',eliminarEstudiante);
router.put('/estudiantes/:idEstudiante', actualizarEstudiante);
router.get('/estudiantes', obtenerEstudiantes);
router.get('/estudiantes/tutor/:usuarioTutor' ,obtenerEstudiantesPorTutor);
router.get('/estudiantes-tutores', obtenerTodosLosEstudiantesTutores);


module.exports = router;
