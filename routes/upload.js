/*

*/

var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');


var app = express();

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    if (!req.files) {
        res.status(400).json({
            ok: false,
            mensaje: 'Error Sin Archivo Seleccionado',
            errors: { message: 'Debe seleccionar un archivo' }
        });
        return;
    };

    var tipo = req.params.tipo;
    var id = req.params.id;

    // El nombre del archivo (imagen) es el asignado en el envio
    var archivo = req.files.imagen;
    var cortes = archivo.name.split('.');
    var extensionArchivo = cortes[cortes.length - 1];

    // Validar tipos de entidad 
    var tiposValidos = ['medico', 'hospital', 'usuario'];
    if (tiposValidos.indexOf(tipo) < 0) {
        res.status(400).json({
            ok: false,
            mensaje: 'Tipo de entidad incorrecta',
            errors: { message: 'Tipos Soportados: [' + tiposValidos.join(', ') + ']' }
        });
        return;

    }

    // Validar Extenccion del archivo 
    var extensionesValidas = ['jpg', 'gif', 'png', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        res.status(400).json({
            ok: false,
            mensaje: 'Extension no Valida',
            errors: { message: 'Extensiones Soportadas: [' + extensionesValidas.join(', ') + ']' }
        });
        return;
    };

    // Mover archivo subido al path 
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, (err) => {
        if (err) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error al Guardar Archivo subido',
                errors: { message: 'Error al Guardar Archivo subido' }
            });
            return;
        }
        subirPorTipoGenerico(tipo, id, nombreArchivo, res);

    })
});



function entidadFromTipo(tipo) {
    return new Promise((resolve, reject) => {
        switch (tipo) {
            case 'usuario':
                resolve(Usuario);
                break;
            case 'hospital':
                resolve(Hospital);
                break;
            case 'medico':
                resolve(Medico);
                break;
            default:
                reject(`Tipo [${tipo}] no Implementado - Upload`);
                break;
        }
    });
}

function subirPorTipoGenerico(tipo, id, nombreArchivo, res) {
    entidadFromTipo(tipo)
        .then(entidad => {
            actualizarEntidad(entidad, tipo, id, nombreArchivo, res);
        })
        .catch(err => {
            return res.status(400).json({
                ok: false,
                mensaje: err,
                errors: { message: err }
            });

        })
};


function actualizarEntidad(entidad, tipo, id, nombreArchivo, res) {
    entidad.findById(id, (err, dato) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: `${tipo} Error en Lectura `,
                errors: { message: `${tipo} Error en Lectura  ` }
            });

        }
        if (!dato) {
            return res.status(400).json({
                ok: false,
                mensaje: `${tipo} No Registrado `,
                errors: { message: `${tipo} No Registrado` }
            });

        }

        if (dato.password) {
            dato.password = ':)';
        }

        if (dato.img) {
            let pathViejo = `./uploads/${tipo}/${dato.img}`;
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
        }

        dato.img = nombreArchivo;
        dato.save((err, datoActualizado) => {
            if (err) {
                res.status(500).json({
                    ok: false,
                    mensaje: `Error Actualizando ${tipo}`,
                    errors: { message: `Error Actualizando ${tipo}` }
                });
                return;
            }

            res.status(200).json({
                ok: true,
                mensaje: 'Peticion realizada correctamente...',
                [tipo]: datoActualizado
            });

        })
    })

};

module.exports = app;