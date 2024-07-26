const { pool } = require('../../db/conexion');
const bcrypt = require('bcryptjs');

// Obtener todos los representantes
const getRepresentantes = async (req, res) => {
    try {
        const response = await pool.query('SELECT r.idrepresentante, e.nombres AS representado, r.usuariotutor, r.nombres, r.apellidos, r.cedula, r.ocupacion, r.imagen FROM representante r JOIN estudiante e ON e.idestudiante = r.idestudiante');
        res.status(200).json(response.rows);
    } catch (error) {
        console.error('Error al obtener representantes:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
// Obtener datos del estudiante por usuarioRepresentante, incluyendo materias aprobadas y reprobadas
const getEstudiantePorUsuarioRepresentante = async (req, res) => {
    const usuarioRepresentante = req.params.usuarioRepresentante;

    try {
        const estudianteResult = await pool.query(`
            SELECT 
                e.idestudiante, 
                e.nombres AS nombres, 
                e.apellidos AS apellidos, 
                e.cedula AS cedula,
                e.imagen AS imagen,
                e.correo AS correo,
                e.edad AS edad,
                e.fechanacimiento AS fechanacimiento,
                e.genero AS genero
            FROM 
                estudiante e
            JOIN 
                representante r ON e.idestudiante = r.idestudiante
            WHERE 
                r.usuario = $1
        `, [usuarioRepresentante]);

        if (estudianteResult.rows.length === 0) {
            return res.status(404).json({ message: 'No se encontró ningún estudiante para el representante especificado' });
        }

        const estudiante = estudianteResult.rows[0];

        const aprobadasResult = await pool.query(`
            SELECT 
                m.nombre_materia AS nombre_materia, 
                a.calificacion1, 
                a.calificacion2, 
                a.promediofinal,
                a.observacion, 
                a.asistencia, 
                a.fecha,
                true AS aprobado
            FROM 
                materia_aprobada a
            JOIN 
                materia m ON a.idmateria = m.idmateria
            WHERE 
                a.idestudiante = $1
        `, [estudiante.idestudiante]);

        const reprobadasResult = await pool.query(`
            SELECT 
                m.nombre_materia AS nombre_materia, 
                r.calificacion1, 
                r.calificacion2, 
                r.promediofinal, 
                r.observacion,
                r.asistencia, 
                r.fecha,
                false AS aprobado
            FROM 
                materia_reprobada r
            JOIN 
                materia m ON r.idmateria = m.idmateria
            WHERE 
                r.idestudiante = $1
        `, [estudiante.idestudiante]);

        const materiasAprobadas = aprobadasResult.rows.map(row => ({
            nombre_materia: row.nombre_materia,
            calificacion1: row.calificacion1,
            calificacion2: row.calificacion2,
            promediofinal: row.promediofinal,
            asistencia: row.asistencia,
            observacion: row.observacion,
            fecha: row.fecha,
            aprobado: row.aprobado,
            estado_materia: 'aprobada'
        }));

        const materiasReprobadas = reprobadasResult.rows.map(row => ({
            nombre_materia: row.nombre_materia,
            calificacion1: row.calificacion1,
            calificacion2: row.calificacion2,
            promediofinal: row.promediofinal,
            asistencia: row.asistencia,
            observacion: row.observacion,
            fecha: row.fecha,
            aprobado: row.aprobado,
            estado_materia: 'reprobada'
        }));

        const materias = [...materiasAprobadas, ...materiasReprobadas];

        res.status(200).json({ estudiante, materias });
    } catch (error) {
        console.error('Error al obtener estudiante por usuarioRepresentante:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Obtener representantes por tutor
const obtenerRepresentantesPorTutor = async (req, res) => {
    const tutorUsuario = req.params.usuarioTutor;

    try {
        const result = await pool.query('SELECT r.*, e.nombres AS representado_nombre, e.apellidos AS representado_apellidos FROM representante r JOIN estudiante e ON r.idestudiante = e.idestudiante WHERE r.usuariotutor = $1', [tutorUsuario]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener representantes por tutor:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Crear un nuevo representante
const crearRepresentantes = async (req, res) => {
    const { idestudiante, usuariotutor, nombres, apellidos, cedula, correo, estadocivil, ocupacion, imagen, numberphone, usuario, pass, rol } = req.body;

    try {
        // Verificar si ya existe un representante con la misma cédula
        const existeRepresentante = await pool.query('SELECT idrepresentante FROM representante WHERE cedula = $1', [cedula]);
        if (existeRepresentante.rows.length > 0) {
            return res.status(400).json({ message: 'Ya existe un representante con esta cédula' });
        }

        // Encriptar la contraseña
        const passEncriptada = await bcrypt.hash(pass, 10);

        // Insertar nuevo representante
        await pool.query('INSERT INTO representante (idestudiante, usuariotutor, nombres, apellidos, cedula, correo, estadocivil, ocupacion, imagen, numberphone, usuario, pass, rol) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)', [
            idestudiante,
            usuariotutor,
            nombres,
            apellidos,
            cedula,
            correo,
            estadocivil,
            ocupacion,
            imagen,
            numberphone,
            usuario,
            passEncriptada,
            rol
        ]);

        res.status(201).json({
            message: 'Representante creado',
            representante: { idestudiante, usuariotutor, nombres, apellidos, cedula, correo, estadocivil, ocupacion, imagen, numberphone }
        });
    } catch (error) {
        console.error('Error al crear representante:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Eliminar representante por ID
const eliminarRepresentante = async (req, res) => {
    const idrepresentante = req.params.idrepresentante;

    try {
        await pool.query('DELETE FROM representante WHERE idrepresentante = $1', [idrepresentante]);
        res.status(200).json({ message: 'Representante eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar representante:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Obtener representante por cédula
const getRepresentanteCedula = async (req, res) => {
    const cedula = req.params.cedula;

    try {
        const response = await pool.query('SELECT r.idrepresentante, e.nombres AS representado, r.nombres, r.apellidos, r.cedula, r.ocupacion, r.imagen FROM representante r JOIN estudiante e ON e.idEstudiante = r.idEstudiante WHERE r.cedula = $1', [cedula]);
        res.status(200).json(response.rows);
    } catch (error) {
        console.error('Error al obtener representante por cédula:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Actualizar representante por ID
const actualizarRepresentante = async (req, res) => {
    const idrepresentante = req.params.idrepresentante;
    const { idestudiante, usuariotutor, nombres, apellidos, cedula, correo, estadocivil, ocupacion, imagen, numberphone } = req.body;

    try {
        await pool.query('UPDATE representante SET idestudiante=$1, usuariotutor=$2, nombres=$3, apellidos=$4, cedula=$5, correo=$6, estadocivil=$7, ocupacion=$8, imagen=$9, numberphone=$10 WHERE idrepresentante=$11', [
            idestudiante, usuariotutor, nombres, apellidos, cedula, correo, estadocivil, ocupacion, imagen, numberphone, idrepresentante
        ]);

        res.status(200).json({
            message: 'Representante actualizado',
            representante: { idrepresentante, idestudiante, usuariotutor, nombres, apellidos, cedula, correo, estadocivil, ocupacion, imagen, numberphone }
        });
    } catch (error) {
        console.error('Error al actualizar representante:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = {
    getRepresentantes,
    getRepresentanteCedula,
    obtenerRepresentantesPorTutor,
    getEstudiantePorUsuarioRepresentante,
    crearRepresentantes,
    eliminarRepresentante,
    actualizarRepresentante,
};
