
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const { format } = require('util');
const { GOOGLE_PROJECT_ID, GOOGLE_APPLICATION_CREDENTIALS_PATH,GOOGLE_BUCKET_NAME } = require('../db/conexion');

// Configura el cliente de Google Cloud Storage usando variables de entorno
const storage = new Storage({
  projectId: GOOGLE_PROJECT_ID,
  keyFilename: path.join(__dirname, GOOGLE_APPLICATION_CREDENTIALS_PATH)
});

const bucket = storage.bucket(GOOGLE_BUCKET_NAME);

// Configura multer para usar una función de almacenamiento personalizada
const multerStorage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // Limitar el tamaño del archivo a 5MB
}).single('file');

const uploadToFirebase = (req, res, next) => {
  multerStorage(req, res, (err) => {
    if (err) {
      return next(err);
    }

    if (!req.file) {
      return next();
    }

    const blob = bucket.file(req.file.originalname);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: req.file.mimetype
      }
    });

    blobStream.on('error', (err) => {
      req.file.firebaseError = err;
      next(err);
    });

    blobStream.on('finish', () => {
      const publicUrl = format(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);
      req.file.firebaseUrl = publicUrl;
      next();
    });

    blobStream.end(req.file.buffer);
  });
};

module.exports = {
  uploadToFirebase
};
