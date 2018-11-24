var express = require('express');
var bcrypt = require('bcryptjs');

var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

var Usuario = require('../models/usuario');

var app = express();

app.post('/', (req, res) => {
    var body = req.body;


    Usuario.findOne({ email: body.email }, (err, usuario) => {
        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error Buscando Usuario',
                errors: err
            });

        } else if (!usuario) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error en Credencial (email)',
                errors: { message: 'Error en Credencial (email)' }
            });

        } else if (!bcrypt.compareSync(body.password, usuario.password)) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error en Credencial (password)',
                errors: { message: 'Error en Credencial (password)' }
            });

        } else {

            // Generar token
            usuario.password = ':)';
            var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 });

            res.status(200).json({
                ok: true,
                mensaje: 'Login correcto ',
                token: token,
                id: usuario._id
            });

        }
    });

});

module.exports = app;