# 🎮 Sistema de Itens - Guia Completo

## 📦 Itens Disponíveis

### 💎 Boost VIPs (Duração: 30 dias - administradores apenas)

| Item | Preço | Multiplicador | Efeito |
|------|-------|---------------|--------|
| ⚡ Boost VIP Gold | 0 (admin) | 2x | Multiplicador 2x XP e Coins por 30 dias (dado por admins) |
| 💎 Boost VIP Platinum | 0 (admin) | 3x | Multiplicador 3x XP e Coins por 30 dias (dado por admins) |
| 💎 Boost VIP Ruby | 0 (admin) | 5x | Multiplicador 5x XP e Coins por 30 dias (dado por admins) |

**Como funcionam:**
- São itens especiais que só podem ser dados pelos administradores (não vendidos na loja).
- O usuário pode ativar quando quiser com `/use Boost VIP Gold` ou `!use Boost VIP Gold`
- Ao ativar, começa a contar 30 dias de duração

### ⚡ XP Boosts (Duração: 1 hora)

| Item | Preço | Multiplicador | Efeito |
|------|-------|---------------|--------|
| ⚡ XP Boost 2x | 50 coins | 2x | Dobra todo XP ganho |
| ⚡⚡ XP Boost 3x | 150 coins | 3x | Triplica todo XP ganho |
| ⚡⚡⚡ XP Boost 5x | 250 coins | 5x | Quintuplica todo XP ganho |

**Como funcionam:**
- Ao usar um boost, ele fica ativo por **1 hora (60 minutos)**
- Durante esse tempo, **todo XP ganho** (mensagens e voz) é multiplicado
- Apenas **1 boost pode estar ativo por vez**
- Se usar outro boost, ele substitui o anterior

### 📦 Pacotes de Experiência (Instantâneos)

| Item | Preço | XP Ganho | Coins Bônus |
|------|-------|----------|-------------|
| 📦 Pacote Tier 1 | 50 coins | +150 XP | +10 coins |
| 📦✨ Pacote Tier 2 | 150 coins | +250 XP | +20 coins |
| 📦💎 Pacote Tier 3 | 250 coins | +350 XP | +40 coins |

**Como funcionam:**
- Uso instantâneo: XP e coins são adicionados imediatamente
- Ótimo para subir de nível rapidamente
- O bônus de coins ajuda a recuperar parte do investimento

## 🎯 Como Usar

### 1. Ver a Loja
```
/shop
```
ou
```
!loja
```

### 2. Comprar um Item
```
/buy XP Boost 2x
/buy "Pacote de Experiência Tier 1"
```

### 3. Verificar Inventário
```
/inventory
```
ou
```
!inv
```

### 4. Usar um Item
```
/use XP Boost 2x
/use "Pacote de Experiência Tier 1"
```

### 5. Verificar Boost Ativo
```
/boost
```
Mostra se você tem um boost ativo e quanto tempo resta.

## 💡 Estratégias Recomendadas

### 🎯 Para Maximizar XP

1. **Compre um boost antes de participar muito:**
   - Use `/buy XP Boost 2x` (50 coins)
   - Ative com `/use XP Boost 2x`
   - Ganhe XP por 1 hora com multiplicador!

2. **Combine boost + atividade:**
   - Ative o boost
   - Participe ativamente (envie mensagens, entre em calls)
   - XP base de 15-25 por mensagem vira 30-50 (com 2x)

3. **Use pacotes para subir de nível rápido:**
   - Precisa subir de nível urgente?
   - Compre um Pacote Tier 3 (350 XP instantâneo)

### 💰 Para Economizar Coins

1. **Reivindique daily todo dia:**
   - `/daily` = 100 coins grátis a cada 24h

2. **Compre no momento certo:**
   - XP Boost 2x (50 coins) tem melhor custo-benefício
   - Use quando puder aproveitar a hora completa

3. **Pacotes maiores são mais eficientes:**
   - Tier 3: 1,4 XP por coin (250 coins → 350 XP)
   - Tier 1: 3,0 XP por coin (50 coins → 150 XP)
   - **Mas** Tier 1 retorna 10 coins, então custo real é 40 coins

## 📊 Análise de Custo-Benefício

### XP Boosts
Considerando que você ganha ~20 XP por mensagem em média:

- **Boost 2x (50 coins):**
  - Custo: 50 coins
  - Se enviar 30 mensagens/hora: 600 XP → 1200 XP
  - **Ganho extra: 600 XP** por 50 coins
  - **ROI: 12 XP por coin**

- **Boost 5x (250 coins):**
  - Custo: 250 coins
  - Se enviar 30 mensagens/hora: 600 XP → 3000 XP
  - **Ganho extra: 2400 XP** por 250 coins
  - **ROI: 9.6 XP por coin**

**Conclusão:** Boost 2x tem melhor ROI para uso casual!

### Pacotes de Experiência

- **Tier 1:** 150 XP + 10 coins = 40 coins líquido → **3.75 XP/coin**
- **Tier 2:** 250 XP + 20 coins = 130 coins líquido → **1.92 XP/coin**
- **Tier 3:** 350 XP + 40 coins = 210 coins líquido → **1.67 XP/coin**

**Conclusão:** Tier 1 é mais eficiente se considerar o retorno de coins!

## 🔧 Comandos Técnicos

### Para Administradores

**Popular loja com novos itens:**
```bash
npm run migrate:boosts  # Atualiza banco de dados
npm run seed           # Adiciona itens à loja
npm run deploy         # Registra comando /boost
```

**Adicionar item customizado:**
```javascript
import { createItem } from './src/database.js';

await createItem(
  'Nome do Item',
  'Descrição',
  100,  // preço
  '🎁', // emoji
  'boost' // tipo
);
```

## 🐛 Solução de Problemas

**Boost não está aplicando:**
- Verifique com `/boost` se está ativo
- Boosts duram 1 hora, podem ter expirado
- Use `/use` novamente para reativar

**Item não aparece no inventário:**
- Confirme a compra com `/buy`
- Verifique se tinha coins suficientes
- Use `/inventory` para ver todos os itens

**XP não está aumentando:**
- Cooldown de 60s entre mensagens para XP
- Comandos não dão XP
- Voice requer mínimo de 60 segundos

## 📈 Atualizações Futuras

Planejado para próximas versões:
- 🎲 Boosts de diferentes durações (30min, 2h, 4h)
- 🎁 Caixas misteriosas com itens aleatórios
- 🏆 Itens exclusivos de eventos
- 💎 Sistema de raridades
- 🔄 Troca de itens entre usuários
