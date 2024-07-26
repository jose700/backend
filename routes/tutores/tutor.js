const { Router } = require('express');
const { getTutor, crearTutor, obtenerPerfilTutor, actualizarPerfilTutor,obtenerDatosTutorLogueado } = require('../../controllers/tutores/register/tutor');
const { crearLogin,obtenerIdTutor  } = require('../../controllers/tutores/login/tutor');
const authenticateToken = require('../../middleware/authenticateToken');
const router = Router();

router.get('/tutores', getTutor);
router.post('/tutores', crearTutor);
router.post('/logintutor', crearLogin);
router.get('/obtener-id', authenticateToken, obtenerIdTutor);
router.get('/tutor/:idtutor/perfil', obtenerPerfilTutor);
// Nueva ruta para obtener datos del tutor logueado
router.get('/tutor/logueado', authenticateToken, obtenerDatosTutorLogueado);

router.put('/tutor/logueado/:idtutor', actualizarPerfilTutor);

module.exports = router;
 