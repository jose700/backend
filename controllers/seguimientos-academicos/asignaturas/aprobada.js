const { pool } = require('../../../db/conexion');
const getAprobadas = async (req, res) => {
    const response = await pool.query(`
        SELECT 
            a.idaprobada, 
            e.nombres, 
            e.apellidos,
            e.cedula, 
            m.nombre_materia AS nombre_materia, 
            m.creditos AS creditos,
            a.usuariotutor,
            a.observacion, 
            a.calificacion1, 
            a.calificacion2, 
            a.promediofinal, 
            a.asistencia ,
            a.fecha
        FROM 
            materia_aprobada a 
        JOIN 
            materia m ON m.idmateria = a.idmateria 
        JOIN 
            estudiante e ON e.idestudiante = a.idestudiante
    `);
    res.status(200).json(response.rows);
};


const getAprobadasPorTutor = async (req, res) => {
    const usuariotutor = req.params.usuariotutor;
    const response = await pool.query(`
        SELECT 
            a.idaprobada,
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
            materia_aprobada a 
        JOIN 
            materia m ON m.idmateria = a.idmateria 
        JOIN 
            estudiante e ON e.idestudiante = a.idestudiante 
        WHERE 
            a.usuariotutor = $1`,
        [usuariotutor]
    );
    res.status(200).json(response.rows);
};
const crearAprobadas = async (req, res) => {
    const { idmateria, idestudiante, usuariotutor, observacion, calificacion1, calificacion2, asistencia } = req.body;

    try {
        // Verificar si ya existe una materia aprobada con los mismos datos
        const existeAprobada = await pool.query(
            'SELECT * FROM materia_aprobada WHERE idmateria = $1 AND idestudiante = $2',
            [idmateria, idestudiante]
        );
        
        if (existeAprobada.rows.length > 0 && estado === 'aprobado') {
            return res.status(400).json({ error: 'No se puede cambiar a reprobada porque ya existe una asignatura aprobada para esta materia' });
        }
        
        

        // Si no existe, procedemos a insertar la materia aprobada
        const insersion = await pool.query(
            `INSERT INTO materia_aprobada (
                idmateria, 
                idestudiante, 
                usuariotutor, 
                observacion, 
                calificacion1, 
                calificacion2, 
                asistencia
            ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [
                idmateria,
                idestudiante,
                usuariotutor,
                observacion,
                calificacion1,
                calificacion2,
                asistencia
            ]
        );

        const materiaAprobadaInsertada = insersion.rows[0];

        res.json({
            body: {
                message: 'Materia aprobada guardada',
                materia_aprobada: materiaAprobadaInsertada
            }
        });
    } catch (error) {
        console.error('Error al insertar materia aprobada:', error);
        res.status(500).json({ error: 'Error al guardar la materia aprobada' });
    }
};


const eliminarAprobada = async (req, res) => {
    const idaprobada = req.params.idaprobada;
    const eliminacion = await pool.query('DELETE FROM materia_aprobada WHERE idaprobada = $1', [idaprobada]);
    res.json({
        message: 'Materia aprobada eliminada'
    });
};

const getAprobadaMateria = async (req, res) => {
    const nombre = req.params.nombre;
    const response = await pool.query(`
        SELECT 
            a.idaprobada, 
            e.nombres, 
            e.cedula, 
            m.nombre AS nombre_materia, 
            a.observacion, 
            a.calificacion1, 
            a.calificacion2, 
            a.promediofinal, 
            a.asistencia 
        FROM 
            materia_aprobada a 
        JOIN 
            materia m ON m.idmateria = a.idmateria 
        JOIN 
            estudiante e ON e.idestudiante = a.idestudiante 
        WHERE 
            m.nombre LIKE $1`,
        [nombre + '%']
    );
    res.status(200).json(response.rows);
};
const actualizarAprobada = async (req, res) => {
    const idaprobada = req.params.idaprobada;
    const { observacion, calificacion1, calificacion2, asistencia } = req.body;
    const actualizacion = await pool.query(`
        UPDATE materia_aprobada 
        SET 
            observacion = $1, 
            calificacion1 = $2, 
            calificacion2 = $3, 
            asistencia = $4 
        WHERE idaprobada = $5`,
        [
            observacion,
            calificacion1,
            calificacion2,
         
            asistencia,
            idaprobada
        ]
    );
    res.json({
        message: 'Materia aprobada actualizada',
        materia_aprobada: { idaprobada, observacion, calificacion1, calificacion2, asistencia }
    });
};


module.exports = {
    getAprobadas,
    getAprobadasPorTutor,
    getAprobadaMateria,
    crearAprobadas,
    eliminarAprobada,
    actualizarAprobada
};
