'use strict';
const request = require("supertest");
const app = require("../app");
const digest = require("../config/digest");
let operationTypes = [];
let user;

require('dotenv').config();
const mylog = (...msg) => {
    if ((process.env.DEBUG || 'false') == 'true')
        return console.log(...msg);
}

beforeAll(async () => {
    // inicializa ambiente
    await digest("senhaeditor")
        .then(hash =>
            this.user = {
                name: 'Editor de CFP',
                email: "editor@cfp.com.br",
                hash
            }
        )
        .then(async () => {
            const response = await request(app)
                .post('/auth/signup')
                .send(this.user);
            this.user = response.body;
        })
});

it('Deve ser possível ler os 7 tipos de operações', async () => {
    const response = await request(app)
        .get('/api/operationtypes')
        .send(this.user);
    this.operationTypes = response.body;
    expect(response.body.length).toBe(7);
    expect(response.status).toBe(200);
});

it('Deve ser possível ler o tipo de operação pelo ID', async () => {
    const response = await request(app)
        .get(`/api/operationtypes/${this.operationTypes[0].id}`)
        .send(this.user);
    expect(response.body).toMatchObject(this.operationTypes[0]);
    expect(response.status).toBe(200);
});
