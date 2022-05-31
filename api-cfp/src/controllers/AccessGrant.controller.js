'use strict';

const logerr = require("../config/logerr");
const AccessGrant = require('../models/AccessGrant');
const AccessRule = require('../models/AccessRule');

const sanitizeUser = (user) => {
    const { id, name, email, version } = user
    return { id, name, email, version }
}

const sanitizeEagerAccessGrant = (accessGrant) => {
    const {
        id,
        startDate,
        version,
        agOwnerId,
        agGrantedUserId,
        agAccessRuleId,
        agOwner,
        agGrantedUser,
        agAccessRule
    } = accessGrant
    return {
        id,
        startDate,
        version,
        agOwnerId,
        agGrantedUserId,
        agAccessRuleId,
        agOwner: sanitizeUser(agOwner),
        agGrantedUser: sanitizeUser(agGrantedUser),
        agAccessRule
    }
}

function validateFields(grant) {
    return new Promise((resolve, reject) => {
        if (!grant ||
            !grant.agOwnerId ||
            !grant.agGrantedUserId ||
            !grant.agAccessRuleId)
            reject({ status: 405, message: 'Erro: Dados inválidos.' })
        else
            resolve(grant);
    });
}

function verifyDuplicate(grant) {
    return new Promise(async (resolve, reject) => {
        await AccessGrant.findGrantByIds(grant.agOwnerId, grant.agGrantedUserId, grant.agAccessRuleId)
            .then(grantFound => {
                if (!grantFound || grantFound.length == 0)
                    resolve(grant)
                else
                    reject({ status: 409, message: 'Erro: Acesso já concedido.' })
            })
            .catch(err => sendErr(err, res));
    });
}

function insertAccessGrant(grant) {
    return new Promise((resolve, reject) => {
        grant.version = Date.now();
        grant.version = grant.version - (grant.version % 1000);
        // Se não setar a data aqui, neste primeiro momento retorna objeto com 'CURRENT_DATE'
        grant.startDate = grant.version;
        AccessGrant.create(grant)
            .then(newAccessGrant => {
                if (!newAccessGrant)
                    reject({ status: 500, message: 'Erro ao registrar acesso.' })
                else
                    resolve(newAccessGrant)
            })
    });
}

function sendErr(err, res) {
    if (!err.status)
        res.status(500).send(logerr(err))
    else
        res.status(err.status).send(logerr(err.message));
}

// Registra concessão de acesso ao controle financeiro pessoal.
exports.grantAccess = function (req, res) {
    return new Promise(async (resolve) => {
        if (AccessRule.isOwner(await AccessGrant.getUserProfileInOwnerCFP(req.decoded.id, req.body.agOwnerId)))
            validateFields(req.body)
                .then(verifyDuplicate)
                .then(insertAccessGrant)
                .then(newAccessGrant => resolve(res.status(201).send(newAccessGrant.dataValues)))
                .catch(err => sendErr(err, res))
        else
            return sendErr({ status: 401, message: 'Acesso negado.' }, res);
    });
}

// Revoga o acesso identificado na data corrente.
exports.revokeAccess = function (req, res) {
    if (!req.params.id)
        sendErr({ status: 405, message: 'Erro: Dados inválidos.' }, res)
    else
        return new Promise(async (resolve, reject) => {
            await AccessGrant.findByPk(req.params.id)
                .then(async grant => {
                    if (!grant)
                        reject({ status: 404, message: 'Erro: Acesso não identificado ou inválido' });
                    // Verificar se é o proprietário do CFP, neste caso poderia comparar: req.decoded.id = grant.agOwnerId
                    if (AccessRule.isOwner(await AccessGrant.getUserProfileInOwnerCFP(req.decoded.id, grant.agOwnerId))) {
                        grant.endDate = Date.now();
                        grant.version = Date.now();
                        grant.version = grant.version - (grant.version % 1000);
                        await grant.save()
                        return grant
                    } else return sendErr({ status: 401, message: 'Acesso negado.' }, res);
                })
                .then(revokedGrant => resolve(res.status(200).send(revokedGrant.dataValues)))
                .catch(err => sendErr(err, res));
        })
}

// Retorna array com a relação de acessos concedidos pelo proprietário identificado.
exports.listAccessGrantedByOwnerId = async function (req, res) {
    if (!req.params.id)
        sendErr({ status: 405, message: 'Erro: Dados inválidos.' }, res)
    else
        if (AccessRule.isAuditor(await AccessGrant.getUserProfileInOwnerCFP(req.decoded.id, req.params.id)))
            await AccessGrant.findByOwnerId(req.params.id)
                .then(grants => {
                    if (grants.length == 0)
                        return sendErr({ status: 404, message: 'Erro: Proprietário não identificado.' }, res)
                    else
                        return res.status(200).send(grants.map(grant => sanitizeEagerAccessGrant(grant)))
                },
                    reason => sendErr({ status: 500, message: 'Erro: outros erros. '.concat(reason) }, res))
                .catch(err => sendErr(err, res))
        else return sendErr({ status: 401, message: 'Acesso negado.' }, res);
}

// Retorna array com a relação de acessos concedidos ao usuário identificado.
exports.listAccessGrantedByUserId = async function (req, res) {
    if (!req.params.id)
        sendErr({ status: 405, message: 'Erro: Dados inválidos.' }, res)
    else
        if (AccessRule.isAuditor(await AccessGrant.getUserProfileInOwnerCFP(req.decoded.id, req.params.id)))
            await AccessGrant.findByGrantedUserId(req.params.id)
                .then(granted => {
                    if (granted.length == 0)
                        return sendErr({ status: 404, message: 'Erro: Usuário não localizado.' }, res)
                    else
                        return res.status(200).send(granted.map(grant => sanitizeEagerAccessGrant(grant)))
                },
                    reason => sendErr({ status: 500, message: 'Erro: outros erros. '.concat(reason) }, res))
                .catch(err => sendErr(err, res));
        else return sendErr({ status: 401, message: 'Acesso negado.' }, res);
}

