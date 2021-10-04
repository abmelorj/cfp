workspace {

    model {

        anonymous = person "Usuário não Registrado" "Usuário não cadastrado no sistema" 

        registeredUser = person "Usuário Registrado" "Usuário cadastrado com endereço de e-mail mas ainda não autenticado"

        authenticatedUser = person "Usuário Autenticado" "Usuário autenticado pelo sistema"
        
        googleSystem = softwareSystem "Google" "Serviço de autenticação do Google" "External System"

        emailSystem = softwareSystem "Sistema de email" "Serviço de correio eletrônico" "External System"

        enterprise CFP {

            cfpSystem = softwareSystem "Controle Financeiro Pessoal" "A melhor forma de manter o controle dos gastos e planejar o futuro" {

                webserver_app = container "Aplicação Web" "Disponibiliza o conteúdo estático e a aplicação (SPA) de controle financeiro pessoal." "NodeJS + Express"

                spa_cpf_angular = container "SPA-CFP" "Interface gráfica do sistema Controle Financeiro Pessoal." "NodeJS + Angular" "shapeSPA"

                database = container "Base de dados CFP" "Armazena os dados registrados pelo usuário em memória persistente." "MariaDB" "Database"

                api_cpf = container "API-CFP" "API de serviços backend responsável pela execução de todos os processos da aplicação." "NodeJS" {

                    signup = component "Sign Up Controller" "Realiza o cadastro de novos usuários na aplicação." "OAuth/e-mail"

                    signin = component "Sign In Controller" "Realiza a autenticação de usuários da aplicação" "OAuth/e-mail"

                    resetPass = component "Reset Password Controller" "Permite aos usuários resetarem as credenciais cadastradas com e-mail." "e-mail"

                    securityLayer = component "Security Layer" "Provê funcionalidades de segurança relacionadas ao cadastro, autenticação, troca de senha, esqueci minha senha, etc." "OAuth/e-mail"

                    financialStructure = component "CFP Structure" "Fuções de manutenção da estrutura de categorias, contas e controle de acesso para outros usuários"

                    databaseFacade = component "Database Facade" "Funcionalidades de acesso aos dados da aplicação" "ORM"

                    financialControl = component "CFP Controller" "Atende as principais operações financeiras que afetam os saldos das contas" "Angular"

                    signup -> securityLayer "utiliza" "" "relationshipShape"
                    signin -> securityLayer "utiliza" "" "relationshipShape"
                    resetPass -> securityLayer "utiliza" "" "relationshipShape"
                    resetPass -> emailSystem "envia e-mail com autenticação temporária" "SMTP" "relationshipShape"

                    spa_cpf_angular -> signup "utiliza" "HTTPS" "relationshipShape"
                    spa_cpf_angular -> signin "utiliza" "HTTPS" "relationshipShape"
                    spa_cpf_angular -> resetPass "utiliza" "HTTPS" "relationshipShape"
                    spa_cpf_angular -> financialControl "utiliza" "HTTPS" "relationshipShape"
                    spa_cpf_angular -> financialStructure "utiliza" "HTTPS" "relationshipShape"

                    financialControl -> databaseFacade "realiza persistência" "" "relationshipShape"
                    financialStructure -> databaseFacade "realiza persistência" "" "relationshipShape"
                    securityLayer -> databaseFacade "realiza persistência" "" "relationshipShape"
                    securityLayer -> googleSystem "autentica/ registra" "HTTPS" "relationshipShape"

                    databaseFacade -> database "persiste dados" "ORM" "relationshipShape"

                }

            }

        }

        anonymous -> webserver_app "requisita" "HTTPS" "relationshipShape"
        anonymous -> spa_cpf_angular "realiza registro" "HTTPS" "relationshipShape"
        registeredUser -> spa_cpf_angular "autentica ou indica que esqueceu a senha" "HTTPS" "relationshipShape"
        
        authenticatedUser -> spa_cpf_angular "utiliza" "HTTPS" "relationshipShape"
        webserver_app -> spa_cpf_angular "apresenta" "HTTPS" "relationshipShape"
        
        
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