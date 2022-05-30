'use strict';
require('dotenv').config();
const util = require('../models/util');
const service = require('../models/service');
const db = require('./../database/db');
const { Op } = require('sequelize');
const categoryController = require('./Category.controller');

const AccessGrant = require('../models/AccessGrant');
const AccessRule = require('../models/AccessRule');
const Balance = require('../models/Balance');
const Category = require('../models/Category');
const User = require('../models/User');
const logerr = require('../config/logerr');
const loginfo = require('../config/loginfo');
const Shall = require('../models/Shall');
const Operation = require('../models/Operation');
const Account = require('../models/Account');
const Payment = require('../models/Payment');


/*************************************************************
 * Recupera soma total do saldo no mês das contas de recurso 
 * financeiro do plano de contas do proprietário.
 */
exports.getMonthFundsByOwnerId = async function (req, res) {
    util.debug(' getMonthFundsByOwnerId() ======================= ini\n',
        'req.body    => ', req.body, '\n',
        'req.decoded => ', req.decoded, '\n',
        'req.params  => ', req.params, '\n',
        'req.url     => ', req.url, '\n',
        'req.method  => ', req.method, '\n',
        'getMonthFundsByOwnerId() ======================= fim');

    const userId = req.decoded.id;
    const ownerId = req.params.ownerId;
    const yearMonth = req.params.yearMonth;
    // Verifica se os parâmetros informados são válidos e se usuário
    // tem acesso de consulta/auditor ao plano de contas.
    if (util.isYearMonthValid(yearMonth) && !isNaN(ownerId) &&
        (AccessRule.isAuditor(await AccessGrant.getUserProfileInOwnerCFP(userId, ownerId)))) {
        // Localizar as categorias de Recurso Financeiro
        Category.findAll({ where: { catOwnerId: ownerId, isCredit: false } })
            .then(async categories => {
                // Somar os saldos de cada categoria
                let totalBalance = 0;
                for (let i = 0; i < categories.length; i++) {
                    let balance = await categoryController
                        .getBalanceByMonth(categories[i], yearMonth);
                    totalBalance = totalBalance + balance;
                    console.log('FUNDOS ======== Category: ', categories[i].name, '   ====  Saldo ==> ', balance);
                };
                // PROBLEMA: forEach não espera...
                // categories.forEach(async category => {
                //     let balance = await categoryController
                //         .getBalanceByMonth(category, yearMonth);
                //     totalBalance = totalBalance + balance;
                //     console.log('FUNDOS ======== Category: ', category.name, '   ====  Saldo ==> ', balance);
                // });
                console.log('FUNDOS ======== SALDO TOTAL: ', totalBalance);
                return res.status(200).send({ value: totalBalance });
            })
            .catch(err => util.returnErr(err, res));
    } else {
        util.returnErr({ message: 'Erro: parâmetros inválidos.' }, res)
    }
}

/*************************************************************
 * Recupera soma total das obrigações pendentes no mês no plano 
 * de contas do proprietário.
 */
exports.getMonthPendingsByOwnerId = async function (req, res) {
    util.debug(' getMonthPendingsByOwnerId() ======================= ini\n',
        'req.body    => ', req.body, '\n',
        'req.decoded => ', req.decoded, '\n',
        'req.params  => ', req.params, '\n',
        'req.url     => ', req.url, '\n',
        'req.method  => ', req.method, '\n',
        'getMonthPendingsByOwnerId() ======================= fim');

    const userId = req.decoded.id;
    const ownerId = req.params.ownerId;
    const yearMonth = req.params.yearMonth;
    // Verifica se os parâmetros informados são válidos e se usuário
    // tem acesso de consulta/auditor ao plano de contas.
    if (util.isYearMonthValid(yearMonth) && !isNaN(ownerId) &&
        (AccessRule.isAuditor(await AccessGrant.getUserProfileInOwnerCFP(userId, ownerId)))) {
        // Localizar as categorias de Reserva Financeira e Cartão de Crédito
        await Category.findAll({ where: { catOwnerId: ownerId, isCredit: true } })
            .then(async categories => {
                // Somar as obrigações pendentes em cada categoria
                let totalPendings = 0;
                for (let i = 0; i < categories.length; i++) {
                    let pendings = await categoryController
                        .getPendingsByMonth(categories[i].id, categories[i].isCredit, yearMonth);
                    totalPendings = totalPendings + pendings;
                    console.log('OBRIGACOES ======== Category: ', categories[i].name, '   ====  Obrigações ==> ', pendings);
                };
                console.log('OBRIGACOES ======== VALOR TOTAL: ', totalPendings);
                return res.status(200).send({ value: totalPendings });
            })
            .catch(err => util.returnErr(err, res));
    } else {
        util.returnErr({ message: 'Erro: parâmetros inválidos.' }, res)
    }
}
