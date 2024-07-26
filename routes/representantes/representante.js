const { Router } = require('express');
const { getRepresentantes, getRepresentanteCedula, obtenerRepresentantesPorTutor,getEstudiantePorUsuarioRepresentante, crearRepresentantes, eliminarRepresentante, actualizarRepresentante, crearNotificacion, mostrarNotificacionesPorRepresentante, enviarNotificacionATodosLosRepresentantes,actualizarNotificacion,
    eliminarNotificacion,
    mostrarNotificacionesPorTutor } = require('../../controllers/representantes/representante');
const { loginRepresentante, obtenerIdRepresentante } = require('../../controllers/representantes/login_representante');
const router = Router();

// Rutas para obtener representantes
router.get('/representantes', getRepresentantes);  // Obtener todos los representantes
router.get('/representantes/:cedula', getRepresentanteCedula);  // Obtener representante por cédula
router.get('/representantes/tutor/:usuarioTutor', obtenerRepresentantesPorTutor);  // Obtener representantes por tutor
router.get('/representante/estudiante/:usuarioRepresentante', getEstudiantePorUsuarioRepresentante);
// Rutas para CRUD de representantes
router.post('/representantes', crearRepresentantes);  // Crear un nuevo representante
router.delete('/representantes/:idrepresentante', eliminarRepresentante);  // Eliminar representante por ID
router.put('/representantes/:idrepresentante', actualizarRepresentante);  // Actualizar representante por ID
// Ruta para login de representante
router.post('/loginrepresentante', loginRepresentante); // Iniciar sesión para representante
router.get('/idrepresentante',  obtenerIdRepresentante);


module.exports = router;
