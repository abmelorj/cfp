'use strict';

const { Model, DataTypes } = require('sequelize');
const db = require('./../database/db');

class Operation extends Model {
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