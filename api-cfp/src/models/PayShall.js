'use strict';

const { Model, DataTypes } = require('sequelize');
const db = require('./../database/db');

class PayShall extends Model {
}

PayShall.init({
    id: {
        type: DataTypes.INTEGER.ZEROFILL,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    version: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    engine: 'InnoDB',
    sequelize: db,
    modelName: 'PayShall',
    comment: 'Pagar Obrigação é o registro associativo que identifica um ou mais obrigações quitadas com um pagamento único com valor existente em conta de recurso financeiro (conta de débito).',
    freezeTableName: true,
    timestamps: false
});

module.exports = PayShall;