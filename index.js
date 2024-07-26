const express = require('express');
require('dotenv').config();
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const amqp = require('amqplib');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors());

/*app.use(express.json());
const angularDistPath = path.join(__dirname, '../fronted/angular-cliente/dist/angular-cliente/');
app.use(express.static(angularDistPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(angularDistPath, 'index.html'));
});*/
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());


// Rutas 
app.use(require('./routes/estudiantes/estudiante'));
app.use(require('./routes/progreso-estudiante/quizz'));
app.use(require('./routes/progreso-estudiante/tareas'));
app.use(require('./routes/representantes/representante'));
app.use(require('./routes/notificaciones/notificaciones'));
app.use(require('./routes/tutores/tutor'));
app.use(require('./routes/segumientos-medicos/tratamientos-medicos/consulta'));
app.use(require('./routes/segumientos-medicos/tratamientos-medicos/cumplido'));
app.use(require('./routes/segumientos-medicos/tratamientos-medicos/nocumplido'));
app.use(require('./routes/segumientos-academicos/asignaturas/asignatura'));
app.use(require('./routes/segumientos-academicos/asignaturas/aprobada'));
app.use(require('./routes/segumientos-academicos/asignaturas/reprobada'));
app.use(require('./routes/segumientos-academicos/asignaturas/inscripcion'));
app.use(require('./routes/historial-medico/medico'));
app.use(require('./routes/historial-academico/academico'));




  
 /*server.listen(process.env.PORT, process.env.HOST, () => {
    console.log(`Servidor en ejecución en http://${process.env.HOST}:${process.env.PORT}`);
  });*/
/*server.listen(process.env.PORT, () => {
  console.log(`Sistema running on port ${process.env.PORT}`);
});*/



app.listen(process.env.PORT, () => console.log("Server is running on port 3000"))



/*server.listen(3000, () => {
  console.log(`Servidor en ejecución en http://localhost:3000`);
});*/

