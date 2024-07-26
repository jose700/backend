const { pool } = require("../../../db/conexion");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const crearLogin = async (req, res) => {
  try {
    const { usuario, pass } = req.body;

    // Verificar que se proporcionen los datos necesarios
    if (!usuario || !pass) {
      return res.status(400).json({ error: 'Se requiere usuario y contraseña para tutor/representante' });
    }

    let user = null;
    let rol = null;
    let idtutor = null;
    let idrepresentante = null;
    let nombres = null;
    let apellidos = null;
    let correo = null;
    let imagen = null;

    // Buscar en la tabla tutor
    let result = await pool.query('SELECT * FROM tutor WHERE usuario = $1', [usuario]);
    if (result.rows.length > 0) {
      user = result.rows[0];
      rol = 'tutor';
      idtutor = user.idtutor;
      nombres = user.nombres;
      apellidos = user.apellidos;
      correo = user.correo;
      imagen = user.imagen;
    } else {
      // Si no se encuentra en la tabla tutor, buscar en la tabla representante
      result = await pool.query('SELECT * FROM representante WHERE usuario = $1', [usuario]);
      if (result.rows.length > 0) {
        user = result.rows[0];
        rol = 'representante';
        idrepresentante = user.idrepresentante;
        nombres = user.nombres;
        apellidos = user.apellidos;
        correo = user.correo;
        imagen = user.imagen;
      }
    }

    // Si no se encuentra el usuario en ninguna de las dos tablas
    if (!user) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    // Verificar la contraseña
    const passwordMatch = await bcrypt.compare(pass, user.pass);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Generar el token con el rol incluido
    const token = generateToken({ idtutor, idrepresentante, usuario: user.usuario, rol, nombres, apellidos });

    console.log(`Usuario: ${user.usuario}, ID Tutor: ${idtutor}, ID Representante: ${idrepresentante}, Rol: ${rol}, Nombres: ${nombres}, Apellidos: ${apellidos}`); // Mensaje de depuración

    // Asegurar que el id se pase correctamente en la respuesta JSON
    res.json({ success: 'Inicio de sesión exitoso', token, idtutor, idrepresentante, rol, nombres, apellidos });

  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

function generateToken(payload) {
  const secretKey = process.env.JWT_SECRET || 'tu_secreto';
  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
}

const obtenerIdTutor = (req, res) => {
  try {
    const { idtutor, idrepresentante, usuario, rol, nombres, apellidos } = req.user;
    res.json({ idtutor, idrepresentante, usuario, rol, nombres, apellidos });
  } catch (error) {
    console.error('Error al obtener el ID del usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

module.exports = {
  crearLogin,
  obtenerIdTutor,
};
