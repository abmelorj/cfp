'use strict';

const { DataTypes, Model } = require('sequelize');
const db = require('./../database/db');

class OperationType extends Model { }

OperationType.init({
    id: {
        type: DataTypes.DECIMAL(2).ZEROFILL,
        autoIncrement: false,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    description: {
        type: DataTypes.STRING(100),
        allowNull: false
    }
}, {
    engine: 'InnoDB',
    sequelize: db,
    modelName: 'OperationType',
    comment: 'Tipos de operação tratadas pelo sistema',
    freezeTableName: true,
    timestamps: false
});

module.exports = OperationType;