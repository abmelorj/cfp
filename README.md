# TCC Pós-graduação Latu Sensu em Desenvolvimento Web Full Stack
* ``Projeto:`` **Controle Financeiro Pessoal**
* ``Autor..:`` **Anderson B. Melo**
* ``Data...:`` 29/01/2022

## API-CFP (API First)
* [Documentação publicada no SwaggerHub - v1.0.2](https://app.swaggerhub.com/apis-docs/abmelorj/api-cfp/1.0.2)
* [YAML api-cfp-102.yml](https://github.com/abmelorj/cfp/blob/main/api-cfp/api-cfp-102.yml)
## SPA-CFP (Singe Page Application)
* Interface web da aplicação prevista para entrega do Módulo B
## Interface (Mobile First)
* [Wireframes CFPv01.png](https://github.com/abmelorj/cfp/blob/main/doc/CFPv01.png)
## C4-Model - Arquitetura da Aplicação
* [Structurizr DSL script](https://github.com/abmelorj/cfp/blob/main/doc/workspace.dsl)

#
# Roteiro para implantar a aplicação Controle Financeiro Pessoal (CFP)

> O roteiro abaixo foi testado em com sucesso em máquina executando o Sistema Operacional `Linux Debian 10 (buster) x86_64 GNU/Linux`.

> Cada um dos módulos abaixo será executado em um container Docker, e para preservar os dados persistidos no banco de dados, ou ainda as configurações específicas da aplicação, precisamos mapear os arquivos de configuração e o caminho onde serão armazenados os dados em locais de armazenamento acessíveis ao host onde a aplicação for ser executada.
## **DB-CFP** (Banco de Dados)
1.  Na implantação da aplicação, o primeiro passo é criar o container Docker que executará o banco de dados MariaDB utilizado pela aplicação. Logo, é necessário executar o comando a seguir no host que hospedará a aplicação. 

> > `$ docker run -d --name db-cfp -e MYSQL_ROOT_PASSWORD=`*senha_do_bd*` -e MYSQL_DATABASES=`*nome_do_bd*`  -p  `*porta_do_bd_no_host*`:3306 --mount type=bind,source=`*/path_no_host*`,target=/var/lib/mysql docker.io/library/mariadb:10.6` 

> > Na linha de comando acima temos 4 parâmetros que devem ser configurados conforme abaixo para personalizar a implantação, reduzindo as chances de curiosos que queiram explorar a instalação:

> > * **senha_do_bd**: senha que será utilizada para acessar o banco de dados da aplicação.

> > * **nome_do_bd**: nome que será utilizado para criar a instância do banco de dados da aplicação.

> > * **porta_do_bd_no_host**: porta de comunicação que será utilizada pelo banco de dados no host para comunicação com a API da aplicação.

> > * **path_no_host**: caminho da pasta/diretório no host onde serão armazenados os arquivos de dados criados pelo MariaDB para armazenar os dados da aplicação.

2. Após carregar o container Docker executando o servidor do MariaDB é necessário conectar na console do banco de dados e criar a instância do banco de dados da aplicação antes de carregar o módulo API-CFP. Execute o comando a seguir, substituindo os parâmetros **senha_do_bd** e **nome_do_bd** pelos mesmos dados usados na criação do container, para se conectar ao console do banco de dados MariaDB e criar a instância a ser usada pela aplicação:

> > > `$ docker exec -i db-cfp mysql -uroot -p`*senha_do_bd*`  <<< "CREATE DATABASE IF NOT EXISTS  `*nome_do_bd*` CHARACTER SET = 'utf8mb4' COLLATE = 'utf8mb4_swedish_ci';"`

3. Uma vez que tenha sido criado o container **db-cfp**, para parar o serviço do banco de dados para manutenção use o comando:

> > > `$ docker stop db-cfp`

4. Para reiniciar o container do banco de dados use o comando:

> > > `$ docker start db-cfp`
## **API-CFP** (BackEnd)
/app
    /config
        .env.prod
            documentar os parâmetros minimos e opcionais
    /src
        **
    jest.config.json
    package-lock.json
    package.json
## **SPA-CFP** (FronEnd)