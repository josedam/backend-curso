// requires
var express = require('express');
var mongoose = require('mongoose');

// iniciar variables
var app = express();

// Data Base
mongoose.connection.openUri('mongodb://localhost:27017', (err, res) => {
    if (err) throw err;
    console.log('Data Base : \x1b[32m%s\x1b[0m', 'On line');
})

// rutas
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente...'
    });
})

// ecuchar peticiones
app.listen(3000, () => {
    console.log('Servidor puerto 3000: \x1b[32m%s\x1b[0m', 'On line');
})