# 🎄 Sistema de Eventos Sazonais - Implementação Completa

## ✅ O que foi criado

### 1. **Arquivo de Configuração JSON** ✅
**Arquivo:** `src/data/seasonal-events.json`

Sistema de configuração baseado em JSON para facilitar a criação e edição de eventos sem mexer no código!

**Recursos:**
- ✅ Definição de período (start_date, end_date)
- ✅ Controle de chance de disparo (trigger_chance)
- ✅ Mensagem customizável
- ✅ Emoji de reação configurável
- ✅ Timeout de reação
- ✅ Sistema de recompensas (badges, items, coins)
- ✅ Cooldown por usuário
- ✅ Ativação/desativação fácil

### 2. **Módulo de Gerenciamento** ✅
**Arquivo:** `src/utils/seasonalEvents.js`

Módulo completo para gerenciar eventos sazonais:

**Funções principais:**
- `loadEvents()` - Carregar eventos do JSON
- `getActiveEvents()` - Filtrar eventos ativos baseado em data
- `shouldTriggerEvent()` - Verificar se evento deve disparar (baseado em chance)
- `isUserOnCooldown()` - Verificar cooldown do usuário
- `setUserCooldown()` - Registrar cooldown
- `processEventReaction()` - Processar recompensas quando usuário reage
- `triggerSeasonalEvent()` - Disparar evento completo (mensagem + reação + aguardar)

**Recursos:**
- ✅ Sistema de cooldown em memória
- ✅ Integração com sistema de badges
- ✅ Integração com sistema de coins
- ✅ Suporte a items (preparado para expansão)
- ✅ Timeout automático
- ✅ Mensagens de feedback

### 3. **Integração nos Handlers** ✅

#### **Comandos Slash** (`src/events/interactionCreate.js`)
- ✅ Dispara evento após execução bem-sucedida de qualquer comando slash
- ✅ Cria objeto pseudo-message para compatibilidade
- ✅ Usa `followUp` para não interferir na resposta original

#### **Comandos Prefix** (`src/events/messageCreate.js`)
- ✅ Dispara evento após execução bem-sucedida de qualquer comando prefix
- ✅ Usa reply normal da mensagem
- ✅ Não interfere com sistema de XP

### 4. **Comando de Debug** ✅
**Arquivo:** `src/prefixCommands/event-trigger.js`

Comando restrito para forçar eventos (100% de chance) para testes:

**Uso:**
```
!event-trigger              # Dispara primeiro evento ativo
!event-trigger natal_2025   # Dispara evento específico
```

**Recursos:**
- ✅ Restrito ao usuário ID: 524622388629995541
- ✅ Lista eventos disponíveis se ID inválido
- ✅ Força disparo com 100% de chance
- ✅ Ignora cooldown
- ✅ Perfeito para testar novos eventos

## 🎮 Evento Configurado: Natal 2025

### Configuração Atual

```json
{
  "event_id": "natal_2025",
  "name": "Natal 2025",
  "description": "Evento especial de Natal - Reaja para ganhar a badge exclusiva!",
  "start_date": "2025-12-01T00:00:00.000Z",
  "end_date": "2025-12-31T23:59:59.999Z",
  "trigger_chance": 0.08,
  "message": "🎄✨ **Uma estrela brilhante apareceu!** ✨🎄\nReaja com 🎄 nos próximos 30 segundos para ganhar a badge de Natal 2025!",
  "reaction_emoji": "🎄",
  "reaction_timeout": 30000,
  "rewards": {
    "badge_name": "Natal 2025",
    "items": [],
    "coins": 100
  },
  "active": true,
  "cooldown_per_user": 3600000
}
```

### Funcionamento

1. **Período:** 01 a 31 de dezembro de 2025
2. **Chance:** 8% de disparar após qualquer comando
3. **Recompensas:**
   - 🎖️ Badge "Natal 2025"
   - 💰 100 PityCoins
4. **Cooldown:** 1 hora por usuário (não pode ganhar duas vezes seguidas)
5. **Timeout:** 30 segundos para reagir

### Fluxo

```
Usuário usa !level ou /level
         ↓
Bot responde com level do usuário
         ↓
Sistema verifica eventos ativos (Natal 2025 ativo? ✅)
         ↓
Rola 8% de chance (Math.random() < 0.08)
         ↓
🎄 Evento dispara! Bot envia mensagem especial
         ↓
Bot adiciona reação 🎄
         ↓
Usuário tem 30 segundos para reagir com 🎄
         ↓
[SUCESSO] Usuário reage → Ganha badge + 100 coins
[TIMEOUT] Não reage → "⏰ Tempo esgotado!"
```

## 📊 Como Adicionar Novos Eventos

### Passo a Passo

1. **Editar JSON** (`src/data/seasonal-events.json`)
   
   Adicione novo objeto no array `events`:
   ```json
   {
     "event_id": "pascoa_2026",
     "name": "Páscoa 2026",
     "description": "Caça aos ovos!",
     "start_date": "2026-04-01T00:00:00.000Z",
     "end_date": "2026-04-30T23:59:59.999Z",
     "trigger_chance": 0.10,
     "message": "🐰🥚 **Um coelho apareceu!** Reaja com 🥚!",
     "reaction_emoji": "🥚",
     "reaction_timeout": 20000,
     "rewards": {
       "badge_name": "Páscoa 2026",
       "items": [],
       "coins": 200
     },
     "active": true,
     "cooldown_per_user": 3600000
   }
   ```

2. **Criar Badge** (se necessário)
   
   Editar `seed-badges.js` ou inserir manualmente:
   ```sql
   INSERT INTO badges (name, description, image_path, badge_type, is_active)
   VALUES ('Páscoa 2026', 'Badge de Páscoa 2026', 'badge_pascoa_2026.png', 'event', true);
   ```

3. **Adicionar Imagem**
   
   Colocar em: `src/media/badges/badge_pascoa_2026.png`

4. **Testar**
   ```
   !event-trigger pascoa_2026
   ```

## 🔧 Configurações Recomendadas

### Chances de Disparo

| Tipo | Chance | Descrição |
|------|--------|-----------|
| Comum | 10-15% | Eventos frequentes |
| Normal | 5-10% | Eventos mensais |
| Raro | 2-5% | Eventos especiais |
| Épico | 1-2% | Eventos únicos |

### Timeouts

| Tempo | Uso |
|-------|-----|
| 15s | Difícil |
| 30s | Normal (recomendado) |
| 60s | Fácil |

### Cooldowns

| Tempo | Uso |
|-------|-----|
| 30min | Muito frequente |
| 1h | Normal (recomendado) |
| 6h | Raro |
| 24h | Uma vez por dia |

## 🚀 Como Testar

### 1. Testar Evento Específico (Debug)
```
!event-trigger natal_2025
```
- ✅ Dispara com 100% de chance
- ✅ Ignora cooldown
- ✅ Restrito ao dev (ID: 524622388629995541)

### 2. Testar Naturalmente
```
!level
/profile
!coins
... (qualquer comando)
```
- ❓ 8% de chance de disparar
- ✅ Respeita cooldown
- ✅ Qualquer usuário

### 3. Verificar Eventos Ativos

Adicione temporariamente em qualquer comando prefix:
```javascript
import { getActiveEvents } from '../utils/seasonalEvents.js';
const active = getActiveEvents();
console.log('Eventos ativos:', active.length);
```

## 📝 Documentação Completa

Veja `SEASONAL_EVENTS.md` para guia completo incluindo:
- Explicação detalhada de cada propriedade
- Exemplos de eventos (Halloween, Ano Novo, etc.)
- Troubleshooting
- Checklist de novo evento
- Melhores práticas

## ✅ Checklist de Implementação

- ✅ JSON de configuração criado
- ✅ Módulo de eventos implementado
- ✅ Integração em comandos slash
- ✅ Integração em comandos prefix
- ✅ Comando de debug criado
- ✅ Sistema de cooldown funcionando
- ✅ Sistema de recompensas integrado
- ✅ Evento Natal 2025 configurado
- ✅ Documentação completa
- ✅ Pronto para expansões futuras

## 🎯 Próximos Passos

1. **Iniciar o bot:**
   ```bash
   npm start
   ```

2. **Testar comando de debug:**
   ```
   !event-trigger natal_2025
   ```

3. **Reagir com 🎄 em 30 segundos**

4. **Verificar recompensas:**
   ```
   !mybadges
   !coins
   ```

5. **Adicionar mais eventos conforme necessário!**

---

**🎄 Sistema de Eventos Sazonais totalmente implementado e pronto para uso! 🎉**
