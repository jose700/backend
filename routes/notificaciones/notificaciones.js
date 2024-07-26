const { Router } = require('express');
const { crearNotificacion, mostrarNotificacionesPorRepresentante, enviarNotificacionATodosLosRepresentantes,actualizarNotificacion,
    eliminarNotificacion,
    mostrarNotificacionesPorTutor,actualizarNotificacionLeida } = require('../../controllers/notificaciones/notificaciones');

const router = Router();

// Rutas para obtener notificaciones
router.get('/notificaciones/tutor/:usuarioTutor', mostrarNotificacionesPorTutor);
router.get('/notificaciones/representante/:usuarioRepresentante', mostrarNotificacionesPorRepresentante);
// Ruta para eliminar una notificación específica
router.delete('/notificaciones/:idnotificacion', eliminarNotificacion);

//ruta para crear notificación
router.post('/notificaciones', crearNotificacion);
router.post('/notificaciones/tutor/:usuarioTutor', enviarNotificacionATodosLosRepresentantes);

//ruta para actualizar notificación
router.put('/notificaciones/:idnotificacion', actualizarNotificacion);


router.put('/notificaciones/representante/:usuarioRepresentante/:idnotificacion', actualizarNotificacionLeida);
    


module.exports = router;
