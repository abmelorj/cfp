'use strict';
require('dotenv').config();

const AccessGrant = require('../models/AccessGrant');
const AccessRule = require('../models/AccessRule');
const Category = require('../models/Category');
const User = require('../models/User');
const logerr = require('../config/logerr');
const loginfo = require('../config/loginfo');

// Validar preenchimento de name, catOwnerId e isCredit
function validateNameOwnerCredit(category) {
    debug(' validateNameOwnerCredit() ======================= ini\n',
        'category => ', category, '\n',
        'validateNameOwnerCredit() ======================= fim');

    return new Promise((resolve, reject) => {
        if (!category)
            reject({
                status: 405,
                message: 'Erro: Dados não informados.'
            })
        else if (!category.name ||
            !category.catOwnerId ||
            category.isCredit === undefined ||
            category.name === '' ||
            category.catOwnerId === '' ||
            category.isCredit === '')
            reject({
                status: 405,
                message: `Erro: Dados insuficientes. Necessário informar name(${category.name}), catOwnerId(${category.catOwnerId}) e isCredit(${category.isCredit}).`
            })
        else
            resolve(category);
    })
}

// Recupera categoria se existir no controle financeiro
function getCategoryIfExists(category) {
    debug(' getCategoryIfExists() ======================= ini\n',
        'category => ', category, '\n',
        'getCategoryIfExists() ======================= fim');

    return new Promise(async (resolve, reject) => {
        await Category.findByNameAndOwnerId(category.name, category.catOwnerId)
            .then(categoryFound => {
                if (categoryFound == null)
                    resolve(category)
                else
                    resolve(categoryFound);
            },
                (reason) => { reject({ status: 500, message: `Erro: Dados inválidos. ${reason}` }) })
            .catch(err => reject({ status: 500, message: `Erro ao verificar existência da categoria ==> [${err}]` }));
    })
}

// Se o usuário já possui categoria ativa com o mesmo nome, retorna erro 409
function verifyDuplicate(category) {
    debug(' verifyDuplicate() ======================= ini\n',
        'category => ', category, '\n',
        'verifyDuplicate() ======================= fim');

    return new Promise((resolve, reject) => {
        if (category && category.isActive === true)
            reject({ status: 409, message: `Erro: Categoria já registrada.` })
        else
            resolve(category);
    })
}

// Se o usuário já possui categoria inativa com o mesmo nome, reativa
function activateIfExistsInactive(category) {
    debug(' activateIfExistsInactive() ======================= ini\n',
        'category => ', category, '\n',
        'activateIfExistsInactive() ======================= fim');

    return new Promise(async (resolve, reject) => {
        if (category && category.isActive === false) {
            category.isActive = true;
            category.version = Date.now();
            category.version = category.version - (category.version % 1000);
            // Ao Salvar/reativar uma categoria rejeita a promessa para interromper o fluxo de execução
            await category.save()
                .then(updatedCategory => reject({ status: 200, message: updatedCategory }),
                    err => reject({ status: 405, message: `Dados invalidos: [${err.original.text}]` }))
                .catch(err => reject({ status: 500, message: `Erro ao reativar categoria ==> [${err}]` }));
        } else
            resolve(category);
    })
}

// Se não existe categoria, tenta incluir
function createIfNotExists(category) {
    debug(' createIfNotExists() ======================= ini\n',
        'category => ', category, '\n',
        'createIfNotExists() ======================= fim');

    return new Promise(async (resolve, reject) => {
        if (category.isActive === undefined) {
            if (isCreditCardCategory(category.name))
                category.isCredit = true;
            category.version = Date.now();
            category.version = category.version - (category.version % 1000);
            await Category.create(category)
                .then(newCategory => resolve(newCategory),
                    err => reject({ status: 405, message: `Dados invalidos: [${err.original.text}]` }))
                .catch(err => reject({ status: 500, message: `Erro ao registrar categoria ==> [${err}]` }));
        } else
            reject({ status: 500, message: 'Erro: Categoria já existe.' });
    })
}

// Verifica se o OwnerId existe
function verifyOwnerId(id) {
    debug(' verifyOwnerId() ======================= ini\n',
        'id => ', id, '\n',
        'verifyOwnerId() ======================= fim');

    return new Promise(async (resolve, reject) => {
        await User.findByPk(id)
            .then(user => {
                if (!user)
                    reject({ status: 404, message: 'Proprietário informado não localizado.' })
                else
                    resolve(id);
            })
            .catch(err => reject({ status: 500, message: `Erro ao buscar proprietário ==> [${err}]` }));
    })
}

// Busca as categorias do usuário
function findCategoriesByOwnerId(id) {
    debug(' findCategoriesByOwnerId() ======================= ini\n',
        'id => ', id, '\n',
        'findCategoriesByOwnerId() ======================= fim');

    return new Promise(async (resolve, reject) => {
        await Category.findByOwnerId(id)
            .then(categories => resolve(categories),
                err => reject({ status: 405, message: `Dados invalidos: [${err.original.text}]` }))
            .catch(err => reject({ status: 500, message: `Erro ao buscar categorias do proprietário ==> [${err}]` }));
    })
}

function returnErr(err, res) {
    if (!err.status)
        return res.status(500).send(logerr(err))
    else
        return res.status(err.status).send(logerr(err.message));
}

function isCreditCardCategory(name) {
    debug(' isCreditCardCategory() ======================= ini\n',
        'name => ', name, '\n',
        'isCreditCardCategory() ======================= fim');

    const nameUpper = name.toUpperCase()
    return nameUpper == 'CARTÕES DE CRÉDITO' ||
        nameUpper == 'CARTÕES DE CRÉDITOS' ||
        nameUpper == 'CARTÃO DE CRÉDITO' ||
        nameUpper == 'CARTÃO DE CRÉDITOS'
}

// Cadastra categoria
exports.addCategory = async function (req, res) {
    debug(' addCategory() ======================= ini\n',
        'req.body => ', req.body, '\n',
        'req.decoded => ', req.decoded, '\n',
        'addCategory() ======================= fim');

    if (AccessRule.isCoauthor(await AccessGrant.getUserProfileInOwnerCFP(req.decoded.id, req.body.catOwnerId)))
        await validateNameOwnerCredit(req.body)
            .then(getCategoryIfExists)
            .then(verifyDuplicate)
            .then(activateIfExistsInactive)
            .then(createIfNotExists)
            .then(newCategory => res.status(201).send(newCategory.dataValues))
            .catch(err => returnErr(err, res))
    else return returnErr({ status: 403, message: 'Acesso negado.' }, res);
}

// Atualiza categoria
exports.updateCategory = async function (req, res) {
    debug(' updateCategory() ======================= ini\n',
        'req.body => ', req.body, '\n',
        'req.decoded => ', req.decoded, '\n',
        'updateCategory() ======================= fim');

    if (AccessRule.isCoauthor(await AccessGrant.getUserProfileInOwnerCFP(req.decoded.id, req.body.catOwnerId)))
        await validateNameOwnerCredit(req.body)
            .then(getCategoryIfExists)
            .then(category => {
                if (category.id != undefined && category.id != req.body.id)
                    throw new Object({ status: 409, message: 'Erro: Já existe categoria com o nome informado.' })
                else
                    return category;
            })
            // pesquisar a categoria pelo id para atualizar o nome
            .then(async () => await Category.findByPk(req.body.id))
            .then(async category => {
                if (category == null)
                    throw new Object({ status: 404, message: `Categoria não localizada (${req.body.id})` })
                else {
                    // TODO: Faltou Testar esta verificação de versão
                    // Verifica se a versão do registro no BD ainda é a mesma
                    if (new Date(category.version).getTime() != new Date(req.body.version).getTime())
                        // Registro com versão diferente, retorna o dado do BD
                        throw new Object({ status: 405, message: 'Erro: Versão inválida.' });
                    category.name = req.body.name;
                    category.isActive = req.body.isActive;
                    category.version = Date.now();
                    category.version = category.version - (category.version % 1000);
                    await category.save()
                        .then(updatedCategory => res.status(200).send(updatedCategory.dataValues))
                        .catch(err => returnErr(err, res))
                }
            })
            .catch(err => returnErr(err, res))
    else return returnErr({ status: 403, message: 'Acesso negado.' }, res);
}

// Exclui categoria
exports.deleteCategory = async function (req, res) {
    debug(' deleteCategory() ======================= ini\n',
        'req.body => ', req.body, '\n',
        'req.decoded => ', req.decoded, '\n',
        'req.params => ', req.params, '\n',
        'deleteCategory() ======================= fim');

    // TODO
    await Category.findByPk(req.params.id)
        .then(async category => {
            if (category)
                // TODO - verificar se categoria está sem contas
                // TODO - caso ela tenha tido movimento, desativar ao invés de excluir
                if (AccessRule.isCoauthor(await AccessGrant.getUserProfileInOwnerCFP(req.decoded.id, category.catOwnerId)))
                    await category.destroy()
                        .then(() => res.status(200).send(loginfo('MSG013: Exclusão de categoria efetuada com sucesso.')))
                        .catch(err => returnErr(err, res))
                else
                    throw new Object({ status: 403, message: 'Acesso negado.' })
            else
                throw new Object({ status: 404, message: 'Erro: Categoria não identificada ou inválida' })
        })
        .catch(err => returnErr(err, res));
}

// Lista as categorias do usuário
exports.listCategoryByOwnerId = async function (req, res) {
    debug(' listCategoryByOwnerId() ======================= ini\n',
        'req.body => ', req.body, '\n',
        'req.decoded => ', req.decoded, '\n',
        'req.params => ', req.params, '\n',
        'listCategoryByOwnerId() ======================= fim');

    if (AccessRule.isAuditor(await AccessGrant.getUserProfileInOwnerCFP(req.decoded.id, req.params.id)))
        await verifyOwnerId(req.params.id)
            .then(findCategoriesByOwnerId)
            .then(categories => res.status(200).send(categories !== undefined ? categories : [{}]))
            .catch(err => returnErr(err, res))
    else return returnErr({ status: 403, message: 'Acesso negado.' }, res);
}


// Obtém registro da categoria
exports.getCategoryById = function (req, res) {
    debug(' getCategoryById() ======================= ini\n',
        'req.body => ', req.body, '\n',
        'req.decoded => ', req.decoded, '\n',
        'req.params => ', req.params, '\n',
        'getCategoryById() ======================= fim');

    return new Promise(async (resolve, reject) => {
        if (!req.params.id)
            reject(returnErr({ status: 405, message: 'Erro: Dados inválidos.' }, res));
        await Category.findByPk(req.params.id)
            .then(async category => {
                if (!category)
                    reject(returnErr({ status: 404, message: 'Erro: Categoria não localizada.' }, res));
                if (!AccessRule.isAuditor(await AccessGrant.getUserProfileInOwnerCFP(req.decoded.id, category.catOwnerId)))
                    reject(returnErr({ status: 403, message: 'Acesso negado.' }, res));
                resolve(res.status(200).send(category.dataValues));
            })
            .catch(err => reject(returnErr({ status: 500, message: `Erro ao buscar categoria ==> [${err}]` }, res)));
    })
}

// Obtém contas da categoria
exports.listAccountByCategoryId = function (req, res) {
    debug(' listAccountsByCategoryId() ======================= ini\n',
        'req.body => ', req.body, '\n',
        'req.decoded => ', req.decoded, '\n',
        'req.params => ', req.params, '\n',
        'listAccountsByCategoryId() ======================= fim');

    return new Promise(async (resolve, reject) => {
        if (!req.params.id)
            reject(returnErr({ status: 405, message: 'Erro: Dados inválidos.' }, res));
        await Category.findByPk(req.params.id)
            .then(async category => {
                if (!category)
                    reject(returnErr({ status: 404, message: 'Erro: Registro não localizado.' }, res));
                if (!AccessRule.isAuditor(await AccessGrant.getUserProfileInOwnerCFP(req.decoded.id, category.catOwnerId)))
                    reject(returnErr({ status: 403, message: 'Acesso negado.' }, res));
                let accounts = []
                accounts = await category.getAccCategory();
                debug('Accounts => ', accounts)
                accounts = accounts.map(account => account.dataValues);
                resolve(res.status(200).send(accounts));
            })
            .catch(err => reject(returnErr(`Erro ao buscar categoria ==> [${err}]`, res)));
    })
}


const debug = (...msg) => {
    if ((process.env.DEBUG || 'false') == 'true')
        return console.log(...msg);
}