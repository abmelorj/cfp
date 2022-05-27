'use strict';
const service = require('../models/service');
const util = require('../models/util');
const { Op } = require('sequelize');
const db = require('./../database/db');
const Operation = require('../models/Operation');
const Balance = require('../models/Balance');
const Shall = require('../models/Shall');
const Payment = require('../models/Payment');
const PayShall = require('../models/PayShall');

/********************************************************
 * Recupera pagamento relacionado à obrigação.
 *******************************************************/
exports.getPaymentByShallId = async function (req, res) {
    util.debug(' getPaymentByShallId() ======================= ini\n',
        'req.body    => ', req.body, '\n',
        'req.decoded => ', req.decoded, '\n',
        'req.params  => ', req.params, '\n',
        'req.url     => ', req.url, '\n',
        'req.method  => ', req.method, '\n',
        'getPaymentByShallId() ======================= fim');

    let shallId = req.params.id;
    let userId = req.decoded.id;
    await service.verifyShallId(shallId)
        .then(async shall => service.verifyOperationId(shall.shaOperationId))
        .then(async operation => service.verifyAccountId(operation.oprSourceAccountId || operation.oprDestinyAccountId))
        .then(async account => service.verifyAuditorAccessByAccount({ account, userId }))
        .then(async accountGranted => {
            if (!accountGranted)
                return res.status(405).send({ message: `Erro ao localizar pagamento da obrigação: [${shallId}]` });
            // Recupera pagamento...
            let shallFound = await Shall.findAll({
                where: { id: shallId },
                include: [{
                    model: PayShall,
                    as: 'sha',
                    required: true,
                    include: [{
                        model: Payment,
                        as: 'pay',
                        required: true
                    }]
                }]
            });
            let payshall = null;
            if (shallFound != null && shallFound.length > 0) {
                payshall = await shallFound[0].sha;
            }
            let payment = null;
            if (payshall != null) {
                payment = await payshall[0].pay;
            }
            // Mesmo que não exista pagamento associado, retorna status 200
            return res.status(200).send(payment);
        })
        .catch(err => util.returnErr(err, res));
}

/********************************************************
 * 
 *******************************************************/
exports.payUpShallById = async function (req, res) {
    res.status(200).send({ message: 'TO-DO' });
}

/********************************************************
 * Retorna obrigação
 *******************************************************/
exports.getShallById = async function (req, res) {
    util.debug(' getShallById() ======================= ini\n',
        'req.body    => ', req.body, '\n',
        'req.decoded => ', req.decoded, '\n',
        'req.params  => ', req.params, '\n',
        'req.url     => ', req.url, '\n',
        'req.method  => ', req.method, '\n',
        'getShallById() ======================= fim');

    let shallId = req.params.id;
    let userId = req.decoded.id;
    await service.verifyShallId(shallId)
        .then(async shall => service.verifyOperationId(shall.shaOperationId))
        .then(async operation => service.verifyAccountId(operation.oprSourceAccountId || operation.oprDestinyAccountId))
        .then(async account => service.verifyAuditorAccessByAccount({ account, userId }))
        .then(async accountGranted => {
            if (!accountGranted)
                return res.status(405).send({ message: `Erro ao localizar obrigação: [${shallId}]` });
            // Recupera obrigação...
            let shallFound = await Shall.findOne({ where: { id: shallId } });
            return res.status(200).send(shallFound);
        })
        .catch(err => util.returnErr(err, res));
}

/********************************************************
 * 
 *******************************************************/
exports.updateShallById = async function (req, res) {
    res.status(200).send({ message: 'TO-DO' });
}
