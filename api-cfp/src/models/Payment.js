'use strict';
const util = require('./util');


const { Model, DataTypes, Op } = require('sequelize');
const db = require('./../database/db');
const Balance = require('./Balance');
const Operation = require('./Operation');
const PayShall = require('./PayShall');
const Shall = require('./Shall');

class Payment extends Model {

    /***********************************************
     * Exclusão de pagamento implica em:
     * - reverter os saldos (balance) envolvidos na operação;
     * - retornar as obrigações (shall) para pendente de pagamento.
     **********************************************/
    static async delete(payment, transaction, destroy = true) {
        return new Promise(async (resolve, reject) => {
            // Se o pagamento já estava liquidado (pagamento efetuado)...
            if (!payment.isPending) {
                /***********************************************************
                 * Localizar as obrigações (shall) e respectivas operações
                 * associadas ao pagamento que será excluído.
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
                 * Para cada obrigação (shall), estornar os valores 
                 * anteriormente liquidados (shall.isPending = false) nas contas...
                 * - de destino: para operação 6 (cartão de crédito);
                 * - de origem: para as operações 7 e 8 se obrigação estava paga 
                 * Estornar também o valor da obrigação na conta de débito
                 * utilizada para pagamento.
                 * 
                 * Regras para estornar cada shall.value na shall.shaDate:
                 *   6 - estornar débitos na operation.oprDestinyAccount e payment.payDebitAccount
                 *   7 - estornar débitos na operation.oprSourceAccount e payment.payDebitAccount
                 *   8 - estornar débitos na operation.oprSourceAccount e payment.payDebitAccount
                 * 
                 */
                payShalls.forEach(async payShall => {
                    switch (payShall.sha.shaOperation.oprTypeId) {
                        case 6: // Pagamento com cartão de crédito
                            // estornar valor pendente para o cartão
                            await Balance.updateBalanceAddDestiny({
                                oprDestinyAccountId: payShall.sha.shaOperation.oprDestinyAccountId,
                                oprDate: payShall.sha.shaDate,
                                value: payShall.sha.value
                            }, transaction);
                            break;
                        case 7: // Pagamento agendado
                        case 8: // Despesa agendada
                            // estornar valor para a conta de reserva financeira
                            await Balance.updateBalanceAddDestiny({
                                oprDestinyAccountId: payShall.sha.shaOperation.oprSourceAccountId,
                                oprDate: payShall.sha.shaDate,
                                value: payShall.sha.value
                            }, transaction);
                            break;
                    }
                    // Retornar a obrigação para pendente de pagamento
                    payShall.sha.isPending = true;
                    await payShall.sha.save({ transaction });
                })

                /***********************************************************
                 * Antes de excluir o pagamento, estornar o débito na conta 
                 * de recurso financeiro se já estiver liquidado.
                 */
                await Balance.updateBalanceAddDestiny({
                    oprDestinyAccountId: payment.payDebitAccountId,
                    oprDate: payment.payDate,
                    value: payment.value
                }, transaction);

            } // !payment.isPending

            // Se destroy não foi informado, assume verdadeiro como default.
            if (destroy) {
                // EXCLUI o registro de pagamento, pendente ou efetivado.
                await payment.destroy({ transaction });
            }

            resolve(true);
        }).catch(err => reject(err.message));
    }

    /****************************************************
     * Obter o valor de pagamentos pendentes para uma 
     * conta até determinado mês.
     ***************************************************/
    static async getPendingValueByAccountIdYearMonth(accountId, yearMonth, transaction) {
        return Payment.sum('value', {
            where: {
                [Op.and]: [
                    { payDebitAccountId: accountId },
                    { isPending: true },
                    { payDate: { [Op.lt]: util.firstDayNextYearMonth(yearMonth) } }
                ]
            },
            transaction
        });
    }

    /****************************************************
     * Obter o valor de pagamentos pendentes para uma conta.
     ***************************************************/
    static async getPendingValueByAccountId(accountId, transaction) {
        return Payment.sum('value', {
            where: {
                [Op.and]: [
                    { payDebitAccountId: accountId },
                    { isPending: true }
                ]
            },
            transaction
        });
    }
}

Payment.init({
    id: {
        type: DataTypes.INTEGER.ZEROFILL,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    payDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    value: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    },
    isPending: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    version: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    engine: 'InnoDB',
    sequelize: db,
    modelName: 'Payment',
    comment: 'Pagamento é o registro da associação da conta de recurso financeiro (conta de débito) utilizada para liquidação de uma ou mais despesas agendadas em contas de reserva financeira ou conta de cartão de crédito em um pagamento único.',
    freezeTableName: true,
    timestamps: false
});

module.exports = Payment;