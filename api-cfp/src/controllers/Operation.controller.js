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

/****************************************************
 * 1.4.5.1.	Como editor do controle financeiro preciso 
 *          registrar recebimento de crédito em conta 
 *          de recurso financeiro.
 ***************************************************/
exports.creditOperation = async function (req, res) {
    util.debug(' creditOperation() ======================= ini\n',
        'req.body    => ', req.body, '\n',
        'req.decoded => ', req.decoded, '\n',
        'req.params  => ', req.params, '\n',
        'req.url     => ', req.url, '\n',
        'req.method  => ', req.method, '\n',
        'creditOperation() ======================= fim');
    await validateOperationParameters(req.body, req.decoded, req.method.toUpperCase(), req.url.toUpperCase().replace(/\//g, ''))
        .then(async account => {
            // Início da Transação...
            try {
                await db.transaction(async transaction => {
                    await doCreditOrReserv(req, transaction);
                }); // Commit
            } catch (err) { // RollBack
                return util.returnErr(err, res)
            }
            // Fim da Transação!
            return res.status(200).send({ message: `Crédito de ${util.currency(req.body.value)} registrado na conta [${account.name}] em ${util.strBrlDateToString(req.body.oprDate)}.` });
        })
        .catch(err => {
            util.returnErr(err, res)
        })
}

async function doCreditOrReserv(req, transaction) {
    // save operation
    let savedOperation = await Operation.saveOperation(req.body, transaction);
    // update balance - Adiciona valor ao saldo da conta de destino da operação
    await Balance.updateBalanceAddDestiny(savedOperation, transaction);
}

/****************************************************
 * 1.4.5.2.	Como editor do controle financeiro quero 
 *          reservar valor em conta de reserva financeira.
 * *************************************************
 * TO-DO: verificar disponibilidade de saldo de recursos financeiros no mês???
 ***************************************************/
exports.reservOperation = async function (req, res) {
    util.debug(' reservOperation() ======================= ini\n',
        'req.body    => ', req.body, '\n',
        'req.decoded => ', req.decoded, '\n',
        'req.params  => ', req.params, '\n',
        'req.url     => ', req.url, '\n',
        'req.method  => ', req.method, '\n',
        'reservOperation() ======================= fim');
    await validateOperationParameters(req.body, req.decoded, req.method.toUpperCase(), req.url.toUpperCase().replace(/\//g, ''))
        .then(async account => {
            // TO-DO: verificar disponibilidade de saldo de recursos financeiros no mês???

            // Início da Transação...
            try {
                await db.transaction(async transaction => {
                    await doCreditOrReserv(req, transaction);
                }); // Commit
            } catch (err) { // RollBack               
                return util.returnErr(err, res)
            }
            // Fim da Transação!
            return res.status(200).send({ message: `Reserva de ${util.currency(req.body.value)} registrada na conta [${account.name}] em ${util.strBrlDateToString(req.body.oprDate)}.` });
        })
        .catch(err => util.returnErr(err, res))
}

/****************************************************
 * 1.4.5.3.	Como editor do controle financeiro quero 
 *          transferir valor entre contas de recurso financeiro.
 * 1.4.5.4.	Como editor do controle financeiro quero 
 *          transferir valor entre contas de reserva financeira.
 ***************************************************/
exports.transferOperation = async function (req, res) {
    util.debug(' transferOperation() ======================= ini\n',
        'req.body    => ', req.body, '\n',
        'req.decoded => ', req.decoded, '\n',
        'req.params  => ', req.params, '\n',
        'req.url     => ', req.url, '\n',
        'req.method  => ', req.method, '\n',
        'transferOperation() ======================= fim');
    // Regras similares para ambos os casos (Transferência de Valor ou Transferência de Reserva)
    await validateOperationParameters(req.body, req.decoded, req.method.toUpperCase(), req.url.toUpperCase().replace(/\//g, ''))
        .then(async accounts => {
            // TO-DO: verificar disponibilidade de saldo no mês na conta de origem, considerar pagamentos pendentes

            // Início da Transação...
            try {
                await db.transaction(async transaction => {
                    await doTransfer(req, transaction);
                }); // Commit
            } catch (err) { // RollBack               
                return util.returnErr(err, res)
            }
            // Fim da Transação!
            return res.status(200).send({ message: `Realizada transferência de ${util.currency(req.body.value)} da conta [${accounts.sourceAccount.name}] para a conta [${accounts.destinyAccount.name}] em ${util.strBrlDateToString(req.body.oprDate)}.` });
        })
        .catch(err => util.returnErr(err, res))

}

async function doTransfer(req, transaction) {
    // save operation
    let savedOperation = await Operation.saveOperation(req.body, transaction);
    // update balance - Subtrai valor do saldo da conta de origem da operação
    await Balance.updateBalanceSubSource(savedOperation, transaction);
    // update balance - Adiciona valor ao saldo da conta de destino da operação
    await Balance.updateBalanceAddDestiny(savedOperation, transaction);
}

/****************************************************
 * 1.4.5.7.	Como editor do controle financeiro quero 
 *          registrar pagamento agendado para atualizar 
 *          o saldo comprometido da conta de reserva financeira.
 * *************************************************
 * TO-DO: verificar disponibilidade de saldo no mês, 
 *        considerar outros pagamentos pendentes???
 ***************************************************/
exports.forecastOperation = async function (req, res) {
    util.debug(' forecastOperation() ======================= ini\n',
        'req.body    => ', req.body, '\n',
        'req.decoded => ', req.decoded, '\n',
        'req.params  => ', req.params, '\n',
        'req.url     => ', req.url, '\n',
        'req.method  => ', req.method, '\n',
        'forecastOperation() ======================= fim');
    // Não permite informar conta de destino, trata-se de previsão de obrigação pendente de pagamento.
    // Conta de origem:
    // - verificar se é conta de reserva financeira
    // - verificar disponibilidade de saldo no mês, considerar outros pagamentos pendentes???
    await validateOperationParameters(req.body, req.decoded, req.method.toUpperCase(), req.url.toUpperCase().replace(/\//g, ''))
        .then(async sourceAccount => {
            // TO-DO: verificar disponibilidade de saldo no mês, considerar outros pagamentos pendentes???            

            // Não atualiza saldos no momento do registro da previsão de DESPESA

            // Início da Transação...
            try {
                await db.transaction(async transaction => {
                    await doForecast(req, transaction);
                }); // Commit
            } catch (err) { // RollBack               
                return util.returnErr(err, res);
            }
            // Fim da Transação!
            let qty = parseInt(req.body.qtyPayments);
            let strDate = util.strBrlDateToString(req.body.startDate || req.body.oprDate);
            return res.status(200).send({ message: `Realizada previsão de pagamento de ${util.currency(req.body.value)} usando a reserva financeira [${sourceAccount.name}] ${qty == 1 ? 'em' : 'a partir de'} ${strDate}${qty == 1 ? '' : ' dividido em ' + req.body.qtyPayments + ' parcelas mensais'}.` });
        })
        .catch(err => util.returnErr(err, res))
}

async function doForecast(req, transaction) {
    // save operation
    let savedOperation = await Operation.saveOperation(req.body, transaction);

    // Se não possui data de início da operação, considera para efeito de parcelamento a própria data da operação
    if (savedOperation.startDate === undefined)
        savedOperation.startDate = savedOperation.oprDate;

    // Para tratar parcelamento, calcula o valor da primeira parcela e demais parcelas.
    let parcels = valParcels(savedOperation.value, savedOperation.qtyPayments || 1);

    // Tratar parcelamento...
    for (let monthDelay = 0; monthDelay < savedOperation.qtyPayments; monthDelay++) {
        // Apura o valor da parcela corrente
        let parcel = parcels.firstParcel;
        if (monthDelay > 0)
            parcel = parcels.otherParcel;
        savedOperation.value = parcel;

        // Apura a data da parcela e guarda em oprDate...
        savedOperation.oprDate = util.dateWithMonthsDelay(util.strBrlDateToDate(savedOperation.startDate), monthDelay);

        // save pending shall (obrigação pendente)...
        await Shall.create({
            shaOperationId: savedOperation.id,
            shallNr: (1 + monthDelay),
            shaDate: savedOperation.oprDate,
            value: savedOperation.value,
            isPending: true,
            version: Date.now()
        }, { transaction });
    }
}

/****************************************************
 * 1.4.5.5.	Como editor do controle financeiro quero
 *          registrar pagamento à vista ou agendado.
 * 1.4.5.6.	Como editor do controle financeiro quero
 *          registrar pagamento no cartão de crédito.
 * *************************************************
 * TO-DO: verificar disponibilidade de saldo no mês
 *        nas contas de origem e destino,
 *        considerar pagamentos pendentes???
 ***************************************************/
exports.payOperation = async function (req, res) {
    util.debug(' payOperation() ======================= ini\n',
        'req.body    => ', req.body, '\n',
        'req.decoded => ', req.decoded, '\n',
        'req.params  => ', req.params, '\n',
        'req.url     => ', req.url, '\n',
        'req.method  => ', req.method, '\n',
        'payOperation() ======================= fim');
    // Em qualquer caso:
    // - verificar se conta de origem é conta de reserva financeira;
    // - verificar se conta de destino é conta de recurso financeiro ou conta de cartão de crédito;
    // - verificar disponibilidade de saldo no mês na conta de origem, considerar obrigações pendentes;

    // A conta de destino:
    // - verificar disponibilidade de saldo no mês, a cada mês, considerar obrigações pendentes???

    // Se a conta de destino informada for conta de cartão de crédito:
    // - trata como pagamento com cartão de crédito;
    // - exigir preenchimento de qtyPayments e startDate.

    // Se a conta de destino informada for conta de recurso financeiro e a data de pagamento for futura:
    // - tata como agendamento de pagamento com recurso financeiro;
    // - exigir preenchimento apenas de qtyPayments.
    await validateOperationParameters(req.body, req.decoded, req.method.toUpperCase(), req.url.toUpperCase().replace(/\//g, ''))
        .then(async accounts => {
            // TO-DO: verificar disponibilidade de saldo no mês nas contas de origem e destino, considerar pagamentos pendentes???

            // Início da Transação...
            try {
                await db.transaction(async transaction => {
                    await doPay(req, transaction);
                }); // Commit
            } catch (err) { // RollBack               
                return util.returnErr(err, res);
            }

            // Fim da Transação!
            let qty = parseInt(req.body.qtyPayments || '1');
            let strDate = util.strBrlDateToString(req.body.startDate || req.body.oprDate);
            return res.status(200).send({
                message: `Realizado pagamento ${req.body.oprTypeId === 7 ? 'agendado ' : ''}de ${util.currency(req.body.value)} usando a reserva financeira [${accounts.sourceAccount.name}] com valor disponível em [${accounts.destinyAccount.name}] ${qty == 1 ? 'em' : 'a partir de'} ${strDate}${qty == 1 ? '' : ' dividido em ' + req.body.qtyPayments + ' parcelas mensais'}.`
            });
        })
        .catch(err => util.returnErr(err, res));
}

async function doPay(req, transaction) {
    // save operation
    let savedOperation = await Operation.saveOperation(req.body, transaction);

    // Se não possui data de início da operação, considera para efeito de parcelamento a própria data da operação
    if (savedOperation.startDate === undefined)
        savedOperation.startDate = savedOperation.oprDate;

    // Para tratar parcelamento, calcula o valor da primeira parcela e demais parcelas.
    let parcels = valParcels(savedOperation.value, savedOperation.qtyPayments || 1);

    // Tratar o pagamento conforme cada tipo:
    switch (savedOperation.oprTypeId) {
        case 5: // Pagar à Vista
            // Subtrai o valor das contas de reserva e de recurso.
            // update balance - Subtrai valor do saldo da conta de origem da operação
            await Balance.updateBalanceSubSource(savedOperation, transaction);
            // update balance - Subtrai valor do saldo da conta de destino da operação
            await Balance.updateBalanceSubDestiny(savedOperation, transaction);
            break;
        case 6: // Pagar com Cartão de Crédito 
        case 7: // Agendar Pagamento
            // Tratar parcelamento...
            for (let monthDelay = 0; monthDelay < savedOperation.qtyPayments; monthDelay++) {
                // Apura o valor da parcela corrente
                let parcel = parcels.firstParcel;
                if (monthDelay > 0)
                    parcel = parcels.otherParcel;
                savedOperation.value = parcel;

                // Apura a data da parcela e guarda em oprDate...
                savedOperation.oprDate = util.dateWithMonthsDelay(util.strBrlDateToDate(savedOperation.startDate), monthDelay);

                // Se pagamento com cartão de crédito...
                if (savedOperation.oprTypeId == 6) {
                    // Transfere o valor da conta de reserva para a conta de cartão de crédito.
                    await Balance.updateBalanceSubSource(savedOperation, transaction);
                    await Balance.updateBalanceAddDestiny(savedOperation, transaction);
                } else { // savedOperation.oprTypeId == 7
                    // Se pagamento agendado NÃO atualiza o saldo neste momento, 
                    // pois será atualizado quando chegar a data de vencimento.
                }
                // save pending shall (obrigação pendente), se NÃO for pagamento à vista...
                let shall = await Shall.create({
                    shaOperationId: savedOperation.id,
                    shallNr: (1 + monthDelay),
                    shaDate: savedOperation.oprDate,
                    value: savedOperation.value,
                    isPending: true,
                    version: Date.now()
                }, { transaction });

                // Se for Pagamento Agendado com recurso financeiro...
                if (savedOperation.oprTypeId == 7) {
                    // save pending payment (agendamento de pagamento de obrigação pendente)
                    let payment = await Payment.create({
                        payDebitAccountId: savedOperation.oprDestinyAccountId,
                        payDate: savedOperation.oprDate,
                        value: savedOperation.value,
                        isPending: true,
                        version: Date.now()
                    }, { transaction });

                    await PayShall.create({
                        shallId: shall.id,
                        paymentId: payment.id,
                        version: Date.now()
                    }, { transaction });
                }
            }
            break;
    }
}

/****************************************************
 * @returns Lista de obrigações da operação
 ***************************************************/
exports.getShallByOperationId = async function (req, res) {
    // TO-DO
    util.debug(' getShallByOperationId() ======================= ini\n',
        'req.body    => ', req.body, '\n',
        'req.decoded => ', req.decoded, '\n',
        'req.params  => ', req.params, '\n',
        'req.url     => ', req.url, '\n',
        'req.method  => ', req.method, '\n',
        'getShallByOperationId() ======================= fim');

    const userId = req.decoded.id;
    const operationId = req.params.id;
    // Valida o código da operação e retorna o objeto
    await service.verifyOperationId(req.params.id)
        .then(async operation => {
            const oneAccountId = operation.oprSourceAccountId || operation.oprDestinyAccountId;
            // Valida o código de conta associada à operação e retorna o objeto
            await service.verifyAccountId(oneAccountId)
                // Valida o acesso de auditor ao plano de contas da conta
                .then(async account =>
                    service.verifyAuditorAccessByAccount({ account, userId }))
                .then(async account => {
                    if (!account)
                        return res.status(404).send({ message: 'Erro ao buscar operações.' });
                    // Recupera as obrigações da referida operação
                    let shalls = await Shall.findAll({ where: { shaOperationId: operationId } });
                    return res.status(200).send(shalls);
                })
        })
        .catch(err => util.returnErr(err, res));
}

/****************************************************
 * Exclui a operação a ser atualizada e registra nova operação.
 * A operação alterada (nova) permanece pendente de liquisação,
 * mesmo que a operação já estivesse liquidada.
 ***************************************************/
exports.updateOperationById = async function (req, res) {
    util.debug(' updateOperationById() ======================= ini\n',
        'req.body    => ', req.body, '\n',
        'req.decoded => ', req.decoded, '\n',
        'req.params  => ', req.params, '\n',
        'req.url     => ', req.url, '\n',
        'req.method  => ', req.method, '\n',
        'updateOperationById() ======================= fim');
    // delete original operation
    // save new operation
    let operationId = req.params.id;
    let userId = req.decoded.id;
    let operationVersion = new Date(Date.parse(req.body.version));
    await service.verifyOperationId(operationId)
        .then(async operation => service.verifyAccountId(operation.oprSourceAccountId || operation.oprDestinyAccountId))
        .then(async account => service.verifyEditorAccessByAccount({ account, userId }))
        .then(async accountGranted => {
            if (!accountGranted)
                return res.status(405).send({ message: `Erro ao tentar excluir operação: [${operationId}]` });
            // Inicio da transação...
            try {
                await db.transaction(async transaction => {
                    // Recupera Operação...
                    let operation = await Operation.findByPk(operationId);
                    if (operation.version.getTime() !== operationVersion.getTime())
                        return util.returnErr({ status: 403, message: `Não foi possível excluir o registro da operação porque o dado estava defasado. [${JSON.stringify(operation.version).replace(/\"/g, '')} <> ${JSON.stringify(operationVersion).replace(/\"/g, '')}]` }, res);
                    // EXCLUIR a operação, eventuais obrigações e pagamentos (operation, shall, payment), e Reverter os saldos (balance)
                    await Operation.delete(operation, transaction);
                    // INCLUIR nova operação
                    await doNewOperation(req, transaction);
                });// Commit
            } catch (err) { // RollBack
                return util.returnErr(err, res);
            };
            // Fim da Transação!
            return res.status(200).send({ message: 'Operação alterada!' });
        })
        .catch(err => util.returnErr(err, res));

}

async function doNewOperation(req, transaction) {
    await validateOperationParameters(req.body, req.decoded, req.method.toUpperCase(), req.url.toUpperCase().replace(/\//g, ''))
        .then(async () => {
            switch (req.body.oprTypeId) {
                case 1:
                case 2:
                    await doCreditOrReserv(req, transaction);
                    break;
                case 3:
                case 4:
                    await doTransfer(req, transaction);
                    break;
                case 5:
                case 6:
                case 7:
                    await doPay(req, transaction);
                    break;
                case 8:
                    await doForecast(req, transaction);
                    break;
            }
        });
}

/****************************************************
 * Exclui a operação e estorna valores.
 ***************************************************/
exports.deleteOperationById = async function (req, res) {
    util.debug(' deleteOperationById() ======================= ini\n',
        'req.body    => ', req.body, '\n',
        'req.decoded => ', req.decoded, '\n',
        'req.params  => ', req.params, '\n',
        'req.url     => ', req.url, '\n',
        'req.method  => ', req.method, '\n',
        'deleteOperationById() ======================= fim');
    // delete operation, shall*, payment*, payshall* (* depende do tipo de operação)
    // reverte saldo: 1,2,3,4,5,6
    // se houver pagamento (payment), excluir e reverter saldo: 7,8
    // excluir obrigação (shall): 6,7,8

    let operationId = req.params.id;
    let userId = req.decoded.id;
    let operationVersion = new Date(Date.parse(req.body.version));
    await service.verifyOperationId(operationId)
        .then(async operation => service.verifyAccountId(operation.oprSourceAccountId || operation.oprDestinyAccountId))
        .then(async account => service.verifyEditorAccessByAccount({ account, userId }))
        .then(async accountGranted => {
            if (!accountGranted)
                return res.status(405).send({ message: `Erro ao tentar excluir operação: [${operationId}]` });
            // Inicio da transação...
            try {
                await db.transaction(async transaction => {
                    // Recupera Operação...
                    let operation = await Operation.findByPk(operationId);
                    if (operation.version.getTime() !== operationVersion.getTime())
                        return util.returnErr({ status: 403, message: `Não foi possível excluir o registro da operação porque o dado estava defasado. [${JSON.stringify(operation.version).replace(/\"/g, '')} <> ${JSON.stringify(operationVersion).replace(/\"/g, '')}]` }, res);
                    // - Excluir a operação, eventuais obrigações e pagamentos (operation, shall, payment)
                    // - Reverter os saldos (balance)
                    await Operation.delete(operation, transaction);
                });// Commit
            } catch (err) { // RollBack
                return util.returnErr(err, res);
            };
            // Fim da Transação!
            return res.status(200).send({ message: 'Operação excluída!' });
        })
        .catch(err => util.returnErr(err, res));

}

// ==============================================================
// Rotinas auxiliares
// ==============================================================

// =====================
// valParcels - Calcula valor da primeira e demais parcelas
// =====================
function valParcels(value, qty) {
    let firstParcel = value
    let otherParcel = 0;
    if (qty > 1) {
        otherParcel = (value / qty).toFixed(2);
        firstParcel = (value - (otherParcel * (qty - 1))).toFixed(2);
    }
    return { firstParcel, otherParcel }
}


// ==============================================================
// Validar tipo de operação e parâmetros requeridos
// CAMPO                CREDIT RESERV TRANSFER PAY FORECAST DELETE
//                  id                                        S 
//           oprTypeId    S      S       S      S     S              
//  oprSourceAccountId                   S      S     S           
// oprDestinyAccountId    S      S       S      S                   
//         description    S      S       S      S     S              
//             oprDate    S      S       S      S     S              
//         qtyPayments                          O     S          
//           startDate                          O     S         
//               value    S      S       S      S     S          
//             version                                        S 
// ==============================================================
// 1 - CREDIT   - Receber Crédito (adiciona débito)
// 2 - RESERV   - Reservar Valor (adiciona crédito)
// 8 - FORECAST - Agendar Despesa (cria shall, não atualiza saldos)
// TRANSFER pode ser:
// 3 - Transferir valor (de débito para débito)
// 4 - Transferir reserva (de crédito para crédito)
// PAY pode ser:
// 5 - Pagar à vista (reduz débito e crédito)
// 6 - Pagar com cartão de crédito (realiza transferência de crédito para cartão de crédito e cria shall)
// 7 - Agendar Pagamento (cria shall e payment, não atualiza saldos)
// ==============================================================
function validateOperationParameters(operation, user, httpMethod, url) {
    util.debug(' validateOperationParameters() ======================= ini\n',
        'operation => ', operation, '\n',
        'user => ', user, '\n',
        'httpMethod => ', httpMethod, '\n',
        'url => ', url, '\n',
        'validateOperationParameters() ======================= fim');
    return new Promise(async (resolve, reject) => {

        // Verificar código de operação
        if (!isOprTypeIdValid(operation.oprTypeId))
            reject({ status: 405, message: `Erro: Tipo de operação inválida.oprTypeId = [${operation.oprTypeId}]` });

        // Verificar preenchimento dos campos obrigatórios para cada tipo de operação
        switch (operation.oprTypeId) {
            case 1: // Receber Crédito
                isCreditOperationValid(operation, user, httpMethod, url)
                    .then(destinyAccount => resolve(destinyAccount))
                    .catch(err => reject(err))
                break;
            case 2: // Reservar Valor
                isReservOperationValid(operation, user, httpMethod, url)
                    .then(destinyAccount => resolve(destinyAccount))
                    .catch(err => reject(err))
                break;
            case 3: // Transferir Valor - validação similar ao Transferir Reserva
            case 4: // Transferir Reserva
                isTransferOperationValid(operation, user, httpMethod, url)
                    .then(accounts => resolve(accounts))
                    .catch(err => reject(err))
                break;
            case 5: // Pagar à Vista
            case 6: // Pagar com Cartão de Crédito 
            case 7: // Agendar Pagamento
                isPayOperationValid(operation, user, httpMethod, url)
                    .then(accounts => resolve(accounts))
                    .catch(err => reject(err))
                break;
            case 8: // Agendar Despesa
                isForecastOperationValid(operation, user, httpMethod, url)
                    .then(sourceAccount => resolve(sourceAccount))
                    .catch(err => reject(err))
                break;
            default: // Default - Tipo de operação inválida
                reject({ status: 405, message: `Erro: Tipo de operação inválida.oprTypeId = [${operation.oprTypeId}]` });
        }
    })
}

// ==============================================================
// Validação de Operação
// ==============================================================

function isPostCreditOrPut(method, url) {
    return (method === 'POST' && url === 'CREDIT') || (method === 'PUT' && !isNaN(url))
}

function isPostReservOrPut(method, url) {
    return (method === 'POST' && url === 'RESERV') || (method === 'PUT' && !isNaN(url))
}

function isPostTransferOrPut(method, url) {
    return (method === 'POST' && url === 'TRANSFER') || (method === 'PUT' && !isNaN(url))
}

function isPostForecastOrPut(method, url) {
    return (method === 'POST' && url === 'FORECAST') || (method === 'PUT' && !isNaN(url))
}

function isPostPayOrPut(method, url) {
    return (method === 'POST' && url === 'PAY') || (method === 'PUT' && !isNaN(url))
}



// =====================
// Credit
// =====================
function isCreditOperationValid(operation, user, httpMethod, url) {
    return new Promise(async (resolve, reject) => {
        if (isPostCreditOrPut(httpMethod, url) &&
            isDescriptionValid(operation.description) &&
            isDateValid(operation.oprDate) &&
            isValueValid(operation.value))
            // Validar conta e acesso
            isAccountIdValidAndEditorAcessGranted(operation.oprDestinyAccountId, user.id)
                .then(account => {
                    util.debug('isAccountIdValidAndEditorAcessGranted - account => ', account);
                    // Validar se conta de destino é uma conta de recurso financeiro (conta de débito)
                    if (!account.isCredit)
                        resolve(account) // retornando a conta ao invés de true
                    else
                        reject({ status: 405, message: `Erro: Operação de crédito não efetuada, a conta informada[${account.name}]não é uma conta de recurso financeiro.` })
                })
                .catch(err => reject(err))
        else
            reject({ status: 405, message: `Erro: Operação não efetuada. Erro nos parâmetros fornecidos: ${url} com ${JSON.stringify(operation).replace(/\"/g, '\'')}` });
    })
}
// =====================
// Reserv
// =====================
function isReservOperationValid(operation, user, httpMethod, url) {
    return new Promise(async (resolve, reject) => {
        if (isPostReservOrPut(httpMethod, url) &&
            isDescriptionValid(operation.description) &&
            isDateValid(operation.oprDate) &&
            isValueValid(operation.value))
            // Validar conta e acesso
            isAccountIdValidAndEditorAcessGranted(operation.oprDestinyAccountId, user.id)
                .then(account => {
                    util.debug('isAccountIdValidAndEditorAcessGranted - account => ', account);
                    // Validar se conta de destino é uma conta de reserva financeira (conta de crédito)
                    if (account.isCredit && !account.isCard)
                        resolve(account) // retornando a conta ao invés de true
                    else
                        reject({ status: 405, message: `Erro: Operação de reserva não efetuada, a conta informada[${account.name}]não é uma conta de reserva financeira.` })
                })
                .catch(err => reject(err))
        else
            reject({ status: 405, message: `Erro: Operação não efetuada. Erro nos parâmetros fornecidos: ${url} com ${JSON.stringify(operation).replace(/\"/g, '\'')}` });
    })
}
// =====================
// Transfer
// =====================
function isTransferOperationValid(operation, user, httpMethod, url) {
    return new Promise(async (resolve, reject) => {
        if (isPostTransferOrPut(httpMethod, url) &&
            isDescriptionValid(operation.description) &&
            isDateValid(operation.oprDate) &&
            isValueValid(operation.value)) {
            // Validar conta e acesso de editor
            let sourceAccount = await isAccountIdValidAndEditorAcessGranted(operation.oprSourceAccountId, user.id)
                .catch(err => reject(err))
            let destinyAccount = await isAccountIdValidAndEditorAcessGranted(operation.oprDestinyAccountId, user.id)
                .catch(err => reject(err))
            // verificar se as contas de origem e destino são do mesmo tipo (recurso ou reserva)
            if (sourceAccount.isCredit === destinyAccount.isCredit &&
                sourceAccount.isCard === destinyAccount.isCard &&
                sourceAccount.isCard === false)
                resolve({ sourceAccount, destinyAccount }) // retorna as contas de origem e destino
            else
                reject({ status: 405, message: `Erro: Operação de transferência não efetuada.As contas de origem[${sourceAccount.name}]e destino[${destinyAccount.name}]não são compatíveis.` })
        }
        else
            reject({ status: 405, message: `Erro: Operação não efetuada. Erro nos parâmetros fornecidos: ${url} com ${JSON.stringify(operation).replace(/\"/g, '\'')}` });
    })
}
// =====================
// Pay
// =====================
function isPayOperationValid(operation, user, httpMethod, url) {
    return new Promise(async (resolve, reject) => {
        if (isPostPayOrPut(httpMethod, url) &&
            isDescriptionValid(operation.description) &&
            isDateValid(operation.oprDate) &&
            ( // Validação inicial a ser confirmada com os atributos da conta de destino
                (operation.oprTypeId === 5 && (
                    // pagamento à vista não possui parcelas ou data de início
                    operation.qtyPayments === undefined && operation.startDate === undefined
                )) ||
                (operation.oprTypeId === 6 && (
                    // pagamento no cartão requer qtd parcelas e data da primeira
                    isQtyPaymentsValid(operation.qtyPayments) && isDateValid(operation.startDate)
                )) ||
                (operation.oprTypeId === 7 && (
                    // pagamento agendado permite parcelamento, mas usa como data inicial a data da operação
                    isQtyPaymentsValid(operation.qtyPayments) && operation.startDate === undefined
                ))) &&
            isValueValid(operation.value)) {

            // Validar conta e acesso de editor
            let sourceAccount = await isAccountIdValidAndEditorAcessGranted(operation.oprSourceAccountId, user.id)
                .catch(err => reject(err))
            let destinyAccount = await isAccountIdValidAndEditorAcessGranted(operation.oprDestinyAccountId, user.id)
                .catch(err => reject(err))

            if (
                // A conta de origem deve ser conta de reserva financeira...
                (sourceAccount.isCredit && !sourceAccount.isCard) &&
                // A conta de destino deve ser conta de recurso financeiro ou conta de cartão de crédito...
                !(destinyAccount.isCredit && !destinyAccount.isCard) &&
                (
                    // Se pagamento à vista, conta de destino deve ser de recurso financeiro e não pode informar qtyPayments e startDate
                    (operation.oprTypeId === 5 && !destinyAccount.isCredit) ||
                    // Se pagamento com cartão, a conta de destino deve ser conta de cartão de crédito e exigir preenchimento de qtyPayments e startDate
                    (operation.oprTypeId === 6 && destinyAccount.isCredit) ||
                    // Se pagamento agendado, a conta de destino deve ser conta de recurso financeiro,  exigir preenchimento de qtyPayments, e a data de pagamento futura.
                    (operation.oprTypeId === 7 && !destinyAccount.isCredit &&
                        Date.parse(operation.oprDate) > Date.now()
                    )
                ))
                resolve({ sourceAccount, destinyAccount }) // retorna as contas de origem e destino
            else
                reject({
                    status: 405, message: `Erro: Operação de ${operation.oprTypeId === 5 ? "pagamento à vista" : ""}${operation.oprTypeId === 6 ? "pagamento com cartão de crédito" : "agendamento de pagamento"} não efetuada.As contas de origem[${sourceAccount.name}]e destino[${destinyAccount.name}]não são compatíveis.`
                })
        }
        else
            reject({ status: 405, message: `Erro: Operação não efetuada. Erro nos parâmetros fornecidos: ${url} com ${JSON.stringify(operation).replace(/\"/g, '\'')} ` });
    })
}
// =====================
// Forecast
// =====================
function isForecastOperationValid(operation, user, httpMethod, url) {
    return new Promise(async (resolve, reject) => {
        if (isPostForecastOrPut(httpMethod, url) &&
            // Não permite informar conta de destino
            operation.oprDestinyAccountId === undefined &&
            isDescriptionValid(operation.description) &&
            isDateValid(operation.oprDate) &&
            isQtyPaymentsValid(operation.qtyPayments) &&
            // Não permite informar data de início, usa a data da operação como data de início
            operation.startDate === undefined &&
            isValueValid(operation.value)) {

            // Validar conta e acesso de editor
            let sourceAccount = await isAccountIdValidAndEditorAcessGranted(operation.oprSourceAccountId, user.id)
                .catch(err => reject(err))

            // A conta de origem deve ser conta de reserva financeira...
            if (sourceAccount.isCredit && !sourceAccount.isCard)
                resolve(sourceAccount) // retorna a conta de origem
            else
                reject({ status: 405, message: `Erro: Operação de agendamento de despesa não efetuada.A conta informada[${sourceAccount.name}]não é conta de reserva financeira.` })
        }
        else
            reject({ status: 405, message: `Erro: Operação não efetuada. Erro nos parâmetros fornecidos: ${url} com ${JSON.stringify(operation).replace(/\"/g, '\'')} ` });
    })
}


// ==============================================================
// Validação de Campos
// ==============================================================

function isDescriptionValid(description) {
    // não permitir operação sem descrição, ou com descrição menor que 5 caracteres
    return !(description === undefined ||
        description.length < 5);
}

function isOprTypeIdValid(oprTypeId) {
    // Verificar faixa do código de tipo de operação
    return !(oprTypeId === undefined ||
        isNaN(oprTypeId) ||
        oprTypeId < 1 ||
        oprTypeId > 8);
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

function isDateValid(date) {
    // não permitir data de operação inválida, ou inferior à 1900
    return !(date === undefined ||
        isNaN(Date.parse(date)) ||
        Date.parse(date) < Date.parse("1900-01-01"));
}

function isQtyPaymentsValid(qtyPayments) {
    // não permitir quantidade de parcelas inferior à 1 ou fracionária
    return !(qtyPayments === undefined ||
        isNaN(qtyPayments) ||
        qtyPayments < 1 ||
        qtyPayments != parseInt(qtyPayments))
}

function isValueValid(value) {
    // não permitir operação com valor nulo
    return !(value === undefined ||
        value == 0);
}


