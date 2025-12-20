# 🎄 Sistema de Eventos Sazonais - Guia Completo

## 📋 Visão Geral

Sistema de eventos sazonais que adiciona missões secretas aleatórias ao bot. Os eventos aparecem como reações em respostas de comandos, e usuários devem reagir rapidamente para ganhar recompensas exclusivas!

## ⚙️ Como Funciona

### Fluxo do Evento

1. **Usuário executa comando** (prefix ou slash)
2. **Bot processa comando normalmente**
3. **Verificação de evento** → Há X% de chance de disparar evento ativo
4. **Evento dispara** → Bot envia mensagem especial com reação
5. **Usuário reage** → Se reagir dentro do tempo limite, ganha recompensas
6. **Recompensas entregues** → Badges, items, coins etc.
7. **Cooldown aplicado** → Evita spam do mesmo evento

## 📁 Estrutura de Arquivos

### `src/data/seasonal-events.json`
Arquivo de configuração dos eventos. Fácil de editar sem tocar no código!

```json
{
  "events": [
    {
      "event_id": "natal_2025",
      "name": "Natal 2025",
      "description": "Evento especial de Natal - Reaja para ganhar a badge exclusiva!",
      "start_date": "2025-12-01T00:00:00.000Z",
      "end_date": "2025-12-31T23:59:59.999Z",
      "trigger_chance": 0.08,
      "message": "🎄✨ **Uma estrela brilhante apareceu!** ✨🎄\\nReaja com 🎄 nos próximos 30 segundos para ganhar a badge de Natal 2025!",
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
  ]
}
```

### Propriedades Explicadas

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `event_id` | String | ID único do evento (usado internamente) |
| `name` | String | Nome amigável do evento |
| `description` | String | Descrição do evento |
| `start_date` | ISO Date | Data/hora de início do evento |
| `end_date` | ISO Date | Data/hora de fim do evento |
| `trigger_chance` | Number | Chance de disparo (0.0 a 1.0) - 0.08 = 8% |
| `message` | String | Mensagem exibida quando evento dispara |
| `reaction_emoji` | String | Emoji que o usuário deve reagir |
| `reaction_timeout` | Number | Tempo em ms para reagir (30000 = 30s) |
| `rewards.badge_name` | String | Nome da badge a dar (opcional) |
| `rewards.items` | Array | Array de nomes de items (opcional) |
| `rewards.coins` | Number | Quantidade de PityCoins (opcional) |
| `active` | Boolean | Se o evento está ativo |
| `cooldown_per_user` | Number | Cooldown por usuário em ms (3600000 = 1 hora) |

## 🎮 Comandos

### Comando de Debug: `!event-trigger`

**Permissão:** Apenas usuário autorizado (ID: 524622388629995541)

**Uso:**
```
!event-trigger              # Dispara o primeiro evento ativo com 100% de chance
!event-trigger natal_2025   # Dispara evento específico com 100% de chance
```

**Descrição:**
- Força o disparo de um evento sazonal para testes
- Ignora chance de disparo (sempre 100%)
- Ignora cooldown do usuário
- Útil para testar novos eventos antes de ativá-los

## 📝 Criando Novos Eventos

### 1. Adicionar no JSON

Edite `src/data/seasonal-events.json` e adicione um novo objeto no array `events`:

```json
{
  "event_id": "pascoa_2026",
  "name": "Páscoa 2026",
  "description": "Caça aos ovos de chocolate virtual!",
  "start_date": "2026-04-01T00:00:00.000Z",
  "end_date": "2026-04-30T23:59:59.999Z",
  "trigger_chance": 0.10,
  "message": "🐰🥚 **Um coelho apareceu!** Reaja com 🥚 para ganhar prêmios!",
  "reaction_emoji": "🥚",
  "reaction_timeout": 20000,
  "rewards": {
    "badge_name": "Páscoa 2026",
    "items": ["Caixa de Chocolate"],
    "coins": 200
  },
  "active": true,
  "cooldown_per_user": 7200000
}
```

### 2. Criar a Badge (se necessário)

Adicione a badge no banco de dados via `seed-badges.js` ou manualmente:

```sql
INSERT INTO badges (name, description, image_path, badge_type, is_active, expires_at)
VALUES (
  'Páscoa 2026',
  'Badge especial do evento de Páscoa 2026',
  'badge_pascoa_2026.png',
  'event',
  true,
  1780358400000  -- Timestamp de expiração
);
```

### 3. Adicionar Imagem da Badge

Coloque a imagem em `src/media/badges/badge_pascoa_2026.png`

### 4. Testar o Evento

```
!event-trigger pascoa_2026
```

## 🔧 Configurações Recomendadas

### Chances de Disparo

| Tipo de Evento | Chance Recomendada | Observação |
|----------------|-------------------|------------|
| Comum | 0.10 - 0.15 (10-15%) | Eventos frequentes |
| Raro | 0.05 - 0.08 (5-8%) | Eventos mensais |
| Épico | 0.02 - 0.03 (2-3%) | Eventos especiais |
| Lendário | 0.01 (1%) | Eventos únicos/raros |

### Timeouts

| Duração | Uso Recomendado |
|---------|-----------------|
| 15s | Eventos muito rápidos/difíceis |
| 30s | Padrão - bom equilíbrio |
| 60s | Eventos fáceis/comuns |

### Cooldowns

| Duração | Uso Recomendado |
|---------|-----------------|
| 30min (1800000ms) | Eventos muito comuns |
| 1h (3600000ms) | Padrão - eventos raros |
| 6h (21600000ms) | Eventos épicos |
| 24h (86400000ms) | Eventos lendários (uma vez por dia) |

## 🛡️ Segurança

- ✅ Cooldown por usuário evita spam
- ✅ Verificação de datas de início/fim
- ✅ Comando de debug restrito a ID específico
- ✅ Eventos inativos não disparam
- ✅ Timeout evita eventos eternos
- ✅ Recompensas validadas antes de entregar

## 🚀 Integração

O sistema está integrado em:

- ✅ **Comandos Slash** (`src/events/interactionCreate.js`)
- ✅ **Comandos Prefix** (`src/events/messageCreate.js`)

Eventos podem disparar após **qualquer** comando do bot!

## 📊 Exemplos de Eventos

### Evento de Halloween
```json
{
  "event_id": "halloween_2026",
  "name": "Halloween 2026",
  "description": "Doces ou travessuras?",
  "start_date": "2026-10-01T00:00:00.000Z",
  "end_date": "2026-10-31T23:59:59.999Z",
  "trigger_chance": 0.12,
  "message": "🎃👻 **Um fantasma apareceu!** Reaja com 🍬 para ganhar doces!",
  "reaction_emoji": "🍬",
  "reaction_timeout": 25000,
  "rewards": {
    "badge_name": "Halloween 2026",
    "items": ["Saco de Doces"],
    "coins": 150
  },
  "active": true,
  "cooldown_per_user": 5400000
}
```

### Evento de Ano Novo
```json
{
  "event_id": "ano_novo_2026",
  "name": "Ano Novo 2026",
  "description": "Fogos de artifício!",
  "start_date": "2025-12-31T00:00:00.000Z",
  "end_date": "2026-01-01T23:59:59.999Z",
  "trigger_chance": 0.20,
  "message": "🎆🎊 **Fogos de artifício!** Reaja com 🎉 para celebrar!",
  "reaction_emoji": "🎉",
  "reaction_timeout": 15000,
  "rewards": {
    "badge_name": "Ano Novo 2026",
    "items": [],
    "coins": 500
  },
  "active": true,
  "cooldown_per_user": 1800000
}
```

## 🐛 Troubleshooting

### Evento não dispara
- Verifique se `active: true`
- Confirme se as datas estão corretas
- Aumente `trigger_chance` temporariamente para testar
- Use `!event-trigger` para forçar disparo

### Badge não é entregue
- Verifique se a badge existe no banco (`SELECT * FROM badges WHERE name = 'Nome da Badge'`)
- Confirme se `badge_name` no JSON corresponde exatamente ao nome no banco
- Veja logs do console para erros

### Cooldown não funciona
- Cooldown é por usuário, não global
- Reiniciar o bot reseta cooldowns (armazenados em memória)
- Para cooldown persistente, seria necessário salvar no banco

## ✅ Checklist de Novo Evento

- [ ] Definir datas de início/fim
- [ ] Escolher chance de disparo apropriada
- [ ] Criar mensagem criativa
- [ ] Selecionar emoji único
- [ ] Configurar timeout razoável
- [ ] Criar/verificar badge no banco
- [ ] Adicionar imagem da badge
- [ ] Definir recompensas
- [ ] Configurar cooldown
- [ ] Adicionar no JSON
- [ ] Testar com `!event-trigger`
- [ ] Ativar evento (`active: true`)

## 📅 Eventos Ativos

### Natal 2025
- **Período:** 01/12/2025 - 31/12/2025
- **Chance:** 8%
- **Recompensa:** Badge "Natal 2025" + 100 PityCoins
- **Cooldown:** 1 hora

---

**🎮 Aproveite os eventos e boa sorte!** 🍀
