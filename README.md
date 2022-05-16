# TCC Pós-graduação Latu Sensu em Desenvolvimento Web Full Stack
* ``Projeto:`` **Controle Financeiro Pessoal**
* ``Autor..:`` **Anderson B. Melo**
* ``Data...:`` 29/03/2022

#
# Artefatos
## API-CFP (API First)
* [Documentação publicada no SwaggerHub - v1.1.0](https://app.swaggerhub.com/apis-docs/abmelorj/api-cfp/1.1.0)
* [YAML api-cfp-110.yml](https://github.com/abmelorj/cfp/blob/main/api-cfp/api-cfp-110.yml)
## SPA-CFP (Singe Page Application em Angular)
* Interface web da aplicação prevista para entrega do Módulo B
## Interface (Mobile First)
* [Wireframes CFPv01.png](https://github.com/abmelorj/cfp/blob/main/doc/CFPv01.png)
## C4-Model - Arquitetura da Aplicação
* [Structurizr DSL script](https://github.com/abmelorj/cfp/blob/main/doc/workspace.dsl)

#
# Roteiro para implantar a aplicação Controle Financeiro Pessoal (CFP)

> O roteiro abaixo foi testado em com sucesso em máquina executando o Sistema Operacional `Linux Debian 10 (buster) x86_64 GNU/Linux`.

> Cada um dos módulos abaixo será executado em um container Docker, e para preservar os dados persistidos no banco de dados, ou ainda as configurações específicas da aplicação, precisamos mapear os arquivos de configuração e o caminho onde serão armazenados os dados em locais de armazenamento acessíveis ao host onde a aplicação for ser executada.

#
## **1º) DB-CFP** (Banco de Dados)
1.  Na implantação da aplicação, o primeiro passo é criar o container Docker que executará o banco de dados MariaDB utilizado pela aplicação. Logo, é necessário executar o comando a seguir no host que hospedará a aplicação. 

>>> `$ docker run -d --name db-cfp -e MYSQL_ROOT_PASSWORD=`*root_database_password*` -e MYSQL_DATABASES=`*database_name*`  -p  `*database_tcp_port_on_host*`:3306 --mount type=bind,source=`*/path_on_host*`,target=/var/lib/mysql docker.io/library/mariadb:10.6` 

>> Na linha de comando acima temos 4 parâmetros que devem ser configurados conforme abaixo para personalizar a implantação, reduzindo as chances de curiosos que queiram explorar a instalação:

> * **root_database_password**: senha que será utilizada para acessar o banco de dados da aplicação.

> * **database_name**: nome que será utilizado para criar a instância do banco de dados da aplicação.

> * **database_tcp_port_on_host**: porta de comunicação que será utilizada pelo banco de dados no host para comunicação com a API da aplicação.

> * **path_on_host**: caminho da pasta/diretório no host onde serão armazenados os arquivos de dados criados pelo MariaDB para armazenar os dados da aplicação.

2. Após carregar o container Docker executando o servidor do MariaDB é necessário conectar na console do banco de dados e criar a instância do banco de dados da aplicação antes de carregar o módulo API-CFP. Execute o comando a seguir, substituindo os parâmetros **root_database_password** e **database_name** pelos mesmos dados usados na criação do container, para se conectar ao console do banco de dados MariaDB e criar a instância a ser usada pela aplicação:

>>> `$ docker exec -i db-cfp mysql -uroot -p`*root_database_password*`  <<< "CREATE DATABASE IF NOT EXISTS  `*database_name*` CHARACTER SET = 'utf8mb4' COLLATE = 'utf8mb4_swedish_ci';"`

3. Uma vez que tenha sido criado o container **db-cfp**, para parar o serviço do banco de dados para manutenção use o comando:

>>> `$ docker stop db-cfp`

4. Para reiniciar o container do banco de dados use o comando:

>>> `$ docker start db-cfp`

#
## **2º) API-CFP** (BackEnd)
1. Após estar com o banco de dados pronto para atender a aplicação, o próximo passo é instanciar o nó de processamento da API da aplicação que será responsável por processar as solicitação da interface do usuário. Logo, será necessário executar o comando a seguir no host que hospedará a API da aplicação:

>> `docker run --name api-cfp  -d -p 3200:3200 --mount type=bind,source=/`*path_on_host*`/.env.prod,target=/api-cfp/config/.env.prod 
abmelorj/api-cfp:latest`

>> Na linha de comando acima o parâmetro **path_on_host** deve ser configurado com o caminho do arquivo **.env.prod** disponibilizado no host onde o nó de processamento da API será executado. 

>> O aquivo **.env.prod** deverá configurar os parâmetros a seguir, um em cada linha, para o correto funcionamento da API:

> * `PORT=3200` _(*)_
>>>  Define a porta TCP que será utilizada pela API para expor os seus serviços. Caso utilize outra porta também será necessário adequar o parâmetro `-p 3200:3200` utilizado no `docker run`.
> * `DB_NAME=`*database_name*
>>> **database_name**: nome que será utilizado para criar a instância do banco de dados da aplicação.
> * `DB_USER=root`
>>> Usuário principal do BD MariaDB.
> * `DB_PASS=`*root_database_password*
>>> **root_database_password**: senha que será utilizada para acessar o banco de dados da aplicação.
> * `DB_DIALECT=mariadb`
>>> Configuração para especificar que o ORM da aplicação irá trabalhar com o MariaDB.
> * `DB_HOST=172.17.0.2` _(*)_
>>> Endereço IP do nó de processamento do banco de dados. O endereço 172.17.0.2 é o endereço default que foi atribuído pelo Docker para o primeiro container configurado na máquina. Pode haver a necessidade de ajustar este endereço caso haja outras instâncias Docker no mesmo host, ou porque foi publicado em outro host.
> * `DB_PORT=`*database_tcp_port_on_host*
>>> **database_tcp_port_on_host**: porta de comunicação que será utilizada pelo banco de dados no host para comunicação com a API da aplicação.
> * `DB_LOGGING=false`
>>> Define se será ativado log de atividades/comandos enviados ao banco de dados. Valores possíveis: [true | false]
> * `DB_CHARSET=utf8mb4`
>>> Configuração de banco de dados para seleção da tabela de caracteres que permitirá o registro e recuperação de caracteres acentuádos.
> * `DB_COLLATE=utf8mb4_swedish_ci`
>>> Configuração de banco de dados para seleção da tabela de caracteres que permitirá o registro e recuperação de caracteres acentuádos.
> * `LOG_LEVEL=error`
>>> Configuração do nível/verbosidade do log. Valores válidos: [  error | warn | info | http | verbose | debug | silly] (https://github.com/winstonjs/winston#logging)
> * `AUTH_SECRET=`*pass_phrase*
>>> **pass_phrase**: string utilizada para "temperar" o token JWT produzido pela API ao autenticar um usuário.
> * `DEBUG=false`
>>> Ativa/desativa o debug da API para depuração do código. Valores válidos: [true | false]

>> _**(*)**_ Caso altere os parâmetros `PORT` ou `DB_HOST` será necessário ajustar no arquivo de configuração do site web da aplicação ([cfp/spa-cfp/src/environments/abmelo.conf](https://github.com/abmelorj/cfp/blob/main/spa-cfp/src/environments/abmelo.conf)).

2. Uma vez que tenha sido criado o container **api-cfp**, para parar o serviço da API para manutenção use o comando:

>>> `$ docker stop api-cfp`

3. Para reiniciar o container de processamento da API use o comando:

>>> `$ docker start api-cfp`

#
## **3º) SPA-CFP** (FronEnd)
1. O terceiro e último nó de processamento a ser carregado é o container do servidor Web que será responsável por prover as páginas estáticas da aplicação CFP, que é uma Single Page Application Angular, e também por criptografar as requisições realizadas pela Aplicação, em execução no dispositivo do usuário final, aos serviços providos pela API-CFP. Logo é necessário executar o comando a seguir:

>>> `docker run --name spa-cfp  -d --mount type=bind,source=/`*path_on_host*`,target=/etc/nginx/certs -p 80:80 -p 443:443 abmelorj/spa-cfp:latest`

>> Na linha de comando acima o parâmetro **path_on_host** deve ser configurado com o caminho da pasta contendo os certificados disponibilizados no host onde o nó de processamento do container Web será executado. Esta pasta deve conter:

> * **dhparam.pem**: o arquivo com o certificado gerado para proteger a troca de chaves Diffie-Hellman, realizada no processo inicial de handshake entre o Servidor Web e o Navegador do usuário. ([cfp/spa-cfp/src/environments/ssl-params.conf](https://github.com/abmelorj/cfp/blob/main/spa-cfp/src/environments/ssl-params.conf))

> * **name_for_cert.pem**: arquivo contendo `o certificado` usado para identificar o domínio do servidor Web da aplicação CFP. O Let's Encrypt gera o arquivo `fullchain.pem`.

> * **name_for_cert-key.pem**: arquivo contendo `a chave privada` usada para identificar o domínio do servidor Web da aplicação CFP. O Let's Encrypt gera o arquivo `privkey.pem`.

> * **ssl-certs.conf**: arquivo de configuração contendo apenas as duas linhas abaixo, indicando os nomes dos arquivos com o certificado (**name_for_cert.pem**) e a chave privada (**name_for_cert-key.pem**) usados para identificar o domínio do servidor Web da aplicação CFP.
>> * `ssl_certificate /etc/nginx/certs/`*name_for_cert.pem*
>> * `ssl_certificate_key /etc/nginx/certs/`*name_for_cert-key.pem*

2. Uma vez que tenha sido criado o container **spa-cfp**, para parar o servidor Web da Aplicação para manutenção use o comando:

>>> `$ docker stop spa-cfp`

3. Para reiniciar o container de processamento do Servidor Web da aplicação use o comando:

>>> `$ docker start spa-cfp`