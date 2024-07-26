const { pool } = require('../../../db/conexion');

const getAsignaturas = async (req, res) => {
    const response = await pool.query('SELECT idmateria, usuariotutor, nombre_materia, institucion, curso, nivel, paralelo, jornada, descripcion, creditos FROM materia');
    res.status(200).json(response.rows);
};
const getAsignaturasPorTutor = async (req, res) => {
    const usuariotutor = req.params.usuariotutor;
    try {
        const response = await pool.query(
            'SELECT idmateria, usuariotutor, nombre_materia, institucion, curso, nivel, paralelo, jornada, descripcion, creditos FROM materia WHERE usuariotutor = $1',
            [usuariotutor]
        );
        res.status(200).json(response.rows);
    } catch (error) {
        console.error('Error al obtener las asignaturas por tutor:', error);
        res.status(500).json({ error: 'Error al obtener las asignaturas por tutor' });
    }
};
const crearAsignatura = async (req, res) => {
    const {
        usuariotutor,
        nombre_materia,
        institucion,
        curso,
        nivel,
        paralelo,
        jornada,
        descripcion,
        creditos
    } = req.body;

    // Validación y sanitización de los datos de entrada
    if (
        typeof usuariotutor !== 'string' ||
        typeof nombre_materia !== 'string' ||
        typeof institucion !== 'string' ||
        typeof curso !== 'string' ||
        typeof nivel !== 'string' ||
        typeof paralelo !== 'string' ||
        typeof jornada !== 'string' ||
        typeof descripcion !== 'string' ||
        typeof creditos !== 'number'
    ) {
        return res.status(400).json({ error: 'Datos de entrada inválidos' });
    }

    try {
        // Verificar si ya existe una asignatura con el mismo nombre y paralelo
        const existeAsignatura = await pool.query(
            'SELECT * FROM materia WHERE nombre_materia = $1 AND paralelo = $2',
            [nombre_materia, paralelo]
        );

        if (existeAsignatura.rows.length > 0) {
            return res.status(400).json({ error: 'Ya existe una asignatura con el mismo nombre y paralelo' });
        }

        // Si no existe, procedemos a insertar la asignatura
        const insersion = await pool.query(
            'INSERT INTO materia (usuariotutor, nombre_materia, institucion, curso, nivel, paralelo, jornada, descripcion, creditos) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
            [
                usuariotutor,
                nombre_materia,
                institucion,
                curso,
                nivel,
                paralelo,
                jornada,
                descripcion,
                creditos
            ]
        );

        res.json({
            body: {
                message: 'Asignatura creada',
                materia: {
                    usuariotutor,
                    nombre_materia,
                    institucion,
                    curso,
                    nivel,
                    paralelo,
                    jornada,
                    descripcion,
                    creditos
                }
            }
        });
    } catch (error) {
        console.error('Error al crear la asignatura:', error);
        res.status(500).json({ error: 'Error al crear la asignatura' });
    }
};


const eliminarAsignatura = async (req, res) => {
    const idmateria = req.params.idmateria;
    try {
        const eliminacion = await pool.query('DELETE FROM materia WHERE idmateria = $1', [idmateria]);
        res.json({
            message: 'Asignatura eliminada'
        });
    } catch (error) {
        console.error('Error al eliminar la asignatura:', error);
        res.status(500).json({ error: 'Error al eliminar la asignatura' });
    }
};

const getAsignaturaCedula = async (req, res) => {
    const cedula = req.params.cedula;
    try {
        const response = await pool.query(
            'SELECT a.idmateria, a.usuariotutor, a.nombre_materia, a.institucion, a.curso, a.nivel, a.paralelo, a.jornada, a.descripcion, a.creditos FROM materia a JOIN estudiante e ON e.idestudiante = a.idestudiante WHERE e.cedula = $1',
            [cedula]
        );
        res.status(200).json(response.rows);
    } catch (error) {
        console.error('Error al obtener las asignaturas por cédula:', error);
        res.status(500).json({ error: 'Error al obtener las asignaturas por cédula' });
    }
};
const actualizarAsignatura = async (req, res) => {
    const idmateria = req.params.idmateria;
    const {
        usuariotutor,
        nombre_materia,
        institucion,
        curso,
        nivel,
        paralelo,
        jornada,
        descripcion,
        creditos
    } = req.body;

    // Validación y sanitización de los datos de entrada
    if (
        typeof usuariotutor !== 'string' ||
        typeof nombre_materia !== 'string' ||
        typeof institucion !== 'string' ||
        typeof curso !== 'string' ||
        typeof nivel !== 'string' ||
        typeof paralelo !== 'string' ||
        typeof jornada !== 'string' ||
        typeof descripcion !== 'string' ||
        typeof creditos !== 'number'
    ) {
        return res.status(400).json({ error: 'Datos de entrada inválidos' });
    }

    try {
        // Verificar si existe otra asignatura con el mismo nombre y paralelo
        const existeAsignatura = await pool.query(
            'SELECT * FROM materia WHERE nombre_materia = $1 AND paralelo = $2 AND idmateria <> $3',
            [nombre_materia, paralelo, idmateria]
        );

        if (existeAsignatura.rows.length > 0) {
            return res.status(400).json({ error: 'Ya existe otra asignatura con el mismo nombre y paralelo' });
        }

        // Si no existe, procedemos a actualizar la asignatura
        const actualizacion = await pool.query(
            'UPDATE materia SET usuariotutor = $1, nombre_materia = $2, institucion = $3, curso = $4, nivel = $5, paralelo = $6, jornada = $7, descripcion = $8, creditos = $9 WHERE idmateria = $10',
            [
                usuariotutor,
                nombre_materia,
                institucion,
                curso,
                nivel,
                paralelo,
                jornada,
                descripcion,
                creditos,
                idmateria
            ]
        );

        if (actualizacion.rowCount === 0) {
            return res.status(404).json({ error: 'No se encontró la asignatura para actualizar' });
        }

        res.json({
            message: 'Asignatura actualizada',
            materia: {
                idmateria,
                usuariotutor,
                nombre_materia,
                institucion,
                curso,
                nivel,
                paralelo,
                jornada,
                descripcion,
                creditos
            }
        });
    } catch (error) {
        console.error('Error al actualizar la asignatura:', error);
        res.status(500).json({ error: 'Error al actualizar la asignatura' });
    }
};


const getMateriasPorEstudiante = async (req, res) => {
    const idestudiante = req.params.idestudiante; // Suponiendo que pasas el idestudiante como parámetro

    try {
        const response = await pool.query(
            `SELECT 
                m.idmateria,
                m.usuariotutor,
                m.nombre_materia,
                m.institucion,
                m.curso,
                m.nivel,
                m.paralelo,
                m.jornada,
                m.descripcion,
                m.creditos
             FROM 
                inscripcion_materia im
             INNER JOIN 
                materia m ON im.idmateria = m.idmateria
             WHERE 
                im.idestudiante = $1`,
            [idestudiante]
        );

        res.status(200).json(response.rows);
    } catch (error) {
        console.error('Error al obtener las materias por estudiante:', error);
        res.status(500).json({ error: 'Error al obtener las materias por estudiante' });
    }
};



module.exports = {
    getAsignaturas,
    getAsignaturasPorTutor,
    getAsignaturaCedula,
    crearAsignatura,
    actualizarAsignatura,
    eliminarAsignatura,
    getMateriasPorEstudiante
};
