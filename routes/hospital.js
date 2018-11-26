/*

*/

var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');

var Hospital = require('../models/hospital');

var app = express();


/************************************************
 *  GET leer todos los hospitales 
 ************************************************/
app.get('/', (req, res, next) => {
    var desde = req.query.desde ? parseInt(req.query.desde) : 0;
    var porPag = req.query.porPag ? parseInt(req.query.porPag) : 10;

    Hospital.find({})
        .skip(desde)
        .limit(porPag)
        .populate('usuario', 'nombre email')
        .exec((err, hospitales) => {
            if (err) {
                res.status(500).json({
                    ok: false,
                    mensaje: 'Error Cargando Hospitales',
                    errors: err
                });

            } else {
                Hospital.count({}, (err, total) => {
                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: total,
                        porPag: porPag,
                        desde: desde
                    });

                });
            }
        });
});



/************************************************
 *  PUT Actualizar un hospital 
 ************************************************/
app.put('/:id', mdAutenticacion.validarToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error Interno Recuperando hospital',
                errors: err
            });

        } else if (!hospital) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error hospital No Registrado [' + id + ']',
                errors: { message: 'Id no registrado [' + id + ']' }
            });

        } else {

            hospital.nombre = body.nombre;
            hospital.usuario = req.usuario._id;

            hospital.save((err, hospitalGuardado) => {
                if (err) {
                    res.status(400).json({
                        ok: false,
                        mensaje: 'Error Actualizando hospital',
                        errors: err
                    });

                } else {
                    res.status(200).json({
                        ok: true,
                        body: hospitalGuardado
                    });

                }
            });

        }
    });
});


/************************************************
 *  POST Crear un hospital 
 ************************************************/
app.post('/', mdAutenticacion.validarToken, (req, res) => {
    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error Creando hospital',
                errors: err
            });

        } else {
            res.status(201).json({
                ok: true,
                body: hospitalGuardado,
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
    Hospital.findByIdAndDelete(id, (err, hospitalBorrado) => {
        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error Eliminado hospital',
                errors: err
            });

        } else if (!hospitalBorrado) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error hospital Id No Registrado [' + id + ']',
                errors: { message: 'Id hospital no registrado [' + id + ']' }
            });

        } else {
            res.status(200).json({
                ok: true,
                body: hospitalBorrado,
                usuario: req.usuario
            });

        }
    });
});

module.exports = app;