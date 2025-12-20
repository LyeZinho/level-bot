# Level Bot

Bot Discord com sistema de níveis, ranking e perfis gerados em SVG.

## Funcionalidades

- ⏱️ Rastreamento de tempo em canais de voz
- 💬 Contagem de mensagens
- 🎯 Sistema de pontos baseado em atividade
- 📊 Comandos: `/level`, `/ranking`, `/profile`
- 🖼️ Dashboard, ranking e perfis (gerados em SVG e convertidos para PNG antes do envio)
- 🔁 Recalculation background worker: the bot periodically recalculates levels from XP to ensure DB consistency
- 💰 **Sistema de Economia com PityCoins** - Ganhe moedas enquanto ganha XP!
- 🏪 **Loja e Inventário** - Compre e use itens especiais
- 💾 Database PostgreSQL

## Instalação

### Setup Inicial (Novo Bot)

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure o arquivo `.env` com base no `.env.example`
4. Certifique-se de ter um servidor PostgreSQL rodando (ou use Docker - veja abaixo)
5. Registre os comandos: `npm run deploy`
6. **(Opcional)** Popule a loja com itens de exemplo: `npm run seed`
7. Inicie o bot: `npm start`

### Atualização (Bot Existente)

Se você já tem o bot rodando e quer adicionar o sistema de economia:

1. Atualize o código para a versão mais recente
2. **Execute a migração completa do banco de dados:** `npm run migrate:all`
3. Popule a loja: `npm run seed`
4. Registre os novos comandos: `npm run deploy`
5. Reinicie o bot: `npm start`

> ⚠️ **Importante:** Execute `npm run migrate:all` antes de iniciar o bot para adicionar todas as tabelas e colunas necessárias ao banco de dados.

## Comandos

O bot suporta tanto **Slash Commands** (`/`) quanto **Comandos por Prefixo** (`!`).

### Slash Commands (/)
- `/level [@usuario]` - Mostra o nível e XP (imagem PNG)
- `/ranking` - Top 10 usuários do servidor (imagem PNG)
- `/profile [@usuario]` - Perfil detalhado com estatísticas (imagem PNG)

### Prefix Commands (!)
- `!level [@usuario]` ou `!lvl` - Mostra o nível e XP (imagem PNG)
- `!ranking` ou `!rank` ou `!top` - Top 10 usuários do servidor (imagem PNG)
- `!profile [@usuario]` ou `!perfil` ou `!p` - Perfil detalhado com estatísticas (imagem PNG)
- `!help [comando]` ou `!ajuda` - Lista de comandos e ajuda

### Comandos de Economia 💰
#### Slash Commands (/)
- `/coins [@usuario]` - Mostra o saldo de PityCoins
- `/daily` - Reivindica recompensa diária (100 coins)
- `/transfer <@usuario> <quantidade>` - Transfere coins para outro usuário
- `/shop` - Mostra a loja de itens
- `/buy <item> [quantidade]` - Compra um item da loja
- `/inventory [@usuario]` - Mostra o inventário de itens
- `/use <item>` - Usa um item do inventário

#### Prefix Commands (!)
- `!coins [@usuario]` ou `!balance` - Mostra o saldo de PityCoins
- `!daily` - Reivindica recompensa diária (100 coins)
- `!shop` ou `!loja` - Mostra a loja de itens
- `!inventory [@usuario]` ou `!inv` - Mostra o inventário de itens

## Sistema de Economia

### PityCoins (:pitycoin:)
- **Como ganhar:**
  - Ganhe **1 PityCoin a cada 100 XP** adquirido
  - Reivindique **100 coins por dia** com `/daily`
  - Receba coins de outros usuários via `/transfer`
  
- **Como usar:**
  - Compre itens na loja (`/shop`)
  - Transfira para outros membros
  - Acumule para itens raros e especiais

### Sistema de Loja
A loja oferece diversos tipos de itens:
- 🧪 **Consumíveis** - Poções de XP e boosts temporários
- 🏅 **Cosméticos** - Badges e itens decorativos para seu perfil
- 📦 **Caixas Misteriosas** - Itens aleatórios
- 🎟️ **Roles e Benefícios** - Acesso a canais VIP e vantagens especiais

Use `/shop` para ver todos os itens disponíveis!

## Stack

- Node.js (v20+)
- discord.js v14
- PostgreSQL (pg)
- Sharp (para processamento de imagens SVG)

## Scripts Disponíveis

```bash
npm start              # Inicia o bot em produção
npm run dev            # Inicia em modo desenvolvimento (auto-reload)
npm run deploy         # Registra comandos slash no Discord
npm run migrate:all    # Executa TODAS as migrações do banco de dados (recomendado)
npm run migrate        # Executa apenas migração da economia
npm run seed           # Popula a loja com itens de exemplo
npm run test:economy   # Testa o sistema de economia
```

## Docker (recomendado)

Você pode rodar o bot com PostgreSQL usando Docker Compose. Esta é a forma mais simples e recomendada.

### Como usar
1. Configure seu `.env` baseado em `.env.example` com as credenciais do Discord e do PostgreSQL.

2. Build e subir com Docker Compose:

```bash
docker compose up -d
```

3. Verificar logs do container:

```bash
docker compose logs -f level-bot
```

4. Parar e remover os containers:

```bash
docker compose down
```

5. Para remover também os dados do banco (cuidado!):

```bash
docker compose down -v
```

### O que está incluído

- **PostgreSQL 16 Alpine** - Banco de dados exposto na porta **11900** do host
- **Level Bot** - Bot Discord conectado ao PostgreSQL
- **Volume persistente** - Dados do PostgreSQL são preservados em um volume Docker

### Variáveis de ambiente

O arquivo `.env` deve conter:

```env
# Discord
DISCORD_TOKEN=seu_token_aqui
CLIENT_ID=seu_client_id_aqui
GUILD_ID=seu_guild_id_aqui
PREFIX=!

# PostgreSQL (para desenvolvimento local sem Docker)
DB_HOST=localhost
DB_PORT=11900
DB_NAME=levelbot
DB_USER=levelbot
DB_PASSWORD=levelbot123
LEVEL_RECALC_INTERVAL_MS=300000 # Interval in milliseconds for levels recalculation (default 300000 = 5 minutes)
MIN_VOICE_SECONDS=60 # Minimum voice seconds to count towards time (default 60)
```

> Nota: Quando rodando via Docker Compose, o bot usa automaticamente `DB_HOST=postgres` e `DB_PORT=5432` internamente (comunicação entre containers). A porta 11900 é apenas para acesso externo ao PostgreSQL.

## Administração da Loja

Para adicionar ou modificar itens na loja, você pode:

1. **Usar o script de seed** (recomendado para setup inicial):
```bash
node seed-shop.js
```

2. **Adicionar itens manualmente via código**:
```javascript
import { createItem } from './src/database.js';

await createItem(
  'Nome do Item',
  'Descrição do item',
  preço_em_coins,
  'emoji',
  'tipo'
);
```

3. **Diretamente no banco de dados** (PostgreSQL):
```sql
INSERT INTO items (name, description, price, emoji, type) 
VALUES ('Item Especial', 'Descrição', 500, '✨', 'special');
```

