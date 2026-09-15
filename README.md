# CaseCellShop

Mini e-commerce desenvolvido como case técnico.

A aplicação simula uma loja de capinhas para smartphones, permitindo consultar produtos, selecionar quantidade, adicionar itens ao carrinho, realizar login, criar pedidos e consultar pedidos realizados.

O foco principal do projeto foi implementar um fluxo de checkout simples, mas considerando alguns problemas comuns em sistemas reais:

- validação de entrada;
- controle de estoque;
- concorrência;
- transações;
- idempotência;
- persistência;
- tratamento de erros;
- separação de responsabilidades;
- testes automatizados;
- execução via Docker.

# CaseCellShop

## Sumário

- [Como executar](#como-executar)
- [Credenciais](#credenciais)
- [Arquitetura](#arquitetura)
- [Estrutura](#estrutura)
- [Comunicação entre Frontend e Backend](#comunicação-entre-frontend-e-backend)
- [Docker e comunicação de rede](#docker-e-comunicação-de-rede)
- [CORS](#cors)
- [API](#api)
  - [GET /products](#get-products)
  - [GET /products/:id](#get-productsid)
  - [POST /orders](#post-orders)
  - [Fluxo de criação do pedido](#fluxo-de-criação-do-pedido)
  - [Validação](#validação)
  - [Produto inexistente](#produto-inexistente)
  - [Estoque insuficiente](#estoque-insuficiente)
  - [Controle de estoque](#controle-de-estoque)
  - [Transações](#transações)
  - [Idempotência](#idempotência)
  - [GET /orders](#get-orders)
  - [POST /auth/login](#post-authlogin)
- [Padrão de respostas](#padrão-de-respostas)
- [Tratamento de erros](#tratamento-de-erros)
- [Banco de dados](#banco-de-dados)
- [Modelo de dados](#modelo-de-dados)
- [Snapshot do preço](#snapshot-do-preço)
- [Frontend](#frontend)
- [Fluxo do frontend](#fluxo-do-frontend)
- [Limitação atual do checkout](#limitação-atual-do-checkout)
- [Testes](#testes)
- [ZOMBIES](#zombies)
- [TDD](#tdd)
- [Testes de concorrência](#testes-de-concorrência)
- [Docker](#docker)
- [Persistência no Docker](#persistência-no-docker)
- [Variáveis e configuração](#variáveis-e-configuração)
- [Decisões técnicas](#decisões-técnicas)
- [Limitações atuais](#limitações-atuais)
- [Próximos passos](#próximos-passos)
- [Scripts](#scripts)
- [Objetivo do projeto](#objetivo-do-projeto)

---

## Stack

### Backend

- Node.js
- TypeScript
- Fastify
- SQLite
- Vitest

### Frontend

- React
- TypeScript
- React Router
- Context API

### Infraestrutura

- Docker
- Docker Compose

---

# Como executar

## Pré-requisitos

- Docker
- Docker Compose

Não é necessário instalar Node.js ou SQLite localmente para executar a aplicação utilizando Docker.

## Executando

Clone o projeto:

    git clone https://github.com/Nakamura16/CaseCellShop.git

Entre na pasta:

    cd CaseCellShop

Suba os containers:

    docker compose up --build

A aplicação ficará disponível em:

    Frontend: http://localhost:3001
    Backend:  http://localhost:3000

Para verificar se o backend está funcionando:

    http://localhost:3000/

A resposta esperada é:

    {
      "message": "CaseCellShop API is running!"
    }

Para parar os containers:

    docker compose down

O banco SQLite é armazenado em um Docker volume, portanto os dados não são perdidos simplesmente ao executar docker compose down.

---

# Credenciais

A autenticação atualmente é mockada.

    Email: teste@casecell.com
    Senha: 123456

O objetivo do case não era implementar um sistema completo de Identity.

O backend apenas simula o processo de autenticação e retorna um token mockado.

Em uma aplicação real, essa parte poderia ser substituída por uma solução como AWS Cognito, Auth0 ou Keycloak.

Também seriam tratados assuntos como:

- hash de senha;
- JWT;
- refresh token;
- expiração de sessão;
- autorização;
- recuperação de senha;
- revogação de sessão.

---

# Arquitetura

O projeto foi dividido em frontend e backend.

O frontend é responsável pela interface e pelo estado da aplicação.

O backend concentra as regras de negócio, persistência e fluxo de checkout.

A comunicação acontece através de HTTP utilizando uma API REST.

A estrutura principal do backend segue:

    Routes
      ↓
    Services
      ↓
    Repositories
      ↓
    SQLite

## Routes

As Routes são responsáveis pela camada HTTP.

Elas recebem:

- body;
- headers;
- parâmetros;
- requisições HTTP.

E delegam a operação para os Services.

A ideia é evitar colocar regras de negócio diretamente nas rotas.

## Services

Os Services concentram as regras de negócio.

O principal exemplo é o OrderService.

Ele é responsável por coordenar:

- validação;
- idempotência;
- busca do produto;
- controle de estoque;
- criação do pedido;
- criação dos itens;
- transação;
- commit;
- rollback.

## Repositories

Os Repositories encapsulam o acesso ao banco.

Os Services dependem de interfaces dos repositories, enquanto as implementações concretas ficam separadas.

Isso evita que a regra de negócio fique diretamente acoplada ao SQLite.

---

# Estrutura

    CaseCellShop/
    ├── Backend/
    │   ├── src/
    │   │   ├── Database/
    │   │   ├── Error/
    │   │   ├── Models/
    │   │   ├── Repositories/
    │   │   │   ├── Implementation/
    │   │   │   └── Interfaces/
    │   │   ├── Services/
    │   │   ├── routes/
    │   │   └── server.ts
    │   ├── Dockerfile
    │   ├── package.json
    │   └── tsconfig.json
    │
    ├── Frontend/
    │   └── case-cell-shop-webapp/
    │       ├── src/
    │       │   ├── Api/
    │       │   ├── Context/
    │       │   ├── Model/
    │       │   └── Pages/
    │       ├── Dockerfile
    │       └── package.json
    │
    ├── docker-compose.yml
    └── README.md

---

# Comunicação entre Frontend e Backend

O frontend possui classes responsáveis pela comunicação com a API:

- ProductApi
- OrderApi
- AuthApi

Por exemplo, ao carregar a página de produtos:

    ProductsPage
        ↓
    ProductApi.getProducts()
        ↓
    GET http://localhost:3000/products

No backend:

    GET /products
        ↓
    Product Route
        ↓
    Product Service
        ↓
    Product Repository
        ↓
    SQLite

O resultado retorna pelo mesmo caminho até chegar ao React.

Isso mantém a comunicação com a API centralizada e evita espalhar chamadas fetch diretamente pelos componentes.

---

# Docker e comunicação de rede

Existem dois containers:

- frontend;
- backend.

O Docker Compose cria uma network interna entre os serviços.

Dentro da network Docker, um container poderia acessar o backend utilizando:

    http://backend:3000

Porém, o React é executado pelo navegador do usuário.

O navegador não está dentro da network interna do Docker.

Por isso o frontend utiliza:

    http://localhost:3000

O fluxo é:

    Browser
      ↓
    localhost:3000
      ↓
    Docker
      ↓
    Backend Container

O backend escuta em 0.0.0.0 para aceitar conexões vindas da porta publicada pelo Docker.

---

# CORS

O frontend roda em:

    http://localhost:3001

O backend roda em:

    http://localhost:3000

Como são origins diferentes, o backend habilita CORS para permitir requisições provenientes do frontend.

Atualmente:

    http://localhost:3001

é a origem permitida.

Em produção essa configuração deveria ser definida por variável de ambiente e limitada aos domínios reais da aplicação.

---

# API

## GET /products

Lista todos os produtos.

### Request

    GET /products

### Response

    200 OK

    {
      "success": true,
      "data": [
        {
          "id": "iphone-15",
          "name": "Capinha iPhone 15",
          "description": "Capinha de silicone para iPhone 15",
          "price": 49.9,
          "stock": 10,
          "createdAt": "2026-09-15T10:00:00.000Z",
          "updatedAt": "2026-09-15T10:00:00.000Z"
        }
      ]
    }

---

## GET /products/:id

Consulta um produto específico.

### Request

    GET /products/iphone-15

### Response

    200 OK

    {
      "success": true,
      "data": {
        "id": "iphone-15",
        "name": "Capinha iPhone 15",
        "description": "Capinha de silicone para iPhone 15",
        "price": 49.9,
        "stock": 10,
        "createdAt": "2026-09-15T10:00:00.000Z",
        "updatedAt": "2026-09-15T10:00:00.000Z"
      }
    }

Se o produto não existir:

    404 Not Found

    {
      "success": false,
      "error": {
        "code": "PRODUCT_NOT_FOUND",
        "message": "Product not found"
      }
    }

---

# POST /orders

É o principal endpoint da aplicação.

Representa uma tentativa de criação de pedido.

## Headers

A requisição exige uma chave de idempotência:

    Idempotency-Key: 7d9f8b0a-1234

## Request

    POST /orders
    Content-Type: application/json
    Idempotency-Key: 7d9f8b0a-1234

Body:

    {
      "productId": "iphone-15",
      "quantity": 2
    }

## Response

    201 Created

    {
      "id": "b7e5e6e7-2c93-4c7a-9e6e",
      "idempotencyKey": "7d9f8b0a-1234",
      "status": "CONFIRMED",
      "totalAmount": 99.8,
      "createdAt": "2026-09-15T18:30:00.000Z",
      "updatedAt": "2026-09-15T18:30:00.000Z"
    }

---

# Fluxo de criação do pedido

Quando chega um POST /orders, o backend executa:

1. validação da requisição;
2. início da transação;
3. verificação da Idempotency-Key;
4. busca do produto;
5. atualização do estoque;
6. criação do pedido;
7. criação do item;
8. commit da transação.

Simplificando:

    BEGIN IMMEDIATE
        ↓
    Validar request
        ↓
    Verificar idempotência
        ↓
    Buscar produto
        ↓
    Diminuir estoque
        ↓
    Criar pedido
        ↓
    Criar item
        ↓
    COMMIT

Se qualquer operação falhar:

    ROLLBACK

---

# Validação

A API valida os principais dados antes de executar a operação.

productId é obrigatório.

quantity precisa ser um inteiro positivo.

Exemplos inválidos:

    {
      "productId": "iphone-15",
      "quantity": 0
    }

    {
      "productId": "iphone-15",
      "quantity": -1
    }

    {
      "productId": "iphone-15",
      "quantity": 1.5
    }

A Idempotency-Key também é obrigatória.

## Response

    400 Bad Request

    {
      "success": false,
      "error": {
        "code": "VALIDATION_ERROR",
        "message": "Quantity must be a positive integer"
      }
    }

---

# Produto inexistente

Quando o produto informado não existe:

    404 Not Found

    {
      "success": false,
      "error": {
        "code": "PRODUCT_NOT_FOUND",
        "message": "Product not found"
      }
    }

---

# Estoque insuficiente

Quando a quantidade solicitada é maior que o estoque disponível:

    409 Conflict

    {
      "success": false,
      "error": {
        "code": "INSUFFICIENT_STOCK",
        "message": "Insufficient stock"
      }
    }

O status 409 foi utilizado porque a requisição é válida, mas não pode ser processada devido ao estado atual do recurso.

---

# Controle de estoque

O estoque é uma das partes críticas do fluxo.

Uma implementação simples poderia fazer:

    SELECT stock
        ↓
    verifica estoque
        ↓
    UPDATE stock

Esse fluxo pode apresentar problemas em cenários concorrentes.

Exemplo:

    Estoque = 1

    Request A → lê 1
    Request B → lê 1

As duas requisições poderiam concluir que existe estoque suficiente.

Para reduzir esse problema, a própria atualização do estoque possui a condição:

    UPDATE products
    SET
      stock = stock - ?,
      updated_at = ?
    WHERE id = ?
      AND stock >= ?

A aplicação verifica o número de linhas afetadas.

Se uma linha foi atualizada:

    estoque reservado com sucesso

Se nenhuma linha foi atualizada:

    estoque insuficiente

Dessa forma a condição crítica fica na própria operação de alteração do banco.

---

# Transações

A criação de um pedido envolve mais de uma operação:

- atualizar estoque;
- criar pedido;
- criar item.

Essas operações precisam ser tratadas como uma unidade.

Não queremos:

    estoque decrementado
        +
    pedido não criado

Por isso é utilizada uma transação.

Fluxo:

    BEGIN IMMEDIATE

    UPDATE products

    INSERT INTO orders

    INSERT INTO order_items

    COMMIT

Caso alguma operação falhe:

    ROLLBACK

O uso de BEGIN IMMEDIATE também é intencional.

Como o fluxo envolve uma atualização crítica de estoque, a transação solicita a reserva de escrita do SQLite antes de executar as operações.

---

# Idempotência

O endpoint de criação de pedidos exige:

    Idempotency-Key

Essa chave é armazenada na tabela orders e possui uma constraint UNIQUE.

Exemplo:

Primeira requisição:

    POST /orders
    Idempotency-Key: abc-123

O pedido é criado.

Se a mesma operação for enviada novamente utilizando:

    Idempotency-Key: abc-123

O backend encontra o pedido existente e retorna o pedido original.

Nenhum novo pedido é criado.

Nenhum novo estoque é consumido.

Isso é importante principalmente para retries.

Um cenário possível:

    Cliente envia pedido
        ↓
    Backend cria pedido
        ↓
    Resposta é perdida
        ↓
    Cliente tenta novamente
        ↓
    Mesma Idempotency-Key
        ↓
    Backend encontra pedido existente
        ↓
    Pedido original é retornado

A implementação da idempotência está no backend.

No frontend atual, cada chamada de createOrder gera uma nova chave. Portanto, um retry automático no cliente ainda não reutiliza a mesma chave. Em uma implementação de produção, a chave deveria representar a tentativa de checkout e ser reutilizada durante retries daquela mesma operação.

---

# GET /orders

Lista os pedidos existentes.

### Request

    GET /orders

### Response

    200 OK

    [
      {
        "id": "order-123",
        "idempotencyKey": "abc-123",
        "status": "CONFIRMED",
        "totalAmount": 99.8,
        "createdAt": "2026-09-15T18:30:00.000Z",
        "updatedAt": "2026-09-15T18:30:00.000Z"
      }
    ]

---

# POST /auth/login

Realiza o login do usuário.

### Request

    POST /auth/login
    Content-Type: application/json

    {
      "email": "teste@casecell.com",
      "password": "123456"
    }

### Response

    200 OK

    {
      "success": true,
      "data": {
        "token": "mock-token-...",
        "user": {
          "id": "user-1",
          "name": "Teste da Silva",
          "email": "teste@casecell.com"
        }
      }
    }

O token é apenas demonstrativo.

Atualmente os endpoints de produtos e pedidos não validam Authorization.

O login existe para representar o fluxo de autenticação no frontend, mas não deve ser considerado uma implementação de segurança pronta para produção.

---

# Padrão de respostas

Os endpoints que utilizam o envelope padrão seguem:

## Sucesso

    {
      "success": true,
      "data": {}
    }

## Erro

    {
      "success": false,
      "error": {
        "code": "ERROR_CODE",
        "message": "Error message"
      }
    }

O código do erro permite que o frontend trate comportamentos específicos sem precisar interpretar mensagens.

Por exemplo:

    INSUFFICIENT_STOCK

pode resultar em uma mensagem específica para o usuário.

---

# Tratamento de erros

Foi criado um AppError para representar erros conhecidos da aplicação.

Alguns exemplos:

    VALIDATION_ERROR
    PRODUCT_NOT_FOUND
    INSUFFICIENT_STOCK
    INVALID_CREDENTIALS

Existe também um error handler global no Fastify.

Erros conhecidos são transformados em respostas HTTP adequadas.

Erros inesperados resultam em:

    500 Internal Server Error

Resposta:

    {
      "success": false,
      "error": {
        "code": "INTERNAL_ERROR",
        "message": "An unexpected error occurred"
      }
    }

O erro original também é registrado pelo logger do Fastify.

---

# Banco de dados

Foi utilizado SQLite.

A escolha foi proposital.

Para o tamanho do case, SQLite permite demonstrar funcionalidades importantes de um banco relacional sem adicionar infraestrutura desnecessária.

Entre as funcionalidades utilizadas estão:

- SQL;
- transações;
- constraints;
- índices;
- foreign keys;
- persistência;
- controle de concorrência de escrita.

Em um sistema maior, a escolha poderia ser PostgreSQL, Aurora, SQL Server ou outro banco dependendo dos requisitos.

A escolha do SQLite aqui é principalmente pragmática.

---

# Modelo de dados

## products

Representa os produtos disponíveis.

Campos principais:

    id
    name
    description
    price
    stock
    created_at
    updated_at

## orders

Representa os pedidos.

Campos principais:

    id
    idempotency_key
    status
    total_amount
    created_at
    updated_at

A idempotency_key possui uma constraint UNIQUE.

## order_items

Representa os itens dos pedidos.

Campos:

    id
    order_id
    product_id
    quantity
    unit_price

Existe relacionamento entre order_items e orders através de order_id.

---

# Snapshot do preço

O preço também é armazenado no order_items.

Isso é importante porque o preço atual de um produto pode mudar.

Exemplo:

No momento da compra:

    R$ 49,90

Depois:

    R$ 59,90

O pedido antigo precisa continuar representando o valor original.

Por isso o item guarda:

    unit_price

O histórico do pedido não depende do preço atual cadastrado em products.

---

# Frontend

O frontend possui algumas divisões principais:

    Api
    Context
    Model
    Pages
    Components

## Api

Responsável pela comunicação com o backend.

Exemplos:

    ProductApi
    OrderApi
    AuthApi

## Model

Contém os contratos utilizados pelo frontend.

Exemplos:

    Product
    Order
    CartItem
    AuthUser

## Context

Responsável por estados compartilhados.

Existem dois contextos principais:

    CartContext
    AuthContext

O CartContext controla:

- itens;
- quantidade;
- total;
- adicionar produto;
- remover produto;
- alterar quantidade;
- limpar carrinho.

O AuthContext controla:

- sessão;
- usuário;
- login;
- logout;
- estado de autenticação.

---

# Fluxo do frontend

O fluxo principal é:

    Produtos
        ↓
    Selecionar quantidade
        ↓
    Adicionar ao carrinho
        ↓
    Checkout
        ↓
    POST /orders
        ↓
    Pedido confirmado

Durante a compra, a interface também controla o estado de loading para evitar múltiplos disparos enquanto a operação está em andamento.

O frontend apresenta estados diferentes para:

- carregamento;
- erro;
- sucesso;
- estoque insuficiente;
- carrinho vazio.

---

# Limitação atual do checkout

Atualmente o carrinho pode possuir múltiplos produtos.

O frontend envia um POST /orders para cada item.

Exemplo:

    Carrinho
      ├── iPhone 15 x2
      └── Galaxy S25 x1

São feitas duas operações:

    POST /orders
    POST /orders

Isso significa que existe possibilidade de sucesso parcial.

Por exemplo:

    Produto A → comprado
    Produto B → estoque insuficiente

Uma implementação mais robusta seria possuir um endpoint capaz de receber o carrinho inteiro:

    POST /orders

    {
      "items": [
        {
          "productId": "iphone-15",
          "quantity": 2
        },
        {
          "productId": "galaxy-s25",
          "quantity": 1
        }
      ]
    }

O backend poderia então processar todos os itens dentro de uma única transação.

Assim:

    BEGIN
        ↓
    validar todos os produtos
        ↓
    validar estoque
        ↓
    atualizar estoque
        ↓
    criar pedido
        ↓
    criar itens
        ↓
    COMMIT

Se qualquer item falhar:

    ROLLBACK

Essa seria uma das principais evoluções do projeto.

---

# Testes

Os testes utilizam Vitest.

Atualmente existe uma suíte focada principalmente no OrderService.

Os cenários cobertos incluem:

- criação de pedido;
- quantidade zero;
- quantidade negativa;
- quantidade fracionada;
- productId ausente;
- Idempotency-Key ausente;
- compra de uma unidade;
- compra de múltiplas unidades;
- compra exatamente do estoque;
- compra acima do estoque;
- produto inexistente;
- estoque insuficiente;
- persistência do pedido;
- persistência do item;
- commit;
- rollback;
- idempotência;
- consulta dos pedidos;
- erros inesperados.

Os testes seguem a estrutura:

    Arrange
    Act
    Assert

---

# ZOMBIES

A estratégia de testes também foi organizada utilizando a ideia de ZOMBIES.

A intenção é evitar testar somente o happy path.

Os cenários são divididos em:

    Z - Zero
    O - One
    M - Many
    B - Boundary
    I - Interface
    E - Exceptional
    S - Simple

Exemplos:

## Zero

Quantidade zero.

## One

Compra de uma unidade.

## Many

Compra de várias unidades.

## Boundary

Comprar exatamente a quantidade disponível no estoque.

Também entram aqui valores próximos dos limites.

## Interface

Verificar a interação entre Service e Repository.

## Exceptional

Produto inexistente, estoque insuficiente e erros inesperados.

## Simple

Fluxo básico de criação de pedido.

---

# TDD

Os testes desse projeto foram adicionados depois da implementação inicial.

Ou seja, o desenvolvimento não seguiu TDD de forma estrita desde o início.

A suíte foi criada posteriormente para validar principalmente as regras críticas do OrderService e demonstrar uma estratégia de testes automatizados.

Em um projeto real, eu aplicaria TDD principalmente nas regras mais críticas:

- controle de estoque;
- idempotência;
- transações;
- criação de pedidos.

Uma evolução natural seria implementar essas regras através do ciclo:

    Red
      ↓
    Green
      ↓
    Refactor

---

# Testes de concorrência

Um próximo teste importante seria um teste de integração utilizando o banco real.

Por exemplo:

    Estoque inicial = 1

Duas requisições simultâneas:

    Request A → compra 1
    Request B → compra 1

O resultado esperado:

    Request A → CONFIRMED
    Request B → INSUFFICIENT_STOCK

A ordem em que cada request vence não importa.

O importante é que apenas uma consiga consumir o estoque.

Esse teste seria mais representativo do comportamento real do sistema do que um teste unitário utilizando mocks.

---

# Docker

O projeto possui dois Dockerfiles.

Um para o backend e outro para o frontend.

O backend:

1. instala as dependências;
2. executa os testes;
3. executa o TypeScript compiler;
4. gera a aplicação compilada;
5. inicia o servidor.

Isso faz com que uma imagem com testes ou build quebrado não seja considerada válida.

O frontend executa a aplicação React em um container Node.

---

# Persistência no Docker

O SQLite é armazenado em:

    /app/data/casecellshop.db

O Docker Compose monta um volume:

    casecellshop-data

Isso permite que o banco continue existindo mesmo que o container seja recriado.

---

# Variáveis e configuração

A aplicação atualmente possui algumas configurações fixas para manter o case simples, como:

    Backend:
    http://localhost:3000

    Frontend:
    http://localhost:3001

Em uma aplicação de produção essas configurações deveriam ser externalizadas através de variáveis de ambiente.

Exemplo:

    API_BASE_URL
    CORS_ORIGIN
    DATABASE_PATH

Isso permitiria utilizar a mesma aplicação em ambientes diferentes sem alterar o código.

---

# Decisões técnicas

## Por que Node.js + TypeScript?

A escolha foi feita principalmente para demonstrar uma stack diferente da stack principal que utilizo no dia a dia.

TypeScript também permite manter tipagem estática mesmo utilizando Node.js.

Para alguém vindo de C#/.NET, conceitos como interfaces, classes, tipos e contratos continuam bastante familiares.

## Por que Fastify?

Fastify possui uma API simples, boa performance e baixo overhead.

Para o tamanho do projeto não havia necessidade de utilizar um framework maior.

## Por que SQLite?

Porque o problema não exige um banco externo.

SQLite permite demonstrar:

- SQL;
- transações;
- constraints;
- índices;
- persistência;
- concorrência.

Sem adicionar infraestrutura desnecessária.

## Por que não Prisma?

A aplicação não precisava de um ORM para esse nível de complexidade.

O objetivo também era demonstrar conhecimento de SQL e controle explícito das operações críticas de banco.

Por isso os repositories utilizam SQL diretamente.

## Por que React?

É uma tecnologia já utilizada no frontend do projeto e atende bem ao tamanho da aplicação.

O Context API foi suficiente para o estado compartilhado do carrinho e autenticação.

---

# Limitações atuais

O projeto é propositalmente pequeno e possui algumas limitações.

## Autenticação

É mockada e não existe autorização real nos endpoints.

## Checkout com múltiplos produtos

Cada item é enviado individualmente.

O ideal seria processar o carrinho inteiro dentro de uma única transação.

## Idempotência no frontend

O backend suporta idempotência, mas o frontend gera uma nova chave a cada chamada de createOrder.

Em retries reais, a mesma chave deveria ser reutilizada.

## Testes de concorrência

Existem testes unitários para as regras do Service, mas ainda seria interessante adicionar testes de integração concorrentes utilizando SQLite real.

## Observabilidade

O Fastify possui logging, mas ainda não existe uma solução estruturada de observabilidade com métricas, tracing e correlação de requests.

## Persistência de sessão

A sessão do frontend fica apenas em memória.

Ao atualizar a página, o usuário perde a sessão.

Em uma aplicação real seria necessário definir uma estratégia adequada de persistência e segurança da sessão.

## Segurança

Não foram implementados:

- rate limiting;
- autenticação real;
- autorização;
- proteção contra ataques específicos;
- secrets management;
- HTTPS;
- validação mais completa de payloads.

Esses pontos estão fora do escopo do case.

---

# Próximos passos

Se esse projeto fosse evoluído para uma aplicação mais próxima de produção, os próximos passos seriam:

1. Transformar o checkout em uma operação única para todo o carrinho.
2. Adicionar testes de integração com SQLite real.
3. Adicionar testes de concorrência.
4. Implementar autenticação real.
5. Adicionar autorização aos endpoints.
6. Persistir a sessão de forma segura.
7. Externalizar configurações através de environment variables.
8. Adicionar validação de schemas HTTP.
9. Adicionar observabilidade.
10. Adicionar métricas.
11. Adicionar tracing.
12. Adicionar rate limiting.
13. Implementar endpoint de consulta individual do pedido.
14. Implementar estados de pedido mais completos.
15. Adicionar pipeline CI/CD.

---

# Scripts

## Backend

Desenvolvimento:

    npm run dev

Build:

    npm run build

Testes:

    npm test

Testes em modo watch:

    npm run test:watch

Produção:

    npm start

## Frontend

Desenvolvimento:

    npm start

Build:

    npm run build

Testes:

    npm test

---

# Objetivo do projeto

O objetivo do projeto não foi construir um e-commerce completo.

A intenção foi demonstrar como eu estruturaria um fluxo de checkout pequeno, mas considerando problemas que aparecem quando uma operação simples começa a ter requisitos de consistência.

Os principais pontos demonstrados são:

- separação entre HTTP e regra de negócio;
- Dependency Inversion através de interfaces;
- persistência relacional;
- SQL;
- transações;
- controle de estoque;
- idempotência;
- tratamento de erros;
- testes automatizados;
- React;
- TypeScript;
- Docker;
- comunicação entre frontend e backend.

O projeto também deixa explícitas algumas limitações e possíveis evoluções, principalmente em relação a checkout multi-item, concorrência, autenticação e observabilidade.
