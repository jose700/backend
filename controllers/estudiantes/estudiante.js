const { pool } = require('../../db/conexion');
const express = require('express');
const app = express();

// Obtener todos los estudiantes
const obtenerEstudiantes = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM estudiante');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener estudiantes:', error);
    res.status(500).send('Error interno del servidor');
  }
};

// Crear un estudiante
const crearEstudiante = async (req, res) => {
  const { idtutor, usuariotutor, nombres, apellidos, cedula, correo, edad, genero, fechanacimiento, fecharegistro, imagen, rol } = req.body;
  
  console.log(req.body); // Verificar los datos recibidos desde el frontend

  try {
    // Verificar si la cédula ya está en uso
    const cedulaExistente = await pool.query('SELECT * FROM estudiante WHERE cedula = $1', [cedula]);
    if (cedulaExistente.rows.length > 0) {
      return res.status(400).json({ error: 'La cédula ya está en uso.' });
    }

    // Verificar si el correo electrónico ya está en uso
    const correoExistente = await pool.query('SELECT * FROM estudiante WHERE correo = $1', [correo]);
    if (correoExistente.rows.length > 0) {
      return res.status(400).json({ error: 'El correo electrónico ya está en uso.' });
    }

    // Insertar el estudiante si las validaciones pasan
    const insercion = await pool.query(
      'INSERT INTO estudiante(idtutor, usuariotutor, nombres, apellidos, cedula, correo, edad, genero, fechanacimiento, fecharegistro, imagen, rol) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
      [idtutor, usuariotutor, nombres, apellidos, cedula, correo, edad, genero, fechanacimiento, fecharegistro, imagen, rol]
    );

    res.json({
      message: 'Estudiante creado exitosamente.',
      estudiante: { idtutor, usuariotutor, nombres, apellidos, cedula, correo, edad, genero, fechanacimiento, fecharegistro, imagen, rol }
    });
  } catch (error) {
    console.error("Error al insertar estudiante:", error);
    res.status(500).json({ error: 'Hubo un error al procesar la solicitud.' });
  }
};

// Obtener estudiantes por tutor
const obtenerEstudiantesPorTutor = async (req, res) => {
  const tutorUsuario = req.params.usuarioTutor;

  try {
    const result = await pool.query('SELECT * FROM estudiante WHERE usuarioTutor = $1', [tutorUsuario]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener estudiantes del tutor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener todos los estudiantes de todos los tutores
const obtenerTodosLosEstudiantesTutores = async (req, res) => {
  try {
    const result = await pool.query('SELECT t.idTutor, t.nombres AS tutorNombres, t.apellidos AS tutorApellidos, e.* FROM tutor t LEFT JOIN estudiante e ON t.idTutor = e.idTutor');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener todos los estudiantes de todos los tutores:', error);
    res.status(500).send('Error interno del servidor');
  }
};

// Obtener estudiante por cédula
const getEstudianteCedula = async (req, res) => {
  const cedula = req.params.cedula;

  try {
    const response = await pool.query('SELECT idestudiante, nombres, apellidos, cedula, edad, correo, fechanacimiento, imagen, genero FROM estudiante WHERE cedula = $1', [cedula]);
    res.status(200).json(response.rows);
  } catch (error) {
    console.error('Error al obtener estudiante por cédula:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar estudiante
const eliminarEstudiante = async (req, res) => {
  const idEstudiante = req.params.idEstudiante;

  try {
    await pool.query('DELETE FROM estudiante WHERE idEstudiante = $1', [idEstudiante]);
    res.json({
      message: 'Estudiante eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar estudiante:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar estudiante
const actualizarEstudiante = async (req, res) => {
  const idEstudiante = req.params.idEstudiante;
  const { nombres, apellidos, cedula, correo, edad, genero, fechanacimiento, fecharegistro, imagen } = req.body;

  try {
    await pool.query(
      'UPDATE estudiante SET nombres = $1, apellidos = $2, cedula = $3, correo = $4, edad = $5, genero = $6, fechanacimiento = $7, fecharegistro = $8, imagen = $9 WHERE idestudiante = $10',
      [nombres, apellidos, cedula, correo, edad, genero, fechanacimiento, fecharegistro, imagen, idEstudiante]
    );

    res.json({
      message: 'Estudiante actualizado correctamente',
      estudiante: { idEstudiante, nombres, apellidos, cedula, correo, edad, genero, fechanacimiento, fecharegistro, imagen }
    });
  } catch (error) {
    console.error('Error al actualizar estudiante:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  crearEstudiante,
  getEstudianteCedula,
  eliminarEstudiante,
  actualizarEstudiante,
  obtenerEstudiantes,
  obtenerEstudiantesPorTutor,
  obtenerTodosLosEstudiantesTutores,
};
