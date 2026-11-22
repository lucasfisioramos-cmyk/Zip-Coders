# language: pt
Funcionalidade: Controle de acesso por perfil (ZC-56, ZC-57 e ZC-58)
  Contexto:
    Dado que existem os quatro perfis e Carlos é Executor

  Esquema do Cenário: Bloqueio de funcionalidade restrita
    Dado que estou autenticado como "<perfil>"
    Quando tento acessar "<rota>"
    Então recebo HTTP 403 e a mensagem "Acesso não autorizado"
    Exemplos:
      | perfil   | rota                    |
      | USUARIO  | /admin/perfis           |
      | EXECUTOR | /admin/perfis           |
      | GESTOR   | /admin/perfis           |
      | USUARIO  | /api/admin/perfis       |
      | EXECUTOR | /api/admin/perfis       |
      | USUARIO  | /api/relatorios/ordens/exportar |
      | EXECUTOR | /api/relatorios/ordens/exportar |

  Cenário: Atribuição de perfil pelo Administrador com acesso imediato
    Dado que Carlos está autenticado e seu token é mantido
    E que estou autenticado como "ADMIN"
    Quando altero o papel de Carlos para "GESTOR"
    Então o perfil "GESTOR" está persistido e auditado
    E Carlos acessa os relatórios na próxima requisição com o mesmo token
    E a consulta de sessão de Carlos retorna "GESTOR"

  Cenário: Rebaixamento revoga o acesso com o mesmo token
    Dado que Carlos está autenticado como Gestor e seu token é mantido
    E que estou autenticado como "ADMIN"
    Quando altero o papel de Carlos para "EXECUTOR"
    Então o perfil "EXECUTOR" está persistido e auditado
    E Carlos perde a permissão de relatórios com o mesmo token

  Esquema do Cenário: Somente Administrador atribui papéis
    Dado que estou autenticado como "<perfil>"
    Quando altero o papel de Carlos para "ADMIN"
    Então recebo HTTP 403 e a mensagem "Acesso não autorizado"
    E Carlos continua Executor sem auditoria de alteração
    Exemplos:
      | perfil   |
      | USUARIO  |
      | EXECUTOR |
      | GESTOR   |

  Esquema do Cenário: Gestor não pode atribuir perfil pelo cadastro
    Dado que estou autenticado como "GESTOR"
    Quando tento gerenciar usuários com "<metodo>" em "<rota>"
    Então recebo HTTP 403 e a mensagem "Acesso não autorizado"
    Exemplos:
      | metodo | rota                       |
      | POST   | /api/usuarios              |

  Cenário: Perfil inválido não é persistido
    Dado que estou autenticado como "ADMIN"
    Quando altero o papel de Carlos para "SUPER_ADMIN"
    Então recebo HTTP 400
    E Carlos continua Executor sem auditoria de alteração

  Cenário: Perfil em formato inválido não é persistido
    Dado que estou autenticado como "ADMIN"
    Quando envio uma lista como perfil de Carlos
    Então recebo HTTP 400
    E Carlos continua Executor sem auditoria de alteração

  Cenário: Usuário inexistente
    Dado que estou autenticado como "ADMIN"
    Quando altero o perfil de um usuário inexistente
    Então recebo HTTP 404

  Esquema do Cenário: Sessão ausente ou inválida não permite acesso
    Dado que uso uma sessão "<sessao>"
    Quando tento acessar "/api/admin/perfis"
    Então recebo HTTP 401
    Exemplos:
      | sessao   |
      | ausente  |
      | inválida |
      | expirada |
      | excluída |
      | inativa  |

  Cenário: Administrador consulta os quatro perfis
    Dado que estou autenticado como "ADMIN"
    Quando tento acessar "/api/admin/perfis"
    Então recebo os quatro perfis sem dados de senha

  Cenário: A regra existente de desativação por Gestor é preservada
    Dado que estou autenticado como "GESTOR"
    Quando tento gerenciar usuários com "PATCH" em "/api/usuarios/carlos/ativo"
    Então recebo HTTP 200
