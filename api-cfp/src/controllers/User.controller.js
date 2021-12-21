'use strict';

const logerr = require("../config/logerr");
const User = require('../models/User');

const sanitizeUser = (user) => {
    const { id, name, email, version } = user
    return { id, name, email, version }
}

exports.getUserById = async function (req, res) {
    await User.findByPk(req.params.id)
        .then(user => {
            if (!user)
                return sendErr({ status: 404, message: 'Usuário não localizado.' }, res);
            else
                return res.status(200).send(sanitizeUser(user))
        })
        .catch(err => sendErr({ status: 500, message: `Erro ao buscar usuário ==> [${err}]` }, res));
}


exports.updateUserById = async function (req, res) {
    const user = req.body;
    if (!user)
        return sendErr({ status: 405, message: 'Erro: Dados não informados.' }, res);

    // Validar preenchimento de name, email e version
    if (!user.name || !user.email || !user.version)
        return sendErr({ status: 405, message: `Erro: Dados insuficientes. Necessário informar name(${user.name}), email(${user.email}) e version(${user.version}).` }, res);

    // Validar preenchimento do email no padrão
    // O email deve ser informado no formato mínimo contendo “login@dominio.raiz”, podendo ter subdomínios.
    if (!validEmail(user.email))
        return sendErr({ status: 405, message: `MSG004: O endereço de email deve ser informado com um formato válido. Email informado=[${user.email}]` }, res);

    // O usuário só pode alterar o próprio cadastro
    if (req.decoded.id != req.params.id)
        return sendErr({ status: 403, message: 'Acesso negado.' }, res);

    // Procurar o usuário que será alterado
    await User.findByPk(req.params.id)
        .then(async currentUser => {
            if (!currentUser)
                return sendErr({ status: 404, message: 'Usuário não localizado.' }, res);

            // Verifica se a versão do registro no BD ainda é a mesma
            if (new Date(user.version).getTime() != new Date(currentUser.version).getTime())
                // Registro com versão diferente, retorna o dado do BD
                return res.status(405).send(sanitizeUser(currentUser));

            // Tenta atualizar, verifica se deu erro porque não pode ser com endereço já cadastrado
            currentUser.name = user.name;
            currentUser.email = user.email;
            currentUser.version = Date.now();
            currentUser.version = currentUser.version - (currentUser.version % 1000);
            await currentUser.save()
                .then(updatedUser => res.status(200).send(sanitizeUser(updatedUser))
                    , err => sendErr({ status: 405, message: `Dados invalidos: [${err.original.text}]` }, res))
                .catch(err => sendErr({ status: 500, message: `Erro ao atualizar usuário ==> [${err}]` }, res));
        })
        .catch(err => sendErr({ status: 500, message: `Erro ao buscar usuário ==> [${err}]` }, res));
}

function validEmail(email) {
    return /^[\w+.]+@\w+\.\w{2,}(?:\.\w{2})?$/.test(email)
}
// https://stackoverflow.com/questions/47570410/how-to-round-off-to-only-seconds-remove-milliseconds/69653557#69653557
// https://stackoverflow.com/a/69653557/17205803

function sendErr(err, res) {
    if (!err.status)
        res.status(500).send(logerr(err))
    else
        res.status(err.status).send(logerr(err.message));
}