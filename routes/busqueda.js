/*

*/

var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

/*
  Busqueda por COLECCION
*/
app.get('/todo/coleccion/:tabla/:busqueda', (req, res, next) => {
    var tabla = req.params.tabla
    var busqueda = req.params.busqueda;
    var regex = RegExp(busqueda, 'i');
    var promesa

    switch (tabla) {
        case 'hospital':
            promesa = buscarHospitales(busqueda, regex);
            break;
        case 'medico':
            promesa = buscarMedicos(busqueda, regex);
            break;
        case 'usuario':
            promesa = buscarUsuarios(busqueda, regex);
            break;

        default:
            res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda validos son medico, hospital y usuario',
                errors: { message: 'Tipo de busqueda tabla/coleccion no valido...' }
            });
            return;
    }
    promesa.then(resultado => {
        res.status(200).json({
            ok: true,
            mensaje: 'Peticion realizada correctamente...',
            [tabla]: resultado
        });
    });

});

/*
  busqueda GENERAL
*/

app.get('/todo/:busqueda', (req, res, next) => {
    var busqueda = req.params.busqueda;
    var regex = RegExp(busqueda, 'i');


    Promise.all(
        [
            buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ])

    .then(resultados => {
        res.status(200).json({
            ok: true,
            mensaje: 'Peticion realizada correctamente...',
            hospitales: resultados[0],
            medicos: resultados[1],
            usuarios: resultados[2]
        });
    })
})

function buscarHospitales(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error Hospitales:' + err);
                } else {
                    resolve(hospitales);
                }
            });
    });
}

function buscarMedicos(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email ')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error Medicos:' + err);
                } else {
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuarios(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({ nombre: regex }, 'nombre email role')
            .populate('usuario', 'nombre email ')
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error Usuarios:' + err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}

module.exports = app;