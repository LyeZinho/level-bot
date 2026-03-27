# Exemplos de Uso - Sistema de Economia

## 📱 Exemplos Práticos para Usuários

### Verificar Saldo
```
/coins
!balance
```
**Resultado:** Mostra quantos PityCoins você tem

### Recompensa Diária
```
/daily
!daily
```
**Resultado:** Ganha 100 PityCoins (uma vez por dia)

### Ver a Loja
```
/shop
!loja
```
**Resultado:** Lista todos os itens disponíveis para compra

### Comprar Item
```
/buy Poção de XP
/buy "Kit Iniciante" 2
!buy Caixa Misteriosa
```
**Resultado:** Compra o item se você tiver coins suficientes

### Ver Inventário
```
/inventory
/inventory @Usuario
!inv
```
**Resultado:** Mostra seus itens

### Usar Item
```
/use Poção de XP
!use "Kit Iniciante"
```
**Resultado:** Usa o item e remove do inventário

### Transferir Coins
```
/transfer @Usuario 50
```
**Resultado:** Transfere 50 coins para o usuário mencionado

## 🎮 Cenários Comuns

### Cenário 1: Novo Usuário
1. Usuário envia mensagens no servidor
2. Ganha XP automaticamente
3. A cada 100 XP, ganha 1 PityCoin
4. Usa `/daily` para ganhar 100 coins extras
5. Compra um "Kit Iniciante" por 100 coins
6. Usa o kit e ganha mais XP

### Cenário 2: Compra de Item Raro
1. Usuário verifica `/shop` e vê "Badge Raro" (1000 coins)
2. Usa `/coins` para ver saldo atual: 750 coins
3. Precisa de mais 250 coins
4. Continua ganhando XP e usando `/daily`
5. Após alguns dias, compra o badge: `/buy Badge Raro`
6. Badge aparece no `/inventory`

### Cenário 3: Ajudar Amigo
1. Amigo novo no servidor precisa de coins
2. Você transfere: `/transfer @Amigo 200`
3. Amigo agora pode comprar seus primeiros itens
4. Amigo usa coins para comprar "Multiplicador 2x"
5. Ganha XP mais rápido com o boost

## 🔧 Exemplos para Administradores

### Adicionar Item Personalizado

#### Método 1: Via Código
```javascript
import { createItem } from './src/database.js';

// Item simples
await createItem(
  'Poção Mágica',
  'Restaura 1000 XP',
  500,
  '🧙',
  'consumable'
);

// Item especial
await createItem(
  'VIP Mensal',
  'Acesso VIP por 30 dias',
  2000,
  '👑',
  'role'
);
```

#### Método 2: Via SQL
```sql
INSERT INTO items (name, description, price, emoji, type) 
VALUES 
  ('Super Boost', 'Triple XP por 2 horas', 1500, '🚀', 'boost'),
  ('Pet Raro', 'Um pet único para seu perfil', 3000, '🐉', 'cosmetic');
```

### Verificar Economia do Servidor

```sql
-- Ver top 10 usuários mais ricos
SELECT username, coins, xp, level 
FROM users 
WHERE guild_id = 'SEU_GUILD_ID' 
ORDER BY coins DESC 
LIMIT 10;

-- Ver itens mais vendidos
SELECT i.name, COUNT(*) as vendas 
FROM user_inventory ui 
JOIN items i ON ui.item_id = i.item_id 
GROUP BY i.name 
ORDER BY vendas DESC;

-- Ver total de coins na economia
SELECT SUM(coins) as total_coins 
FROM users 
WHERE guild_id = 'SEU_GUILD_ID';
```

### Dar Coins Manualmente (Admin)

```sql
-- Dar 1000 coins bônus para um usuário
UPDATE users 
SET coins = coins + 1000 
WHERE user_id = 'USER_ID' AND guild_id = 'GUILD_ID';

-- Dar coins para todos os usuários (evento especial)
UPDATE users 
SET coins = coins + 500 
WHERE guild_id = 'GUILD_ID';
```

### Criar Evento Especial

```javascript
// Exemplo: Dobrar ganho de coins por 24h
// Em src/database.js, temporariamente modifique:

export async function addMessageXP(userId, username, guildId, xpGain) {
  // ... código existente ...
  
  const oldCoinsFromXp = Math.floor(user.xp / 100);
  const newCoinsFromXp = Math.floor(newXP / 100);
  
  // EVENTO: Dobrar coins
  let coinsGained = (newCoinsFromXp - oldCoinsFromXp) * 2; // x2 coins
  
  // ... resto do código ...
}
```

## 💡 Dicas e Truques

### Para Usuários

1. **Maximize seus ganhos:**
   - Use `/daily` todo dia
   - Seja ativo no servidor (mensagens + voz)
   - Participe de eventos especiais

2. **Economize para itens raros:**
   - Verifique preços com `/shop`
   - Planeje suas compras
   - Não gaste tudo de uma vez

3. **Ajude a comunidade:**
   - Transfira coins para novatos
   - Compartilhe dicas sobre itens
   - Participe de trocas

### Para Administradores

1. **Balanceamento:**
   - Monitore a inflação de coins
   - Ajuste preços dos itens conforme necessário
   - Crie eventos para drenar ou injetar coins

2. **Engajamento:**
   - Adicione itens exclusivos sazonais
   - Crie competições com prêmios em coins
   - Ofereça roles especiais na loja

3. **Moderação:**
   - Monitore transferências suspeitas
   - Revise compras frequentes
   - Ajuste limites se necessário

## 🎯 Casos de Uso Avançados

### Sistema de Recompensas por Eventos

```javascript
// Após um evento, dar coins aos participantes
import { addCoins } from './src/database.js';

const participantes = ['user1', 'user2', 'user3'];
const premio = 500;

for (const userId of participantes) {
  await addCoins(userId, 'GUILD_ID', premio);
}
```

### Loja Sazonal

```javascript
// Adicionar itens de Natal
await createItem('Presente de Natal', 'Item especial de dezembro', 300, '🎄', 'seasonal');
await createItem('Chapéu de Papai Noel', 'Cosmético festivo', 500, '🎅', 'cosmetic');

// Remover após a temporada
// DELETE FROM items WHERE type = 'seasonal';
```

### Sistema de Sorteio

```javascript
// Criar caixa misteriosa que dá item aleatório
const caixaMisteriosa = await getItemByName('Caixa Misteriosa');
const result = await useItem(userId, guildId, caixaMisteriosa.item_id);

if (result.success) {
  // Determinar prêmio aleatório
  const premios = [
    { coins: 50, chance: 0.5 },
    { coins: 200, chance: 0.3 },
    { coins: 1000, chance: 0.15 },
    { coins: 5000, chance: 0.05 }
  ];
  
  // Sortear e dar prêmio
  // ... lógica de sorteio ...
}
```

## 📊 Métricas e Analytics

### Queries Úteis

```sql
-- Economia total do servidor
SELECT 
  COUNT(*) as total_usuarios,
  SUM(coins) as total_coins,
  AVG(coins) as media_coins,
  MAX(coins) as maior_saldo
FROM users 
WHERE guild_id = 'GUILD_ID';

-- Atividade da loja
SELECT 
  DATE(to_timestamp(acquired_at)) as data,
  COUNT(*) as compras,
  SUM(i.price) as receita
FROM user_inventory ui
JOIN items i ON ui.item_id = i.item_id
WHERE ui.guild_id = 'GUILD_ID'
GROUP BY data
ORDER BY data DESC;

-- Usuários que não usaram daily recentemente
SELECT user_id, username, 
  (EXTRACT(EPOCH FROM NOW()) - last_daily_claim) / 86400 as dias_sem_daily
FROM users 
WHERE guild_id = 'GUILD_ID' 
  AND last_daily_claim > 0
  AND (EXTRACT(EPOCH FROM NOW()) - last_daily_claim) > 172800  -- 2 dias
ORDER BY dias_sem_daily DESC;
```
