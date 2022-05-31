'use strict';
const request = require("supertest");
const app = require("../app");
const digest = require("../config/digest");
const logerr = require("../config/logerr");
let users = [];

require('dotenv').config();
const mylog = (...msg) => {
    if ((process.env.DEBUG || 'false') == 'true')
        return console.log(...msg);
}

beforeAll(async () => {
    // inicializa variáveis auxiliares
    await digest("senhaproprietario")
        .then(hash => users.push({
            name: "Proprietario de CFP",
            email: "proprietario@cfp.com.br",
            hash
        }));
    await digest("senhacoautor")
        .then(hash => users.push({
            name: "Coautor de CFP",
            email: "coautor@cfp.com.br",
            hash
        }));
    try {
        // Insere usuários
        await request(app)
            .post('/auth/signup')
            .send(users[0])
            .then(responseUser => users[0] = responseUser.body)
            .catch(err => logerr(`Erro ao inserir dados iniciais: ${err}`));
        await request(app)
            .post('/auth/signup')
            .send(users[1])
            .then(responseUser => users[1] = responseUser.body)
            .catch(err => logerr(`Erro ao inserir dados iniciais: ${err}`));
    } catch (err) {
        logerr(`Erro ao inserir dados iniciais: ${err}`);
    }
})

it('1.4.3.1. Como proprietário do controle financeiro quero conceder acesso de Auditor para outro usuário autenticado consultar os registros.', async () => {
    const response = await request(app)
        .post(`/api/accessgrants`)
        .send({ token: users[0].token, agOwnerId: users[0].id, agGrantedUserId: users[1].id, agAccessRuleId: 4 });
    expect(response.status).toBe(201);
    // Guarda id do acesso concedido para depois revogar no teste '1.4.3.4'
    users[0].auditorId = response.body.id
});

it('1.4.3.2. Como proprietário do controle financeiro quero conceder acesso de Editor para outro usuário autenticado registrar operações financeiras.', async () => {
    const response = await request(app)
        .post(`/api/accessgrants`)
        .send({ token: users[0].token, agOwnerId: users[0].id, agGrantedUserId: users[1].id, agAccessRuleId: 3 });
    expect(response.status).toBe(201);
});

it('1.4.3.3. Como proprietário do controle financeiro quero conceder acesso de Coautor para outro usuário autenticado atualizar a estrutura de categorias e contas.', async () => {
    const response = await request(app)
        .post(`/api/accessgrants`)
        .send({ token: users[0].token, agOwnerId: users[0].id, agGrantedUserId: users[1].id, agAccessRuleId: 2 });
    expect(response.status).toBe(201);
});

it('Listar os acessos concedidos por um usuário', async () => {
    const response = await request(app)
        .get(`/api/accessgrants/${users[0].id}/grants`)
        .send({ token: users[0].token });
    expect(response.status).toBe(200);
})

it('Listar os acessos recebidos por um usuário', async () => {
    const response = await request(app)
        .get(`/api/accessgrants/${users[0].id}/granted`)
        .send({ token: users[0].token });
    expect(response.status).toBe(200);
})

it('Erro ao listar os acessos recebidos por um usuário inexistente', async () => {
    const response = await request(app)
        .get(`/api/accessgrants/9999/granted`)
        .send({ token: users[0].token });
    // Antes de verificar se o usuário existe é verificado se quem solicita tem 
    // acesso mínimo de editor no CFP do usuário informado.
    // Como o usuário informado não existe, logo o usuário autenticado nem pode ter acesso ao CFP.
    expect(response.status).toBe(401);
})

it('1.4.3.4. Como proprietário do controle financeiro quero revogar acesso concedido a outro usuário para manter o acesso controlado.', async () => {
    const response = await request(app)
        .delete(`/api/accessgrants/${users[0].auditorId}`)
        .send({ token: users[0].token });
    expect(response.status).toBe(200);
});

