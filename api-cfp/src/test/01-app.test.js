'use strict';
const request = require('supertest');
const app = require('../app');

require('dotenv').config();
const mylog = (...msg) => {
    if ((process.env.DEBUG || 'false') == 'true')
        return console.log(...msg);
}

it('API-CFP deve estar on-line', async () => {
    const response = await request(app)
        .get('/');
    expect(response.body.message).toBe('API-CFP on-line');
    expect(response.status).toBe(200);
})

it('SecurityLayer - sem Token', async () => {
    const response = await request(app)
        .get('/api');
    expect(response.status).toBe(403);
})

it('SecurityLayer - Token inválido', async () => {
    const response = await request(app)
        .get('/api')
        .send({ token: 'Token inválido' });
    expect(response.status).toBe(403);
})

it('SecurityLayer - Options', async () => {
    const response = await request(app)
        .options('/api');
    mylog('OPTIONS [header] => ', response.header);
    expect(response.status).toBe(204);
})