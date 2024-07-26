const { pool } = require('../../../db/conexion');
const bcrypt = require('bcryptjs');

// Obtener todos los tutores
const getTutor = async (req, res) => {
    try {
        const response = await pool.query('SELECT * FROM tutor');
        res.status(200).json(response.rows);
    } catch (error) {
        console.error('Error al obtener tutores:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Crear un nuevo tutor
const crearTutor = async (req, res) => {
    const { nombres, apellidos, cedula, correo, usuario, pass } = req.body;

    try {
        // Verificar si la cédula ya está en uso
        const cedulaExistente = await pool.query('SELECT * FROM tutor WHERE cedula = $1', [cedula]);
        if (cedulaExistente.rows.length > 0) {
            return res.status(400).json({ message: 'El número de cédula ya está en uso' });
        }

        // Verificar si el usuario ya está en uso
        const usuarioExistente = await pool.query('SELECT * FROM tutor WHERE usuario = $1', [usuario]);
        if (usuarioExistente.rows.length > 0) {
            return res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
        }

        // Verificar si el correo ya está en uso
        const correoExistente = await pool.query('SELECT * FROM tutor WHERE correo = $1', [correo]);
        if (correoExistente.rows.length > 0) {
            return res.status(400).json({ message: 'El correo electrónico ya está en uso' });
        }

        // Si las verificaciones pasan, continuar con la creación del tutor
        const passEncriptada = await bcrypt.hash(pass, 10);
        const insert = await pool.query(
            'INSERT INTO tutor(nombres, apellidos, cedula, correo, usuario, pass, rol) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [nombres, apellidos, cedula, correo, usuario, passEncriptada, 'tutor']
        );

        res.status(201).json({
            message: 'Tutor registrado correctamente',
            body: {
                tutor: insert.rows[0] // Retorna el tutor creado
            }
        });
    } catch (error) {
        console.error('Error al crear tutor:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};


// Obtener perfil de un tutor por ID
const obtenerPerfilTutor = async (req, res) => {
    const tutorId = req.params.idtutor;

    try {
        const result = await pool.query('SELECT * FROM tutor WHERE idtutor = $1', [tutorId]);

        if (result.rows.length === 0) {
            return res.status(404).send('Tutor no encontrado');
        }

        const tutor = result.rows[0];
        delete tutor.pass; // Eliminar la contraseña de la respuesta

        res.json(tutor);
    } catch (error) {
        console.error('Error al obtener perfil del tutor:', error);
        res.status(500).send('Error interno del servidor');
    }
};

//perfil del tutor logueado 
const obtenerDatosTutorLogueado = async (req, res) => {
    try {
        // Extraer la información del usuario del objeto de solicitud
        const { idtutor, usuario } = req.user;
        
        // Buscar el tutor en la base de datos utilizando el ID o el usuario
        // Dependiendo de cómo esté configurada tu base de datos
        const tutor = await pool.query('SELECT * FROM tutor WHERE idtutor = $1 OR usuario = $2', [idtutor, usuario]);
        
        // Verificar si se encontró el tutor
        if (tutor.rows.length === 0) {
            return res.status(404).json({ error: 'Tutor no encontrado' });
        }

        // Devolver los datos del tutor
        res.json(tutor.rows[0]);
    } catch (error) {
        console.error('Error al obtener datos del tutor logueado:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


// Actualizar perfil de un tutor
const actualizarPerfilTutor = async (req, res) => {
    const tutorId = req.params.idtutor;
    const { usuario, correo } = req.body;

    try {
        const result = await pool.query(
            'UPDATE tutor SET usuario = $1, correo = $2 WHERE idtutor = $3 RETURNING *',
            [usuario,correo, tutorId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tutor no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar perfil del tutor:', error);
        res.status(500).send('Error interno del servidor');
    }
};

module.exports = {
    getTutor,
    crearTutor,
    obtenerPerfilTutor,
    actualizarPerfilTutor,
    obtenerDatosTutorLogueado
};
