const {Router} = require('express')
const {getAprobadas,
    getAprobadasPorTutor,
getAprobadaMateria,
crearAprobadas,
eliminarAprobada,
actualizarAprobada,
} = require('../../../controllers/seguimientos-academicos/asignaturas/aprobada')

const router = Router()





router.get('/aprobadas',getAprobadas);
router.get('/aprobadas/:nombre',getAprobadaMateria);
router.get('/aprobadas/tutor/:usuariotutor',getAprobadasPorTutor)
router.post('/aprobadas',crearAprobadas);
router.delete('/aprobadas/:idaprobada',eliminarAprobada);
router.put('/aprobadas/:idaprobada', actualizarAprobada);


module.exports = router;