# E-commerce_api

api inspirada em e-commerce

Recursos disponíveis para acesso via API:
* [**Anúncios de produtos**](#reference)
* [**Perfil do usuário**](#reference)
* [**Categoria de produtos**](#reference)

## URLs de acesso

[GET] /states : Verifica os estados disponíveis.

[POST] /user/signin : Login do usuário.

[POST] /user/signup : cadastro do usuário.

[GET] /user/me : Pega as informações do usuario.(token necessário)

[PUT] /user/me : Modifica as informações do usuario.(token necessário)

[GET] /categories : Verifica as categorias disponíveis.

[POST] /ad/add : Cadastra um anúncio.(token necessário)

[GET] /ad/list : lista dos anúncios.

[GET] /ad/:id : Pega as informações de um anúncio.

[POST] /ad/:id : Modifica as informações de um anúncio.(token necessário)

## Listar
As ações de `listar` permitem o envio dos seguintes parâmetros:

| Parâmetro | Descrição | Valores |
|---|---|---|
| `sort` | Filtra dados em ascendente e descendente. | Valores possiveis: [asc] [dsc] |
| `offset` | Dita quantos dados serão pulado(Paginação). | Valores possiveis: Números |
| `limit` | Filtra quantos dados serão mostrados. | Valores possiveis: Números |
| `q` | Filtra dados pelo valor informado. | Valores possiveis: Qualquer |
| `cat` | Filtra dados pela categoria informada. | Valores possiveis: Qualquer categoria existente |
| `state` | Filtra dados pelo estado informado. | Valores possiveis: Qualquer estado existente |


## Solicitando tokens de acesso

### Obtendo o token

Para obter o token terá que ser feito um login ou cadastro de usuário.

### Login de usuário: [/user/signin]

    + Query

            {
              "email": "[email do usuário]",
              "password": "[senha do usuário]"
            }

+ Response 200 (application/json)

    + Body

            {
                "token": "[token de acesso]"
            }

### cadastro de usuário: [/user/signup]

    + Query

            {
              "name": "[nome do usuário]",
              "email": "[email do usuário]",
              "password": "[senha do usuário]",
              "state": "[ID de algum estado valido]"
            }

+ Response 200 (application/json)

    + Body

            {
                "token": "[token de acesso]"
            }

### Utilizando token de usuário

O `token` terá que ser enviado junto da query.

#### Dados para envio
| Parâmetro | Descrição |
|---|---|
| `token` | Token do cliente. |


### utilizando o token

+ Request (application/json)

    + query

            {
              "token": "[token do usuário]"
            }


# Group Recursos

## Estados [/state]

Busca os estados disponíveis.

## Usuários [/user/me]

### Informações do Usuário [GET /user/me{?token}]
 
+ Request (application/json)

    + query

            {
              "token": "[token do usuário]"
            }

+ Response 200 (application/json)

          {
              "name": "[nome do usuário]"
              "email": "[email do usuário]"
              "state": "[ID do estado do usuário]" 
              "ads": "[
                {
                  "_id": "[ID do anúncio]",
                  "images": [
                    {
                      "url": "[url da imagem]"
                    }
                  ],
                  "status": "[status do anúncio]",
                  "idUser": "[ID do dono anúncio]",
                  "state": "[ID do estado do anúncio]",
                  "dateCreated": "[data de criação do anúncio]",
                  "title": "[titulo do anúncio]",
                  "category": "[ID da categoria anúncio]",
                  "price": "[preço do anúncio]",
                  "priceNegotiable": "[verificação se o preço do anúncio é negociavel ou não]",
                  "description": "[descrição do anúncio]",
                  "views": "[descrição do anúncio]",
                }
              ]"
          }

### Modificar Informações do Usuário [PUT /user/me{?token}]
 
+ Request (application/json)

    + query

            {
              "token": "[token do usuário]"
              
            }

+ Response 200 (application/json)

          {
              "success": "Alterado com sucesso!"
          }

+ Response 400 (application/json)

          {
              "error": "[mensagem de erro referente ao erro cometido]"
          }

## Categorias [/category]

Busca as categorias disponíveis.

                "ads": "[
                {
                  "_id": "[ID do anúncio]",
                  "images": [
                    {
                      "url": "[url da imagem]"
                    }
                  ],
                  "status": "[status do anúncio]",
                  "idUser": "[ID do dono anúncio]",
                  "state": "[ID do estado do anúncio]",
                  "dateCreated": "[data de criação do anúncio]",
                  "title": "[titulo do anúncio]",
                  "category": "[ID da categoria anúncio]",
                  "price": "[preço do anúncio]",
                  "priceNegotiable": "[verificação se o preço do anúncio é negociavel ou não]",
                  "description": "[descrição do anúncio]",
                  "views": "[descrição do anúncio]",
                }
              ]"
