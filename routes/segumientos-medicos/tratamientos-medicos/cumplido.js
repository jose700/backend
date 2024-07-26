const {Router} = require('express')
const {getCumplidos,getCumplidosCedula,getCumplidosPorTutor,crearCumplidos,
eliminarCumplido,actualizarCumplido
} = require('../../../controllers/seguimientos-medicos/tratamientos-medicos/cumplido')

const router = Router()



router.get('/cumplidos', getCumplidos);
router.get('/cumplidos/tutor/:usuarioTutor', getCumplidosPorTutor);
router.get('/cumplidos/:cedula', getCumplidosCedula);
router.post('/cumplidos',crearCumplidos);
router.delete('/cumplidos/:idcumplido',eliminarCumplido);
router.put('/cumplidos/:idcumplido', actualizarCumplido);

module.exports = router;

