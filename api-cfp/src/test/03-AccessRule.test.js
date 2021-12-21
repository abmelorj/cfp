'use strict';
const request = require("supertest");
const app = require("../app");
const digest = require("../config/digest");
let accessRules = [];
let user;

require('dotenv').config();
const mylog = (...msg) => {
    if ((process.env.DEBUG || 'false') == 'true')
        return console.log(...msg);
}

beforeAll(async () => {
    // inicializa ambiente
    await digest("senhaauditor")
        .then(hash =>
            this.user = {
                name: 'Auditor de CFP',
                email: "auditor@cfp.com.br",
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

it('Deve ser possível ler os 4 perfis de acesso', async () => {
    const response = await request(app)
        .get('/api/accessrules')
        .send(this.user);
    this.accessRules = response.body;
    expect(response.body.length).toBe(4);
    expect(response.status).toBe(200);
});

it('Deve ser possível ler o perfis de acesso pelo ID', async () => {
    const response = await request(app)
        .get(`/api/accessrules/${this.accessRules[0].id}`)
        .send(this.user);
    expect(response.body).toMatchObject(this.accessRules[0]);
    expect(response.status).toBe(200);
});
