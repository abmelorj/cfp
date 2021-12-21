'use strict';

const AccessRule = require('../models/AccessRule');

exports.listAccessRules = async function (req, res) {
    await AccessRule.findAll().
        then(accessRules => {
            if (accessRules.length == 0)
                return res.status(404).send('Erro: Perfis de acesso não foram carregados.')
            else
                return res.status(200).send(accessRules);
        })
        .catch(err => res.status(500).send(`Erro ao buscar perfis de acesso ==> [${err}]`));
}

exports.getAccessRuleById = async function (req, res) {
    await AccessRule.findByPk(req.params.id)
        .then(accessRule => {
            if (!accessRule)
                return res.status(404).send('Perfil de acesso não localizado.')
            else
                return res.status(200).send(accessRule);
        })
        .catch(err => res.status(500).send(`Erro ao buscar perfil de acesso ==> [${err}]`));
}
