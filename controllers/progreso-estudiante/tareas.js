const { pool } = require('../../db/conexion');
const { Storage } = require('@google-cloud/storage');
const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const { GOOGLE_PROJECT_ID, GOOGLE_APPLICATION_CREDENTIALS_PATH,GOOGLE_BUCKET_NAME } = require('../../db/conexion');
require('dotenv').config(); // Carga las variables de entorno desde el archivo .env





// Configura el cliente de Google Cloud Storage
const storage = new Storage({
  projectId: GOOGLE_PROJECT_ID, // Reemplaza con tu project ID de Firebase
  keyFilename: path.join(__dirname,'../', GOOGLE_APPLICATION_CREDENTIALS_PATH) // Ruta al archivo de clave JSON descargado
});
const bucket = storage.bucket(GOOGLE_BUCKET_NAME);
 // Reemplaza con el nombre de tu bucket


const obtenerTareasEstudiantes = async (req, res) => {
  const { idmateria } = req.query;  // Obtener el parámetro de consulta `idmateria`

  try {
    let query = `
    
      SELECT 
        te.idtarea,
        te.idmateria,
        te.usuariotutor,
        te.fecha_creo_tarea,
        te.informacion_tarea,
        te.calificacion,
        te.comentarios,
        te.categoria_mejora,
        te.titulo_tarea,
        te.archivo_nombre,
        te.archivo_mimetype, 
        e.nombres AS nombres,
        e.apellidos AS apellidos,
        e.cedula AS cedula,
        e.correo AS correo,
        e.imagen AS imagen,
        m.nombre_materia
      FROM tareas_estudiante te
      INNER JOIN inscripcion_materia im ON te.idmateria = im.idmateria
      INNER JOIN estudiante e ON im.idestudiante = e.idestudiante
      INNER JOIN materia m ON te.idmateria = m.idmateria
    `;

    const values = [];
    if (idmateria) {
      query += ` WHERE te.idmateria = $1`;
      values.push(idmateria);
    }

    const response = await pool.query(query, values);

    // Agrupar los resultados por `idmateria`
    const groupedData = response.rows.reduce((acc, row) => {
      const { idmateria, nombre_materia, ...rest } = row;
      if (!acc[idmateria]) {
        acc[idmateria] = {
          idmateria,
          nombre_materia,
          tareas: []
        };
      }
      acc[idmateria].tareas.push(rest);
      return acc;
    }, {});

    res.status(200).json(Object.values(groupedData));
  } catch (error) {
    console.error('Error al obtener las tareas de estudiantes:', error);
    res.status(500).json({ error: 'Error al obtener las tareas de estudiantes' });
  }
};

const obtenerTareasSubidasEstudiantes = async (req, res) => {
  const { idmateria } = req.query; // Obtener el parámetro de consulta `idmateria`

  try {
    let query = `
      SELECT 
        te.idtarea,
        te.usuariotutor,
        te.fecha_creo_tarea,
        te.informacion_tarea,
        te.comentarios,
        te.categoria_mejora,
        te.titulo_tarea,
        e.nombres AS nombres_estudiante,
        e.apellidos AS apellidos_estudiante,
        e.cedula AS cedula_estudiante,
        e.correo AS correo_estudiante,
        e.imagen AS imagen_estudiante,
        m.nombre_materia,
        tse.idtarea AS id_tarea_subida,
        tse.fecha_envio_tarea AS fecha_envio_tarea_estudiante,
        tse.archivo_nombre AS archivo_nombre_estudiante,
        tse.archivo_mimetype AS archivo_mimetype_estudiante,
        tse.tarea_cumplida AS tarea_cumplida_estudiante
      FROM tareas_estudiante te
      INNER JOIN inscripcion_materia im ON te.idmateria = im.idmateria
      INNER JOIN estudiante e ON im.idestudiante = e.idestudiante
      INNER JOIN materia m ON te.idmateria = m.idmateria
      LEFT JOIN tareas_subidas_estudiantes tse ON te.idtarea = tse.idtarea
                                              AND tse.cedula_estudiante = e.cedula
    `;

    const values = [];
    if (idmateria) {
      query += ` WHERE te.idmateria = $1`;
      values.push(idmateria);
    }

    const response = await pool.query(query, values);

    // Agrupar los resultados por `idmateria`
    const groupedData = response.rows.reduce((acc, row) => {
      const { idmateria, nombre_materia, ...rest } = row;
      if (!acc[idmateria]) {
        acc[idmateria] = {
          idmateria,
          nombre_materia,
          tareas: [],
        };
      }

      // Agregar datos de tareas subidas por estudiantes si están disponibles y la tarea no es nula
      if (row.id_tarea_subida !== null) {
        acc[idmateria].tareas.push({
          ...rest,
          id_tarea_subida: row.id_tarea_subida,
          cedula_estudiante: row.cedula_estudiante,
          fecha_envio_tarea_estudiante: row.fecha_envio_tarea_estudiante,
          archivo_nombre_estudiante: row.archivo_nombre_estudiante,
          archivo_mimetype_estudiante: row.archivo_mimetype_estudiante,
          tarea_cumplida_estudiante: row.tarea_cumplida_estudiante,
        });
      }

      return acc;
    }, {});

    res.status(200).json(Object.values(groupedData));
  } catch (error) {
    console.error('Error al obtener las tareas de estudiantes:', error);
    res.status(500).json({ error: 'Error al obtener las tareas de estudiantes' });
  }
};


const actualizarTareaPorTutor = async (req, res) => {
  const idtarea = req.params.idtarea;
  const {
    calificacion,
    cedula_estudiante
  } = req.body;

  try {
    console.log('Datos recibidos para actualizar tarea:');
    console.log('idtarea:', idtarea);
    console.log('calificacion:', calificacion);
    console.log('cedula_estudiante:', cedula_estudiante);

    // Verificar si existe una entrada en tareas_subidas_estudiantes para la tarea y el estudiante
    const existeSubida = await pool.query(
      `SELECT * FROM tareas_subidas_estudiantes 
      WHERE idtarea = $1 AND cedula_estudiante = $2`,
      [idtarea, cedula_estudiante]
    );

    if (existeSubida.rows.length === 0) {
      return res.status(404).json({ error: 'No existe una tarea subida para actualizar' });
    }

    // Actualizar la tarea en tareas_subidas_estudiantes
    const actualizacion = await pool.query(
      `UPDATE tareas_subidas_estudiantes
      SET calificacion = $1
      WHERE idtarea = $2
        AND cedula_estudiante = $3
      RETURNING *`,
      [calificacion, idtarea, cedula_estudiante]
    );

    if (actualizacion.rows.length === 0) {
      return res.status(404).json({ error: 'No existe una tarea para actualizar' });
    }

    console.log('Tarea actualizada correctamente:');
    console.log('Tarea actualizada:', actualizacion.rows[0]);
    res.json(actualizacion.rows[0]);

  } catch (error) {
    console.error('Error al actualizar tarea por tutor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const obtenerTareasEstudiantesPorTutor = async (req, res) => {
  const { usuariotutor } = req.params;

  try {
    let query = `
      SELECT 
        e.usuariotutor,
        te.idtarea,
        te.idmateria,
        te.fecha_creo_tarea,
        te.informacion_tarea,
        te.titulo_tarea,
        te.comentarios,
        te.categoria_mejora,
        te.archivo_nombre,
        te.archivo_mimetype,
        e.nombres AS nombres_estudiante,
        e.apellidos AS apellidos_estudiante,
        e.cedula AS cedula_estudiante,
        e.correo AS correo_estudiante,
        e.imagen AS imagen_estudiante,
        m.nombre_materia,
        tse.calificacion AS calificacion,
        tse.id AS id,
        tse.fecha_envio_tarea AS fecha_envio_tarea_subida,
        tse.archivo_nombre AS archivo_nombre_subida,
        tse.archivo_mimetype AS archivo_mimetype_subida,
        tse.tarea_cumplida AS tarea_cumplida_subida
      FROM tareas_estudiante te
      INNER JOIN inscripcion_materia im ON te.idmateria = im.idmateria
      INNER JOIN estudiante e ON im.idestudiante = e.idestudiante
      INNER JOIN materia m ON te.idmateria = m.idmateria
      LEFT JOIN tareas_subidas_estudiantes tse ON te.idtarea = tse.idtarea
                                              AND e.cedula = tse.cedula_estudiante
      WHERE te.usuariotutor = $1`;

    const values = [usuariotutor];
    const response = await pool.query(query, values);

    const tasksByTutor = response.rows.reduce((acc, row) => {
      const { usuariotutor, nombres_estudiante, apellidos_estudiante, cedula_estudiante, correo_estudiante, imagen_estudiante } = row;
      if (!acc[usuariotutor]) {
        acc[usuariotutor] = {
          usuariotutor,
          tareas: []
        };
      }

      // Construir la URL pública para visualizar el archivo
      const archivoUrl = row.archivo_nombre_subida
        ? `https://storage.googleapis.com/${process.env.GOOGLE_BUCKET_NAME}/${row.archivo_nombre_subida}`
        : null;

      acc[usuariotutor].tareas.push({
        idtarea: row.idtarea,
        idmateria: row.idmateria,
        fecha_creo_tarea: row.fecha_creo_tarea,
        titulo_tarea: row.titulo_tarea,
        informacion_tarea: row.informacion_tarea,
        comentarios: row.comentarios,
        categoria_mejora: row.categoria_mejora,
        archivo_nombre: row.archivo_nombre,
        archivo_mimetype: row.archivo_mimetype,
        nombres_estudiante,
        apellidos_estudiante,
        cedula_estudiante,
        correo_estudiante,
        imagen_estudiante,
        nombre_materia: row.nombre_materia,
        id: row.id,
        calificacion: row.calificacion,
        fecha_envio_tarea_subida: row.fecha_envio_tarea_subida,
        archivo_nombre_subida: row.archivo_nombre_subida,
        archivo_mimetype_subida: row.archivo_mimetype_subida,
        tarea_cumplida_subida: row.tarea_cumplida_subida,
        archivo_url: archivoUrl
      });

      return acc;
    }, {});

    const tasksArray = Object.values(tasksByTutor);
    res.status(200).json(tasksArray);
  } catch (error) {
    console.error('Error al obtener las tareas de estudiantes por tutor:', error);
    res.status(500).json({ error: 'Error al obtener las tareas de estudiantes por tutor' });
  }
};

//obtener tareas por estudiante(numero de cedula )

const obtenerTareasEstudiantePorCedulaYMateria = async (req, res) => {
  const { cedula, idMateria } = req.params; // Obtener los parámetros cedula y idMateria de los parámetros de ruta

  try {
    let query = `
      SELECT 
        e.cedula AS cedula_estudiante,
        te.idtarea,
        te.idmateria,
        te.fecha_creo_tarea,
        te.titulo_tarea,
        te.informacion_tarea,
        te.comentarios,
        te.categoria_mejora,
        te.archivo_nombre,
        te.archivo_mimetype,
        e.nombres AS nombres_estudiante,
        e.apellidos AS apellidos_estudiante,
        e.correo AS correo_estudiante,
        e.imagen AS imagen_estudiante,
        m.nombre_materia,
        tse.id AS id,
        tse.calificacion AS calificacion,
        tse.fecha_envio_tarea AS fecha_envio_tarea_subida,
        tse.archivo_nombre AS archivo_nombre_subida,
        tse.archivo_mimetype AS archivo_mimetype_subida,
        tse.tarea_cumplida AS tarea_cumplida_subida
      FROM tareas_estudiante te
      INNER JOIN inscripcion_materia im ON te.idmateria = im.idmateria
      INNER JOIN estudiante e ON im.idestudiante = e.idestudiante
      INNER JOIN materia m ON te.idmateria = m.idmateria
      LEFT JOIN tareas_subidas_estudiantes tse ON te.idtarea = tse.idtarea AND tse.cedula_estudiante = e.cedula
      WHERE e.cedula = $1
        AND te.idmateria = $2`;

    console.log('Query SQL:', query);

    const values = [cedula, parseInt(idMateria)]; // Convertir idMateria a número usando parseInt
    console.log('Valores:', values);

    const response = await pool.query(query, values);
    console.log('Respuesta de la base de datos:', response.rows);

    // Agrupar las tareas por cedula_estudiante en la respuesta JSON
    const tasksByCedula = response.rows.reduce((acc, row) => {
      const { cedula_estudiante, idtarea, nombres_estudiante, apellidos_estudiante, correo_estudiante, imagen_estudiante } = row;
      if (!acc[cedula_estudiante]) {
        acc[cedula_estudiante] = {
          cedula_estudiante,
          idtarea,
          tareas: []
        };
      }

      // Verificar si la tarea tiene información válida para agregarla
      if (idtarea) {
        acc[cedula_estudiante].tareas.push({
          idtarea,
          idmateria: row.idmateria,
          fecha_creo_tarea: row.fecha_creo_tarea,
          titulo_tarea: row.titulo_tarea,
          informacion_tarea: row.informacion_tarea,
          comentarios: row.comentarios,
          categoria_mejora: row.categoria_mejora,
          archivo_nombre: row.archivo_nombre,
          archivo_mimetype: row.archivo_mimetype,
          nombres_estudiante,
          apellidos_estudiante,
          cedula_estudiante,
          correo_estudiante,
          imagen_estudiante,
          nombre_materia: row.nombre_materia,
          id:row.id,
          calificacion: row.calificacion,
          fecha_envio_tarea_subida: row.fecha_envio_tarea_subida,
          archivo_nombre_subida: row.archivo_nombre_subida,
          archivo_mimetype_subida: row.archivo_mimetype_subida,
          tarea_cumplida_subida: row.tarea_cumplida_subida
        });
      
      }

      return acc;
    }, {});

    // Convertir el objeto de tareas por cedula_estudiante a un array de objetos
    const tasksArray = Object.values(tasksByCedula);

    res.status(200).json(tasksArray); // Devolver los resultados en el formato deseado
  } catch (error) {
    console.error('Error al obtener las tareas de estudiantes por número de cédula y materia:', error);
    res.status(500).json({ error: 'Error al obtener las tareas de estudiantes por número de cédula y materia' });
  }
};



// Crear un registro de progreso de estudiante
const crearTareaEstudiante = async (req, res) => {
  const {
    idmateria,
    usuariotutor,
    titulo_tarea,
    informacion_tarea,

  } = req.body;

  const fecha_creo_tarea = new Date(); // Obtener la fecha actual

  try {
    const query = `
      INSERT INTO tareas_estudiante (
        idmateria,
        usuariotutor,
        fecha_creo_tarea,
        titulo_tarea,
        informacion_tarea
      
      
      
      ) VALUES ($1, $2, $3, $4, $5 )
    `;
    
    const values = [
      idmateria,
      usuariotutor,
      fecha_creo_tarea,
      titulo_tarea,
      informacion_tarea,
  

    ];

    await pool.query(query, values);
    res.status(201).json({ message: 'Progreso del estudiante creado exitosamente' });
  } catch (error) {
    console.error('Error al crear el progreso del estudiante', error);
    res.status(500).json({ error: 'Error al crear el progreso del estudiante' });
  }
};

// Actualizar progreso de estudiante al cumplir tarea
const actualizarProgresoEstudianteTareaCumplida = async (req, res) => {
  const { idtarea } = req.params; // ID del progreso de estudiante
  const { tarea_cumplida } = req.body; // Indicador si la tarea se ha cumplido

  try {
    // Validar que se haya proporcionado tarea_cumplida como booleano
    if (typeof tarea_cumplida !== 'boolean') {
      return res.status(400).json({ error: 'Se requiere indicar si la tarea fue cumplida o no' });
    }

    // Actualizar el registro de progreso_estudiante
    const query = `
      UPDATE progreso_estudiante
      SET tarea_cumplida = $1,
          fecha_envio_tarea = CURRENT_TIMESTAMP -- Actualizar fecha_envio_tarea al cumplir la tarea
      WHERE idtarea = $2
      RETURNING *
    `;
    const result = await pool.query(query, [tarea_cumplida, idtarea]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Progreso de estudiante no encontrado' });
    }

    res.json({
      message: 'Progreso de estudiante actualizado correctamente',
      progreso_estudiante: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar progreso de estudiante al cumplir tarea:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};




// Eliminar progreso de estudiante
const eliminarProgresoEstudiante = async (req, res) => {
  const idtarea = req.params.idtarea;

  try {
    // Iniciar una transacción
    await pool.query('BEGIN');

    // Eliminar primero las subidas de estudiantes relacionadas
    await pool.query('DELETE FROM tareas_subidas_estudiantes WHERE idtarea = $1', [idtarea]);

    // Luego, eliminar la tarea de estudiante principal
    const eliminacion = await pool.query('DELETE FROM tareas_estudiante WHERE idtarea = $1 RETURNING *', [idtarea]);

    // Confirmar la transacción
    await pool.query('COMMIT');

    if (eliminacion.rows.length === 0) {
      return res.status(404).json({ error: 'Progreso de estudiante no encontrado' });
    }

    res.json({
      message: 'Progreso de estudiante eliminado correctamente',
      progreso_estudiante: eliminacion.rows[0]
    });
  } catch (error) {
    // Revertir la transacción en caso de error
    await pool.query('ROLLBACK');

    console.error('Error al eliminar progreso de estudiante:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const eliminarTareaSubidaEstudiante = async (req, res) => {
  const { id } = req.params; // ID de la tarea a eliminar

  try {
    // Consulta para obtener el nombre del archivo desde la base de datos
    const resultado = await pool.query('SELECT archivo_nombre FROM tareas_subidas_estudiantes WHERE id = $1', [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    const archivo = resultado.rows[0];
    const archivoNombre = archivo.archivo_nombre;

    // Verifica que el nombre del archivo en la base de datos sea correcto
    console.log('Nombre del archivo a eliminar:', archivoNombre);

    // Intenta eliminar el archivo
    const file = bucket.file(archivoNombre);

   

    await file.delete();

    console.log(`Archivo eliminado correctamente: ${archivoNombre}`);

    // Elimina el registro de la base de datos
    await pool.query('DELETE FROM tareas_subidas_estudiantes WHERE id = $1', [id]);

    res.json({
      message: 'Tarea eliminada correctamente'
    });

  } catch (error) {
    console.error('Error al eliminar la tarea:', error);
    if (error.code === 404) {
      // Archivo no encontrado
      res.status(404).json({ error: 'Archivo no encontrado en Google Cloud Storage' });
    } else {
      // Otros errores
      res.status(500).json({ error: 'Error al eliminar la tarea' });
    }
  }
};


const actualizarProgresoEstudiante = async (req, res) => {
  const { cedula, idtarea } = req.params;
  const { fecha_envio_tarea, tarea_cumplida } = req.body;
  const archivo_nombre = req.file ? req.file.originalname : null; // Nombre del archivo
  const archivo_mimetype = req.file ? req.file.mimetype : null; // Tipo MIME del archivo

  console.log('Datos recibidos en la solicitud:');
  console.log('Cédula:', cedula);
  console.log('ID Tarea:', idtarea);
  console.log('Fecha de envío de tarea:', fecha_envio_tarea);
  console.log('Nombre del archivo:', archivo_nombre);
  console.log('Tipo MIME del archivo:', archivo_mimetype);
  console.log('Tarea cumplida:', tarea_cumplida);
  console.log('Datos del archivo:', req.file);

  if (!fecha_envio_tarea || !archivo_nombre || !archivo_mimetype || tarea_cumplida === undefined) {
    return res.status(400).json({ error: 'Datos incompletos en la solicitud' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No se ha subido ningún archivo' });
  }

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      console.log('Verificando existencia del progreso del estudiante...');
      const verificacion = await client.query(
        `SELECT te.idtarea 
         FROM tareas_subidas_estudiantes te
         INNER JOIN estudiante e ON te.cedula_estudiante = e.cedula
         WHERE te.idtarea = $1 AND e.cedula = $2 AND te.tarea_cumplida = false`,
        [idtarea, cedula]
      );

      console.log('Insertando o actualizando progreso del estudiante...');
      const query = `
        INSERT INTO tareas_subidas_estudiantes (idtarea, cedula_estudiante, fecha_envio_tarea, archivo_nombre, archivo_mimetype, tarea_cumplida)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (idtarea, cedula_estudiante)
        DO UPDATE SET fecha_envio_tarea = EXCLUDED.fecha_envio_tarea,
                      archivo_nombre = EXCLUDED.archivo_nombre,
                      archivo_mimetype = EXCLUDED.archivo_mimetype,
                      tarea_cumplida = EXCLUDED.tarea_cumplida
        RETURNING *`;
      const values = [
        idtarea,
        cedula,
        fecha_envio_tarea,
        archivo_nombre,
        archivo_mimetype,
        tarea_cumplida
      ];

      const actualizacion = await client.query(query, values);

      if (actualizacion.rows.length === 0) {
        await client.query('ROLLBACK');
        console.log('No se pudo actualizar el progreso del estudiante');
        return res.status(404).json({ error: 'No se pudo actualizar el progreso del estudiante' });
      }

      await client.query('COMMIT');
      console.log('Progreso de estudiante actualizado correctamente');
      res.json({
        message: 'Progreso de estudiante actualizado correctamente',
        progreso_estudiante: actualizacion.rows[0]
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error al actualizar progreso de estudiante:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


module.exports = {
  obtenerTareasSubidasEstudiantes,
  obtenerTareasEstudiantes,
  obtenerTareasEstudiantesPorTutor,
  actualizarTareaPorTutor,
  obtenerTareasEstudiantePorCedulaYMateria,
  crearTareaEstudiante,
  actualizarProgresoEstudianteTareaCumplida,
  actualizarProgresoEstudiante,
  eliminarProgresoEstudiante,
  eliminarTareaSubidaEstudiante
};
