'use strict';

const { Model, DataTypes } = require('sequelize');
const db = require('./../database/db');

class Shall extends Model {

}

Shall.init({
    id: {
        type: DataTypes.INTEGER.ZEROFILL,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    shallNr: {
        type: DataTypes.TINYINT,
        allowNull: false
    },
    shaDate: {
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
    modelName: 'Shall',
    comment: 'Obrigação pendente de pagamento, que é gerada a partir das operações de pagamento com cartão de crédito ou de agendamento de pagamento.',
    freezeTableName: true,
    timestamps: false
});

module.exports = Shall;