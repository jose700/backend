const {Router} = require('express')
const {getHistorialesAcademicos,filtroHistorial} = require('../../controllers/historial-academico/academico')
const router = Router()



router.get('/academicos',getHistorialesAcademicos);
router.get('/academicos/:cedula',filtroHistorial);



module.exports = router;