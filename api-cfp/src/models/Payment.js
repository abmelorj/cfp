'use strict';

const { Model, DataTypes } = require('sequelize');
const db = require('./../database/db');

class Payment extends Model {
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