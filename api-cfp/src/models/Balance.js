'use strict';
const { Model, DataTypes, Op } = require('sequelize');
const db = require('./../database/db');
const util = require('./util');

class Balance extends Model {
    // Account ------------------------------------------------------
    // buscar o saldo final da conta, quando não localizar retorna null
    static async getBalance(balAccountId, transaction) {
        return Balance.findOne({
            where: { balAccountId },
            order: [['yearMonth', 'DESC']],
            limit: 1,
            transaction: transaction
        })
            .then(balance => balance, reason => reason)
            .catch(err => err);
    }
    // buscar o saldo da conta até o mes informado, quando não localizar retorna null
    static async getBalanceByYearMonth(balAccountId, yearMonth, transaction) {
        return Balance.findOne({
            where: {
                balAccountId,
                yearMonth: {
                    [Op.lte]: yearMonth
                }
            },
            order: [['yearMonth', 'DESC']],
            limit: 1,
            transaction: transaction
        })
            .then(balance => balance, reason => reason)
            .catch(err => err);
    }

    static async updateBalanceSince(accountId, yearMonth, delta, transaction) {
        // busca saldo no mês da operação, se não existir cria
        await Balance.getOrCreateBalanceAtYearMonth(accountId, yearMonth, transaction);
        // Atualiza o saldo da conta a partir do mês da operação até o último que existir
        await Balance.addDelta(accountId, yearMonth, delta, transaction);
        // Atualiza versão do registro do saldo da conta a partir do mês da operação até o último que existir
        await Balance.updateVersion(accountId, yearMonth, transaction);
    }

    static async getOrCreateBalanceAtYearMonth(accountId, yearMonth, transaction) {
        // obtém o saldo da conta no mês
        let actualBalance = await Balance.getBalanceByYearMonth(accountId, yearMonth, transaction);
        console.log(' actualBalance ==> ', actualBalance)

        // busca resgistro específico de saldo no mês, e se não existir cria
        return Balance.findOrCreate({
            where: {
                balAccountId: accountId,
                yearMonth: yearMonth
            },
            defaults: {
                value: actualBalance === null ? 0 : actualBalance.value,
                version: Date.now()
            },
            transaction: transaction
        });
    }

    static async addDelta(accountId, yearMonth, delta, transaction) {
        // Atualiza o saldo da conta a partir do mês da operação até o último que existir
        return Balance.increment({
            value: delta
        }, {
            where: {
                balAccountId: accountId,
                yearMonth: { [Op.gte]: yearMonth }
            },
            transaction: transaction
        });
    }

    static async updateVersion(accountId, yearMonth, transaction) {
        // Atualiza versão do registro do saldo da conta a partir do mês da operação até o último que existir
        return Balance.update({
            version: Date.now()
        }, {
            where: {
                balAccountId: accountId,
                yearMonth: { [Op.gte]: yearMonth }
            },
            transaction: transaction
        });
    }

    // ==============================================================
    // Atualização de saldo a partir de uma operação de débito ou crédito
    // ==============================================================

    // =====================
    // updateBalanceAddSource - Crédito na conta de origem
    // =====================
    static async updateBalanceAddSource(savedOperation, transaction) {
        // update balance
        await Balance.updateBalanceSince(
            savedOperation.oprSourceAccountId,
            util.yearMonth(savedOperation.oprDate),
            savedOperation.value,
            transaction);
    }
    // =====================
    // updateBalanceAddDestiny - Crédito na conta de destino
    // =====================
    static async updateBalanceAddDestiny(savedOperation, transaction) {
        // update balance
        await Balance.updateBalanceSince(
            savedOperation.oprDestinyAccountId,
            util.yearMonth(savedOperation.oprDate),
            savedOperation.value,
            transaction);
    }
    // =====================
    // updateBalanceSubSource - Débito na conta de origem
    // =====================
    static async updateBalanceSubSource(savedOperation, transaction) {
        // update balance
        await Balance.updateBalanceSince(
            savedOperation.oprSourceAccountId,
            util.yearMonth(savedOperation.oprDate),
            savedOperation.value * (-1),
            transaction);
    }
    // =====================
    // updateBalanceSubDestiny - Débito na conta de destino
    // =====================
    static async updateBalanceSubDestiny(savedOperation, transaction) {
        // update balance
        await Balance.updateBalanceSince(
            savedOperation.oprDestinyAccountId,
            util.yearMonth(savedOperation.oprDate),
            savedOperation.value * (-1),
            transaction);
    }
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