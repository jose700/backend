const {Router} = require('express')
const {getReprobadas,
    getReprobadaMateria,
    getReprobadasPorTutor,
    crearReprobadas,
    eliminarReprobada,
    actualizarReprobada
} = require('../../../controllers/seguimientos-academicos/asignaturas/reprobada');


const router = Router()





router.get('/reprobadas', getReprobadas);
router.get('/reprobadas/:nombre',  getReprobadaMateria);
router.post('/reprobadas', crearReprobadas);
router.delete('/reprobadas/:idreprobada',eliminarReprobada);

router.get('/reprobadas/tutor/:usuariotutor', getReprobadasPorTutor)

router.put('/reprobadas/:idaprobada', actualizarReprobada);



module.exports = router;