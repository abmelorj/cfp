'use strict';
require('dotenv').config();
const service = require('../models/service');
const util = require('../models/util');
const logerr = require('../config/logerr');
const loginfo = require('../config/loginfo');
const db = require('./../database/db');
const { Op } = require('sequelize');


const AccessGrant = require('../models/AccessGrant');
const AccessRule = require('../models/AccessRule');
const Account = require('../models/Account');
const Balance = require('../models/Balance');
const Category = require('../models/Category');
const Operation = require('../models/Operation');
const Payment = require('../models/Payment');
const Shall = require('../models/Shall');

/*************************************************************
 * 
 ************************************************************/
exports.listAccountOperationByMonth = async function (req, res) {
    util.debug(' listAccountOperationByMonth() ======================= ini\n',
        'req.body => ', req.body, '\n',
        'req.decoded.id => ', req.decoded.id, '\n',
        'req.params => ', req.params, '\n',
        'listAccountOperationByMonth() ======================= fim');

    let userId = req.decoded.id;
    let accountId = req.params.id;
    let yearMonth = req.params.yearMonth;
    await service.verifyAccountId(accountId)
        .then(async account => service.verifyAuditorAccessByAccount({ account, userId }))
        .then(async accountGranted => {
            if (!accountGranted)
                return res.status(405).send({ message: `Erro ao tentar localizar operações da conta: [${accountId}]` });
            // Recupera operações
            let operations = await Operation.listOperationByAccountIdYearMonth(accountId, yearMonth);
            res.status(200).send(operations)
        })
        .catch(err => util.returnErr(err, res));
}

/*************************************************************
 * Retorna o valor pendente de pagamento nas contas de débito, 
 * crédito ou cartão de crédito até o mês informado.
 ************************************************************/
exports.getAccountPendingValueByMonth = async function (req, res) {
    util.debug(' getAccountPendingValueByMonth() ======================= ini\n',
        'req.body => ', req.body, '\n',
        'req.decoded.id => ', req.decoded.id, '\n',
        'req.params => ', req.params, '\n',
        'getAccountPendingValueByMonth() ======================= fim');

    /******************************************
     * - Conta de reserva ou cartão de crédito (isCredit),
     *   apurar obrigações pendentes associadas às operações no mês.
     * - Conta de débito (!isCredit),
     *   apurar pagamentos pendentes no mês.
     *****************************************/
    let userId = req.decoded.id;
    let accountId = req.params.id;
    let yearMonth = req.params.yearMonth;
    await service.verifyAccountId(accountId)
        .then(async account => service.verifyAuditorAccessByAccount({ account, userId }))
        .then(async accountGranted => {
            if (!accountGranted)
                return res.status(405).send({ message: `Erro ao tentar localizar valor pendente da conta: [${accountId}]` });

            // Verifica como vai apurar o valor pendente
            if (accountGranted.isCredit) {
                // Para as contas de crédito e cartão de crédito, apura pela entidade Shall
                let arrayPendingValue = await getPendingValueByAccountIdYearMonth(accountGranted.id, yearMonth);
                let objPendingValue = arrayPendingValue[0];
                res.status(200).send(objPendingValue);
            } else {
                // Para as contas de débito, apura pela entidade Payment
                let pendingValue = await Payment.getPendingValueByAccountIdYearMonth(accountGranted.id, yearMonth);
                res.status(200).send({ pendingValue });
            }
        })
        .catch(err => util.returnErr(err, res));
}

/****************************************************
 * Obter o valor de obrigações pendentes para uma 
 * conta até determinado mês.
 ***************************************************/
async function getPendingValueByAccountIdYearMonth(accountId, yearMonth, transaction) {
    return Operation.findAll({
        attributes: [
            [db.fn('SUM', db.col('shaOperation.value')), 'pendingValue']
        ],
        where: {
            [Op.or]: [
                { oprSourceAccountId: accountId },
                { oprDestinyAccountId: accountId }
            ]
        },
        include: {
            model: Shall,
            as: 'shaOperation',
            require: true,
            attributes: [],
            where: {
                [Op.and]: [
                    { isPending: true },
                    { shaDate: { [Op.lt]: util.firstDayNextYearMonth(yearMonth) } }
                ]
            },
            transaction
        },
        transaction
    });
}
/*************************************************************
* Retorna o valor pendente de pagamento nas contas de débito, 
* crédito ou cartão de crédito.
************************************************************/
exports.getAccountPendingValue = async function (req, res) {
    util.debug(' getAccountPendingValue() ======================= ini\n',
        'req.body => ', req.body, '\n',
        'req.decoded.id => ', req.decoded.id, '\n',
        'req.params => ', req.params, '\n',
        'getAccountPendingValue() ======================= fim');

    /******************************************
     * - Conta de reserva ou cartão de crédito (isCredit),
     *   apurar obrigações pendentes associadas às operações no mês.
     * - Conta de débito (!isCredit),
     *   apurar pagamentos pendentes no mês.
     *****************************************/
    let userId = req.decoded.id;
    let accountId = req.params.id;
    await service.verifyAccountId(accountId)
        .then(async account => service.verifyAuditorAccessByAccount({ account, userId }))
        .then(async accountGranted => {
            if (!accountGranted)
                return res.status(405).send({ message: `Erro ao tentar localizar valor pendente da conta: [${accountId}]` });

            // Verifica como vai apurar o valor pendente
            if (accountGranted.isCredit) {
                // Para as contas de crédito e cartão de crédito, apura pela entidade Shall
                let arrayPendingValue = await getPendingValueByAccountId(accountGranted.id);
                let objPendingValue = arrayPendingValue[0];
                res.status(200).send(objPendingValue);
            } else {
                // Para as contas de débito, apura pela entidade Payment
                let pendingValue = await Payment.getPendingValueByAccountId(accountGranted.id);
                res.status(200).send({ pendingValue });
            }
        })
        .catch(err => util.returnErr(err, res));
}

/****************************************************
 * Obter o valor de obrigações pendentes para uma conta.
 ***************************************************/
async function getPendingValueByAccountId(accountId, transaction) {
    return Operation.findAll({
        attributes: [
            [db.fn('SUM', db.col('shaOperation.value')), 'pendingValue']
        ],
        where: {
            [Op.or]: [
                { oprSourceAccountId: accountId },
                { oprDestinyAccountId: accountId }
            ]
        },
        include: {
            model: Shall,
            as: 'shaOperation',
            require: true,
            attributes: [],
            where: { isPending: true },
            transaction
        },
        transaction
    });
}

/*************************************************************
 * 
 ************************************************************/
exports.getAccountBalanceByMonth = async function (req, res) {
    debug(' getAccountBalanceByMonth() ======================= ini\n',
        'req.body => ', req.body, '\n',
        'req.decoded.id => ', req.decoded.id, '\n',
        'req.params => ', req.params, '\n',
        'getAccountBalanceByMonth() ======================= fim');
    await validateAccountId(req.params.id, req.decoded.id)
        .then(verifyAccessAuditor)
        .then(account => getBalanceByMonth(account, req.params.yearMonth))
        .then(balance => {
            debug('Balance => ', balance)
            res.status(200).send(balance)
        })
        .catch(err => returnErr(err, res))
}

/*************************************************************
 * 
 ************************************************************/
exports.getAccountBalance = async function (req, res) {
    debug(' getAccountBalance() ======================= ini\n',
        'req.body => ', req.body, '\n',
        'req.decoded.id => ', req.decoded.id, '\n',
        'getAccountBalance() ======================= fim');
    await validateAccountId(req.params.id, req.decoded.id)
        .then(verifyAccessAuditor)
        .then(getBalance)
        .then(balance => {
            debug('Balance => ', balance)
            res.status(200).send(balance)
        })
        .catch(err => returnErr(err, res))
}

/*************************************************************
 * 
 ************************************************************/
exports.getAccountById = async function (req, res) {
    debug(' getAccountById() ======================= ini\n',
        'req.body => ', req.body, '\n',
        'req.decoded.id => ', req.decoded.id, '\n',
        'getAccountById() ======================= fim');

    await validateAccountId(req.params.id, req.decoded.id)
        .then(verifyAccessAuditor)
        .then(account => res.status(200).send(account.dataValues))
        .catch(err => returnErr(err, res))
}

/*************************************************************
 * 
 ************************************************************/
exports.addAccount = async function (req, res) {
    debug(' addAccount() ======================= ini\n',
        'req.body => ', req.body, '\n',
        'req.decoded.id => ', req.decoded.id, '\n',
        'addAccount() ======================= fim');

    await validateFields(req.body, req.decoded.id)
        .then(verifyAccessCoauthor)
        .then(verifyCategoryCompliance)
        .then(getIfExists)
        .then(verifyDuplicate)
        .then(activateIfExistsInactive)
        .then(createIfNotExists)
        .then(newAccount => res.status(201).send(newAccount.dataValues))
        .catch(err => returnErr(err, res))
}

/*************************************************************
 * 
 ************************************************************/
exports.listAccountByOwnerId = async function (req, res) {
    debug(' listAccountByOwnerId() ======================= ini\n',
        'req.params.id => ', req.params.id, '\n',
        'req.decoded.id => ', req.decoded.id, '\n',
        'listAccountByOwnerId() ======================= fim');

    if (AccessRule.isAuditor(await AccessGrant.getUserProfileInOwnerCFP(req.decoded.id, req.params.id))) {
        debug('AccessRule.isAuditor...')
        await Account.findByOwnerId(req.params.id)
            .then(accounts => {
                debug('Accounts => ', accounts)
                accounts = accounts.map(account => account.dataValues);
                debug('Accounts Mapped => ', accounts)
                res.status(200).send(accounts);
            })
            .catch(err => returnErr(err, res))
    }

    else return returnErr({ status: 403, message: 'Acesso negado.' }, res);
}


// ==============================================================
// Exclui conta
// ==============================================================
/*************************************************************
 * 
 ************************************************************/
exports.deleteAccountById = async function (req, res) {
    debug(' deleteAccountById() ======================= ini\n',
        'req.body => ', req.body, '\n',
        'req.decoded.id => ', req.decoded.id, '\n',
        'deleteAccountById() ======================= fim');

    await validateAccountId(req.params.id, req.decoded.id)
        .then(verifyAccessCoauthor)
        .then(async ({ account, category }) => {
            // TODO - verificar se conta está sem operações
            // TODO - caso ela tenha tido movimento e esteja com saldo zerado, desativar ao invés de excluir
            await account.destroy()
                .then(() => res.status(200).send(loginfo('MSG016: Exclusão de conta efetuada com sucesso.')))
                .catch(err => returnErr(err, res))
        })
        .catch(err => returnErr(err, res))
}

// ==============================================================
// Atualiza conta
// ==============================================================
/*************************************************************
 * 
 ************************************************************/
exports.updateAccount = async function (req, res) {
    debug(' updateAccount() ======================= ini\n',
        'req.body => ', req.body, '\n',
        'req.decoded.id => ', req.decoded.id, '\n',
        'updateAccount() ======================= fim');

    await validateFields(req.body, req.decoded.id)
        .then(verifyAccessCoauthor)
        .then(verifyCategoryCompliance)
        .then(getIfExists)
        .then(account => {
            // Se encontrar outra conta, mesmo que inativa, com o Novo nome...
            if (account.id != req.body.id)
                if (account.isActive)
                    throw new Error(`Erro: Já existe conta com o nome fornecido (${account.id}).`)
                else
                    throw new Error(`Erro: Existe conta inativa com o nome fornecido (${account.id}).`);
            // Não existe outra conta com o Novo nome...
            // Localiza a versão anterior da conta pelo ID
            return validateAccountId(req.body.id, req.decoded.id)
        })
        .then(async ({ account, userId }) => {
            // Verifica se a versão do registro no BD ainda é a mesma
            if (new Date(account.version).getTime() != new Date(req.body.version).getTime())
                // Registro com versão diferente, retorna o dado do BD
                return res.status(405).send(account.dataValues);
            // Permite atualizar apenas o nome ou se é cartão de crédito,
            // a reativação de contas é tratada na inclusão.
            account.name = req.body.name;
            account.isCard = req.body.isCard;
            account.version = Date.now();
            account.version = account.version - (account.version % 1000);
            await account.save()
                .then(updatedAccount => res.status(200).send(updatedAccount.dataValues))
                .catch(err => returnErr(err, res))
        })
        .catch(err => returnErr(err, res))
}


// ==============================================================
// Consulta conta
// ==============================================================

// Verificar se tem acesso necessário no CFP para realizar a operação
function verifyAccessAuditor({ account, userId }) {
    debug(' verifyAccessAuditor() ======================= ini\n',
        'account => ', account, '\n',
        'userId => ', userId, '\n',
        'verifyAccessAuditor() ======================= fim');

    return new Promise(async (resolve, reject) => {
        await Category.findByPk(account.accCategoryId)
            .then(async category => {
                if (AccessRule.isAuditor(await AccessGrant.getUserProfileInOwnerCFP(userId, category.catOwnerId)))
                    resolve(account)
                else
                    reject({ status: 403, message: 'Acesso negado.' });
            },
                reason => reject(reason))
    })
}

// Validar preenchimento do parametro: accountId
function validateAccountId(accountId, userId) {
    debug(' validateAccountId() ======================= ini\n',
        'accountId => ', accountId, '\n',
        'userId => ', userId, '\n',
        'validateAccountId() ======================= fim');

    return new Promise(async (resolve, reject) => {
        if (isNaN(accountId))
            reject({ status: 405, message: 'Erro: Dados inválidos.' });
        await Account.findByPk(accountId)
            .then(account => {
                if (!account)
                    reject({ status: 404, message: 'Erro: Conta não localizada.' })
                // Campos preenchidos corretamente
                resolve({ account, userId });
            })
            .catch(err => reject(`Erro ao pesquisar conta ==> [${err}]`));
    })
}

//Recupera o saldo da conta
function getBalance(account) {
    debug(' getBalance() ======================= ini\n',
        'account => ', account, '\n',
        'getBalance() ======================= fim');

    return new Promise(async (resolve, reject) => {
        await Balance.getBalance(account.id)
            .then(balanceFound => {
                resolve(balanceFound)
            }, reason => reject(`Erro: Dados inválidos. ${reason}`))
            .catch(err => reject(`Erro ao buscar saldo da conta ==> [${err}]`));
    })
}

//Recupera o saldo da conta até o mês
function getBalanceByMonth(account, yearMonth) {
    debug(' getBalanceByMonth() ======================= ini\n',
        'account => ', account, '\n',
        'yearMonth => ', yearMonth, '\n',
        'getBalanceByMonth() ======================= fim');

    return new Promise(async (resolve, reject) => {
        // TO-DO: VerifyYearMonthInvalid
        try {
            // Verifica se o mês informado é válido
            let month = parseInt(yearMonth.substring(yearMonth.length - 2, yearMonth.length))
            debug('month string => ', yearMonth.substring(yearMonth.length - 2, yearMonth.length), '\n',
                'month parseInt => ', month);
            if (isNaN(month) || month < 1 || month > 12)
                reject(`Erro: Dados inválidos. yearMonth=${yearMonth}`);
            // Verifica se o ano informado é válido, acima de 1900
            let year = parseInt(yearMonth.substring(yearMonth.length - 6, yearMonth.length - 2))
            debug('year string => ', yearMonth.substring(yearMonth.length - 6, yearMonth.length - 2), '\n',
                'year parseInt => ', year);
            if (isNaN(year) || year < 1900)
                reject(`Erro: Dados inválidos. yearMonth=${yearMonth}`);
        } catch (err) {
            reject(`Erro ao validar yearMonth=${yearMonth} ==> [${err}]`);
        }

        await Balance.getBalanceByYearMonth(account.id, yearMonth)
            .then(balanceFound => {
                resolve(balanceFound)
            }, reason => reject(`Erro: Dados inválidos. ${reason}`))
            .catch(err => reject(`Erro ao buscar saldo da conta ==> [${err}]`));
    })
}



// ==============================================================
// Cadastra conta
// ==============================================================

// Se não existe conta, tenta incluir
function createIfNotExists(account) {
    debug(' createIfNotExists() ======================= ini\n',
        'account => ', account, '\n',
        'createIfNotExists() ======================= fim');

    return new Promise(async (resolve, reject) => {
        if (account.isActive === undefined) {
            if (account.isCard)
                account.isCredit = true;
            account.version = Date.now();
            account.version = account.version - (account.version % 1000);
            await Account.create(account)
                .then(newAccount => resolve(newAccount)
                    , err => reject({ status: 405, message: `Dados invalidos: [${err.original.text}]` }))
                .catch(err => reject(`Erro ao registrar conta ==> [${err}]`));
        } else
            reject('Erro: Conta já existe.');
    })
}

// Se o usuário já possui conta inativa com o mesmo nome, reativa
function activateIfExistsInactive(account) {
    debug(' activateIfExistsInactive() ======================= ini\n',
        'account => ', account, '\n',
        'activateIfExistsInactive() ======================= fim');

    return new Promise(async (resolve, reject) => {
        if (account && account.isActive === false) {
            account.isActive = true;
            account.version = Date.now();
            account.version = account.version - (account.version % 1000);
            // Ao Salvar/reativar uma conta rejeita a promessa para interromper o fluxo de execução
            await account.save()
                .then(updatedAccount => reject({ status: 200, message: updatedAccount }),
                    err => reject({ status: 405, message: `Dados invalidos: [${err.original.text}]` }))
                .catch(err => reject(`Erro ao reativar categoria ==> [${err}]`));
        } else
            // Se não existe inativa, repassa o pedido para criar
            resolve(account);
    })
}

// Se o usuário já possui conta ativa com o mesmo nome, retorna erro 409
function verifyDuplicate(account) {
    debug(' verifyDuplicate() ======================= ini\n',
        'account => ', account, '\n',
        'verifyDuplicate() ======================= fim');

    return new Promise((resolve, reject) => {
        if (account && account.isActive === true)
            reject({ status: 409, message: `Erro: Conta já cadastrada.` })
        else
            resolve(account);
    })
}

// Recupera a conta se existir no controle financeiro
function getIfExists({ account, catOwnerId }) {
    debug(' getIfExists() ======================= ini\n',
        'account => ', account, '\n',
        'catOwnerId => ', catOwnerId, '\n',
        'getIfExists() ======================= fim');

    return new Promise(async (resolve, reject) => {
        await Account.findByNameAndOwnerId(account.name, catOwnerId)
            .then(accountFound => {
                if (accountFound == null)
                    resolve(account)
                else
                    resolve(accountFound);
            }, reason => reject(`Erro: Dados inválidos. ${reason}`))
            .catch(err => reject(`Erro ao verificar existência da categoria ==> [${err}]`));
    })
}

// Verificar se a conta é compatível com a categoria
function verifyCategoryCompliance({ account, category }) {
    debug(' verifyCategoryCompliance() ======================= ini\n',
        'account => ', account, '\n',
        'category => ', category.dataValues, '\n',
        'verifyCategoryCompliance() ======================= fim');

    return new Promise((resolve, reject) => {
        // Categoria de reserva financeira: Conta de reserva financeira e Conta de cartão de crédito
        // Categoria de recurso financeiro: Conta de recurso financeiro 
        if (category.isCredit == account.isCredit)
            // Conta compatível com a categoria...
            resolve({ account, catOwnerId: category.catOwnerId });
        else
            reject({
                status: 405,
                message: `Erro: Categoria inadequada para o tipo de conta.`
            });
    })
}

// Verificar se tem acesso necessário no CFP para realizar a operação
function verifyAccessCoauthor({ account, userId }) {
    debug(' verifyAccessCoauthor() ======================= ini\n',
        'account => ', account, '\n',
        'userId => ', userId, '\n',
        'verifyAccessCoauthor() ======================= fim');

    return new Promise(async (resolve, reject) => {
        await Category.findByPk(account.accCategoryId)
            .then(async category => {
                if (AccessRule.isCoauthor(await AccessGrant.getUserProfileInOwnerCFP(userId, category.catOwnerId)))
                    resolve({ account, category })
                else
                    reject({ status: 403, message: 'Acesso negado.' });
            },
                reason => reject(reason))
    })
}

// Validar preenchimento dos campos essenciais: name, isCredit, isCard, accCategoryId
function validateFields(account, userId) {
    debug(' validateFields() ======================= ini\n',
        'account => ', account, '\n',
        'userId => ', userId, '\n',
        'validateFields() ======================= fim');

    return new Promise((resolve, reject) => {

        if (!account)
            reject({ status: 405, message: 'Erro: Dados não informados.' });

        debug(
            'typeof account.isCredit ==> ', typeof account.isCredit, '\n',
            'typeof account.isCard ==> ', typeof account.isCard, '\n',
            'typeof account.accCategoryId ==> ', typeof account.accCategoryId, '\n'
        );

        if (!('name' in account) ||
            !('isCredit' in account) ||
            !('isCard' in account) ||
            !('accCategoryId' in account) ||
            account.name === undefined ||
            account.isCredit === undefined ||
            account.isCard === undefined ||
            account.accCategoryId === undefined ||
            account.name === '' ||
            (typeof account.isCredit !== 'boolean') ||
            (typeof account.isCard !== 'boolean') ||
            (isNaN(account.accCategoryId)))
            reject({
                status: 405,
                message: `Erro: Dados insuficientes. Necessário informar name(${account.name}), isCredit(${account.isCredit}), isCard(${account.isCard}) e accCategoryId(${account.accCategoryId}).`
            });

        // Validar a compatibilidade dos campos...  isCredit x isCard  -- Categoria
        // conta de reserva financeira                true      false     reserva financeira
        // conta de cartão de crédito                 true      true      reserva financeira (especial)
        // conta de recurso financeiro                false     false     recurso financeiro
        if (account.isCard && !account.isCredit)
            reject({ status: 405, message: `Erro: Dados incompatíveis - reserva(${account.isCredit}) x cartão de crédito(${account.isCard}).` });

        // Campos preenchidos corretamente, falta verificar se está na categoria adequada (vide: verifyCategoryCompliance)
        resolve({ account, userId });
    })
}

// ==============================================================
// Rotinas de apoio
// ==============================================================

function returnErr(err, res) {
    if (!err.status)
        return res.status(500).send(logerr(err))
    else
        return res.status(err.status).send(logerr(err.message));
}

const debug = (...msg) => {
    if ((process.env.DEBUG || 'false') == 'true')
        return console.log(...msg);
}