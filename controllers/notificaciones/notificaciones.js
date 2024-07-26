const { pool } = require('../../db/conexion');

// Crear notificación
const crearNotificacion = async (req, res) => {
    const { idtutor, idrepresentante, idestudiante, usuariotutor, mensaje, es_evento, titulo_evento, fecha_evento, hora_evento, fecha_envio } = req.body;

    try {
        const insercion = await pool.query(
            'INSERT INTO notificacion (idtutor, idrepresentante, idestudiante, usuariotutor, mensaje, es_evento, titulo_evento, fecha_evento, hora_evento, fecha_envio) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,$10)',
            [idtutor, idrepresentante, idestudiante, usuariotutor, mensaje, es_evento, titulo_evento, fecha_evento, hora_evento,fecha_envio]
        );

        res.json({
            message: 'Notificación creada',
            notificacion: {
                idtutor,
                idrepresentante,
                idestudiante,
                usuariotutor,
                mensaje,
                es_evento,
                titulo_evento,
                fecha_evento,
                hora_evento,
                fecha_envio
            }
        });
    } catch (error) {
        console.error('Error al crear notificación:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const enviarNotificacionATodosLosRepresentantes = async (req, res) => {
    const { idtutor, idestudiante, usuariotutor, mensaje, es_evento, titulo_evento, fecha_evento, hora_evento, fecha_envio } = req.body;

    try {
        // Obtener todos los representantes
        const representantes = await pool.query('SELECT * FROM representante');

        if (representantes.rows.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron representantes.' });
        }

        // Enviar la notificación a cada representante
        for (const representante of representantes.rows) {
            await pool.query(
                'INSERT INTO notificacion (idtutor, idrepresentante, idestudiante, usuariotutor, mensaje, es_evento, titulo_evento, fecha_evento, hora_evento, fecha_envio) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
                [idtutor, representante.idrepresentante, idestudiante, usuariotutor, mensaje, es_evento, titulo_evento, fecha_evento, hora_evento, fecha_envio]
            );
        }

        res.json({ message: 'Notificación enviada a todos los representantes.' });
    } catch (error) {
        console.error('Error al enviar notificación a todos los representantes:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const mostrarNotificacionesPorRepresentante = async (req, res) => {
    try {
        const usuarioRepresentante = req.params.usuarioRepresentante;

        // Consulta SQL para obtener todas las notificaciones con datos del representante
        const query = `
            SELECT r.idrepresentante, r.nombres AS representanteNombres, r.apellidos AS representanteApellidos,
                   n.idnotificacion, n.idtutor, n.idestudiante, n.mensaje,
                   n.es_evento, n.titulo_evento, n.fecha_evento, n.hora_evento, n.leida, n.fecha_envio,
                   n.usuariotutor
            FROM representante r
            INNER JOIN notificacion n ON r.idrepresentante = n.idrepresentante
            INNER JOIN tutor t ON t.idtutor = n.idtutor
            WHERE r.usuario = $1
        `;
        
        const result = await pool.query(query, [usuarioRepresentante]);

        if (result.rows.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron notificaciones para el representante proporcionado.' });
        }
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener notificaciones por representante:', error);
        res.status(500).json({ error: 'Error interno del servidor', detalles: error.message });
    }
};



// Función para actualizar notificación
const actualizarNotificacion = async (datosNotificacion, idnotificacion) => {
    const {
      idtutor,
      idrepresentante,
      idestudiante,
      usuariotutor,
      mensaje,
      es_evento,
      titulo_evento,
      fecha_evento,
      hora_evento,
    } = datosNotificacion;
  
    try {
      const actualizacion = await pool.query(
        'UPDATE notificacion SET idtutor=$1, idrepresentante=$2, idestudiante=$3, usuariotutor=$4, mensaje=$5, es_evento=$6, titulo_evento=$7, fecha_evento=$8, hora_evento=$9, leida=true WHERE idnotificacion=$10',
        [
          idtutor,
          idrepresentante,
          idestudiante,
          usuariotutor,
          mensaje,
          es_evento,
          titulo_evento,
          fecha_evento,
          hora_evento,
          idnotificacion,
        ]
      );
  
      return {
        message: 'Notificación actualizada como leída',
        notificacion: {
          idnotificacion,
          idtutor,
          idrepresentante,
          idestudiante,
          usuariotutor,
          mensaje,
          es_evento,
          titulo_evento,
          fecha_evento,
          hora_evento,
          leida: true,
        },
      };
    } catch (error) {
      console.error('Error al actualizar notificación:', error);
      throw new Error('Error al actualizar notificación');
    }
  };

  const actualizarNotificacionLeida = async (req, res) => {
    const idnotificacion = req.params.idnotificacion;
    const usuarioRepresentante = req.params.usuarioRepresentante;

    try {
        // Verificar si la notificación pertenece al representante especificado
        const notificacionResult = await pool.query(
            'SELECT * FROM notificacion n JOIN representante r ON n.idrepresentante = r.idrepresentante WHERE n.idnotificacion = $1 AND r.usuario = $2',
            [idnotificacion, usuarioRepresentante]
        );

        // Verificar si se encontró la notificación para el representante
        if (notificacionResult.rows.length === 0) {
            return res.status(404).json({ error: 'Notificación no encontrada para el representante especificado' });
        }

        // Actualizar la notificación como leída
        const actualizacion = await pool.query(
            'UPDATE notificacion SET leida=true WHERE idnotificacion=$1',
            [idnotificacion]
        );

        res.json({ message: 'Notificación actualizada como leída' });
    } catch (error) {
        console.error('Error al actualizar notificación:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

  

// Eliminar notificación
const eliminarNotificacion = async (req, res) => {
    const idnotificacion = req.params.idnotificacion;

    try {
        const eliminacion = await pool.query(
            'DELETE FROM notificacion WHERE idnotificacion = $1',
            [idnotificacion]
        );

        res.json({ message: 'Notificación eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar notificación:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const mostrarNotificacionesPorTutor = async (req, res) => {
    try {
        const tutorUsuario = req.params.usuarioTutor;

        // Consulta SQL para obtener todas las notificaciones con datos del representante
        const query = `
            SELECT r.idrepresentante, r.nombres AS representanteNombres, r.apellidos AS representanteApellidos,
                   n.idnotificacion, n.idtutor, n.idestudiante, n.mensaje,
                   n.es_evento, n.titulo_evento, n.fecha_evento, n.hora_evento, n.leida, fecha_envio,
                   n.usuariotutor
            FROM representante r
            INNER JOIN notificacion n ON r.idrepresentante = n.idrepresentante
            INNER JOIN tutor t ON t.idtutor = n.idtutor
            WHERE t.usuario = $1
        `;
        
        const result = await pool.query(query, [tutorUsuario]);

        if (result.rows.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron notificaciones para el tutor proporcionado.' });
        }
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener todas las notificaciones por tutor:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};





module.exports = {
    crearNotificacion,
    mostrarNotificacionesPorRepresentante,
    enviarNotificacionATodosLosRepresentantes,
    actualizarNotificacion,
    eliminarNotificacion,
    mostrarNotificacionesPorTutor,
    actualizarNotificacionLeida
};
