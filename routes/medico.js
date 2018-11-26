/*

*/
var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');

var Medico = require('../models/medico');

var app = express();


/************************************************
 *  GET leer todos los Medicos 
 ************************************************/
app.get('/', (req, res, next) => {
    var desde = req.query.desde ? parseInt(req.query.desde) : 0;
    var porPag = req.query.porPag ? parseInt(req.query.porPag) : 10;

    Medico.find({}, '')
        .skip(desde)
        .limit(porPag)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {
            if (err) {
                res.status(500).json({
                    ok: false,
                    mensaje: 'Error Cargando Medicos',
                    errors: err
                });

            } else {
                Medico.count({}, (err, total) => {
                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: total,
                        porPag: porPag,
                        desde: desde
                    });
                });
            }
        });
});



/************************************************
 *  PUT Actualizar un medico 
 ************************************************/
app.put('/:id', mdAutenticacion.validarToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error Interno Recuperando medico',
                errors: err
            });

        } else if (!medico) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error medico No Registrado [' + id + ']',
                errors: { message: 'Id no registrado [' + id + ']' }
            });

        } else {

            medico.nombre = body.nombre;
            medico.usuario = req.usuario._id;
            medico.hospital = body.hospital;

            medico.save((err, medicoGuardado) => {
                if (err) {
                    res.status(400).json({
                        ok: false,
                        mensaje: 'Error Actualizando medico',
                        errors: err
                    });

                } else {
                    res.status(200).json({
                        ok: true,
                        body: medicoGuardado
                    });

                }
            });

        }
    });
});


/************************************************
 *  POST grabar un medico 
 ************************************************/
app.post('/', mdAutenticacion.validarToken, (req, res) => {
    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error Creando medico',
                errors: err
            });

        } else {
            res.status(201).json({
                ok: true,
                body: medicoGuardado,
                usuario: req.usuario
            });

        }
    });
});

/************************************************
 *  DELETE Borrar un medico 
 ************************************************/
app.delete('/:id', mdAutenticacion.validarToken, (req, res) => {
    var id = req.params.id;
    Medico.findByIdAndDelete(id, (err, medicoBorrado) => {
        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error Eliminado medico',
                errors: err
            });

        } else if (!medicoBorrado) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error medico Id No Registrado [' + id + ']',
                errors: { message: 'Id medico no registrado [' + id + ']' }
            });

        } else {
            res.status(200).json({
                ok: true,
                body: medicoBorrado,
                usuario: req.usuario
            });

        }
    });
});

module.exports = app;