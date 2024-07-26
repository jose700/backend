const {Router} = require('express')
const {getAsignaturas,
    getAsignaturasPorTutor,
    getMateriasPorEstudiante,
getAsignaturaCedula,
crearAsignatura,
eliminarAsignatura,
actualizarAsignatura
} = require('../../../controllers/seguimientos-academicos/asignaturas/asignatura')

const router = Router()





router.get('/materias',getAsignaturas);
router.get('/materias/tutor/:usuariotutor', getAsignaturasPorTutor)
router.get('/materias/estudiante/:idestudiante', getMateriasPorEstudiante);
router.get('/materias/:cedula',getAsignaturaCedula);
router.post('/materias',crearAsignatura);
router.delete('/materias/:idmateria',eliminarAsignatura);
router.put('/materias/:idmateria',actualizarAsignatura);



module.exports = router;