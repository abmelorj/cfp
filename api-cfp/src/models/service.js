'use strict';
require('dotenv').config();
const util = require('./util');

const Account = require('./Account');
const AccessGrant = require('./AccessGrant');
const AccessRule = require('./AccessRule');
const Category = require('./Category');
const Operation = require('./Operation');
const OperationType = require('./OperationType');
const Payment = require('./Payment');
const Shall = require('./Shall');
const User = require('./User');

// ==============================================================
// Validar preenchimento do parametro: operationTypeId
// ==============================================================
exports.verifyOperationTypeId = function (operationTypeId) {
    util.debug(' verifyOperationTypeId() ======================= ini\n',
        'operationTypeId => ', operationTypeId, '\n',
        'verifyOperationTypeId() ======================= fim');

    return new Promise(async (resolve, reject) => {
        if (isNaN(operationTypeId))
            reject({ status: 405, message: `Erro: Dados inválidos. operationTypeId=[${operationTypeId}]` });
        await OperationType.findByPk(operationTypeId)
            .then(operationType => {
                if (!operationType)
                    reject({ status: 404, message: `Erro: Tipo de operação não localizada. operationTypeId=[${operationTypeId}]` });
                // operationTypeId válido
                resolve(operationType);
            })
            .catch(err => reject({ status: 405, message: `Erro: Dados inválidos. [${err}]` }));
    })
}

// ==============================================================
// Validar preenchimento do parametro: accessRuleId
// ==============================================================
exports.verifyAccessRuleId = function (accessRuleId) {
    util.debug(' verifyAccessRuleId() ======================= ini\n',
        'accessRuleId => ', accessRuleId, '\n',
        'verifyAccessRuleId() ======================= fim');

    return new Promise(async (resolve, reject) => {
        if (isNaN(accessRuleId))
            reject({ status: 405, message: `Erro: Dados inválidos. accessRuleId=[${accessRuleId}]` });
        await AccessRule.findByPk(accessRuleId)
            .then(accessRule => {
                if (!accessRule)
                    reject({ status: 404, message: `Erro: Perfil de acesso não localizado. accessRuleId=[${accessRuleId}]` });
                // accessRuleId válido
                resolve(accessRule);
            })
            .catch(err => reject({ status: 405, message: `Erro: Dados inválidos. [${err}]` }));
    })
}

// ==============================================================
// Validar preenchimento do parametro: accessGrantId
// ==============================================================
exports.verifyAccessGrantId = function (accessGrantId) {
    util.debug(' verifyAccessGrantId() ======================= ini\n',
        'accessGrantId => ', accessGrantId, '\n',
        'verifyAccessGrantId() ======================= fim');

    return new Promise(async (resolve, reject) => {
        if (isNaN(accessGrantId))
            reject({ status: 405, message: `Erro: Dados inválidos. accessGrantId=[${accessGrantId}]` });
        await AccessGrant.findByPk(accessGrantId)
            .then(accessGrant => {
                if (!accessGrant)
                    reject({ status: 404, message: `Erro: Concessão de acesso não localizada. accessGrantId=[${accessGrantId}]` });
                // accessGrantId válido
                resolve(accessGrant);
            })
            .catch(err => reject({ status: 405, message: `Erro: Dados inválidos. [${err}]` }));
    })
}

// ==============================================================
// Validar preenchimento do parametro: userId
// ==============================================================
exports.verifyUserId = function (userId) {
    util.debug(' verifyUserId() ======================= ini\n',
        'userId => ', userId, '\n',
        'verifyUserId() ======================= fim');

    return new Promise(async (resolve, reject) => {
        if (isNaN(userId))
            reject({ status: 405, message: `Erro: Dados inválidos. userId=[${userId}]` });
        await User.findByPk(userId)
            .then(user => {
                if (!user)
                    reject({ status: 404, message: `Erro: Usuário não localizado. userId=[${userId}]` });
                // userId válido
                resolve(user);
            })
            .catch(err => reject({ status: 405, message: `Erro: Dados inválidos. [${err}]` }));
    })
}

// ==============================================================
// Validar preenchimento do parametro: categoryId
// ==============================================================
exports.verifyCategoryId = function (categoryId) {
    util.debug(' verifyCategoryId() ======================= ini\n',
        'categoryId => ', categoryId, '\n',
        'verifyCategoryId() ======================= fim');

    return new Promise(async (resolve, reject) => {
        if (isNaN(categoryId))
            reject({ status: 405, message: `Erro: Dados inválidos. categoryId=[${categoryId}]` });
        await Category.findByPk(categoryId)
            .then(category => {
                if (!category)
                    reject({ status: 404, message: `Erro: Categoria não localizada. categoryId=[${categoryId}]` });
                // categoryId válido
                resolve(category);
            })
            .catch(err => reject({ status: 405, message: `Erro: Dados inválidos. [${err}]` }));
    })
}

// ==============================================================
// Validar preenchimento do parametro: accountId
// ==============================================================
exports.verifyAccountId = function (accountId) {
    util.debug(' verifyAccountId() ======================= ini\n',
        'accountId => ', accountId, '\n',
        'verifyAccountId() ======================= fim');

    return new Promise(async (resolve, reject) => {
        if (isNaN(accountId))
            reject({ status: 405, message: `Erro: Dados inválidos. accountId=[${accountId}]` });
        await Account.findByPk(accountId)
            .then(account => {
                if (!account)
                    reject({ status: 404, message: `Erro: Conta não localizada. accountId=[${accountId}]` });
                // accountId válido
                resolve(account);
            })
            .catch(err => reject({ status: 405, message: `Erro: Dados inválidos. [${err}]` }));
    })
}

// ==============================================================
// Validar preenchimento do parametro: operationId
// ==============================================================
exports.verifyOperationId = function (operationId) {
    util.debug(' verifyOperationId() ======================= ini\n',
        'operationId => ', operationId, '\n',
        'verifyOperationId() ======================= fim');

    return new Promise(async (resolve, reject) => {
        if (isNaN(operationId))
            reject({ status: 405, message: `Erro: Dados inválidos. operationId=[${operationId}]` });
        await Operation.findByPk(operationId)
            .then(operation => {
                if (!operation)
                    reject({ status: 404, message: `Erro: Operação não localizada. operationId=[${operationId}]` });
                // operationId válido
                resolve(operation);
            })
            .catch(err => reject({ status: 405, message: `Erro: Dados inválidos. [${err}]` }));
    })
}

// ==============================================================
// Validar preenchimento do parametro: shallId
// ==============================================================
exports.verifyShallId = function (shallId) {
    util.debug(' verifyShallId() ======================= ini\n',
        'shallId => ', shallId, '\n',
        'verifyShallId() ======================= fim');

    return new Promise(async (resolve, reject) => {
        if (isNaN(shallId))
            reject({ status: 405, message: `Erro: Dados inválidos. shallId=[${shallId}]` });
        await Shall.findByPk(shallId)
            .then(shall => {
                if (!shall)
                    reject({ status: 404, message: `Erro: Obrigação não localizada. shallId=[${shallId}]` });
                // shallId válido
                resolve(shall);
            })
            .catch(err => reject({ status: 405, message: `Erro: Dados inválidos. [${err}]` }));
    })
}

// ==============================================================
// Validar preenchimento do parametro: paymentId
// ==============================================================
exports.verifyPaymentId = function (paymentId) {
    util.debug(' verifyPaymentId() ======================= ini\n',
        'paymentId => ', paymentId, '\n',
        'verifyPaymentId() ======================= fim');

    return new Promise(async (resolve, reject) => {
        if (isNaN(paymentId))
            reject({ status: 405, message: `Erro: Dados inválidos. paymentId=[${paymentId}]` });
        await Payment.findByPk(paymentId)
            .then(payment => {
                if (!payment)
                    reject({ status: 404, message: `Erro: Pagamento de obrigação não localizado. paymentId=[${paymentId}]` });
                // paymentId válido
                resolve(payment);
            })
            .catch(err => reject({ status: 405, message: `Erro: Dados inválidos. [${err}]` }));
    })
}

// ==============================================================
// Verificar se tem acesso de Owner no CFP para realizar a operação
// ==============================================================
exports.verifyOwnerAccessByAccount = function ({ account, userId }) {
    util.debug(' verifyOwnerAccessByAccount() ======================= ini\n',
        'account => ', account, '\n',
        'userId => ', userId, '\n',
        'verifyOwnerAccessByAccount() ======================= fim');

    return new Promise(async (resolve, reject) => {
        if (!areAccountAndUserIdPresent(account, userId))
            reject({ status: 405, message: `Erro ao verificar acesso: account=[${account}], userId=[${userId}]` });
        await Category.findByPk(account.accCategoryId)
            .then(async category => {
                if (!category)
                    reject({ status: 405, message: 'Erro ao validar acesso.' });
                if (AccessRule.isOwner(await AccessGrant.getUserProfileInOwnerCFP(userId, category.catOwnerId)))
                    resolve(account)
                else
                    reject({ status: 403, message: 'Erro: Acesso negado.' });
            })
            .catch(err => reject({ status: 403, message: `Erro: Acesso negado. [${err}]` }));
    })
}

// ==============================================================
// Verificar se tem acesso de Coauthor no CFP para realizar a operação
// ==============================================================
exports.verifyCoauthorAccessByAccount = function ({ account, userId }) {
    util.debug(' verifyCoauthorAccessByAccount() ======================= ini\n',
        'account => ', account, '\n',
        'userId => ', userId, '\n',
        'verifyCoauthorAccessByAccount() ======================= fim');

    return new Promise(async (resolve, reject) => {
        if (!areAccountAndUserIdPresent(account, userId))
            reject({ status: 405, message: `Erro ao verificar acesso: account=[${account}], userId=[${userId}]` });
        await Category.findByPk(account.accCategoryId)
            .then(async category => {
                if (!category)
                    reject({ status: 405, message: 'Erro ao validar acesso.' });
                if (AccessRule.isCoauthor(await AccessGrant.getUserProfileInOwnerCFP(userId, category.catOwnerId)))
                    resolve(account)
                else
                    reject({ status: 403, message: 'Erro: Acesso negado.' });
            })
            .catch(err => reject({ status: 403, message: `Erro: Acesso negado. [${err}]` }));
    })
}

// ==============================================================
// Verificar se tem acesso de Editor no CFP para realizar a operação
// ==============================================================
exports.verifyEditorAccessByAccount = function ({ account, userId }) {
    util.debug(' verifyEditorAccessByAccount() ======================= ini\n',
        'account => ', account, '\n',
        'userId => ', userId, '\n',
        'verifyEditorAccessByAccount() ======================= fim');

    return new Promise(async (resolve, reject) => {
        if (!areAccountAndUserIdPresent(account, userId))
            reject({ status: 405, message: `Erro ao verificar acesso: account=[${account}], userId=[${userId}]` });
        await Category.findByPk(account.accCategoryId)
            .then(async category => {
                if (!category)
                    reject({ status: 405, message: 'Erro ao validar acesso.' });
                if (AccessRule.isEditor(await AccessGrant.getUserProfileInOwnerCFP(userId, category.catOwnerId)))
                    resolve(account)
                else
                    reject({ status: 403, message: 'Erro: Acesso negado.' });
            })
            .catch(err => reject({ status: 403, message: `Erro: Acesso negado. [${err}]` }));
    })
}

// ==============================================================
// Verificar se tem acesso de Auditor no CFP para realizar a operação
// ==============================================================
exports.verifyAuditorAccessByAccount = function ({ account, userId }) {
    util.debug(' verifyAuditorAccessByAccount() ======================= ini\n',
        'account => ', account, '\n',
        'userId => ', userId, '\n',
        'verifyAuditorAccessByAccount() ======================= fim');

    return new Promise(async (resolve, reject) => {
        if (!areAccountAndUserIdPresent(account, userId))
            reject({ status: 405, message: `Erro ao verificar acesso: account=[${account}], userId=[${userId}]` });
        await Category.findByPk(account.accCategoryId)
            .then(async category => {
                if (!category)
                    reject({ status: 405, message: 'Erro ao validar acesso.' });
                if (AccessRule.isAuditor(await AccessGrant.getUserProfileInOwnerCFP(userId, category.catOwnerId)))
                    resolve(account)
                else
                    reject({ status: 403, message: 'Erro: Acesso negado.' });
            })
            .catch(err => reject({ status: 403, message: `Erro: Acesso negado. [${err}]` }));
    })
}

// ==============================================================
// Verificar se tem acesso de Auditor no CFP para realizar a operação
// ==============================================================
exports.verifyAuditorAccessByCategoryId = function (categoryId, userId) {
    util.debug(' verifyAuditorAccessByCategoryId() ======================= ini\n',
        'categoryId => ', categoryId, '\n',
        'userId => ', userId, '\n',
        'verifyAuditorAccessByCategoryId() ======================= fim');

    return new Promise(async (resolve, reject) => {
        if (!areCategoryIdAndUserIdPresent(categoryId, userId))
            reject({ status: 405, message: `Erro ao verificar acesso: categoryId=[${categoryId}], userId=[${userId}]` });
        await Category.findByPk(categoryId)
            .then(async category => {
                if (!category)
                    reject({ status: 405, message: 'Erro ao validar acesso.' });
                if (AccessRule.isAuditor(await AccessGrant.getUserProfileInOwnerCFP(userId, category.catOwnerId)))
                    resolve(category)
                else
                    reject({ status: 403, message: 'Erro: Acesso negado.' });
            })
            .catch(err => reject({ status: 403, message: `Erro: Acesso negado. [${err}]` }));
    })
}

// ==============================================================
// Validators
// ==============================================================
function areAccountAndUserIdPresent(account, userId) {
    return !(account === undefined || userId === undefined ||
        account === null || userId === null || isNaN(userId));
}

function areCategoryIdAndUserIdPresent(categoryId, userId) {
    return !(categoryId === undefined || userId === undefined ||
        categoryId === null || userId === null ||
        isNaN(categoryId) || isNaN(userId));
}

