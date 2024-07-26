const {Router} = require('express')
const {getHistorialesMedicos,filtraHistorial} = require('../../controllers/historial-medico/medico')
const router = Router()


router.get('/medicos',getHistorialesMedicos);
router.get('/medicos/:cedula',filtraHistorial);



module.exports = router;