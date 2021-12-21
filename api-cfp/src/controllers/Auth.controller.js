'use strict';
require('dotenv').config();
const logerr = require("../config/logerr");
const User = require('../models/User');
const AccessGrant = require('../models/AccessGrant');
const authSecret = process.env.AUTH_SECRET || 'Default';
const jwt = require('jsonwebtoken');
const loginfo = require('../config/loginfo');

const userSignin = async (req, res, next) => {
    debug(' userSignin() ================================\n',
        'req.body ==> ', req.body, '\n',
        'userSignin() ================================');

    const user = req.body;
    if (!user || !user.email || !user.hash)
        return res.status(405).send(logerr('Erro: Dados não informados.'));

    await User.findByEmail(user.email)
        .then(async (userFound) => {
            if (userFound != null && userFound.hash == user.hash) {
                // Usuário autentico
                const { id, name, email, version } = userFound;
                const userAuth = { id, name, email, version }
                const token = jwt.sign(userAuth, authSecret, { expiresIn: '1 day' });
                return res.status(201).send({ id, name, email, version, token, valid: true });
            } else {
                // Credencial invalida
                return res.status(404).send(logerr('Erro: Acesso não autorizado.'));
            }
        },
            err => res.status(405).send(logerr(`Erro: Dados invalidos. [${err.original.text}]`)))
}

const validateToken = (req, res, next) => {
    debug(' validateToken() ================================\n',
        'req.body ==> ', req.body, '\n',
        'validateToken() ================================');

    // Função auxiliar para retornar mensagem quando for token inválido!
    const invalidToken = () => res.status(404).send(logerr('Erro: Token inválido.'));
    // Verifica se recebeu o token...
    if (!req.body.token) return invalidToken();
    // Valida o token...
    const token = req.body.token || ''
    jwt.verify(token, authSecret, async function (err, decoded) {
        if (!err) {
            const { id, name, email, version } = decoded
            // Verifica se o usuário do token é válido...
            await User.findByEmail(email)
                .then(user => user == null ? invalidToken() : res.status(200).send({ id, name, email, version, token, valid: true })
                    , () => invalidToken())
        } else return invalidToken();
    })
}

const userSignup = async (req, res, next) => {
    debug(' userSignup() ================================ ini\n',
        'req.body ==> ', req.body, '\n',
        'userSignup() ================================ fim');

    let user = req.body;
    if (!user)
        return res.status(405).send(logerr('Erro: Dados não informados.'));

    // Validar preenchimento de name, email e hash
    if (!user.name || !user.email || !user.hash ||
        user.name === '' || user.email === '' || user.hash === '')
        return res.status(405).send(logerr(`Erro: Dados insuficientes. Necessário informar name(${user.name}), email(${user.email}) e hash(${user.hash}).`));

    // Validar preenchimento do email no padrão
    // O email deve ser informado no formato mínimo contendo “login@dominio.raiz”, podendo ter subdomínios.
    if (!validEmail(user.email))
        return res.status(405).send(logerr(`MSG004: O endereço de email deve ser informado com um formato válido. Email informado=[${user.email}]`));

    // TODO: Verificar se .then() aninhado está sendo suportado pelo async/await e não está deixando de retornar algum valor esperado
    // Se o endereço de email já está registrado, retorna erro 409
    await User.findByEmail(user.email)
        .then(async (userFound) => {
            debug('userFound ==> ', userFound)
            if (userFound == undefined) {
                // Tenta inserir, e verifica se deu erro porque não pode ser com endereço já cadastrado
                user.version = Date.now();
                user.version = user.version - (user.version % 1000);
                await User.create(user)
                    .then(async newUser => {
                        // Insere registro de proprietário do próprio plano de contas
                        const grant = {
                            agOwnerId: newUser.id,
                            agGrantedUserId: newUser.id,
                            agAccessRuleId: 1,
                            version: newUser.version
                        };
                        await AccessGrant.create(grant)
                            // Tratar a criação do token de sessão de autenticação do usuário registrado
                            .then(() => userSignin(req, res, next)
                                , err => res.status(405).send(logerr(`Dados invalidos: [${err.original.text}]`)))
                            .catch(err => res.status(500).send(logerr(`Erro ao registrar acesso do usuário ==> [${err}]`)));
                    },
                        err => res.status(405).send(logerr(`Dados invalidos: [${err.original.text}]`)))
                    .catch(err => res.status(500).send(logerr(`Erro ao registrar usuário ==> [${err}]`)));
            } else {
                return res.status(409).send(logerr(`Erro: Usuário (${user.email}) já registrado.`));
            }
        }, reason => res.status(500).send(logerr(`Erro: Dados inválidos. ${reason}`)))
        .catch(err => res.status(500).send(logerr(`Erro ao verificar existência do usuário ==> [${err}]`)));
}

function validEmail(email) {
    return /^[\w+.]+@\w+\.\w{2,}(?:\.\w{2})?$/.test(email)
}

const debug = (...msg) => {
    if ((process.env.DEBUG || 'false') == 'true')
        return console.log(...msg);
}

module.exports = { userSignin, validateToken, userSignup }