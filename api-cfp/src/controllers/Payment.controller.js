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

/*************************************************
 * 
 ************************************************/
exports.payupPayment = async function (req, res) {
    res.status(200).send({ message: 'TO-DO' });
}

/*************************************************
 * 
 ************************************************/
exports.listShallByPaymentId = async function (req, res) {
    res.status(200).send({ message: 'TO-DO' });
}

/*************************************************
 * 
 ************************************************/
exports.getPaymentById = async function (req, res) {
    res.status(200).send({ message: 'TO-DO' });
}

/*************************************************
 * 
 ************************************************/
exports.updatePayment = async function (req, res) {
    res.status(200).send({ message: 'TO-DO' });
}

/*************************************************
 * 
 ************************************************/
exports.deletePayment = async function (req, res) {
    util.debug(' deletePayment() ======================= ini\n',
        'req.body    => ', req.body, '\n',
        'req.decoded => ', req.decoded, '\n',
        'req.params  => ', req.params, '\n',
        'req.url     => ', req.url, '\n',
        'req.method  => ', req.method, '\n',
        'deletePayment() ======================= fim');

    let paymentId = req.params.id;
    let userId = req.decoded.id;
    let paymentVersion = new Date(Date.parse(req.body.version));
    await service.verifyPaymentId(paymentId)
        .then(async payment => service.verifyAccountId(payment.payDebitAccountId))
        .then(async account => service.verifyEditorAccessByAccount({ account, userId }))
        .then(async accountGranted => {
            if (!accountGranted)
                return res.status(405).send({ message: `Erro ao tentar excluir pagamento: [${paymentId}]` });
            // Inicio da transação...
            try {
                await db.transaction(async transaction => {
                    // Recupera pagamento...
                    let payment = await Payment.findByPk(paymentId);
                    if (payment.version.getTime() !== paymentVersion.getTime())
                        return util.returnErr({ status: 403, message: `Não foi possível excluir o registro do pagamento porque o dado estava defasado. [${JSON.stringify(payment.version).replace(/\"/g, '')} <> ${JSON.stringify(paymentVersion).replace(/\"/g, '')}]` }, res);
                    // - Excluir o pagamento (payment)
                    // - Reverter os saldos (balance)
                    // - Retornar as obrigações (shall) para pendente de pagamento
                    await Payment.delete(payment, transaction);
                });// Commit
            } catch (err) { // RollBack
                return util.returnErr(err.message, res);
            };
            // Fim da Transação!
            return res.status(200).send({ message: 'Pagamento excluído!' });
        })
        .catch(err => util.returnErr(err.message, res));
}

/*************************************************
 * 
 ************************************************/
exports.addPayment = async function (req, res) {
    res.status(200).send({ message: 'TO-DO' });
}
