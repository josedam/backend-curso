var express = require('express');
var bcrypt = require('bcryptjs');

var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

var Usuario = require('../models/usuario');

var app = express();

// Google ///////////////////////////////////////////////

var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}


/*******************************************
  Login Ingreso Google
********************************************/
app.post('/google', async(req, res) => {
    var token = req.body.token;

    var googleUser = await verify(token)
        .catch(err => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token No valido.',
            });
        })

    Usuario.findOne({ email: googleUser.email }, (err, usuario) => {
        console.log(err, usuario);
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error Buscando Usuario',
                errors: err
            });

        } else if (!usuario) {
            nuevoUsuarioFromGoogle(googleUser)
                .then(usuario => {
                    // Generar token
                    generarNuevoToken(usuario, res);
                })
                .catch(err => {
                    res.status(500).json({
                        ok: false,
                        mensaje: 'Error Grabacion de Usuario. ' + err,
                        errors: { message: 'Error Grabacion de Usuario. ' + err }
                    });

                });

        } else if (usuario.google === false) {
            res.status(400).json({
                ok: false,
                mensaje: 'Debe Usar su autenticacion Normal',
                errors: { message: 'Debe Usar su autenticacion Normal' }
            });

        } else {
            generarNuevoToken(usuario, res);
        }
    });
})

function nuevoUsuarioFromGoogle(googleUser) {
    return new Promise((resolve, reject) => {
        usuario = new Usuario();
        usuario.nombre = googleUser.nombre;
        usuario.email = googleUser.email;
        usuario.img = googleUser.img;
        usuario.password = ':)';
        usuario.google = true;
        usuario.save((err, nuevoUsuario) => {
            if (err) {
                reject(err);
            } else {
                nuevoUsuario.password = ':)';
                resolve(nuevoUsuario);
            }
        });
    });
}


/*******************************************
  Login Ingreso Normal
********************************************/
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
            generarNuevoToken(usuario, res);

        }
    });

});

function generarNuevoToken(usuario, res) {
    usuario.password = ':)';
    var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 864000 });

    res.status(200).json({
        ok: true,
        mensaje: 'Login correcto ',
        token: token,
        usuario
    });

};

module.exports = app;