const {pool} = require('../../../db/conexion')


const getCumplidos = async (req, res) => {
    try {
        const response = await pool.query(`
            SELECT c.idcumplido, e.nombres AS estudiante, e.cedula AS ci, 
                   t.descripcionconsulta, t.tratamientopsicologico, t.tratamientofisico, 
                   c.observacion, c.fechainicio, c.fechafin 
            FROM tratamiento_cumplido c 
            JOIN tratamiento t ON t.idtratamiento = c.idtratamiento 
            JOIN estudiante e ON e.idestudiante = t.idestudiante
        `);
        res.status(200).json(response.rows);
    } catch (error) {
        console.error('Error al obtener cumplidos:', error);
        res.status(500).json({
            error: 'Hubo un error al obtener los cumplidos'
        });
    }
};
const getCumplidosPorTutor = async (req, res) => {
    const tutorUsuario = req.params.usuarioTutor;
  
    try {
        const result = await pool.query(`
            SELECT c.*, e.nombres AS nombres, e.apellidos AS apellidos, e.imagen AS imagen, e.cedula AS ci, 
                   t.descripcionconsulta, t.tratamientopsicologico, t.tratamientofisico, 
                   c.observacion, c.fechainicio, c.fechafin, t.duraciontratamiento, t.resultado 
            FROM tratamiento_cumplido c 
            JOIN tratamiento t ON c.idtratamiento = t.idtratamiento 
            JOIN estudiante e ON t.idestudiante = e.idestudiante 
            WHERE t.usuariotutor = $1
        `, [tutorUsuario]);
        
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener tratamientos cumplidos por tutor:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};



const crearCumplidos = async (req, res) => {
    const { idtratamiento, usuariotutor, observacion, fechainicio, fechafin, cumplimiento } = req.body;

    try {
        const insersion = await pool.query(
            'INSERT INTO tratamiento_cumplido(idtratamiento, usuariotutor, observacion, fechainicio, fechafin, cumplimiento) VALUES ($1, $2, $3, $4, $5, $6)',
            [
                idtratamiento,
                usuariotutor,
                observacion,
                fechainicio,
                fechafin,
                cumplimiento
            ]
        );

        res.json({
            body: {
                message: 'Se cumplió el tratamiento',
                tratamientocumplido: { idtratamiento, usuariotutor, observacion, fechainicio, fechafin, cumplimiento }
            }
        });
    } catch (error) {
        console.error('Error al insertar tratamiento cumplido:', error);
        res.status(500).json({
            error: 'Hubo un error al insertar el tratamiento cumplido'
        });
    }
};

const eliminarCumplido = async(req,res)=>{
    const idcumplido = req.params.idcumplido;
    const eliminacion = await pool.query('delete from tratamiento_cumplido where idcumplido = $1',
    [
        idcumplido 
    ])
    res.json({
        message: 'se elimino el tratamiento cumplido'
    })
}
const actualizarCumplido = async (req, res) => {
    const idcumplido = req.params.idcumplido;
    const { idtratamiento, usuariotutor, observacion, fechainicio, fechafin, cumplimiento } = req.body;

    try {
        const actualizacion = await pool.query(`
            UPDATE tratamiento_cumplido
            SET idtratamiento = $1,
                usuariotutor = $2,
                observacion = $3,
                fechainicio = $4,
                fechafin = $5,
                cumplimiento = $6
            WHERE idcumplido = $7
        `, [idtratamiento, usuariotutor, observacion, fechainicio, fechafin, cumplimiento, idcumplido]);

        res.json({
            message: 'Tratamiento cumplido actualizado correctamente',
            tratamientocumplido: { idcumplido, idtratamiento, usuariotutor, observacion, fechainicio, fechafin, cumplimiento }
        });
    } catch (error) {
        console.error('Error al actualizar tratamiento cumplido:', error);
        res.status(500).json({
            error: 'Hubo un error al actualizar el tratamiento cumplido'
        });
    }
};


const getCumplidosCedula = async(req,res)=>{
const cedula = req.params.cedula;
const response = await pool.query('select c.idcumplido, e.nombres as estudiante ,e.cedula as ci, t.descripcionconsulta, t.tratamientopsicologico,t.tratamientofisico, c.observacion,c.fechainicio,c.fechafin from tratamiento_cumplido c join tratamiento t on t.idTratamiento = c.idTratamiento join estudiante e on e.idEstudiante = t.idEstudiante where e.cedula = $1',
[
    cedula
])
res.status(200).json(response.rows)
}


module.exports = {
    getCumplidos,
    getCumplidosCedula,
    getCumplidosPorTutor,
    crearCumplidos,
    actualizarCumplido,
    eliminarCumplido
}