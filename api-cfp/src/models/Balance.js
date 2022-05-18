'use strict';

const { Model, DataTypes, Op } = require('sequelize');
const db = require('./../database/db');

class Balance extends Model {
    // Account ------------------------------------------------------
    // buscar o saldo final da conta, quando não localizar retorna null
    static async getBalance(balAccountId) {
        return Balance.findOne({
            where: { balAccountId },
            order: [['yearMonth', 'DESC']],
            limit: 1
        })
            .then(balance => balance, reason => reason)
            .catch(err => err);
    }
    // buscar o saldo da conta até o mes informado, quando não localizar retorna null
    static async getBalanceByYearMonth(balAccountId, yearMonth) {
        return Balance.findOne({
            where: {
                balAccountId,
                yearMonth: {
                    [Op.lte]: yearMonth
                }
            },
            order: [['yearMonth', 'DESC']],
            limit: 1
        })
            .then(balance => balance, reason => reason)
            .catch(err => err);
    }
    // // Category -----------------------------------------------------
    // // buscar a soma do saldo final das contas da categoria, quando não localizar retorna null
    // static async getBalance(balAccountIds) {
    //     return Balance.findOne({
    //         where: { balAccountId: [...balAccountIds] },
    //         order: [['yearMonth', 'DESC']],
    //         limit: 1
    //     })
    //         .then(balance => balance, reason => reason)
    //         .catch(err => err);
    // }
}

Balance.init({
    id: {
        type: DataTypes.INTEGER.ZEROFILL,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    yearMonth: {
        type: DataTypes.INTEGER.ZEROFILL,
        allowNull: false,
        unique: 'AccountMonthBalance'
    },
    value: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
    },
    version: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    engine: 'InnoDB',
    sequelize: db,
    modelName: 'Balance',
    comment: 'Representa o saldo disponível em cada conta mês a mês a partir do mês da data de referência do primeiro registro financeiro na conta.',
    freezeTableName: true,
    timestamps: false
});

module.exports = Balance;