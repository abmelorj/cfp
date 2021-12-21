'use strict';
const request = require("supertest");
const app = require("../app");
const digest = require("../config/digest");
const logerr = require("../config/logerr");
let user;
let category;

require('dotenv').config();
const mylog = (...msg) => {
    if ((process.env.DEBUG || 'false') == 'true')
        return console.log(...msg);
}

beforeAll(async () => {
    const self = this
    // inicializa variáveis auxiliares
    await digest("senhaoutro")
        .then(async hash =>
            self.user = {
                name: "Outro Usuário de CFP",
                email: "outro@cfp.com.br",
                hash
            }
        )
        .then(async () => {
            // Insere usuário
            const responseUser = await request(app)
                .post('/auth/signup')
                .send(self.user);
            self.user = responseUser.body;
        })
        .then(() => {
            self.category = {
                name: "Lazer",
                catOwnerId: self.user.id,
                isCredit: true
            }
        })
        .catch(err => logerr(`Erro ao inserir proprietário de categoria: ${err}`))
})


it('1.4.4.1. Como coautor do controle financeiro quero cadastrar categorias para agrupar contas de reserva financeira, contas de recurso financeiro ou contas de cartão de crédito.', async () => {
    const self = this
    const response = await request(app)
        .post('/api/categories')
        .send({
            name: self.category.name,
            catOwnerId: self.category.catOwnerId,
            isCredit: self.category.isCredit,
            token: self.user.token
        });
    mylog('response.body ==> ', response.body)
    expect(response.body).toMatchObject(self.category);
    expect(response.status).toBe(201);
    updateCategory(self, response.body);
});

it('Deve ser possível consultar categoria pelo ID.', async () => {
    const self = this
    const response = await request(app)
        .get(`/api/categories/${self.category.id}`)
        .send(self.user);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject(self.category);
});

it('Deve ser possível consultar lista de categorias.', async () => {
    const self = this
    const response = await request(app)
        .get(`/api/categories/owner/${self.user.id}`)
        .send(self.user);
    expect(response.status).toBe(200);
    expect(response.body).toContainEqual(self.category);
});

it('Deve ser possível alterar nome da categoria.', async () => {
    const self = this
    self.category.name = 'Nova Moradia';
    const response = await request(app)
        .put(`/api/categories`)
        .send({
            id: self.category.id,
            name: self.category.name,
            catOwnerId: self.category.catOwnerId,
            isCredit: self.category.isCredit,
            isActive: self.category.isActive,
            version: self.category.version,
            token: self.user.token
        });
    mylog('response.status ===> ', response.status);
    mylog('response.body ===> ', response.body);
    mylog('self.category ===> ', self.category);
    self.category.version = response.body.version
    expect(response.body).toMatchObject(self.category);
    expect(response.status).toBe(200);
    updateCategory(self, response.body);
});

it('Deve ser possível excluir categoria sem movimento ou desativar categoria com saldo zerado.', async () => {
    const self = this
    const response = await request(app)
        .delete(`/api/categories/${self.category.id}`)
        .send(self.user);
    expect(response.status).toBe(200);
});

// completar os dados para usar em outros testes
function updateCategory(self, cat) {
    self.category.id = cat.id;
    self.category.version = cat.version;
    self.category.isActive = cat.isActive;
}
