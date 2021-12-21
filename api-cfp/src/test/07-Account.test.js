'use strict';
const request = require("supertest");
const app = require("../app");
const digest = require("../config/digest");
const logerr = require("../config/logerr");
let users = [];
let categories = [];
let accounts = [,];

require('dotenv').config();
const mylog = (...msg) => {
    if ((process.env.DEBUG || 'false') == 'true')
        return console.log(...msg);
}

beforeAll(async () => {
    // inicializa variáveis auxiliares
    await digest("senhaproprietario")
        .then(hash => users.push({
            email: "proprietario@cfp.com.br",
            hash
        }));

    // Insere usuários
    await request(app)
        .post('/auth/signin')
        .send(users[0])
        .then(responseUser => users[0] = responseUser.body)
        .catch(err => logerr(`Erro ao autenticar proprietário: ${err}`));

})
// =============================================
//  POST /api/categories
// =============================================
/*                                              Tipo
    categories[0] = Moradia                     Reserva financeira
    categories[1] = Contas bancárias            Recurso financeiro
    categories[2] = Cartões de Crédito          Cartão de crédito
    categories[3] = Em espécie                  Recurso financeiro
    categories[4] = Saúde                       Reserva financeira
    categories[5] = Lazer                       Reserva financeira
    categories[6] = Educação                    Reserva financeira
    categories[7] = Aquisição de bens           Reserva financeira
    categories[8] = Telecom                     Reserva financeira
    categories[9] = Outras despesas             Reserva financeira
*/

it('1.4.4.1. Como coautor do controle financeiro quero cadastrar categoria: RESERVA FINANCEIRA (Moradia)', async () => {
    categories[0] = {
        name: "Moradia",
        catOwnerId: users[0].id,
        isCredit: true,
    }
    const response = await request(app)
        .post('/api/categories')
        .send({
            name: categories[0].name,
            catOwnerId: categories[0].catOwnerId,
            isCredit: categories[0].isCredit,
            token: users[0].token
        });
    mylog('response.body => ', response.body)
    expect(response.body).toMatchObject(categories[0]);
    expect(response.status).toBe(201);
    categories[0] = response.body;
});

it('1.4.4.1. Como coautor do controle financeiro quero cadastrar categoria: RECURSO FINANCEIRO (Contas bancárias)', async () => {
    categories[1] = {
        name: "Contas bancárias",
        catOwnerId: users[0].id,
        isCredit: false,
    }
    const response = await request(app)
        .post('/api/categories')
        .send({
            name: categories[1].name,
            catOwnerId: categories[1].catOwnerId,
            isCredit: categories[1].isCredit,
            token: users[0].token
        });
    expect(response.body).toMatchObject(categories[1]);
    expect(response.status).toBe(201);
    categories[1] = response.body;
});

it('1.4.4.1. Como coautor do controle financeiro quero cadastrar categoria: CARTÕES DE CRÉDITO', async () => {
    categories[2] = {
        name: "Cartões de Crédito",
        catOwnerId: users[0].id,
        isCredit: true,
    }
    const response = await request(app)
        .post('/api/categories')
        .send({
            name: categories[2].name,
            catOwnerId: categories[2].catOwnerId,
            isCredit: categories[2].isCredit,
            token: users[0].token
        });
    expect(response.body).toMatchObject(categories[2]);
    expect(response.status).toBe(201);
    categories[2] = response.body;
});

it('1.4.4.1. Como coautor do controle financeiro quero cadastrar categoria: RECURSO FINANCEIRO (Em espécie)', async () => {
    categories[3] = {
        name: "Em espécie",
        catOwnerId: users[0].id,
        isCredit: false,
    }
    const response = await request(app)
        .post('/api/categories')
        .send({
            name: categories[3].name,
            catOwnerId: categories[3].catOwnerId,
            isCredit: categories[3].isCredit,
            token: users[0].token
        });
    expect(response.body).toMatchObject(categories[3]);
    expect(response.status).toBe(201);
    categories[3] = response.body;
});

it('1.4.4.1. Como coautor do controle financeiro quero cadastrar categoria: RESERVA FINANCEIRA (Saúde)', async () => {
    categories[4] = {
        name: "Saúde",
        catOwnerId: users[0].id,
        isCredit: true,
    }
    const response = await request(app)
        .post('/api/categories')
        .send({
            name: categories[4].name,
            catOwnerId: categories[4].catOwnerId,
            isCredit: categories[4].isCredit,
            token: users[0].token
        });
    mylog('response.body => ', response.body)
    expect(response.body).toMatchObject(categories[4]);
    expect(response.status).toBe(201);
    categories[4] = response.body;
});

it('1.4.4.1. Como coautor do controle financeiro quero cadastrar categoria: RESERVA FINANCEIRA (Lazer)', async () => {
    categories[5] = {
        name: "Lazer",
        catOwnerId: users[0].id,
        isCredit: true,
    }
    const response = await request(app)
        .post('/api/categories')
        .send({
            name: categories[5].name,
            catOwnerId: categories[5].catOwnerId,
            isCredit: categories[5].isCredit,
            token: users[0].token
        });
    mylog('response.body => ', response.body)
    expect(response.body).toMatchObject(categories[5]);
    expect(response.status).toBe(201);
    categories[5] = response.body;
});

it('1.4.4.1. Como coautor do controle financeiro quero cadastrar categoria: RESERVA FINANCEIRA (Educação)', async () => {
    categories[6] = {
        name: "Educação",
        catOwnerId: users[0].id,
        isCredit: true,
    }
    const response = await request(app)
        .post('/api/categories')
        .send({
            name: categories[6].name,
            catOwnerId: categories[6].catOwnerId,
            isCredit: categories[6].isCredit,
            token: users[0].token
        });
    mylog('response.body => ', response.body)
    expect(response.body).toMatchObject(categories[6]);
    expect(response.status).toBe(201);
    categories[6] = response.body;
});

it('1.4.4.1. Como coautor do controle financeiro quero cadastrar categoria: RESERVA FINANCEIRA (Aquisição de Bens)', async () => {
    categories[7] = {
        name: "Aquisição de Bens",
        catOwnerId: users[0].id,
        isCredit: true,
    }
    const response = await request(app)
        .post('/api/categories')
        .send({
            name: categories[7].name,
            catOwnerId: categories[7].catOwnerId,
            isCredit: categories[7].isCredit,
            token: users[0].token
        });
    mylog('response.body => ', response.body)
    expect(response.body).toMatchObject(categories[7]);
    expect(response.status).toBe(201);
    categories[7] = response.body;
});

it('1.4.4.1. Como coautor do controle financeiro quero cadastrar categoria: RESERVA FINANCEIRA (Telecom)', async () => {
    categories[8] = {
        name: "Telecom",
        catOwnerId: users[0].id,
        isCredit: true,
    }
    const response = await request(app)
        .post('/api/categories')
        .send({
            name: categories[8].name,
            catOwnerId: categories[8].catOwnerId,
            isCredit: categories[8].isCredit,
            token: users[0].token
        });
    mylog('response.body => ', response.body)
    expect(response.body).toMatchObject(categories[8]);
    expect(response.status).toBe(201);
    categories[8] = response.body;
});

it('1.4.4.1. Como coautor do controle financeiro quero cadastrar categoria: RESERVA FINANCEIRA (Outras despesas)', async () => {
    categories[9] = {
        name: "Outras despesas",
        catOwnerId: users[0].id,
        isCredit: true,
    }
    const response = await request(app)
        .post('/api/categories')
        .send({
            name: categories[9].name,
            catOwnerId: categories[9].catOwnerId,
            isCredit: categories[9].isCredit,
            token: users[0].token
        });
    mylog('response.body => ', response.body)
    expect(response.body).toMatchObject(categories[9]);
    expect(response.status).toBe(201);
    categories[9] = response.body;
});


// =============================================
//  POST /api/accounts
// =============================================

/* 
    categories[0] = Moradia                     Reserva financeira
*/

it('1.4.4.2. Como coautor do controle financeiro quero cadastrar CONTA DE RESERVA FINANCEIRA (Luz).', async () => {
    accounts[0, 0] = {
        name: 'Luz',
        isCredit: true,
        isCard: false,
        accCategoryId: categories[0].id
    }
    const response = await request(app)
        .post('/api/accounts')
        .send({
            name: accounts[0, 0].name,
            isCredit: accounts[0, 0].isCredit,
            isCard: accounts[0, 0].isCard,
            accCategoryId: accounts[0, 0].accCategoryId,
            token: users[0].token
        });
    expect(response.body).toMatchObject(accounts[0, 0]);
    expect(response.status).toBe(201);
    accounts[0, 0] = response.body
});

it('1.4.4.2. Como coautor do controle financeiro quero cadastrar CONTA DE RESERVA FINANCEIRA (Água).', async () => {
    accounts[0, 1] = {
        name: 'Água',
        isCredit: true,
        isCard: false,
        accCategoryId: categories[0].id
    }
    const response = await request(app)
        .post('/api/accounts')
        .send({
            name: accounts[0, 1].name,
            isCredit: accounts[0, 1].isCredit,
            isCard: accounts[0, 1].isCard,
            accCategoryId: accounts[0, 1].accCategoryId,
            token: users[0].token
        });
    expect(response.body).toMatchObject(accounts[0, 1]);
    expect(response.status).toBe(201);
    accounts[0, 1] = response.body
});

it('1.4.4.2. Como coautor do controle financeiro quero cadastrar CONTA DE RESERVA FINANCEIRA (Aluguel).', async () => {
    accounts[0, 2] = {
        name: 'Taxa Corpo de Bombeiros',
        isCredit: true,
        isCard: false,
        accCategoryId: categories[0].id
    }
    const response = await request(app)
        .post('/api/accounts')
        .send({
            name: accounts[0, 2].name,
            isCredit: accounts[0, 2].isCredit,
            isCard: accounts[0, 2].isCard,
            accCategoryId: accounts[0, 2].accCategoryId,
            token: users[0].token
        });
    expect(response.body).toMatchObject(accounts[0, 2]);
    expect(response.status).toBe(201);
    accounts[0, 2] = response.body
});

it('1.4.4.2. Como coautor do controle financeiro quero cadastrar CONTA DE RESERVA FINANCEIRA (Gaz).', async () => {
    accounts[0, 3] = {
        name: 'Gaz',
        isCredit: true,
        isCard: false,
        accCategoryId: categories[0].id
    }
    const response = await request(app)
        .post('/api/accounts')
        .send({
            name: accounts[0, 3].name,
            isCredit: accounts[0, 3].isCredit,
            isCard: accounts[0, 3].isCard,
            accCategoryId: accounts[0, 3].accCategoryId,
            token: users[0].token
        });
    expect(response.body).toMatchObject(accounts[0, 3]);
    expect(response.status).toBe(201);
    accounts[0, 3] = response.body
});

it('1.4.4.2. Como coautor do controle financeiro quero cadastrar CONTA DE RESERVA FINANCEIRA (IPTU).', async () => {
    accounts[0, 4] = {
        name: 'IPTU',
        isCredit: true,
        isCard: false,
        accCategoryId: categories[0].id
    }
    const response = await request(app)
        .post('/api/accounts')
        .send({
            name: accounts[0, 4].name,
            isCredit: accounts[0, 4].isCredit,
            isCard: accounts[0, 4].isCard,
            accCategoryId: accounts[0, 4].accCategoryId,
            token: users[0].token
        });
    expect(response.body).toMatchObject(accounts[0, 4]);
    expect(response.status).toBe(201);
    accounts[0, 4] = response.body
});

it('1.4.4.2. Como coautor do controle financeiro quero cadastrar CONTA DE RESERVA FINANCEIRA (Reformas).', async () => {
    accounts[0, 5] = {
        name: 'Reformas',
        isCredit: true,
        isCard: false,
        accCategoryId: categories[0].id
    }
    const response = await request(app)
        .post('/api/accounts')
        .send({
            name: accounts[0, 5].name,
            isCredit: accounts[0, 5].isCredit,
            isCard: accounts[0, 5].isCard,
            accCategoryId: accounts[0, 5].accCategoryId,
            token: users[0].token
        });
    expect(response.body).toMatchObject(accounts[0, 5]);
    expect(response.status).toBe(201);
    accounts[0, 5] = response.body
});


/* 
    categories[1] = Contas bancárias            Recurso financeiro
*/

it('1.4.4.3. Como coautor do controle financeiro quero cadastrar CONTA DE RECURSO FINANCEIRO (Conta corrente no banco FinTech).', async () => {
    accounts[1, 0] = {
        name: 'Conta corrente no banco FinTech',
        isCredit: false,
        isCard: false,
        accCategoryId: categories[1].id
    }
    const response = await request(app)
        .post('/api/accounts')
        .send({
            name: accounts[1, 0].name,
            isCredit: accounts[1, 0].isCredit,
            isCard: accounts[1, 0].isCard,
            accCategoryId: accounts[1, 0].accCategoryId,
            token: users[0].token
        });
    expect(response.body).toMatchObject(accounts[1, 0]);
    expect(response.status).toBe(201);
    accounts[1, 0] = response.body
});

it('1.4.4.3. Como coautor do controle financeiro quero cadastrar CONTA DE RECURSO FINANCEIRO (Caderneta de Poupança no PoupaMais).', async () => {
    accounts[1, 1] = {
        name: 'Caderneta de Poupança no PoupaMais',
        isCredit: false,
        isCard: false,
        accCategoryId: categories[1].id
    }
    const response = await request(app)
        .post('/api/accounts')
        .send({
            name: accounts[1, 1].name,
            isCredit: accounts[1, 1].isCredit,
            isCard: accounts[1, 1].isCard,
            accCategoryId: accounts[1, 1].accCategoryId,
            token: users[0].token
        });
    expect(response.body).toMatchObject(accounts[1, 1]);
    expect(response.status).toBe(201);
    accounts[1, 1] = response.body
});

it('1.4.4.3. Como coautor do controle financeiro quero cadastrar CONTA DE RECURSO FINANCEIRO (Vale refeição).', async () => {
    accounts[1, 2] = {
        name: 'Vale refeição',
        isCredit: false,
        isCard: false,
        accCategoryId: categories[1].id
    }
    const response = await request(app)
        .post('/api/accounts')
        .send({
            name: accounts[1, 2].name,
            isCredit: accounts[1, 2].isCredit,
            isCard: accounts[1, 2].isCard,
            accCategoryId: accounts[1, 2].accCategoryId,
            token: users[0].token
        });
    expect(response.body).toMatchObject(accounts[1, 2]);
    expect(response.status).toBe(201);
    accounts[1, 2] = response.body
});

it('1.4.4.3. Como coautor do controle financeiro quero cadastrar CONTA DE RECURSO FINANCEIRO (Vale alimentação).', async () => {
    accounts[1, 3] = {
        name: 'Vale alimentação',
        isCredit: false,
        isCard: false,
        accCategoryId: categories[1].id
    }
    const response = await request(app)
        .post('/api/accounts')
        .send({
            name: accounts[1, 3].name,
            isCredit: accounts[1, 3].isCredit,
            isCard: accounts[1, 3].isCard,
            accCategoryId: accounts[1, 3].accCategoryId,
            token: users[0].token
        });
    expect(response.body).toMatchObject(accounts[1, 3]);
    expect(response.status).toBe(201);
    accounts[1, 3] = response.body
});

it('1.4.4.3. Como coautor do controle financeiro quero cadastrar CONTA DE RECURSO FINANCEIRO (Fundo de investimento AAA no Banco).', async () => {
    accounts[1, 4] = {
        name: 'Fundo de investimento AAA no Banco',
        isCredit: false,
        isCard: false,
        accCategoryId: categories[1].id
    }
    const response = await request(app)
        .post('/api/accounts')
        .send({
            name: accounts[1, 4].name,
            isCredit: accounts[1, 4].isCredit,
            isCard: accounts[1, 4].isCard,
            accCategoryId: accounts[1, 4].accCategoryId,
            token: users[0].token
        });
    expect(response.body).toMatchObject(accounts[1, 4]);
    expect(response.status).toBe(201);
    accounts[1, 4] = response.body
});

/* 
    categories[2] = Cartões de Crédito          Cartão de crédito
*/

it('1.4.4.4. Como coautor do controle financeiro quero cadastrar CONTA DE CARTAO DE CRÉDITO (Cartão bandeira CFP no banco FinTech).', async () => {
    accounts[2, 0] = {
        name: 'Cartão bandeira CFP no banco FinTech',
        isCredit: true,
        isCard: true,
        accCategoryId: categories[2].id
    }
    const response = await request(app)
        .post('/api/accounts')
        .send({
            name: accounts[2, 0].name,
            isCredit: accounts[2, 0].isCredit,
            isCard: accounts[2, 0].isCard,
            accCategoryId: accounts[2, 0].accCategoryId,
            token: users[0].token
        });
    expect(response.body).toMatchObject(accounts[2, 0]);
    expect(response.status).toBe(201);
    accounts[2, 0] = response.body
});


/*
    categories[3] = Em espécie                  Recurso financeiro
*/
it('1.4.4.3. Como coautor do controle financeiro quero cadastrar CONTA DE RECURSO FINANCEIRO (Carteira).', async () => {
    accounts[3, 1] = {
        name: 'Carteira',
        isCredit: false,
        isCard: false,
        accCategoryId: categories[3].id
    }
    const response = await request(app)
        .post('/api/accounts')
        .send({
            name: accounts[3, 1].name,
            isCredit: accounts[3, 1].isCredit,
            isCard: accounts[3, 1].isCard,
            accCategoryId: accounts[3, 1].accCategoryId,
            token: users[0].token
        });
    expect(response.body).toMatchObject(accounts[3, 1]);
    expect(response.status).toBe(201);
    accounts[3, 1] = response.body
});


/*
    categories[4] = Saúde                       Reserva financeira
*/

it('1.4.4.2. Como coautor do controle financeiro quero cadastrar CONTA DE RESERVA FINANCEIRA (Plano de saúde).', async () => {
    accounts[4, 0] = {
        name: 'Plano de saúde',
        isCredit: true,
        isCard: false,
        accCategoryId: categories[4].id
    }
    const response = await request(app)
        .post('/api/accounts')
        .send({
            name: accounts[4, 0].name,
            isCredit: accounts[4, 0].isCredit,
            isCard: accounts[4, 0].isCard,
            accCategoryId: accounts[4, 0].accCategoryId,
            token: users[0].token
        });
    expect(response.body).toMatchObject(accounts[4, 0]);
    expect(response.status).toBe(201);
    accounts[4, 0] = response.body
});

it('1.4.4.2. Como coautor do controle financeiro quero cadastrar CONTA DE RESERVA FINANCEIRA (Academia).', async () => {
    accounts[4, 1] = {
        name: 'Academia',
        isCredit: true,
        isCard: false,
        accCategoryId: categories[4].id
    }
    const response = await request(app)
        .post('/api/accounts')
        .send({
            name: accounts[4, 1].name,
            isCredit: accounts[4, 1].isCredit,
            isCard: accounts[4, 1].isCard,
            accCategoryId: accounts[4, 1].accCategoryId,
            token: users[0].token
        });
    expect(response.body).toMatchObject(accounts[4, 1]);
    expect(response.status).toBe(201);
    accounts[4, 1] = response.body
});


/*
    categories[5] = Lazer                       Reserva financeira
*/

it('1.4.4.2. Como coautor do controle financeiro quero cadastrar CONTA DE RESERVA FINANCEIRA (Serviços de streaming).', async () => {
    accounts[5, 0] = {
        name: 'Serviços de streaming',
        isCredit: true,
        isCard: false,
        accCategoryId: categories[5].id
    }
    const response = await request(app)
        .post('/api/accounts')
        .send({
            name: accounts[5, 0].name,
            isCredit: accounts[5, 0].isCredit,
            isCard: accounts[5, 0].isCard,
            accCategoryId: accounts[5, 0].accCategoryId,
            token: users[0].token
        });
    expect(response.body).toMatchObject(accounts[5, 0]);
    expect(response.status).toBe(201);
    accounts[5, 0] = response.body
});

it('1.4.4.2. Como coautor do controle financeiro quero cadastrar CONTA DE RESERVA FINANCEIRA (TV a cabo).', async () => {
    accounts[5, 1] = {
        name: 'TV a cabo',
        isCredit: true,
        isCard: false,
        accCategoryId: categories[5].id
    }
    const response = await request(app)
        .post('/api/accounts')
        .send({
            name: accounts[5, 1].name,
            isCredit: accounts[5, 1].isCredit,
            isCard: accounts[5, 1].isCard,
            accCategoryId: accounts[5, 1].accCategoryId,
            token: users[0].token
        });
    expect(response.body).toMatchObject(accounts[5, 1]);
    expect(response.status).toBe(201);
    accounts[5, 1] = response.body
});

it('1.4.4.2. Como coautor do controle financeiro quero cadastrar CONTA DE RESERVA FINANCEIRA (Clube social).', async () => {
    accounts[5, 2] = {
        name: 'Clube social',
        isCredit: true,
        isCard: false,
        accCategoryId: categories[5].id
    }
    const response = await request(app)
        .post('/api/accounts')
        .send({
            name: accounts[5, 2].name,
            isCredit: accounts[5, 2].isCredit,
            isCard: accounts[5, 2].isCard,
            accCategoryId: accounts[5, 2].accCategoryId,
            token: users[0].token
        });
    expect(response.body).toMatchObject(accounts[5, 2]);
    expect(response.status).toBe(201);
    accounts[5, 2] = response.body
});

it('1.4.4.2. Como coautor do controle financeiro quero cadastrar CONTA DE RESERVA FINANCEIRA (Viagem).', async () => {
    accounts[5, 3] = {
        name: 'Viagem',
        isCredit: true,
        isCard: false,
        accCategoryId: categories[5].id
    }
    const response = await request(app)
        .post('/api/accounts')
        .send({
            name: accounts[5, 3].name,
            isCredit: accounts[5, 3].isCredit,
            isCard: accounts[5, 3].isCard,
            accCategoryId: accounts[5, 3].accCategoryId,
            token: users[0].token
        });
    expect(response.body).toMatchObject(accounts[5, 3]);
    expect(response.status).toBe(201);
    accounts[5, 3] = response.body
});

it('1.4.4.2. Como coautor do controle financeiro quero cadastrar CONTA DE RESERVA FINANCEIRA (Cinema & Teatro).', async () => {
    accounts[5, 4] = {
        name: 'Cinema & Teatro',
        isCredit: true,
        isCard: false,
        accCategoryId: categories[5].id
    }
    const response = await request(app)
        .post('/api/accounts')
        .send({
            name: accounts[5, 4].name,
            isCredit: accounts[5, 4].isCredit,
            isCard: accounts[5, 4].isCard,
            accCategoryId: accounts[5, 4].accCategoryId,
            token: users[0].token
        });
    expect(response.body).toMatchObject(accounts[5, 4]);
    expect(response.status).toBe(201);
    accounts[5, 4] = response.body
});


/*
    categories[6] = Educação                    Reserva financeira
*/

it('1.4.4.2. Como coautor do controle financeiro quero cadastrar CONTA DE RESERVA FINANCEIRA (Escola).', async () => {
    accounts[6, 0] = {
        name: 'Escola',
        isCredit: true,
        isCard: false,
        accCategoryId: categories[6].id
    }
    const response = await request(app)
        .post('/api/accounts')
        .send({
            name: accounts[6, 0].name,
            isCredit: accounts[6, 0].isCredit,
            isCard: accounts[6, 0].isCard,
            accCategoryId: accounts[6, 0].accCategoryId,
            token: users[0].token
        });
    expect(response.body).toMatchObject(accounts[6, 0]);
    expect(response.status).toBe(201);
    accounts[6, 0] = response.body
});

it('1.4.4.2. Como coautor do controle financeiro quero cadastrar CONTA DE RESERVA FINANCEIRA (Cursos extras).', async () => {
    accounts[6, 1] = {
        name: 'Cursos extras',
        isCredit: true,
        isCard: false,
        accCategoryId: categories[6].id
    }
    const response = await request(app)
        .post('/api/accounts')
        .send({
            name: accounts[6, 1].name,
            isCredit: accounts[6, 1].isCredit,
            isCard: accounts[6, 1].isCard,
            accCategoryId: accounts[6, 1].accCategoryId,
            token: users[0].token
        });
    expect(response.body).toMatchObject(accounts[6, 1]);
    expect(response.status).toBe(201);
    accounts[6, 1] = response.body
});

it('1.4.4.2. Como coautor do controle financeiro quero cadastrar CONTA DE RESERVA FINANCEIRA (Publicações).', async () => {
    accounts[6, 2] = {
        name: 'Publicações',
        isCredit: true,
        isCard: false,
        accCategoryId: categories[6].id
    }
    const response = await request(app)
        .post('/api/accounts')
        .send({
            name: accounts[6, 2].name,
            isCredit: accounts[6, 2].isCredit,
            isCard: accounts[6, 2].isCard,
            accCategoryId: accounts[6, 2].accCategoryId,
            token: users[0].token
        });
    expect(response.body).toMatchObject(accounts[6, 2]);
    expect(response.status).toBe(201);
    accounts[6, 2] = response.body
});

it('1.4.4.2. Como coautor do controle financeiro quero cadastrar CONTA DE RESERVA FINANCEIRA (Participação em eventos).', async () => {
    accounts[6, 3] = {
        name: 'Participação em eventos',
        isCredit: true,
        isCard: false,
        accCategoryId: categories[6].id
    }
    const response = await request(app)
        .post('/api/accounts')
        .send({
            name: accounts[6, 3].name,
            isCredit: accounts[6, 3].isCredit,
            isCard: accounts[6, 3].isCard,
            accCategoryId: accounts[6, 3].accCategoryId,
            token: users[0].token
        });
    expect(response.body).toMatchObject(accounts[6, 3]);
    expect(response.status).toBe(201);
    accounts[6, 3] = response.body
});


/*
    categories[7] = Aquisição de bens           Reserva financeira
*/

it('1.4.4.2. Como coautor do controle financeiro quero cadastrar CONTA DE RESERVA FINANCEIRA (Bens de consumo).', async () => {
    accounts[7, 0] = {
        name: 'Bens de consumo',
        isCredit: true,
        isCard: false,
        accCategoryId: categories[7].id
    }
    const response = await request(app)
        .post('/api/accounts')
        .send({
            name: accounts[7, 0].name,
            isCredit: accounts[7, 0].isCredit,
            isCard: accounts[7, 0].isCard,
            accCategoryId: accounts[7, 0].accCategoryId,
            token: users[0].token
        });
    expect(response.body).toMatchObject(accounts[7, 0]);
    expect(response.status).toBe(201);
    accounts[7, 0] = response.body
});

it('1.4.4.2. Como coautor do controle financeiro quero cadastrar CONTA DE RESERVA FINANCEIRA (Bens duráveis).', async () => {
    accounts[7, 1] = {
        name: 'Bens duráveis',
        isCredit: true,
        isCard: false,
        accCategoryId: categories[7].id
    }
    const response = await request(app)
        .post('/api/accounts')
        .send({
            name: accounts[7, 1].name,
            isCredit: accounts[7, 1].isCredit,
            isCard: accounts[7, 1].isCard,
            accCategoryId: accounts[7, 1].accCategoryId,
            token: users[0].token
        });
    expect(response.body).toMatchObject(accounts[7, 1]);
    expect(response.status).toBe(201);
    accounts[7, 1] = response.body
});

it('1.4.4.2. Como coautor do controle financeiro quero cadastrar CONTA DE RESERVA FINANCEIRA (Imóveis).', async () => {
    accounts[7, 2] = {
        name: 'Imóveis',
        isCredit: true,
        isCard: false,
        accCategoryId: categories[7].id
    }
    const response = await request(app)
        .post('/api/accounts')
        .send({
            name: accounts[7, 2].name,
            isCredit: accounts[7, 2].isCredit,
            isCard: accounts[7, 2].isCard,
            accCategoryId: accounts[7, 2].accCategoryId,
            token: users[0].token
        });
    expect(response.body).toMatchObject(accounts[7, 2]);
    expect(response.status).toBe(201);
    accounts[7, 2] = response.body
});


/*
    categories[8] = Telecom                     Reserva financeira
*/

it('1.4.4.2. Como coautor do controle financeiro quero cadastrar CONTA DE RESERVA FINANCEIRA (Telefone celular).', async () => {
    accounts[8, 0] = {
        name: 'Telefone celular',
        isCredit: true,
        isCard: false,
        accCategoryId: categories[8].id
    }
    const response = await request(app)
        .post('/api/accounts')
        .send({
            name: accounts[8, 0].name,
            isCredit: accounts[8, 0].isCredit,
            isCard: accounts[8, 0].isCard,
            accCategoryId: accounts[8, 0].accCategoryId,
            token: users[0].token
        });
    expect(response.body).toMatchObject(accounts[8, 0]);
    expect(response.status).toBe(201);
    accounts[8, 0] = response.body
});

it('1.4.4.2. Como coautor do controle financeiro quero cadastrar CONTA DE RESERVA FINANCEIRA (Telefone Fixo).', async () => {
    accounts[8, 1] = {
        name: 'Telefone Fixo',
        isCredit: true,
        isCard: false,
        accCategoryId: categories[8].id
    }
    const response = await request(app)
        .post('/api/accounts')
        .send({
            name: accounts[8, 1].name,
            isCredit: accounts[8, 1].isCredit,
            isCard: accounts[8, 1].isCard,
            accCategoryId: accounts[8, 1].accCategoryId,
            token: users[0].token
        });
    expect(response.body).toMatchObject(accounts[8, 1]);
    expect(response.status).toBe(201);
    accounts[8, 1] = response.body
});

it('1.4.4.2. Como coautor do controle financeiro quero cadastrar CONTA DE RESERVA FINANCEIRA (Internet).', async () => {
    accounts[8, 2] = {
        name: 'Internet',
        isCredit: true,
        isCard: false,
        accCategoryId: categories[8].id
    }
    const response = await request(app)
        .post('/api/accounts')
        .send({
            name: accounts[8, 2].name,
            isCredit: accounts[8, 2].isCredit,
            isCard: accounts[8, 2].isCard,
            accCategoryId: accounts[8, 2].accCategoryId,
            token: users[0].token
        });
    expect(response.body).toMatchObject(accounts[8, 2]);
    expect(response.status).toBe(201);
    accounts[8, 2] = response.body
});

/*
    categories[9] = Outras despesas             Reserva financeira
*/

it('1.4.4.2. Como coautor do controle financeiro quero cadastrar CONTA DE RESERVA FINANCEIRA (Vestuario).', async () => {
    accounts[9, 0] = {
        name: 'Vestuario',
        isCredit: true,
        isCard: false,
        accCategoryId: categories[9].id
    }
    const response = await request(app)
        .post('/api/accounts')
        .send({
            name: accounts[9, 0].name,
            isCredit: accounts[9, 0].isCredit,
            isCard: accounts[9, 0].isCard,
            accCategoryId: accounts[9, 0].accCategoryId,
            token: users[0].token
        });
    expect(response.body).toMatchObject(accounts[9, 0]);
    expect(response.status).toBe(201);
    accounts[9, 0] = response.body
});

it('1.4.4.2. Como coautor do controle financeiro quero cadastrar CONTA DE RESERVA FINANCEIRA (Alimentação).', async () => {
    accounts[9, 1] = {
        name: 'Alimentação',
        isCredit: true,
        isCard: false,
        accCategoryId: categories[9].id
    }
    const response = await request(app)
        .post('/api/accounts')
        .send({
            name: accounts[9, 1].name,
            isCredit: accounts[9, 1].isCredit,
            isCard: accounts[9, 1].isCard,
            accCategoryId: accounts[9, 1].accCategoryId,
            token: users[0].token
        });
    expect(response.body).toMatchObject(accounts[9, 1]);
    expect(response.status).toBe(201);
    accounts[9, 1] = response.body
});

it('1.4.4.2. Como coautor do controle financeiro quero cadastrar CONTA DE RESERVA FINANCEIRA (Transporte).', async () => {
    accounts[9, 2] = {
        name: 'Transporte',
        isCredit: true,
        isCard: false,
        accCategoryId: categories[9].id
    }
    const response = await request(app)
        .post('/api/accounts')
        .send({
            name: accounts[9, 2].name,
            isCredit: accounts[9, 2].isCredit,
            isCard: accounts[9, 2].isCard,
            accCategoryId: accounts[9, 2].accCategoryId,
            token: users[0].token
        });
    expect(response.body).toMatchObject(accounts[9, 2]);
    expect(response.status).toBe(201);
    accounts[9, 2] = response.body
});

it('1.4.4.2. Como coautor do controle financeiro quero cadastrar CONTA DE RESERVA FINANCEIRA (Outros).', async () => {
    accounts[9, 3] = {
        name: 'Outros',
        isCredit: true,
        isCard: false,
        accCategoryId: categories[9].id
    }
    const response = await request(app)
        .post('/api/accounts')
        .send({
            name: accounts[9, 3].name,
            isCredit: accounts[9, 3].isCredit,
            isCard: accounts[9, 3].isCard,
            accCategoryId: accounts[9, 3].accCategoryId,
            token: users[0].token
        });
    expect(response.body).toMatchObject(accounts[9, 3]);
    expect(response.status).toBe(201);
    accounts[9, 3] = response.body
});

// =============================================
//  GET /api/accounts/:id
// =============================================
it('Deve ser possível ler uma conta pelo ID.', async () => {
    const response = await request(app)
        .get(`/api/accounts/${accounts[9, 3].id}`)
        .send({ token: users[0].token });
    expect(response.body).toMatchObject(accounts[9, 3]);
    expect(response.status).toBe(200);
    accounts[9, 3] = response.body
});

// =============================================
//  PUT /api/accounts
// =============================================
it('Deve ser possível alterar uma conta.', async () => {
    accounts[9, 3].name = 'Outras despesas'
    const response = await request(app)
        .put(`/api/accounts`)
        .send({
            id: accounts[9, 3].id,
            name: accounts[9, 3].name,
            isCredit: accounts[9, 3].isCredit,
            isCard: accounts[9, 3].isCard,
            accCategoryId: accounts[9, 3].accCategoryId,
            version: accounts[9, 3].version,
            token: users[0].token
        });
    mylog('response.body ==> ', response.body);
    accounts[9, 3].version = response.body.version;
    expect(response.body).toMatchObject(accounts[9, 3]);
    expect(response.status).toBe(200);
    accounts[9, 3] = response.body;
});

// =============================================
//  DELETE /api/accounts/:id
// =============================================
it('Deve ser possível excluir uma conta pelo ID.', async () => {
    const response = await request(app)
        .delete(`/api/accounts/${accounts[9, 3].id}`)
        .send({ token: users[0].token });
    expect(response.status).toBe(200);
    accounts[9, 3] = response.body
});


// =============================================
//  GET /api/accounts/owner/:id
// =============================================
it('Deve ser possível ler a lista de contas pelo ID do proprietário.', async () => {
    const response = await request(app)
        .get(`/api/accounts/owner/${users[0].id}`)
        .send({ token: users[0].token });
    expect(response.status).toBe(200);
    mylog(response.body);
});

// =============================================
//  GET /api/categories/:id/accounts
// =============================================
it('Deve ser possível ler a lista de contas pelo ID da categoria.', async () => {
    const response = await request(app)
        .get(`/api/categories/${categories[0].id}/accounts`)
        .send({ token: users[0].token });
    expect(response.status).toBe(200);
    mylog(response.body);
});
