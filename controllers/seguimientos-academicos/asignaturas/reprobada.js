const { pool } = require('../../../db/conexion');

const getReprobadas = async (req, res) => {
    try {
        const response = await pool.query(`
            SELECT r.idreprobada, e.nombres, e.apellidos, e.cedula, m.nombre_materia AS nombre_materia,
                   r.usuariotutor, r.calificacion1, r.calificacion2, r.promediofinal,
                   r.asistencia, r.aprobado, r.observacion, r.fecha
            FROM materia_reprobada r
            JOIN materia m ON m.idmateria = r.idmateria
            JOIN estudiante e ON e.idestudiante = r.idestudiante
        `);
        res.status(200).json(response.rows);
    } catch (error) {
        console.error('Error al obtener materias reprobadas:', error);
        res.status(500).json({ error: 'Error al obtener materias reprobadas' });
    }
};

const getReprobadasPorTutor = async (req, res) => {
    const usuariotutor = req.params.usuariotutor;
    try {
        const response = await pool.query(`
            SELECT 
                a.idreprobada,
                e.idestudiante, 
                e.nombres, 
                e.apellidos,
                e.cedula, 
                m.nombre_materia AS nombre_materia, 
                m.creditos AS creditos,
                m.idmateria AS idmateria,
                a.usuariotutor,
                a.observacion, 
                a.calificacion1, 
                a.calificacion2, 
                a.promediofinal, 
                a.asistencia,
                a.fecha,
                a.aprobado
            FROM 
                materia_reprobada a 
            JOIN 
                materia m ON m.idmateria = a.idmateria 
            JOIN 
                estudiante e ON e.idestudiante = a.idestudiante 
            WHERE 
                a.usuariotutor = $1`,
            [usuariotutor]
        );
        res.status(200).json(response.rows);
    } catch (error) {
        console.error('Error al obtener materias reprobadas por tutor:', error);
        res.status(500).json({ error: 'Error al obtener materias reprobadas por tutor' });
    }
};

const crearReprobadas = async (req, res) => {
    const { idmateria, idestudiante, usuariotutor, calificacion1, calificacion2, asistencia, observacion } = req.body;
    
    try {
        const existeReprobada = await pool.query(
            'SELECT * FROM materia_reprobada WHERE idmateria = $1 AND idestudiante = $2',
            [idmateria, idestudiante]
        );
        
        if (existeReprobada.rows.length > 0) {
            return res.status(400).json({ error: 'El estudiante ya ha reprobado esta materia' });
        }
        
        // Verificar si el estudiante ya ha aprobado la materia
        const existeAprobada = await pool.query(
            'SELECT * FROM materia_aprobada WHERE idmateria = $1 AND idestudiante = $2',
            [idmateria, idestudiante]
        );

        if (existeAprobada.rows.length > 0) {
            return res.status(400).json({ error: 'El estudiante ya ha aprobado esta materia' });
        }

        // Si no existe, procedemos a insertar la materia reprobada
        const insercion = await pool.query(
            `INSERT INTO materia_reprobada (
                idmateria, idestudiante, usuariotutor, calificacion1, calificacion2,
                asistencia, observacion
            ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [idmateria, idestudiante, usuariotutor, calificacion1, calificacion2, asistencia, observacion]
        );

        const materiaReprobadaInsertada = insercion.rows[0];
        res.json({
            message: 'Materia reprobada creada',
            materia_reprobada: materiaReprobadaInsertada
        });
    } catch (error) {
        console.error('Error al crear materia reprobada:', error);
        res.status(500).json({ error: 'Error al crear materia reprobada' });
    }
};

const eliminarReprobada = async (req, res) => {
    const idreprobada = req.params.idreprobada;
    try {
        await pool.query('DELETE FROM materia_reprobada WHERE idreprobada = $1', [idreprobada]);
        res.json({
            message: 'Materia reprobada eliminada'
        });
    } catch (error) {
        console.error('Error al eliminar materia reprobada:', error);
        res.status(500).json({ error: 'Error al eliminar materia reprobada' });
    }
};

const actualizarReprobada = async (req, res) => {
    const idreprobada = req.params.idreprobada;
    const { calificacion1, calificacion2, asistencia, observacion } = req.body;
    try {
        
        const actualizacion = await pool.query(`
            UPDATE materia_reprobada
            SET calificacion1 = $1, calificacion2 = $2,
                asistencia = $3, observacion = $4
            WHERE idreprobada = $5
            RETURNING *
        `, [calificacion1, calificacion2, asistencia, observacion, idreprobada]);
        const materiaReprobadaActualizada = actualizacion.rows[0];
        res.json({
            message: 'Materia reprobada actualizada',
            materia_reprobada: materiaReprobadaActualizada
        });
    } catch (error) {
        console.error('Error al actualizar materia reprobada:', error);
        res.status(500).json({ error: 'Error al actualizar materia reprobada' });
    }
};

const getReprobadaMateria = async (req, res) => {
    const nombre = req.params.nombre;
    try {
        const response = await pool.query(`
            SELECT r.idreprobada, e.nombres, e.apellidos, e.cedula, m.nombre AS nombre_materia,
                   r.usuariotutor, r.calificacion1, r.calificacion2, r.promediofinal,
                   r.asistencia, r.aprobado, r.observacion, r.fecha
            FROM materia_reprobada r
            JOIN materia m ON m.idmateria = r.idmateria
            JOIN estudiante e ON e.idestudiante = r.idestudiante
            WHERE m.nombre LIKE $1
        `, [nombre + '%']);
        res.status(200).json(response.rows);
    } catch (error) {
        console.error('Error al obtener materias reprobadas por nombre de materia:', error);
        res.status(500).json({ error: 'Error al obtener materias reprobadas por nombre de materia' });
    }
};

module.exports = {
    getReprobadas,
    getReprobadasPorTutor,
    crearReprobadas,
    eliminarReprobada,
    actualizarReprobada,
    getReprobadaMateria
};
