# Sistema de Economia - Level Bot

## 🎯 Resumo Rápido

### Como Ganhar PityCoins
- ✅ **1 PityCoin a cada 100 XP** ganho (automático)
- ✅ **100 PityCoins/dia** com `/daily` ou `!daily`
- ✅ Receba transferências de outros usuários

### Comandos Disponíveis

#### 💰 Economia
| Comando | Aliases | Descrição |
|---------|---------|-----------|
| `/coins [@usuario]` | `!balance`, `!bal` | Ver saldo de PityCoins |
| `/daily` | `!diaria` | Recompensa diária (100 coins) |
| `/transfer <@user> <qtd>` | - | Transferir coins |

#### 🏪 Loja & Inventário
| Comando | Aliases | Descrição |
|---------|---------|-----------|
| `/shop` | `!loja`, `!store` | Ver itens à venda |
| `/buy <item> [qtd]` | - | Comprar item |
| `/inventory [@user]` | `!inv`, `!bag` | Ver inventário |
| `/use <item>` | - | Usar item |

## 🛠️ Setup Inicial

### 1. Migração do Banco de Dados
```bash
node migrate-economy.js
```

### 2. Popular a Loja (Opcional)
```bash
node seed-shop.js
```

### 3. Registrar Comandos
```bash
npm run deploy
```

### 4. Iniciar o Bot
```bash
npm start
# ou para desenvolvimento:
npm run dev
```

## 📊 Itens de Exemplo na Loja

| Item | Preço | Tipo | Descrição |
|------|-------|------|-----------|
| 🧪 Poção de XP | 250 | Consumível | +500 XP instantâneo |
| ⚡ Multiplicador 2x | 500 | Boost | Dobra XP por 1 hora |
| 📦 Caixa Misteriosa | 150 | Mystery | Item aleatório |
| 🏅 Badge Raro | 1000 | Cosmético | Badge especial |
| 🎟️ Ticket VIP | 750 | Role | Acesso VIP 7 dias |
| 🎁 Kit Iniciante | 100 | Bundle | 100 XP + 50 coins |

## 🔧 Administração

### Adicionar Novo Item
```javascript
import { createItem } from './src/database.js';

await createItem(
  'Nome do Item',
  'Descrição',
  500, // preço
  '✨', // emoji
  'consumable' // tipo
);
```

### Tipos de Itens
- `consumable` - Itens de uso único
- `boost` - Buffs temporários
- `cosmetic` - Itens decorativos
- `role` - Cargos/benefícios
- `bundle` - Pacotes
- `mystery` - Caixas misteriosas

## 🎮 Fluxo do Usuário

1. **Ganhar XP** através de mensagens e tempo de voz
2. **Acumular PityCoins** automaticamente (1 coin/100 XP)
3. **Coletar recompensa diária** (`/daily`)
4. **Comprar itens** na loja (`/shop` → `/buy`)
5. **Usar itens** do inventário (`/inventory` → `/use`)

## 🧪 Teste Rápido

```bash
# Testar sistema de economia
node test-economy.js

# Verificar comandos registrados
npm run deploy
```

## 📝 Notas Importantes

- ⚠️ Execute `migrate-economy.js` se estiver atualizando de uma versão anterior
- 💡 O emoji `:pitycoin:` precisa ser adicionado ao servidor Discord
- 🔄 Coins são ganhos automaticamente ao ganhar XP
- ⏰ Daily reset é após 24h da última reivindicação
- 💾 Todos os dados são salvos no PostgreSQL

## 🐛 Troubleshooting

### Erro: "column coins does not exist"
```bash
node migrate-economy.js
```

### Loja vazia
```bash
node seed-shop.js
```

### Comandos não aparecem
```bash
npm run deploy
```
Aguarde até 1 hora para comandos globais ou use GUILD_ID no .env para teste instantâneo.
