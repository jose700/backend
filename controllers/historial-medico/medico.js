const{pool} = require('../../db/conexion')



const getHistorialesMedicos = async(req,res)=>{
    const response = await pool.query('select e.nombres,e.cedula,e.correo,t.clasediscapacidad,t.descripcionconsulta,t.tratamientopsicologico,t.tratamientofisico,c.fechainicio,c.fechafin from estudiante e join tratamiento t on e.idEstudiante = t.idEstudiante join tratamientocumplido c on t.idTratamiento = c.idTratamiento')
    res.status(200).json(response.rows)
}



const filtraHistorial = async(req,res)=>{
    const cedula = req.params.cedula;
    const filtro = await pool.query('select e.nombres,e.cedula,e.correo,t.clasediscapacidad,t.descripcionconsulta,t.tratamientopsicologico,t.tratamientofisico,c.fechainicio,c.fechafin from estudiante e join tratamiento t on e.idEstudiante = t.idEstudiante join tratamientocumplido c on t.idTratamiento = c.idTratamiento where e.cedula like $1',
    [
        cedula + '%'
    ])
    res.status(200).json(filtro.rows)
}




module.exports = {
    getHistorialesMedicos,
    filtraHistorial
}