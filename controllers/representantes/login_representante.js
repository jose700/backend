const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../../db/conexion');
const dotenv = require('dotenv');
dotenv.config();

const loginRepresentante = async (req, res) => {
  const { usuario, pass } = req.body;

  try {
    // Buscar el representante por usuario
    const representante = await pool.query('SELECT * FROM representante WHERE usuario = $1', [usuario]);

    if (representante.rows.length === 0) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    // Verificar la contraseña
    const match = await bcrypt.compare(pass, representante.rows[0].pass);

    if (!match) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    // Generar un token JWT
    const token = generateToken({ idRepresentante: representante.rows[0].idrepresentante, usuario: representante.rows[0].usuario });

    // Devolver una respuesta exitosa con el token
    res.status(200).json({ message: 'Inicio de sesión exitoso', token });

  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

function generateToken(payload) {
  const secretKey = process.env.JWT_SECRET || 'tu_secreto';
  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
}
const obtenerIdRepresentante = (req, res) => {
    try {
      const { idrepresentante, usuario } = req.user;
      res.json({ idrepresentante, usuario });
    } catch (error) {
      console.error('Error al obtener el ID del representante:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  };
module.exports = {
  loginRepresentante,
  obtenerIdRepresentante
};
