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
 * Liquida pagamento de obrigação agendada
 ************************************************/
exports.payupPayment = async function (req, res) {
    util.debug(' payupPayment() ======================= ini\n',
        'req.body    => ', req.body, '\n',
        'req.decoded => ', req.decoded, '\n',
        'req.params  => ', req.params, '\n',
        'req.url     => ', req.url, '\n',
        'req.method  => ', req.method, '\n',
        'payupPayment() ======================= fim');

    let paymentId = req.params.id;
    let userId = req.decoded.id;
    let paymentVersion = new Date(Date.parse(req.body.version));
    let payDate = req.body.payDate !== undefined ? util.strBrlDateToDate(req.body.payDate) : undefined;
    await service.verifyPaymentId(paymentId)
        .then(async payment => service.verifyAccountId(payment.payDebitAccountId))
        .then(async account => service.verifyAuditorAccessByAccount({ account, userId }))
        .then(async accountGranted => {
            if (!accountGranted)
                throw new Object({ status: 405, message: `Erro ao localizar pagamento: [${paymentId}]` });

            let payment = await Payment.findByPk(paymentId);
            // Verifica se pagamento está pendente de liquidação...
            if (!payment.isPending)
                throw new Object({ status: 401, message: `O pagamento já estava liquidado.` });

            // Verifica versão do pagamento a ser liquidado...
            if (payment.version.getTime() !== paymentVersion.getTime())
                throw new Object({ status: 401, message: `Não foi possível liquidar o pagamento porque o dado estava defasado. [${JSON.stringify(payment.version).replace(/\"/g, '')} <> ${JSON.stringify(paymentVersion).replace(/\"/g, '')}]` });

            // Inicio da transação...
            try {
                await db.transaction(async transaction => {
                    await doPayup(paymentId, payDate, transaction)
                });// Commit
                // Fim da Transação!
                return res.status(200).send({ message: 'Pagamento realizado!' });
            } catch (err) { // RollBack
                return util.returnErr(err, res);
            };
        })
        .catch(err => util.returnErr(err, res));
}

async function doPayup(paymentId, payDate, transaction) {
    await Payment.findAll({
        where: { id: paymentId },
        include: [{
            model: PayShall,
            as: 'pay',
            required: true,
            include: [{
                model: Shall,
                as: 'sha',
                required: true,
                include: [{
                    model: Operation,
                    as: 'shaOperation',
                    required: true,
                    transaction
                }],
                transaction
            }],
            transaction
        }],
        transaction
    }).then(payments => payments.length > 0 ? payments[0] : null)
        .then(async payment => {
            // para cada obrigação associada...
            await payment.pay.forEach(async payshall => {
                // Liquida obrigação, debitando a conta de crédito conforme o tipo de operação...
                // 6 - oprDestinyAccount (cartão de crédito)
                // 7,8 - oprSourceAccount (conta de reserva)
                let accountId = payshall.sha.shaOperation.oprTypeId == 6 ?
                    payshall.sha.shaOperation.oprSourceAccountId :
                    payshall.sha.shaOperation.oprDestinyAccountId;
                await Balance.updateBalanceSubDestiny({
                    oprDestinyAccountId: accountId,
                    oprDate: payshall.sha.shaDate,
                    value: payshall.sha.value
                }, transaction);
                payshall.sha.isPending = false;
                payshall.sha.version = Date.now();
                await payshall.sha.save({ transaction });
            })

            // liquida pagamento, debitando a conta de débito...
            if (payDate) // Atualiza payDate se fornecido
                payment.payDate = payDate;
            await Balance.updateBalanceSubDestiny({
                oprDestinyAccountId: payment.payDebitAccountId,
                oprDate: payment.payDate,
                value: payment.value
            }, transaction);
            payment.isPending = false;
            payment.version = Date.now();
            // Após salvar o objeto principal conclui a transação, 
            // por isso tem que ser o último passo.
            await payment.save({ transaction });
        })

}

/*************************************************
 * Lista as obrigações associadas a um pagamento.
 ************************************************/
exports.listShallByPaymentId = async function (req, res) {
    util.debug(' listShallByPaymentId() ======================= ini\n',
        'req.body    => ', req.body, '\n',
        'req.decoded => ', req.decoded, '\n',
        'req.params  => ', req.params, '\n',
        'req.url     => ', req.url, '\n',
        'req.method  => ', req.method, '\n',
        'listShallByPaymentId() ======================= fim');

    let paymentId = req.params.id;
    let userId = req.decoded.id;
    await service.verifyPaymentId(paymentId)
        .then(async payment => service.verifyAccountId(payment.payDebitAccountId))
        .then(async account => service.verifyAuditorAccessByAccount({ account, userId }))
        .then(async accountGranted => {
            if (!accountGranted)
                return res.status(405).send({ message: `Erro ao localizar obrigações do pagamento: [${paymentId}]` });
            // Recupera obrigações associadas ao pagamento...
            let paymentShalls = await Payment.findAll({
                // attributes: ['pay'],
                where: { id: paymentId },
                include: [{
                    model: PayShall,
                    as: 'pay',
                    required: true,
                    // attributes: ['sha'],
                    include: [{
                        model: Shall,
                        as: 'sha',
                        required: true,
                        attributes: ['id', 'shallNr', 'shaDate', 'value', 'isPending', 'version']
                    }]
                }]
            });
            return res.status(200).send(paymentShalls[0].pay.map(payshall => payshall.sha));
        })
        .catch(err => util.returnErr(err, res));
}

/*************************************************
 * Recupera dados de pagamento
 ************************************************/
exports.getPaymentById = async function (req, res) {
    util.debug(' getPaymentById() ======================= ini\n',
        'req.body    => ', req.body, '\n',
        'req.decoded => ', req.decoded, '\n',
        'req.params  => ', req.params, '\n',
        'req.url     => ', req.url, '\n',
        'req.method  => ', req.method, '\n',
        'getPaymentById() ======================= fim');

    let paymentId = req.params.id;
    let userId = req.decoded.id;
    await service.verifyPaymentId(paymentId)
        .then(async payment => service.verifyAccountId(payment.payDebitAccountId))
        .then(async account => service.verifyAuditorAccessByAccount({ account, userId }))
        .then(async accountGranted => {
            if (!accountGranted)
                return res.status(405).send({ message: `Erro ao localizar pagamento: [${paymentId}]` });
            // Recupera pagamento...
            let payment = await Payment.findByPk(paymentId);
            return res.status(200).send(payment);
        })
        .catch(err => util.returnErr(err, res));
}

/*************************************************
 * Atualiza dados de pagamento
 ************************************************/
exports.updatePayment = async function (req, res) {
    util.debug(' updatePayment() ======================= ini\n',
        'req.body    => ', req.body, '\n',
        'req.decoded => ', req.decoded, '\n',
        'req.params  => ', req.params, '\n',
        'req.url     => ', req.url, '\n',
        'req.method  => ', req.method, '\n',
        'updatePayment() ======================= fim');

    if (!isIdValid(req.decoded.id) ||
        !isIdValid(req.params.id) ||
        !isIdValid(req.body.payDebitAccountId) ||
        !isDateValid(req.body.payDate) ||
        !isValueValid(req.body.value) ||
        !isBooleanValid(req.body.isPending) ||
        !isDateValid(req.body.version)) {
        console.log('isIdValid(req.body.shallId) = ', isIdValid(req.body.shallId));
        console.log('isIdValid(req.body.payDebitAccountId) = ', isIdValid(req.body.payDebitAccountId));
        console.log('isDateValid(req.body.payDate) = ', isDateValid(req.body.payDate));
        console.log('isValueValid(req.body.value) = ', isValueValid(req.body.value));
        console.log('isBooleanValid(req.body.isPending) = ', isBooleanValid(req.body.isPending));
        console.log('isDateValid(req.body.version) = ', isDateValid(req.body.version));
        return res.status(405).send({ message: `Erro ao tentar alter pagamento: [${req.params.id}].` });
    }

    let userId = req.decoded.id;
    let paymentId = req.params.id;
    let payDebitAccountId = req.body.payDebitAccountId;
    let payDate = req.body.payDate;
    let payValue = req.body.value;
    let payIsPending = req.body.isPending;
    let paymentVersion = new Date(Date.parse(req.body.version));

    await isAccountIdValidAndEditorAcessGranted(payDebitAccountId, userId)
        .then(async () => service.verifyPaymentId(paymentId))
        .then(async payment => {
            if (!payment)
                throw new Object({ status: 404, message: `Erro: Pagamento informado não foi localizado. [${paymentId}]` });

            // Verifica versão do pagamento a ser alterado...
            if (payment.version.getTime() !== paymentVersion.getTime())
                throw new Object({ status: 404, message: `Não foi possível alterar o pagamento porque o dado estava defasado. [${JSON.stringify(payment.version).replace(/\"/g, '')} <> ${JSON.stringify(paymentVersion).replace(/\"/g, '')}]` });

            // Inicio da transação...
            try {
                await db.transaction(async transaction => {
                    // Verifica se alterou o estado do pagamento: liquidado vs pendente
                    if (payment.isPending != payIsPending) {
                        if (payment.isPending) {
                            // Se estava pendente, liquida pagamento, não importa se
                            // mudou a data, valor ou a conta de débito...
                            payment.payDebitAccountId = payDebitAccountId;
                            payment.payDate = payDate;
                            payment.value = payValue;
                            await payup(payment, transaction);
                            // Continua para atualizar dados do pagamento...
                        } else {
                            // Se estava liquidado, estorna valores sem excluir o pagamento
                            await Payment.delete(payment, transaction, false);
                            // Continua para atualizar dados do pagamento...
                        }
                    } else {
                        // Se não alterou o estado do pagamento, estava liquidado, 
                        // alterou a conta de débito, a data ou o valor:
                        // estorna o débito anterior e contabiliza o novo.
                        if (!payment.isPending &&
                            (payment.payDebitAccountId != payDebitAccountId ||
                                payment.value != payValue ||
                                payment.payDate != payDate)) {
                            // Estorna o débito original...
                            await Balance.updateBalanceAddDestiny({
                                oprDestinyAccountId: payment.payDebitAccountId,
                                oprDate: payment.payDate,
                                value: payment.value
                            }, transaction);
                            // Contabiliza o novo débito...
                            await Balance.updateBalanceSubDestiny({
                                oprDestinyAccountId: payment.payDebitAccountId,
                                oprDate: payDate,
                                value: payValue
                            }, transaction);
                            // Continua para atualizar dados do pagamento...

                        } else {
                            // Pagamento pendente ou liquidado sem alteração... 
                            // Se pagamento sem alteração... Aborta!
                            if (payment.payDebitAccountId == payDebitAccountId &&
                                payment.value == payValue &&
                                payment.payDate == payDate) {
                                throw new Object({ status: 405, message: 'Erro: Operação não permitida. Sem alteração nos dados.' })
                            } else {
                                // Continua para atualizar dados do pagamento...
                            }
                        }
                    }
                    // Atualiza dados do pagamento
                    payment.payDebitAccountId = payDebitAccountId;
                    payment.payDate = payDate;
                    payment.value = payValue;
                    payment.isPending = payIsPending;
                    payment.version = Date.now();
                    await payment.save({ transaction });
                });// Commit
                // Fim da Transação!
                return res.status(200).send({ message: 'Pagamento alterado!' });
            } catch (err) { // RollBack
                return util.returnErr(err, res);
            };
        }).catch(err => util.returnErr(err, res));

}

/***********************************************
 * Liquidação de pagamento implica em:
 * - atualizar os saldos (balance) envolvidos na operação;
 * - alterar as obrigações (shall) para liquidadas.
 **********************************************/
async function payup(payment, transaction) {
    return new Promise(async (resolve, reject) => {
        // Se o pagamento estava pendente (não liquidado)...
        if (payment.isPending) {
            /***********************************************************
             * Localizar as obrigações (shall) e respectivas operações
             * associadas ao pagamento que será liquidado.
             * 
             * formato: 
             * - payShalls[] - array da associativa PayShall
             * - payShalls[].sha - registro Shall associado
             * - payShalls[].sha.shaOperation - registro Operation associado
             */
            let payShalls = await PayShall.findAll({
                where: { paymentId: payment.id },
                include: [{
                    model: Shall,
                    as: 'sha',
                    required: true,
                    include: [{
                        model: Operation,
                        as: 'shaOperation',
                        required: true
                    }],
                    transaction
                }],
                transaction
            });

            /***********************************************************
             * Para cada obrigação (shall), debitar os valores nas contas...
             * - de destino: para operação 6 (cartão de crédito);
             * - de origem: para as operações 7 e 8 se obrigação estava pendente. 
             * Debitar também o valor da obrigação na conta de débito
             * utilizada para pagamento.
             * 
             * Regras para liquidar cada shall.value na shall.shaDate:
             *   6 - débitos na operation.oprDestinyAccount e payment.payDebitAccount
             *   7 - débitos na operation.oprSourceAccount e payment.payDebitAccount
             *   8 - débitos na operation.oprSourceAccount e payment.payDebitAccount
             * 
             */
            payShalls.forEach(async payShall => {
                switch (payShall.sha.shaOperation.oprTypeId) {
                    case 6: // Pagamento com cartão de crédito
                        // realizar pagamento do cartão de crédito
                        await Balance.updateBalanceSubDestiny({
                            oprDestinyAccountId: payShall.sha.shaOperation.oprDestinyAccountId,
                            oprDate: payShall.sha.shaDate,
                            value: payShall.sha.value
                        }, transaction);
                        break;
                    case 7: // Pagamento agendado
                    case 8: // Despesa agendada
                        // realizar pagamento com recurso da conta de reserva financeira
                        await Balance.updateBalanceSubDestiny({
                            oprDestinyAccountId: payShall.sha.shaOperation.oprSourceAccountId,
                            oprDate: payShall.sha.shaDate,
                            value: payShall.sha.value
                        }, transaction);
                        break;
                }
                // Liquidar obrigação
                payShall.sha.isPending = false;
                payShall.sha.version = Date.now();
                await payShall.sha.save({ transaction });
            })

            /***********************************************************
             * Antes de liquidar o pagamento, realizar o débito na conta 
             * de recurso financeiro.
             */
            await Balance.updateBalanceSubDestiny({
                oprDestinyAccountId: payment.payDebitAccountId,
                oprDate: payment.payDate,
                value: payment.value
            }, transaction);

        } else {
            // !payment.isPending 
            reject({ status: 405, message: 'Pagamento já estava liquidado.' });
        }

        resolve(true);
    }).catch(err => reject(err.message));
}


/*************************************************
 * Exclui pagamento
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
                        throw new Object({ status: 401, message: `Não foi possível excluir o registro do pagamento porque o dado estava defasado. [${JSON.stringify(payment.version).replace(/\"/g, '')} <> ${JSON.stringify(paymentVersion).replace(/\"/g, '')}]` });
                    // - Excluir o pagamento (payment)
                    // - Reverter os saldos (balance)
                    // - Retornar as obrigações (shall) para pendente de pagamento
                    await Payment.delete(payment, transaction);
                });// Commit
                // Fim da Transação!
                return res.status(200).send({ message: 'Pagamento excluído!' });
            } catch (err) { // RollBack
                return util.returnErr(err, res);
            };
        })
        .catch(err => util.returnErr(err, res));
}

/*************************************************
 * Registra pagamento de obrigação agendada.
 ************************************************/
exports.addPayment = async function (req, res) {
    util.debug(' addPayment() ======================= ini\n',
        'req.body    => ', req.body, '\n',
        'req.decoded => ', req.decoded, '\n',
        'req.params  => ', req.params, '\n',
        'req.url     => ', req.url, '\n',
        'req.method  => ', req.method, '\n',
        'addPayment() ======================= fim');

    if (!isIdValid(req.body.shallId) ||
        !isIdValid(req.body.payDebitAccountId) ||
        !isDateValid(req.body.payDate) ||
        !isValueValid(req.body.value) ||
        !isDateValid(req.body.version)) {
        console.log('isIdValid(req.body.shallId) = ', isIdValid(req.body.shallId));
        console.log('isIdValid(req.body.payDebitAccountId) = ', isIdValid(req.body.payDebitAccountId));
        console.log('isDateValid(req.body.payDate) = ', isDateValid(req.body.payDate));
        console.log('isValueValid(req.body.value) = ', isValueValid(req.body.value));
        console.log('isDateValid(req.body.version) = ', isDateValid(req.body.version));
        return res.status(405).send({ message: `Erro ao tentar realizar pagamento da obrigação: Obrigação=[${req.body.id}].` });
    }
    let userId = req.decoded.id;
    let shallId = req.body.shallId;
    let payDebitAccountId = req.body.payDebitAccountId;
    let payDate = req.body.payDate;
    let payValue = req.body.value;
    let shallVersion = new Date(Date.parse(req.body.version));

    await service.verifyShallId(shallId)
        .then(async shall => service.verifyOperationId(shall.shaOperationId))
        .then(async operation => isAccountIdValidAndEditorAcessGranted(operation.oprSourceAccountId || operation.oprDestinyAccountId, userId))
        .then(async () => isAccountIdValidAndEditorAcessGranted(payDebitAccountId, userId))
        .then(async accountGranted => {
            if (!accountGranted)
                throw new Object({ status: 405, message: `Erro ao tentar registrar pagamento: [${shallId}]` });

            // Verifica se está pendente de pagamento...
            let shall = await Shall.findByPk(shallId);
            if (!shall.isPending)
                throw new Object({ status: 401, message: `A obrigação já estava liquidada.` });

            // Verifica versão da obrigação a ser paga...
            if (shall.version.getTime() !== shallVersion.getTime())
                throw new Object({ status: 401, message: `Não foi possível registrar o pagamento porque o dado estava defasado. [${JSON.stringify(shall.version).replace(/\"/g, '')} <> ${JSON.stringify(shallVersion).replace(/\"/g, '')}]` });

            // Inicio da transação...
            try {
                await db.transaction(async transaction => {
                    await doPayment(shallId, payDebitAccountId, payDate, payValue, transaction);
                });// Commit
                // Fim da Transação!
                return res.status(201).send({ message: 'Pagamento registrado!' });
            } catch (err) { // RollBack
                return util.returnErr(err, res);
            };
        }).catch(err => util.returnErr(err, res));
}

async function doPayment(shallId, payDebitAccountId, payDate, payValue, transaction) {
    return new Promise(async (resolve, reject) => {
        // Recupera obrigação...
        let shall = await Shall.findOne({
            where: { id: shallId },
            include: [{
                model: PayShall,
                as: 'sha',
                required: false,
                include: [{
                    model: Payment,
                    as: 'pay',
                    required: false,
                    transaction
                }],
                transaction
            }],
            transaction
        });

        console.log('============ shall => ', shall);
        // Verificar se já existe pagamento registrado e pendente de liquidação
        if (shall.sha.length > 0) {
            let payment = shall.sha[0].pay[0];
            if (payment.isPending) {
                // Atualizar o pagamento (liquidando na data e valor informado)
                payment.isPending = false;
                payment.payDebitAccountId = payDebitAccountId;
                payment.payDate = payDate;
                payment.value = payValue;
                payment.version = Date.now();
                await payment.save({ transaction });
            } else {
                reject({ status: 401, message: 'Obrigação já estava liquidada.' });
            }
        } else {
            // Registrar o pagamento (liquidado)
            let payment = await Payment.create({
                payDebitAccountId,
                payDate,
                value: payValue,
                isPending: false,
                version: Date.now()
            }, { transaction });
            // Registra associação do pagamento com a obrigação
            await PayShall.create({
                shallId,
                paymentId: payment.id,
                version: Date.now()
            }, { transaction });
        }

        // Atualizar os saldos
        // liquida pagamento, debitando a conta de débito...
        await Balance.updateBalanceSubDestiny({
            oprDestinyAccountId: payDebitAccountId,
            oprDate: payDate,
            value: payValue
        }, transaction);

        // Liquida obrigação, debitando a conta de crédito conforme o tipo de operação...
        // 6 - oprDestinyAccount (cartão de crédito)
        // 7,8 - oprSourceAccount (conta de reserva)
        let operation = await Operation.findOne({
            where: { id: shall.shaOperationId },
            transaction
        });
        let accountId = operation.oprTypeId == 6 ?
            operation.oprSourceAccountId :
            operation.oprDestinyAccountId;
        await Balance.updateBalanceSubDestiny({
            oprDestinyAccountId: accountId,
            oprDate: shall.shaDate,
            value: shall.value
        }, transaction);

        // Atualiza Obrigação (último evento da transação)
        shall.isPending = false;
        shall.version = Date.now();
        await shall.save({ transaction });
        resolve(true);
    });
}

// ==============================================================
// Validação de Campos
// ==============================================================

function isIdValid(id) {
    // Verificar faixa do código de tipo de operação
    return !(id === undefined || isNaN(id) || id <= 0);
}

function isBooleanValid(bool) {
    // Verificar faixa do código de tipo de operação
    return !(bool === undefined || typeof bool != 'boolean');
}

function isDateValid(strBrlDate) {
    // não permitir data de operação inválida, ou inferior à 1900
    return !(strBrlDate === undefined ||
        isNaN(Date.parse(strBrlDate)) ||
        Date.parse(strBrlDate) < Date.parse("1900-01-01"));
}

function isValueValid(value) {
    // não permitir operação com valor nulo
    return !(value === undefined || isNaN(value) || value == 0);
}

function isAccountIdValidAndEditorAcessGranted(accountId, userId) {
    // validar acesso de editor no plano de conta da conta
    return new Promise(async (resolve, reject) => {
        if (accountId === undefined || isNaN(accountId) || isNaN(userId))
            resolve(false)
        else
            await service.verifyAccountId(accountId)
                .then(account => {
                    service.verifyEditorAccessByAccount({ account, userId })
                        .then(accountGranted => {
                            // Retorna conta para poder validar o tipo
                            resolve(accountGranted);
                        })
                })
                .catch(err => reject(err))
    })
}
