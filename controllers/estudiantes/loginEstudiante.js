const { pool } = require("../../db/conexion");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const loginEstudiante = async (req, res) => {
  try {
    const { cedula } = req.body;

    // Verificar que se proporcione la cédula
    if (!cedula) {
      return res.status(400).json({ error: 'Se requiere la cédula para iniciar sesión como estudiante' });
    }

    // Buscar en la tabla estudiante por cédula
    const result = await pool.query('SELECT * FROM estudiante WHERE cedula = $1', [cedula]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const rol = 'estudiante';
      const idestudiante = user.idestudiante;
      const nombres = user.nombres;
      const apellidos = user.apellidos;
      const correo = user.correo; // Asignación de correo
      const imagen = user.imagen; // Asignación de imagen

      // Generar el token con el rol incluido
      const token = generateToken({ idestudiante, cedula: user.cedula, rol, nombres, apellidos });

      console.log(`Estudiante: ${user.cedula}, ID Estudiante: ${idestudiante}, Rol: ${rol}, Nombres: ${nombres}, Apellidos: ${apellidos}`); // Mensaje de depuración

      // Asegurar que el id se pase correctamente en la respuesta JSON
      res.json({ success: 'Inicio de sesión exitoso', token, idestudiante, rol, nombres, apellidos });
    } else {
      return res.status(401).json({ error: 'Cédula incorrecta' });
    }

  } catch (error) {
    console.error('Error al iniciar sesión como estudiante:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
const obtenerIdEstudiante = (req, res) => {
    try {
      const { idestudiante, nombres, apellidos, correo, imagen } = req.user;
      res.json({ idestudiante, nombres, apellidos, correo, imagen });
    } catch (error) {
      console.error('Error al obtener la información del estudiante:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  };
function generateToken(payload) {
  const secretKey = process.env.JWT_SECRET || 'tu_secreto';
  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
}

module.exports = {
  loginEstudiante,
  obtenerIdEstudiante
};
