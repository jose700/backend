const { pool } = require('../../../db/conexion');

const getNoCumplidos = async (req, res) => {
    try {
        const response = await pool.query(`
            SELECT c.idnocumplido, e.nombres AS estudiante, e.cedula AS ci, 
                   t.descripcionconsulta, t.tratamientopsicologico, t.tratamientofisico, 
                   c.observacion, c.fechainicio, c.fechafin 
            FROM tratamiento_nocumplido c 
            JOIN tratamiento t ON t.idtratamiento = c.idtratamiento 
            JOIN estudiante e ON e.idestudiante = t.idestudiante
        `);
        res.status(200).json(response.rows);
    } catch (error) {
        console.error('Error al obtener no cumplidos:', error);
        res.status(500).json({
            error: 'Hubo un error al obtener los no cumplidos'
        });
    }
};

const getNoCumplidosPorTutor = async (req, res) => {
    const tutorUsuario = req.params.usuarioTutor;
  
    try {
        const result = await pool.query(`
            SELECT c.*, e.nombres AS nombres, e.apellidos AS apellidos, e.imagen AS imagen, e.cedula AS ci, 
                   t.descripcionconsulta, t.tratamientopsicologico, t.tratamientofisico, 
                   c.observacion, c.fechainicio, c.fechafin, t.duraciontratamiento, t.resultado 
            FROM tratamiento_nocumplido c 
            JOIN tratamiento t ON c.idtratamiento = t.idtratamiento 
            JOIN estudiante e ON t.idestudiante = e.idestudiante 
            WHERE t.usuariotutor = $1
        `, [tutorUsuario]);
        
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener tratamientos no cumplidos por tutor:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const crearNoCumplidos = async (req, res) => {
    const { idtratamiento, usuariotutor, observacion, fechainicio, fechafin, cumplimiento } = req.body;

    try {
        const insercion = await pool.query(
            'INSERT INTO tratamiento_nocumplido(idtratamiento, usuariotutor, observacion, fechainicio, fechafin, cumplimiento) VALUES ($1, $2, $3, $4, $5, $6)',
            [idtratamiento, usuariotutor, observacion, fechainicio, fechafin, cumplimiento]
        );

        res.json({
            body: {
                message: 'No se cumplió el tratamiento',
                tratamientoNocumplido: { idtratamiento, usuariotutor, observacion, fechainicio, fechafin, cumplimiento }
            }
        });
    } catch (error) {
        console.error('Error al insertar tratamiento no cumplido:', error);
        res.status(500).json({
            error: 'Hubo un error al insertar el tratamiento no cumplido'
        });
    }
};
const eliminarNoCumplido = async (req, res) => {
    const idnocumplido = req.params.idnocumplido; // Asegúrate de que el nombre del parámetro coincide

    try {
        const result = await pool.query('DELETE FROM tratamiento_nocumplido WHERE idnocumplido = $1', [idnocumplido]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: 'No se encontró el no tratamiento cumplido con el id especificado'
            });
        }

        res.json({
            message: 'Se eliminó el no tratamiento cumplido'
        });
    } catch (error) {
        console.error('Error al eliminar el no tratamiento cumplido:', error);
        res.status(500).json({
            error: 'Hubo un error al eliminar el no tratamiento cumplido'
        });
    }
};
const actualizarNoCumplido = async (req, res) => {
    const idnocumplido = req.params.idnocumplido; // Ajustado a idnocumplido
    const { idtratamiento, usuariotutor, observacion, fechainicio, fechafin, cumplimiento } = req.body;

    try {
        const actualizacion = await pool.query(`
            UPDATE tratamiento_nocumplido
            SET idtratamiento = $1,
                usuariotutor = $2,
                observacion = $3,
                fechainicio = $4,
                fechafin = $5,
                cumplimiento = $6
            WHERE idnocumplido = $7
        `, [idtratamiento, usuariotutor, observacion, fechainicio, fechafin, cumplimiento, idnocumplido]);

        res.json({
            message: 'Tratamiento no cumplido actualizado correctamente',
            tratamientoNoCumplido: { idnocumplido, idtratamiento, usuariotutor, observacion, fechainicio, fechafin, cumplimiento }
        });
    } catch (error) {
        console.error('Error al actualizar tratamiento no cumplido:', error);
        res.status(500).json({
            error: 'Hubo un error al actualizar el tratamiento no cumplido'
        });
    }
};


const getNoCumplidosCedula = async (req, res) => {
    const cedula = req.params.cedula;

    try {
        const response = await pool.query(`
            SELECT c.idnocumplido, e.nombres AS estudiante, e.cedula AS ci, 
                   t.descripcionconsulta, t.tratamientopsicologico, t.tratamientofisico, 
                   c.observacion, c.fechainicio, c.fechafin 
            FROM tratamiento_nocumplido c 
            JOIN tratamiento t ON t.idtratamiento = c.idtratamiento 
            JOIN estudiante e ON e.idestudiante = t.idestudiante 
            WHERE e.cedula = $1
        `, [cedula]);

        res.status(200).json(response.rows);
    } catch (error) {
        console.error('Error al obtener no cumplidos por cédula:', error);
        res.status(500).json({
            error: 'Hubo un error al obtener los no cumplidos por cédula'
        });
    }
};

module.exports = {
    getNoCumplidos,
    getNoCumplidosCedula,
    getNoCumplidosPorTutor,
    crearNoCumplidos,
    actualizarNoCumplido,
    eliminarNoCumplido
};
