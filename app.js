// requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');


// iniciar variables
var app = express();

//app.use(express.json());
// body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// importar Rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');

// Data Base
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;
    console.log('Data Base : \x1b[32m%s\x1b[0m', 'On line');
})

// rutas
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);


// escuchar peticiones
app.listen(3000, () => {
    console.log('Servidor puerto 3000: \x1b[32m%s\x1b[0m', 'On line');
})