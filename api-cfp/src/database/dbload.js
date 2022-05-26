'use strict';
const logger = require('./../config/logger');
const AccessRule = require('../models/AccessRule');
const OperationType = require('../models/OperationType');
const User = require('../models/User');
const AccessGrant = require('../models/AccessGrant');
const Category = require('../models/Category');
const associations = require('../models/associations');

async function createDB() {
    const database = require('./db');
    await database.sync({ alter: true })
        .then(() => loadAccessRules())
        .then(() => loadOperationTypes())
        .catch(err => { logger.info(`Database sync error: ${err}`); });
}

createDB();

async function loadAccessRules() {
    await insertIfNotExistAccessRule(1, 'Proprietário');
    await insertIfNotExistAccessRule(2, 'Coautor');
    await insertIfNotExistAccessRule(3, 'Editor');
    await insertIfNotExistAccessRule(4, 'Auditor');
}

async function insertIfNotExistAccessRule(id, name, description = `${name} de controle financeiro`) {
    await AccessRule.findByPk(id)
        .then(async data => {
            if (!data) {
                await AccessRule.create({
                    id,
                    name,
                    description
                })
                    .then(newData => logger.info(`AccessRule '${newData.id} - ${newData.name}' inserted!`))
                    .catch(err => logger.info('Insert failure: ' + err));
            } else
                logger.info(`AccessRule '${data.id} - ${data.name}' previously loaded.`);
        })
        .catch(err => {
            logger.info(`FindByPk(${id}) failure: ${err}`)
        });
}

async function loadOperationTypes() {
    await insertIfNotExistOperationType(1, 'Receber crédito', 'Registrar recebimento de crédito em conta de recurso financeiro');
    await insertIfNotExistOperationType(2, 'Reservar valor', 'Reservar valor em conta de reserva financeira');
    await insertIfNotExistOperationType(3, 'Transferir valor', 'Registrar transferência valor entre contas de recurso financeiro');
    await insertIfNotExistOperationType(4, 'Transferir reserva', 'Transferir valor entre contas de reserva financeira');
    await insertIfNotExistOperationType(5, 'Pagar à vista', 'Registrar pagamento à vista');
    await insertIfNotExistOperationType(6, 'Pagar com cartão de crédito', 'Registrar pagamento efetuado com cartão de crédito');
    await insertIfNotExistOperationType(7, 'Agendar pagamento', 'Registrar pagamento a ser liquidado em data futura');
    await insertIfNotExistOperationType(8, 'Agendar despesa', 'Registrar previsão de pagamento a ser liquidado em data futura');
}

async function insertIfNotExistOperationType(id, name, description = name) {
    await OperationType.findByPk(id)
        .then(async data => {
            if (!data) {
                await OperationType.create({
                    id,
                    name,
                    description
                })
                    .then(newData => logger.info(`OperationType '${newData.id} - ${newData.name}' inserted!`))
                    .catch(err => logger.info('Insert failure: ' + err));
            } else
                logger.info(`OperationType '${data.id} - ${data.name}' previously loaded.`);
        })
        .catch(err => {
            logger.info(`FindByPk(${id}) failure: ${err}`)
        });
}

module.exports = createDB;