/*

*/

var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

/************************************************
 *  TOKEN Validar
 ************************************************/
exports.validarToken = function(req, res, next) {

    var token = req.query.token;
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });

        } else {
            req.usuario = decoded.usuario;
            next();
        }

    })
};