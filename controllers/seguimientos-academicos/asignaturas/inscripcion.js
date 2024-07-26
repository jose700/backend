const { pool } = require('../../../db/conexion');

const getInscripciones = async (req, res) => {
    try {
        const response = await pool.query(
            `SELECT 
                im.idinscripcion, 
                im.idestudiante, 
                im.idmateria, 
                im.usuariotutor, 
                im.fecha_inscripcion, 
                im.estado,
                e.nombres AS nombres_estudiante,
                e.apellidos AS apellidos_estudiante,
                e.imagen AS imagen,
                e.correo AS correo_estudiante,
                e.cedula AS cedula_estudiante,
                m.nombre_materia
             FROM inscripcion_materia im
             INNER JOIN estudiante e ON im.idestudiante = e.idestudiante
             INNER JOIN materia m ON im.idmateria = m.idmateria`
        );
        res.status(200).json(response.rows);
    } catch (error) {
        console.error('Error al obtener las inscripciones:', error);
        res.status(500).json({ error: 'Error al obtener las inscripciones' });
    }

};

const getInscripcionesPorTutor = async (req, res) => {
    const usuariotutor = req.params.usuariotutor;
    try {
        const response = await pool.query(
            `SELECT 
               im.idinscripcion, 
                im.idestudiante, 
                im.idmateria, 
                im.usuariotutor, 
                im.fecha_inscripcion, 
                im.estado,
                e.nombres AS nombres,
                e.apellidos AS apellidos,
                e.cedula AS cedula_estudiante,
                e.imagen AS imagen,
                e.correo AS correo,
                m.nombre_materia,
                m.institucion,
                m.curso,
                m.nivel,
                m.paralelo,
                m.jornada,
                m.descripcion,
                m.creditos
             FROM inscripcion_materia im
             INNER JOIN estudiante e ON im.idestudiante = e.idestudiante
             INNER JOIN materia m ON im.idmateria = m.idmateria
             WHERE im.usuariotutor = $1`,
            [usuariotutor]
        );
    
        console.log('Consulta SQL ejecutada correctamente');
        console.log('Filas encontradas:', response.rows.length);
    
        res.status(200).json(response.rows);
    } catch (error) {
        console.error('Error al ejecutar la consulta SQL:', error);
        res.status(500).json({ error: 'Error al obtener las inscripciones por tutor' });
    }
};

//obtener materias por estudiantes 
const getMateriasPorEstudiante = async (req, res) => {
    const cedula = req.params.cedula; // Captura la cedula del estudiante desde los parametros de la solicitud
    console.log('Cédula del estudiante:', cedula); // Agrega un console.log para verificar el valor de cedula
    try {
        const response = await pool.query(
            `SELECT 
                im.idinscripcion, 
                im.idestudiante, 
                im.idmateria, 
                im.usuariotutor, 
                im.fecha_inscripcion, 
                im.estado,
                e.nombres AS nombres,
                e.apellidos AS apellidos,
                e.cedula AS cedula_estudiante,
                e.imagen AS imagen,
                e.correo AS correo,
                m.nombre_materia,
                m.institucion,
                m.curso,
                m.nivel,
                m.paralelo,
                m.jornada,
                m.descripcion,
                m.creditos
             FROM inscripcion_materia im
             INNER JOIN materia m ON im.idmateria = m.idmateria
             INNER JOIN estudiante e ON im.idestudiante = e.idestudiante
             WHERE e.cedula = $1`, // Filtra por la cedula del estudiante
            [cedula]
        );

        console.log('Consulta SQL ejecutada correctamente');
        console.log('Filas encontradas:', response.rows.length);

        res.status(200).json(response.rows);
    } catch (error) {
        console.error('Error al ejecutar la consulta SQL:', error);
        res.status(500).json({ error: 'Error al obtener las materias por estudiante' });
    }
};


const inscribirEstudiante = async (req, res) => {
    const { idestudiante, idmateria, usuariotutor, estado } = req.body;
    try {
        // Primero, verifica si ya existe una inscripción para el estudiante en la materia
        const verificaInscripcion = await pool.query(
            'SELECT * FROM inscripcion_materia WHERE idestudiante = $1 AND idmateria = $2',
            [idestudiante, idmateria]
        );

        // Si encuentra alguna fila, significa que el estudiante ya está inscrito
        if (verificaInscripcion.rows.length > 0) {
            return res.status(400).json({ error: 'El estudiante ya está inscrito en esta materia' });
        }

        // Si no hay inscripción previa, procede con la inserción
        const insersion = await pool.query(
            'INSERT INTO inscripcion_materia (idestudiante, idmateria, usuariotutor, estado) VALUES ($1, $2, $3, $4)',
            [idestudiante, idmateria, usuariotutor, estado]
        );

        res.json({
            message: 'Estudiante inscrito en materia',
            inscripcion: {
                idestudiante,
                idmateria,
                usuariotutor,
                estado
            }
        });
    } catch (error) {
        console.error('Error al inscribir estudiante en materia:', error);
        res.status(500).json({ error: 'Error al inscribir estudiante en materia' });
    }
};
const eliminarInscripcionEstudiante = async (req, res) => {
    const { idinscripcion } = req.params; // Cambio a req.params para obtener el idinscripcion desde la URL
    try {
        const eliminacion = await pool.query(
            'DELETE FROM inscripcion_materia WHERE idinscripcion = $1',
            [idinscripcion]
        );
        res.json({
            message: 'Inscripción eliminada correctamente'
        });
    } catch (error) {
        console.error('Error al eliminar inscripción:', error);
        res.status(500).json({ error: 'Error al eliminar inscripción' });
    }
};

const actualizarEstadoInscripcion = async (req, res) => {
    const { idinscripcion, estado } = req.body;
    try {
        const actualizacion = await pool.query(
            'UPDATE inscripcion_materia SET estado = $1 WHERE idinscripcion = $2',
            [estado, idinscripcion]
        );

        if (actualizacion.rowCount === 0) {
            return res.status(404).json({ error: 'No se encontró la inscripción para actualizar' });
        }

        res.json({
            message: 'Estado de inscripción actualizado',
            inscripcion: {
                idinscripcion,
                estado
            }
        });
    } catch (error) {
        console.error('Error al actualizar estado de inscripción:', error);
        res.status(500).json({ error: 'Error al actualizar estado de inscripción' });
    }
};


module.exports = {
    getInscripciones,
    getInscripcionesPorTutor,
    getMateriasPorEstudiante,
    inscribirEstudiante,
    eliminarInscripcionEstudiante,
    actualizarEstadoInscripcion
};
