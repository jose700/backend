const express = require('express');
const router = express.Router();

const  {uploadToFirebase}  = require('../../middleware/multer');


const {
  obtenerTareasEstudiantes,
  obtenerTareasSubidasEstudiantes,
  obtenerTareasEstudiantesPorTutor,
  obtenerTareasEstudiantePorCedulaYMateria,
  crearTareaEstudiante,
  actualizarProgresoEstudiante,
  eliminarProgresoEstudiante,
  actualizarProgresoEstudianteTareaCumplida,
  actualizarTareaPorTutor,

  eliminarTareaSubidaEstudiante // Importamos el nuevo método
} = require('../../controllers/progreso-estudiante/tareas');





//obtener todas las tareas subidas
router.get('/tareas_estudiantes_subidas', obtenerTareasSubidasEstudiantes);

// Endpoint para obtener todas las tareas de estudiantes
router.get('/tareas_estudiantes', obtenerTareasEstudiantes);

// Endpoint para obtener las tareas de estudiantes por tutor
router.get('/tareas_estudiantes/tutor/:usuariotutor', obtenerTareasEstudiantesPorTutor);

// Endpoint para obtener las tareas de un estudiante por cédula y materia

router.get('/estudiantes/tareas/:cedula/:idMateria', obtenerTareasEstudiantePorCedulaYMateria);

// Endpoint para crear una tarea de estudiante, incluyendo carga de archivo
router.post('/tareas_estudiante',  crearTareaEstudiante);

// Endpoint para actualizar el progreso de un estudiante en una tarea específica
// Se incluye la cédula y el ID de la tarea en la ruta
//router.put('/estudiante/:cedula/tarea/:idtarea', upload.single('archivo'), actualizarProgresoEstudiante);
router.put('/estudiante/:cedula/tarea/:idtarea',  uploadToFirebase,actualizarProgresoEstudiante);


// Endpoint para eliminar el progreso de una tarea de estudiante por su ID
router.delete('/tareas_estudiantes/:idtarea', eliminarProgresoEstudiante);

//eliminar que subio el estudiante
router.delete('/tareas-subidas/:id', eliminarTareaSubidaEstudiante);

// Endpoint para actualizar la tarea cumplida de un estudiante, incluyendo carga de archivo
router.put('/estudiante/tareas/:idtarea',  actualizarProgresoEstudianteTareaCumplida);

// Endpoint para actualizar la tarea por tutor (solo idmateria, titulo e informacion_tarea)
router.put('/tareas/:idtarea', actualizarTareaPorTutor);

module.exports = router;
