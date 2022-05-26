'use strict';

const { Model, DataTypes } = require('sequelize');
const db = require('./../database/db');

class Category extends Model {

    static async findByNameAndOwnerId(name, catOwnerId, transaction) {
        return Category.findOne({
            where: { name, catOwnerId },
            transaction
        })
            .then(category => category, reason => reason)
            .catch(err => err);
    }

    static async findByOwnerId(catOwnerId, transaction) {
        return Category.findAll({
            where: { catOwnerId },
            order: [
                ['name', 'ASC']
            ],
            transaction
        })
            .then(categories => categories, reason => reason)
            .catch(err => err);
    }
}

Category.init({
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
    modelName: 'Category',
    comment: 'Categorias criadas pelo proprietário ou coautor do controle financeiro para agrupar as contas de recurso financeiro (débito), reserva financeira (crédito) ou cartão de crédito para facilitar a navegação no controle financeiro.',
    freezeTableName: true,
    timestamps: false
});

module.exports = Category;