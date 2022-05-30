'use strict';

const { Model, DataTypes } = require('sequelize');
const db = require('./../database/db');
const Category = require('./Category');

class Account extends Model {

    static async findByNameAndOwnerId(name, catOwnerId, transaction) {
        return Account.findOne({
            where: { name },
            include: {
                model: Category,
                as: 'accCategory',
                where: { catOwnerId }
            },
            transaction: transaction
        })
            .then(account => account, reason => reason)
            .catch(err => err);
    }

    static async findByOwnerId(catOwnerId, transaction) {
        return Account.findAll({
            include: {
                model: Category,
                as: 'accCategory',
                where: { catOwnerId: catOwnerId },
                required: true,
                transaction
            },
            order: [
                ['name', 'ASC']
            ],
            transaction: transaction
        })
            .then(accounts => accounts, reason => reason)
            .catch(err => err);
    }
}

Account.init({
    id: {
        type: DataTypes.INTEGER.ZEROFILL,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    isCredit: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    isCard: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    isActive: {
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
    modelName: 'Account',
    comment: 'Contas de recurso financeiro (débito), reserva financeira (crédito) ou cartão de crédito criadas pelo proprietário ou coautor do controle financeiro para organizar o controle financeiro.',
    freezeTableName: true,
    timestamps: false
});

module.exports = Account;