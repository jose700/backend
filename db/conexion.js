const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config(); // Carga las variables de entorno desde el archivo .env

const {
  POSTGRES_URL,
  URL,
  GOOGLE_PROJECT_ID,
  GOOGLE_APPLICATION_CREDENTIALS_PATH,
  GOOGLE_BUCKET_NAME,
  /*DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,*/
  PORT
} = process.env;

const pool = new Pool({
  //host: POSTGRES_URL,
  connectionString: process.env.POSTGRES_URL + "?sslmode=require",
  //port: DB_PORT,
  //user: DB_USER,
  //password: DB_PASSWORD,
  //database: DB_NAME,
  /*ssl: {
    rejectUnauthorized: false, // Configuración para evitar errores en entornos de desarrollo, ¡no lo uses en producción sin entender los riesgos!
  },
  // Agrega sslmode=require al connection string
  connectionTimeoutMillis: 5000, // Opcional, ajusta según sea necesario
  sslmode: 'require',*/ // Asegura que se use una conexión SSL
});

module.exports = {
  pool,
  GOOGLE_PROJECT_ID,
  GOOGLE_APPLICATION_CREDENTIALS_PATH,
  GOOGLE_BUCKET_NAME,
  //POSTGRES_URL,
  //DB_PORT,
  //DB_USER,
  //DB_PASSWORD,
  //DB_NAME,
  URL,
  PORT
};
