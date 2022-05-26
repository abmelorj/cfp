'use strict';
const util = require('./util');

const { Model, DataTypes, Op } = require('sequelize');
const db = require('./../database/db');
const Balance = require('./Balance');
const Payment = require('./Payment');
const PayShall = require('./PayShall');
const Shall = require('./Shall');

class Operation extends Model {

    /**************************************************
     * Exclusão de operação implica em:
     * - reverter os saldos (balance) envolvidos na operação;
     * - excluir os pagamentos associados às obrigações relacionadas com a operação;
     * - excluir as obrigações associadas à operação.
     *************************************************/
    static async delete(operation, transaction) {
        return new Promise(async (resolve) => {

            /****************************************************
             * Apenas operações 6, 7 e 8 poderão ter mais de uma parcela,
             * logo para as operações 1, 2, 3, 4 e 5 não haverá obrigação (Shall)
             * e 'operationWithParcels.shaOperation' será null.
             */
            if (operation.oprTypeId >= 6) {
                /************************************************
                 * Localizar eventuais obrigações e pagamentos
                 * para estornar as liquidações e excluir pagamentos
                 * e obrigações associadas antes de excluir a operação.
                 * 
                 * formato:
                 * - operationWithParcels - operação com cada Shall, PayShall e Payment
                 * - operationWithParcels.shaOperation[] - obrigação (Shall)
                 * - operationWithParcels.shaOperation[].sha[] - associativa com pagamento (PayShall)
                 * - operationWithParcels.shaOperation[].sha[].pay[] - pagamento (Payment)
                 */
                let operationWithParcels = await Operation.findOne({
                    where: { id: operation.id },
                    include: [{
                        model: Shall,
                        as: 'shaOperation',
                        required: false,
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
                    }],
                    transaction
                });

                /****************************************************
                * Regras para excluir uma operação:
                * - Excluir pagamento se houver, providenciando os devidos estornos.
                *   TO-DO: Verificar se o 'cursor' é atualizado com os comandos efetuados 
                *          por Payment.delete() quando houver 1 pagamento liquidando
                *          mais de uma obrigação como será o caso de pagamento de fatura
                *          de cartão de crédito. 
                *        - Se não atualizar o 'cursor', causará erro a partir da segunda
                *          obrigação associada ao mesmo pagamento, pois a obrigação estará
                *          marcada como pendente apesar de já ter estornado o respectivo
                *          pagamento que já estará excluído na base de dados.
                * - Excluir operação providenciando os devidos estornos.
                */
                await operationWithParcels.shaOperation.forEach(async (shall, index) => {
                    /**********************************************
                     * Se houver obrigação associada com pagamento, 
                     * deve excluir o pagamento.
                     */
                    if (shall != null && shall.sha != null)
                        shall.sha.forEach(async payshall => {
                            if (payshall.pay != null)
                                await Payment.delete(payshall.pay, transaction);
                        });

                    /**********************************************
                     * Estornar a obrigação e excluir:
                     * 6 - estorna débito na oprSourceAccount e estorna crédito na oprDestinyAccount
                     * 7 - não há estorno da obrigação, se necessário foi executado na exclusão do pagamento
                     * 8 - não há estorno da obrigação, se necessário foi executado na exclusão do pagamento
                     */
                    if (operationWithParcels.oprTypeId == 6) {
                        // estornar débito na conta de reserva financeira
                        await Balance.updateBalanceAddDestiny({
                            oprDestinyAccountId: operationWithParcels.oprSourceAccountId,
                            oprDate: shall.shaDate,
                            value: shall.value
                        }, transaction);
                        // estornar crédito na conta de cartão de crédito
                        await Balance.updateBalanceSubDestiny({
                            oprDestinyAccountId: operationWithParcels.oprDestinyAccountId,
                            oprDate: shall.shaDate,
                            value: shall.value
                        }, transaction);
                    } // operationWithParcel.oprTypeId == 6

                }) // forEach

            } else { // operation.oprTypeId < 6
                /************************************
                 * Tratar estornos das operações de 1 a 5:
                 * 1,2,3,4 - estornar crédito na oprDestinyAccount
                 * 5 - estornar débito na oprDestinyAccount
                 * 3,4,5 - estornar débito na oprSourceAccount
                 */
                if ([1, 2, 3, 4].includes(operation.oprTypeId))
                    await Balance.updateBalanceSubDestiny(operation, transaction);
                if ([5].includes(operation.oprTypeId))
                    await Balance.updateBalanceAddDestiny(operation, transaction);
                if ([3, 4, 5].includes(operation.oprTypeId))
                    await Balance.updateBalanceAddSource(operation, transaction);
            }

            // EXCLUIR o registro da operação.
            await operation.destroy({ transaction });
            resolve(true);
        }).catch(err => reject(err.message));
    }

    /**************************************************
     * Registra operação preenchendo o campo version com a data e hora atual.
     *************************************************/
    static async saveOperation(operation, transaction) {
        operation.version = Date.now();
        return Operation.create(operation, { transaction });
    }

    /**************************************************
     * 
     *************************************************/
    static async listOperationByAccountIdYearMonth(accountId, yearMonth, transaction) {
        return Operation.findAll({
            where: {
                [Op.and]: [
                    { oprDate: { [Op.gte]: util.firstDayYearMonth(yearMonth) } },
                    { oprDate: { [Op.lt]: util.firstDayNextYearMonth(yearMonth) } },
                    {
                        [Op.or]: [
                            { oprSourceAccountId: accountId },
                            { oprDestinyAccountId: accountId }
                        ]
                    }
                ]
            },
            order: [
                ['oprDate', 'ASC']
            ],
            transaction
        });
    }
}

Operation.init({
    id: {
        type: DataTypes.INTEGER.ZEROFILL,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    description: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    oprDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    qtyPayments: {
        type: DataTypes.TINYINT,
        allowNull: true
    },
    startDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    value: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    },
    version: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    engine: 'InnoDB',
    sequelize: db,
    modelName: 'Operation',
    comment: 'Representa as operações financeiras essenciais do sistema, que além do registro em Operation podem afetar as entidades Balance e/ou Shall. podem ser dos tipos: crédito, reserva, tranferência, agendamento e pagamento.',
    freezeTableName: true,
    timestamps: false
});

module.exports = Operation;