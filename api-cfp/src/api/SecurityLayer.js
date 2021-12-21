'use strict';
require('dotenv').config();
const authSecret = process.env.AUTH_SECRET || 'Default';
const jwt = require('jsonwebtoken')
const logerr = require('../config/logerr');

module.exports = (req, res, next) => {
    // CORS
    if (req.method === 'OPTIONS') {
        next()
    }
    else {
        const token = req.body.token || req.query.token || req.headers['authorization']
        if (!token) {
            return res.status(403).send(logerr('Somente acesso autenticado.'))
        }
        jwt.verify(token, authSecret, function (err, decoded) {
            if (err) {
                return res.status(403).send(logerr('Token inválido.'))
            } else {
                req.decoded = decoded
                // TODO: Implementar...
                // Identificar maior perfil de acesso do usuário no CFP requisitado
                // Verificar se atende ao requisito de acesso da operação
                if ((process.env.DEBUG || 'false') == 'true') {
                    console.log(
                        ' ==========================================================\n',
                        '#             N O V A    R E Q U I S I Ç Ã O             #\n',
                        '==========================================================\n',
                        'req.method        => ', req.method, '\n',
                        'req.originalUrl   => ', req.originalUrl, '\n',
                        'req.headers.token => ', req.headers['authorization'], '\n',
                        '----------------------------------------------------------\n',
                        'req.body    => ', req.body, '\n',
                        '----------------------------------------------------------\n',
                        'req.decoded => ', req.decoded, '\n',
                        '==========================================================');
                }
                next()
            }
        })
    }
}