'use strict';
const logerr = require("../config/logerr");
const OperationType = require('../models/OperationType');

exports.listOperationTypes = async function (req, res) {
    await OperationType.findAll().
        then(operationTypes => {
            if (operationTypes.length == 0)
                res.status(404).send(logerr('Erro: Tipos de operação não foram carregadas.'))
            else
                res.status(200).send(operationTypes !== undefined ? operationTypes : [{}]);
        })
        .catch(err => res.status(500).send(logerr(`Erro ao buscar tipo de operação ==> [${err}]`)));
}

exports.getOperationTypeById = async function (req, res) {
    await OperationType.findByPk(req.params.id)
        .then(operationType => {
            if (!operationType)
                res.status(404).send(logerr('Tipo de operação não localizada.'))
            else
                res.status(200).send(operationType);
        })
        .catch(err => res.status(500).send(logerr(`Erro ao buscar tipo de operação ==> [${err}]`)));
}