const { pool } = require('../../db/conexion');
const express = require('express');
const app = express();



const obtenerQuizzesPorTutor = async (req, res) => {
  const { idtutor } = req.params; // Obtener el parámetro `idtutor` de los parámetros de ruta

  try {
    let query = `
      SELECT 
        q.idpreguntas AS idpreguntas,
        q.idmateria,
        q.tipo AS tipo,
        q.categoria AS categoria,
        q.dificultad AS dificultad,
        q.pregunta AS pregunta,
        q.respuesta_correcta AS respuesta_correcta,
        q.respuestas_incorrectas AS respuestas_incorrectas,
        re.respuesta_seleccionada AS respuesta_seleccionada,
        re.estado_test AS estado_test,
        re.tiempo_tardado AS tiempo_tardado,
        q.limite_tiempo AS limite_tiempo,
        m.nombre_materia,
        t.nombres AS nombres_tutor,
        t.apellidos AS apellidos_tutor,
        t.idtutor AS idtutor,
        e.nombres AS nombres_estudiante,
        e.apellidos AS apellidos_estudiante,
        e.cedula AS cedula_estudiante,
        e.correo AS correo_estudiante,
        e.imagen AS imagen_estudiante
      FROM preguntas q
      INNER JOIN inscripcion_materia im ON q.idmateria = im.idmateria
      INNER JOIN estudiante e ON im.idestudiante = e.idestudiante
      INNER JOIN materia m ON q.idmateria = m.idmateria
      INNER JOIN tutor t ON q.idtutor = t.idtutor
      LEFT JOIN respuestas_estudiantes re ON q.idpreguntas = re.idpreguntas AND e.cedula = re.cedula_estudiante
      WHERE q.idtutor = $1`;

    const values = [idtutor];

    const response = await pool.query(query, values);

    if (response.rowCount === 0) {
      return res.status(404).json({ message: 'No se encontraron quizzes para el tutor con el ID proporcionado' });
    }

    res.status(200).json(response.rows);
  } catch (error) {
    console.error('Error al obtener los quizzes por tutor:', error);
    res.status(500).json({ error: 'Error al obtener los quizzes por tutor' });
  }
};

const obtenerQuizzesPorCedulaEstudiante = async (req, res) => {
  const { cedula_estudiante } = req.params; // Obtener el parámetro `cedula_estudiante` de los parámetros de ruta
  const { nombre_materia } = req.query; // Obtener el parámetro `nombre_materia` de los parámetros de consulta

  if (!cedula_estudiante) {
    return res.status(400).json({ error: 'El parámetro cedula_estudiante es requerido' });
  }

  try {
    let query = `
      SELECT 
        q.idpreguntas AS idpreguntas,
        q.idmateria,
        q.tipo AS tipo,
        q.categoria AS categoria,
        q.dificultad AS dificultad,
        q.pregunta AS pregunta,
        q.respuesta_correcta AS respuesta_correcta,
        q.respuestas_incorrectas AS respuestas_incorrectas,
        re.respuesta_seleccionada AS respuesta_seleccionada,
        re.estado_test AS estado_test,
        re.tiempo_tardado AS tiempo_tardado,
        q.limite_tiempo AS limite_tiempo,
        m.nombre_materia,
        t.nombres AS nombres_tutor,
        t.apellidos AS apellidos_tutor,
        t.idtutor AS idtutor,
        e.nombres AS nombres_estudiante,
        e.apellidos AS apellidos_estudiante,
        e.cedula AS cedula_estudiante,
        e.correo AS correo_estudiante,
        e.imagen AS imagen_estudiante
      FROM preguntas q
      INNER JOIN inscripcion_materia im ON q.idmateria = im.idmateria
      INNER JOIN estudiante e ON im.idestudiante = e.idestudiante
      INNER JOIN materia m ON q.idmateria = m.idmateria
      INNER JOIN tutor t ON q.idtutor = t.idtutor
      LEFT JOIN respuestas_estudiantes re ON q.idpreguntas = re.idpreguntas AND e.cedula = re.cedula_estudiante
      WHERE e.cedula = $1`;

    const values = [cedula_estudiante];

    if (nombre_materia) {
      query += ` AND m.nombre_materia = $2`;
      values.push(nombre_materia);
    }

    const response = await pool.query(query, values);

    if (response.rowCount === 0) {
      return res.status(404).json({ message: 'No se encontraron quizzes para el estudiante con la cédula proporcionada' });
    }

    res.status(200).json(response.rows);
  } catch (error) {
    console.error('Error al obtener los quizzes por cédula de estudiante:', error);
    res.status(500).json({ error: 'Error al obtener los quizzes por cédula de estudiante' });
  }
};

const crearQuiz = async (req, res) => {
  const {
    idtutor,
    idmateria,
    categoria,
    tipo,
    dificultad,
    pregunta,
    respuesta_correcta,
    respuestas_incorrectas,
    respuesta_seleccionada,
    estado_test,
    limite_tiempo,
  } = req.body;

  console.log('Datos recibidos para crear el quiz:');
  console.log('idtutor:', idtutor);
  console.log('idmateria:', idmateria);
  console.log('categoria:', categoria);
  console.log('tipo:', tipo);
  console.log('dificultad:', dificultad);
  console.log('pregunta:', pregunta);
  console.log('respuesta_correcta:', respuesta_correcta);
  console.log('respuestas_incorrectas:', respuestas_incorrectas);
  console.log('estado_test:', estado_test);
  console.log('limite_tiempo:', limite_tiempo);

  try {
    const query = `
      INSERT INTO preguntas (
        idtutor,
        idmateria,
        categoria,
        tipo,
        dificultad,
        pregunta,
        respuesta_correcta,
        respuestas_incorrectas,
        respuesta_seleccionada,
        estado_test,
        limite_tiempo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `;

    const values = [
      idtutor,
      idmateria,
      categoria,
      tipo,
      dificultad,
      pregunta,
      respuesta_correcta,
      respuestas_incorrectas,
      respuesta_seleccionada,
      estado_test,
      limite_tiempo,
    ];

    await pool.query(query, values);
    console.log('Quiz creado exitosamente');
    res.status(201).json({ message: 'Quiz creado exitosamente' });
  } catch (error) {
    console.error('Error al crear el quiz', error);
    res.status(500).json({ error: 'Error al crear el quiz' });
  }
};

const actualizarQuizEstudiante = async (req, res) => {
  const { cedula_estudiante } = req.params;
  const respuestasList = req.body; // Debería ser un array de respuestas

  try {
    // Iterar sobre cada respuesta para insertar o actualizar en la base de datos
    for (const respuesta of respuestasList) {
      const {
        idpreguntas,
        
        respuesta_seleccionada,
        tiempo_tardado,
        estado_test,
      } = respuesta;

      // Ejecutar la consulta para actualizar o insertar la respuesta del estudiante
      const query = `
        INSERT INTO respuestas_estudiantes (idpreguntas, cedula_estudiante, respuesta_seleccionada, tiempo_tardado, estado_test)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (idpreguntas, cedula_estudiante)
        DO UPDATE SET respuesta_seleccionada = EXCLUDED.respuesta_seleccionada,
                      tiempo_tardado = EXCLUDED.tiempo_tardado,
                      estado_test = EXCLUDED.estado_test
      `;
      const values = [
        idpreguntas,
        cedula_estudiante,
        respuesta_seleccionada,
        tiempo_tardado,
        estado_test,
      ];

      await pool.query(query, values);
    }

    res.status(200).json({ message: 'Quiz actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar el quiz del estudiante:', error);
    res.status(500).json({ error: 'Error al actualizar el quiz del estudiante' });
  }
};




const eliminarRespuestasPorTutor = async (req, res) => {
  const idpreguntas = parseInt(req.params.idpreguntas, 10);
  const cedulaEstudiante = req.query.cedula_estudiante;

  if (isNaN(idpreguntas)) {
    return res.status(400).json({ error: 'ID de preguntas inválido' });
  }

  if (!cedulaEstudiante) {
    return res.status(400).json({ error: 'Cédula de estudiante es requerida' });
  }

  try {
    // Iniciar una transacción
    await pool.query('BEGIN');

    // Eliminar las respuestas relacionadas con la pregunta
    await pool.query('DELETE FROM respuestas_estudiantes WHERE idpreguntas = $1 AND cedula_estudiante = $2', [idpreguntas, cedulaEstudiante]);

    // Eliminar la pregunta principal
    const { rowCount } = await pool.query('DELETE FROM preguntas WHERE idpreguntas = $1', [idpreguntas]);

    // Confirmar la transacción
    await pool.query('COMMIT');

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Pregunta no encontrada' });
    }

    res.json({
      message: 'Pregunta y respuestas eliminadas correctamente'
    });
  } catch (error) {
    // Revertir la transacción en caso de error
    await pool.query('ROLLBACK');

    console.error('Error al eliminar las preguntas y respuestas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


  const actualizarQuiz = async (req, res) => {
    const { idpreguntas } = req.params; // ID del quiz a actualizar
    const {
      idmateria,
      idtutor,
      tipo,
      categoria,
      dificultad,
      pregunta,
      respuesta_correcta,
      respuestas_incorrectas,
      respuesta_seleccionada,
      estado_test,
      limite_tiempo,
      calificacion
    } = req.body;
  
    try {
      const query = `
        UPDATE preguntas
        SET idmateria = $1,
            idtutor = $2,
            categoria = $3,
            tipo = $4,
            dificultad = $5,
            pregunta = $6,
            respuesta_correcta = $7,
            respuestas_incorrectas = $8,
            respuesta_seleccionada = $9,
            estado_test = $10,
            limite_tiempo = $11,
            calificacion = $12
        WHERE idpreguntas = $13
      `;
  
      const values = [
        idmateria,
        idtutor,
        categoria,
        tipo,
        dificultad,
        pregunta,
        respuesta_correcta,
        respuestas_incorrectas,
        respuesta_seleccionada,
        estado_test,
        limite_tiempo,
        calificacion,
        idpreguntas
      ];
  
      await pool.query(query, values);
      res.status(200).json({ message: 'Quiz actualizado correctamente' });
    } catch (error) {
      console.error('Error al actualizar el quiz:', error);
      res.status(500).json({ error: 'Error al actualizar el quiz' });
    }
  };
  

  const eliminarQuiz = async (req, res) => {
    const { idpreguntas } = req.params; // ID del quiz a eliminar
  
    try {
      const eliminacion = await pool.query('DELETE FROM preguntas WHERE idpreguntas = $1 RETURNING *', [idpreguntas]);
  
      if (eliminacion.rows.length === 0) {
        return res.status(404).json({ error: 'Quiz no encontrado' });
      }
  
      res.json({
        message: 'Quiz eliminado correctamente',
        quiz: eliminacion.rows[0]
      });
    } catch (error) {
      console.error('Error al eliminar el quiz:', error);
      res.status(500).json({ error: 'Error al eliminar el quiz' });
    }
  };
        


  module.exports = {
    obtenerQuizzesPorTutor,
    obtenerQuizzesPorCedulaEstudiante,
    crearQuiz,
    actualizarQuiz,
    actualizarQuizEstudiante,
    eliminarQuiz,
    eliminarRespuestasPorTutor
  };