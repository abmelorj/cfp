'use strict';
const request = require("supertest");
const app = require("../app");
const digest = require("../config/digest");
let users = [];

require('dotenv').config();
const mylog = (...msg) => {
    if ((process.env.DEBUG || 'false') == 'true')
        return console.log(...msg);
}

beforeAll(async () => {
    mylog('Before all - Início...');
    // inicializa ambiente
    await digest("senhaauditor")
        .then(hash => {
            users.push({
                name: "Auditor de CFP",
                email: "auditor@cfp.com.br",
                hash
            });
        })
        .finally(mylog('Before All - Terminou!'));
});

it('1.4.1.1. Como pessoa não registrada quero me cadastrar utilizando endereço de e-mail para utilizar o sistema.', async () => {
    mylog('Teste 01 - Início');
    const response = await request(app)
        .post('/auth/signup')
        .send(users[0]);
    expect(response.body).toMatchObject({ email: users[0].email, name: users[0].name });
    expect(response.status).toBe(201);
    users[0].id = response.body.id;
    users[0].version = response.body.version;
    mylog('1.4.1.1. Token antes = ', users[0].token);
    users[0].token = response.body.token;
    mylog('1.4.1.1. Token depois = ', users[0].token);
    mylog('Body => ', response.body);
    mylog('Teste 01 - Terminou');
});

it('Não deve ser possível incluir usuário com o mesmo email', async () => {
    mylog('Teste 02 - Início');
    const response = await request(app)
        .post('/auth/signup')
        .send({
            name: 'Outro Auditor de CFP',
            email: 'auditor@cfp.com.br',
            hash: users[0].hash
        });
    expect(response.status).toBe(409);
    mylog('Teste 02 - Terminou');
});

it('Não deve ser possível incluir usuário sem nome', async () => {
    mylog('Teste 03 - Início');
    const response = await request(app)
        .post('/auth/signup')
        .send({
            name: '',
            email: 'coautor@cfp.com.br',
            hash: users[0].hash
        });
    expect(response.status).toBe(405);
    mylog('Teste 03 - Terminou');
});

it('Não deve ser possível incluir usuário sem email', async () => {
    mylog('Teste 04 - Início');
    const response = await request(app)
        .post('/auth/signup')
        .send({
            name: 'Coautor de CFP',
            email: '',
            hash: users[0].hash
        });
    expect(response.status).toBe(405);
    mylog('Teste 04 - Terminou');
});

it('Não deve ser possível incluir usuário sem senha', async () => {
    mylog('Teste 05 - Início');
    const response = await request(app)
        .post('/auth/signup')
        .send({
            name: 'Coautor de CFP',
            email: 'coautor@cfp.com.br',
            hash: ''
        });
    expect(response.status).toBe(405);
    mylog('Teste 05 - Terminou');
});

it('1.4.1.2. Como pessoa não registrada quero me cadastrar utilizando autenticação do Google para utilizar o sistema.', async () => {
    mylog('Teste 06 - Início');
    // TODO
    mylog('Teste 06 - Terminou');
});

it('1.4.2.1. Como pessoa registrada quero me autenticar com a credencial associada ao e-mail para utilizar o sistema.', async () => {
    mylog('Teste 07 - Início');
    const response = await request(app)
        .post('/auth/signin')
        .send(users[0])
    mylog('1.4.2.1. Users[0] => ', users[0]);
    mylog('1.4.2.1. Body => ', response.body);
    mylog('1.4.2.1. Status => ', response.status);
    expect(response.status).toBe(201);
    expect(response.body.valid).toBe(true);
    mylog('Teste 07 - Terminou');
});

it('1.4.2.2. Como pessoa registrada quero me autenticar utilizando minha conta do Google para utilizar o sistema.', async () => {
    mylog('Teste 08 - Início');
    // TODO
    mylog('Teste 08 - Terminou');
});

it('1.4.2.3. Como pessoa registrada quero recadastrar minha senha associada ao e-mail para recuperar o acesso.', async () => {
    mylog('Teste 09 - Início');
    // TODO
    mylog('Teste 09 - Terminou');
});

it('1.4.6.9. Como pessoa autenticada quero poder alterar nome e endereço de e-mail.', async () => {
    mylog('Teste 10 - Início');
    users[0].name = 'Auditor Alterado';
    users[0].email = 'alterado@cfp.com.br';
    const response = await request(app)
        .put(`/api/users/${users[0].id}`)
        .send(users[0]);
    expect(response.body).toMatchObject({ email: users[0].email, id: users[0].id, name: users[0].name });
    expect(response.status).toBe(200);
    mylog('Teste 10 - Terminou');
});

it('Deve ser possível autenticar o usuário com o novo e-mail', async () => {
    mylog('Teste 11 - Início');
    mylog('users[0] => ', users[0]);
    const response = await request(app)
        .post('/auth/signin')
        .send(users[0])
    mylog('Status => ', response.status);
    mylog('Body => ', response.body);
    expect(response.status).toBe(201);
    expect(response.body.valid).toBe(true);
    users[0] = response.body
    mylog('Teste 11 - Terminou');
});

it('Deve ser possível localizar o registro do usuário pelo ID', async () => {
    mylog('Teste 12 - Início');
    mylog('users[0] => ', users[0]);
    const response = await request(app)
        .get(`/api/users/${users[0].id}`)
        .send({ token: users[0].token });
    mylog('Status => ', response.status);
    mylog('Body => ', response.body);
    expect(response.body).toMatchObject({ email: users[0].email, id: users[0].id, name: users[0].name, version: users[0].version });
    expect(response.status).toBe(200);
    mylog('Teste 12 - Terminou');
});

it('Deve retornar 404 ao tentar localizar o registro do usuário com ID não cadastrado', async () => {
    mylog('Teste 13 - Início');
    const response = await request(app)
        .get(`/api/users/9999`)
        .send({ token: users[0].token });
    expect(response.status).toBe(404);
    mylog('Teste 13 - Terminou');
});


it('API-CFP deve estar on-line para usuário autenticado', async () => {
    const response = await request(app)
        .get('/api')
        .send({ token: users[0].token });
    expect(response.body.message).toBe('API-CFP on-line');
    expect(response.status).toBe(200);
})
