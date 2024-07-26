const {Router} = require('express')
const {getTratamientos,obtenerTratamientosPorTutor,getTratamientoEstudiante,crearTratamientos,
eliminarTratamiento,actualizarTratamiento
} = require('../../../controllers/seguimientos-medicos/tratamientos-medicos/consulta')

const router = Router()


router.get('/tratamientos',getTratamientos);
router.get('/tratamientos/tutor/:usuarioTutor',obtenerTratamientosPorTutor);
router.get('/tratamientos/:nombres',getTratamientoEstudiante);
router.post('/tratamientos',crearTratamientos);
router.delete('/tratamientos/:idtratamiento',eliminarTratamiento);
router.put('/tratamientos/:idtratamiento',actualizarTratamiento)


module.exports = router;

