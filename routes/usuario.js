/*

*/

var express = require('express');
var bcrypt = require('bcryptjs');
var mdAutenticacion = require('../middlewares/autenticacion');

var Usuario = require('../models/usuario');

var app = express();

/************************************************
 *  GET leer todos los usuarios 
 ************************************************/
app.get('/', (req, res, next) => {
    Usuario.find({}, 'nombre email role img')
        .exec((err, usuarios) => {
            if (err) {
                res.status(500).json({
                    ok: false,
                    mensaje: 'Error Cargando Usuarios',
                    errors: err
                });

            } else {
                res.status(200).json({
                    ok: true,
                    usuarios: usuarios
                });
            }
        });
});



/************************************************
 *  PUT Actualizar un usuario 
 ************************************************/
app.put('/:id', mdAutenticacion.validarToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error Interno Recuperando Usuario',
                errors: err
            });

        } else if (!usuario) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error Usuario Id No Registrado [' + id + ']',
                errors: { message: 'Id no registrado [' + id + ']' }
            });

        } else {

            usuario.nombre = body.nombre;
            usuario.email = body.email;
            usuario.role = body.role;

            usuario.save((err, usuarioGuardado) => {
                if (err) {
                    res.status(400).json({
                        ok: false,
                        mensaje: 'Error Actualizando Usuarios',
                        errors: err
                    });

                } else {
                    usuarioGuardado.password = ':)';

                    res.status(200).json({
                        ok: true,
                        body: usuarioGuardado
                    });

                }
            });

        }
    });
});


/************************************************
 *  POST grabar un usuario 
 ************************************************/
app.post('/', mdAutenticacion.validarToken, (req, res) => {
    var body = req.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error Creando Usuarios',
                errors: err
            });

        } else {
            res.status(201).json({
                ok: true,
                body: usuarioGuardado,
                usuario: req.usuario
            });

        }
    });
});

/************************************************
 *  DELETE Borrar un usuario 
 ************************************************/
app.delete('/:id', mdAutenticacion.validarToken, (req, res) => {
    var id = req.params.id;
    Usuario.findByIdAndDelete(id, (err, usuarioBorrado) => {
        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error Eliminado Usuario',
                errors: err
            });

        } else if (!usuarioBorrado) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error Usuario Id No Registrado [' + id + ']',
                errors: { message: 'Id no registrado [' + id + ']' }
            });

        } else {
            res.status(200).json({
                ok: true,
                body: usuarioBorrado
            });

        }
    });
});


module.exports = app;