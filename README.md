# Sistema de Controle de Estoque do Setor

Projeto pronto para controlar o estoque mensal do seu setor com:

- importação automática de Excel
- estoque base por mês
- lançamentos diários de saída e entrada
- dashboard moderno
- saldo atual calculado automaticamente

## Arquitetura

- **Frontend:** React + Vite + Tailwind via CDN + Recharts
- **Backend:** Node.js + Express
- **Banco:** Prisma + SQLite

> Escolhi SQLite nesta versão para ficar realmente pronto para rodar no seu PC sem depender de instalar PostgreSQL. Se você quiser, depois eu adapto para PostgreSQL sem mudar o fluxo do sistema.

## Fluxo real do sistema

1. Todo mês você importa a planilha oficial.
2. O sistema grava esse arquivo como estoque base do mês.
3. Durante o mês você registra apenas as movimentações.
4. O sistema calcula o saldo atual sozinho.

## Estrutura

```txt
estoque-setor-pronto/
  backend/
  frontend/
  README.md
```

## Como rodar

### 1) Backend

```bash
cd backend
copy .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Backend ficará em:

```bash
http://localhost:3333
```

### 2) Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend ficará em:

```bash
http://localhost:5173
```

## Importação do Excel

A planilha esperada é no formato parecido com a que você enviou, contendo cabeçalhos como:

- Item
- Material
- U.M.
- Finalidade de Compra
- Diretoria
- Saldo Reserva
- Disponível
- Total
- Validade

## Endpoints principais

- `GET /api/dashboard?month=4&year=2024`
- `GET /api/stock/current?month=4&year=2024`
- `GET /api/products`
- `POST /api/imports/monthly`
- `GET /api/movements?month=4&year=2024`
- `POST /api/movements`

## Próximas melhorias

- autenticação real com login
- exportar relatório PDF/Excel
- filtro por diretoria
- limite de saída conforme saldo
- alerta visual por estoque mínimo configurável
- deploy em servidor
