workspace {
  model {
    anonymous = person "Usuário anônimo" "Qualquer pessoa acessando a Internet" 
    registeredUser = person "Usuário Registrado" "Usuário cadastrado com endereço de e-mail mas ainda não autenticado"
    authenticatedUser = person "Usuário Autenticado" "Usuário autenticado pelo sistema"
    googleSystem = softwareSystem "Google" "Serviço de autenticação do Google" "External System"
    emailSystem = softwareSystem "Sistema de email" "Serviço de correio eletrônico" "External System"
    enterprise CFP {
      cfpSystem = softwareSystem "Controle Financeiro Pessoal" "A melhor forma de manter o controle dos gastos e planejar o futuro" {
        web_app = container "Aplicação Web" "Produz o conteúdo estático da aplicação (SPA) de controle financeiro pessoal." "NodeJS + Angular"
        webserver = container "Servidor Web" "Disponibiliza o conteúdo estático da aplicação (SPA) de controle financeiro pessoal." "Nginx"
        spa_cpf_angular = container "SPA-CFP" "Interface gráfica do sistema Controle Financeiro Pessoal." "Angular" "shapeSPA"
        database = container "Base de dados CFP" "Armazena os dados registrados pelo usuário em memória persistente." "MariaDB" "Database"
        api_cpf = container "API-CFP" "API de serviços backend responsável pela execução de todos os processos da aplicação." "NodeJS + ExpressJS + Sequelize" {
          authController = component "Auth Controller" "Provê funcionalidades de segurança relacionadas ao cadastro, autenticação, troca de senha, esqueci minha senha, etc." "NodeJS+Express" 
          securityLayer = component "Security Layer" "" "NodeJS"
          apiController = component "API Controller" "Atende as principais operações financeiras que afetam os saldos das contas" "NodeJS+Express"
          databaseFacade = component "Database Facade" "Funcionalidades de acesso aos dados da aplicação" "ORM Sequelize"
          authController -> securityLayer "utiliza" "" "relationshipShape"
          authController -> emailSystem "envia e-mail com autenticação temporária" "SMTP" "relationshipShape"
          spa_cpf_angular -> authController "utiliza" "HTTPS" "relationshipShape"
          spa_cpf_angular -> apiController "utiliza" "HTTPS" "relationshipShape"
          apiController -> securityLayer "utiliza" "" "relationshipShape"
          securityLayer -> databaseFacade "realiza persistência" "" "relationshipShape"
          authController -> googleSystem "autentica/ registra" "HTTPS" "relationshipShape"
          databaseFacade -> database "persiste dados" "ORM Sequelize" "relationshipShape"
        }
      }
    }
    anonymous -> webserver "requisita" "HTTPS" "relationshipShape"
    anonymous -> spa_cpf_angular "realiza registro" "HTTPS" "relationshipShape"
    registeredUser -> spa_cpf_angular "autentica ou indica que esqueceu a senha" "HTTPS" "relationshipShape"
    authenticatedUser -> spa_cpf_angular "utiliza" "HTTPS" "relationshipShape"
    web_app -> webserver "publica" "files" "relationshipShape"
    webserver -> spa_cpf_angular "apresenta" "HTTPS" "relationshipShape"
    registeredUser -> emailSystem "Recebe link temporário para resetar a senha" "POP3/IMAP" "relationshipShape"
  }
  views {
    systemContext cfpSystem "C4-Level1" "C4 - Level 1" { 
      include * 
    }
    container cfpSystem "C4-Level2" "C4 - Level 2" { 
      include * 
    }
    component api_cpf "C4-Level3" "C4 - Level 3" { 
      include * 
    }
    styles {
      element "External System" {
          background #dddddd
          color #000000
      }
      element "Database" {
          shape Cylinder
      }
      element "shapeSPA" {
          shape WebBrowser
      }
      relationship "relationshipShape" {
          thickness 2
          color #000000
      }
    }
    theme default
  }
}