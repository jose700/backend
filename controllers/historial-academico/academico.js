const {pool} = require('../../db/conexion')



const getHistorialesAcademicos = async(req,res)=>{
const response = await pool.query('select e.nombres, e.cedula, e.correo, t.clasediscapacidad,m.facultad,m.carrera,m.nivel,m.paralelo,m.jornada,m.nombre,a.promediofinal,a.observacion from estudiante e join materia m on e.idEstudiante = m.idEstudiante join materiaaprobada a on m.idMateria = a.idMateria join tratamiento t on e.idEstudiante = t.idEstudiante')
res.status(200).json(response.rows)
}


const filtroHistorial = async(req,res)=>{
const cedula = req.params.cedula;
const filtro = await pool.query('select e.nombres,e.cedula,e.correo,t.clasediscapacidad,m.facultad,m.carrera,m.nivel,m.paralelo,m.jornada,m.nombre,a.promediofinal,a.observacion from estudiante e join materia m on e.idEstudiante = m.idEstudiante join materiaaprobada a on m.idMateria = a.idMateria join tratamiento t on e.idEstudiante = t.idEstudiante where e.cedula like $1',
[
    cedula + '%'
]) 
res.status(200).json(filtro.rows)
}





module.exports = {
    getHistorialesAcademicos,
    filtroHistorial
}