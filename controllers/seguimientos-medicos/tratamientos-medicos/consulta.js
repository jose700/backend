const {pool} = require('../../../db/conexion')




const getTratamientos = async(req,res)=>{
    const response = await pool.query('select t.idtratamiento, e.nombres as estudiante, e.cedula as ci, t.clasediscapacidad,t.tratamientopsicologico,t.tratamientofisico,t.descripcionconsulta,t.opinionpaciente,t.fechaconsulta from tratamiento t join estudiante e on e.idestudiante = t.idestudiante')
    res.status(200).json(response.rows);
}
//mostra representantes por tutor
const obtenerTratamientosPorTutor = async (req, res) => {
    const tutorUsuario = req.params.usuarioTutor;
  
    try {
        const result = await pool.query('SELECT t.*, e.nombres AS estudiante_nombres, e.apellidos AS estudiante_apellidos,e.imagen AS estudiante_imagen, e.cedula AS estudiante_cedula FROM tratamiento t JOIN estudiante e ON t.idestudiante = e.idestudiante WHERE t.usuariotutor = $1', [tutorUsuario]);
        
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener los tratamientos del tutor:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const crearTratamientos = async (req, res) => {
    const {
        idestudiante,
        usuariotutor,
        clasediscapacidad,
        descripcionconsulta,
        opinionpaciente,
        tratamientopsicologico,
        tratamientofisico,
        duraciontratamiento,
        resultado
    } = req.body;

    // Obtener la fecha y hora actuales
    const fechaconsulta = new Date();

    try {
        // Realizar la inserción en la base de datos
        await pool.query(
            'INSERT INTO tratamiento (idestudiante, usuariotutor, clasediscapacidad, descripcionconsulta, fechaconsulta, opinionpaciente, tratamientopsicologico, tratamientofisico, duraciontratamiento, resultado) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
            [
                idestudiante,
                usuariotutor,
                clasediscapacidad,
                descripcionconsulta,
                fechaconsulta,
                opinionpaciente,
                tratamientopsicologico,
                tratamientofisico,
                duraciontratamiento,
                resultado
            ]
        );

        res.json({
            body: {
                message: 'Consulta creada',
                tratamiento: {
                    idestudiante,
                    usuariotutor,
                    clasediscapacidad,
                    descripcionconsulta,
                    fechaconsulta,
                    opinionpaciente,
                    tratamientopsicologico,
                    tratamientofisico,
                    duraciontratamiento,
                    resultado
                }
            }
        });
    } catch (error) {
        // Manejo de errores
        console.error('Error al crear tratamiento:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}



const eliminarTratamiento = async(req,res)=>{
const idtratamiento = req.params.idtratamiento;
const eliminacion = await pool.query('delete from tratamiento where idtratamiento = $1',
[
    idtratamiento
])
res.json({
    message: 'consulta eliminada'
})
}


const getTratamientoEstudiante = async(req,res)=>{
    const nombres = req.params.nombres;
    const response = await pool.query('select t.idtratamiento, e.nombres as estudiante, t.clasediscapacidad,t.tratamientopsicologico,t.tratamientofisico,t.descripcionconsulta,t.opinionpaciente,t.fechaconsulta from tratamiento t join estudiante e on e.idestudiante = t.idestudiante where e.nombres like $1 ',
    [
        nombres + '%'
    ])
    res.status(200).json(response.rows)
}



const actualizarTratamiento = async (req, res) => {
    const idtratamiento = req.params.idtratamiento;
    const {
        idestudiante,
        usuariotutor,
        clasediscapacidad,
        descripcionconsulta,
        opinionpaciente,
        tratamientopsicologico,
        tratamientofisico,
        duraciontratamiento,
        resultado
    } = req.body;

    // Obtener la fecha y hora actuales
    const fechaconsulta = new Date();

    try {
        // Realizar la actualización en la base de datos
        const response = await pool.query(
            'UPDATE tratamiento SET idestudiante=$1, usuariotutor=$2, clasediscapacidad=$3, descripcionconsulta=$4, fechaconsulta=$5, opinionpaciente=$6, tratamientopsicologico=$7, tratamientofisico=$8, duraciontratamiento=$9, resultado=$10 WHERE idtratamiento=$11',
            [
                idestudiante,
                usuariotutor,
                clasediscapacidad,
                descripcionconsulta,
                fechaconsulta,
                opinionpaciente,
                tratamientopsicologico,
                tratamientofisico,
                duraciontratamiento,
                resultado,
                idtratamiento
            ]
        );

        res.json({
            message: 'Tratamiento actualizado',
            tratamiento: {
                idtratamiento,
                idestudiante,
                usuariotutor,
                clasediscapacidad,
                descripcionconsulta,
                fechaconsulta,
                opinionpaciente,
                tratamientopsicologico,
                tratamientofisico,
                duraciontratamiento,
                resultado
            }
        });
    } catch (error) {
        // Manejo de errores
        console.error('Error al actualizar tratamiento:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

module.exports = {
    getTratamientos,
    obtenerTratamientosPorTutor,
    getTratamientoEstudiante,
    crearTratamientos,
    eliminarTratamiento,
    actualizarTratamiento // Agregar el método para actualizar tratamiento
}
