const express = require('express');
const router = express.Router();
const {
  obtenerQuizzesPorTutor,
  obtenerQuizzesPorCedulaEstudiante,
  crearQuiz,
  actualizarQuiz,
  actualizarQuizEstudiante,
  eliminarQuiz,
  eliminarRespuestasPorTutor
} = require('../../controllers/progreso-estudiante/quizz');


// Ruta para obtener todos los quizzes de un tutor
router.get('/tutor/:idtutor', obtenerQuizzesPorTutor);

// Ruta para obtener quizzes por número de cédula del estudiante
router.get('/estudiante/:cedula_estudiante',  obtenerQuizzesPorCedulaEstudiante);

// Ruta para crear un nuevo quiz asociado a un tutor (idtutor)
router.post('/crearQuizz',crearQuiz);

  // Ruta para actualizar un quiz por el número de cédula del estudiante
router.put('/actualizarQuizEstudiante/:cedula_estudiante', actualizarQuizEstudiante);  
// Ruta para actualizar un quiz por su ID
router.put('/:idpreguntas', actualizarQuiz);      
 
// Ruta para eliminar un quiz por su ID
router.delete('/:idpreguntas', eliminarQuiz); 

// Ruta para eliminar respuestas de un estudiante por parte de un tutor

router.delete('/preguntas_estudiantes/:idpreguntas', eliminarRespuestasPorTutor);



module.exports = router;
