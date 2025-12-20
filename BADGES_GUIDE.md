# 🏅 Sistema de Badges e Missões - Guia Completo

## 📋 Visão Geral

O Level Bot agora possui um sistema completo de badges e missões que recompensa os usuários por suas conquistas no servidor!

## 🎖️ Tipos de Badges

### 1. 🏆 **Badges de Rank** (Automáticas)

Badges automáticas baseadas no seu nível. Apenas UMA badge de rank por vez!

| Rank | Nome | Níveis | Badge |
|------|------|--------|-------|
| 1 | Iniciante | 1-10 | `badge_rank_1.png` |
| 2 | Aprendiz | 11-30 | `badge_rank_2.png` |
| 3 | Experiente | 31-60 | `badge_rank_3.png` |
| 4 | Veterano | 61-100 | `badge_rank_4.png` |
| 5 | Elite | 101-150 | `badge_rank_5.png` |
| 6 | Lendário | 151+ | `badge_rank_6.png` |

**Como funciona:**
- Ao subir de nível, sua badge de rank é automaticamente atualizada
- A badge antiga é SUBSTITUÍDA pela nova
- Progressão geométrica: cada tier requer mais níveis que o anterior

### 2. 🎯 **Badges de Missão**

Conquiste completando missões específicas!

| Badge | Missão | Recompensa |
|-------|--------|------------|
| Conversador | Envie 1000 mensagens | 500 PityCoins |
| Maratonista | Fique 100 horas em voz | 1000 PityCoins |
| Dedicado | Daily por 30 dias seguidos | 2000 PityCoins |
| Colecionador | Complete 10 missões | Badge especial |

### 3. 🎉 **Badges de Evento** (Tempo Limitado)

Badges especiais disponíveis apenas durante eventos!

- **Natal 2025**: Disponível até 07/01/2026
- Compráveis na loja durante o período do evento
- Podem expirar após o evento

## 🎯 Sistema de Missões

### Ver Suas Missões
```
/missions
/missions @usuario
```

**Mostra:**
- ✅ Missões completas
- 📋 Missões ativas com barra de progresso
- 💰 Recompensas disponíveis

### Tipos de Missões

#### 💬 **Mensagens**
- Rastreamento automático
- Conta todas as mensagens enviadas
- Exemplo: "Envie 1000 mensagens"

#### 🎤 **Tempo em Voz**
- Rastreamento automático de tempo em canais de voz
- Conta o tempo total acumulado
- Exemplo: "Fique 100 horas em voz"

#### 📅 **Daily Streak**
- Sequência de dias coletando `/daily`
- Resetado se perder um dia
- Exemplo: "Colete daily por 30 dias seguidos"

#### 📈 **Nível**
- Baseado no seu nível atual
- Atualização automática
- Exemplo: "Alcance o nível 50"

## 📛 Comandos de Badges

### Ver Suas Badges
```
/mybadges
/mybadges @usuario
```

Exibe todas as badges que você conquistou, organizadas por tipo:
- 🏆 Badges de Rank
- 🎯 Badges de Missão
- 🎉 Badges de Evento

### Gerenciar Badges (Admin)

#### Dar Badge
```
/badge give @usuario <nome-da-badge>
```
Concede uma badge específica a um usuário (não funciona com badges de rank).

#### Remover Badge
```
/badge remove @usuario <nome-da-badge>
```
Remove uma badge de um usuário.

#### Listar Todas as Badges
```
/badge list
```
Mostra todas as badges disponíveis no servidor.

#### Ver Badges de Um Usuário
```
/badge user @usuario
```
Mostra todas as badges de um usuário específico (admin).

## 🖼️ Badges no Perfil

Suas badges aparecem automaticamente no seu perfil!

```
/profile
/profile @usuario
```

- **Máximo de 6 badges** exibidas por vez
- Prioridade: Rank > Missão > Evento
- As mais recentes aparecem primeiro

## 🏪 Badges de Evento na Loja

Badges de evento podem ser compradas na loja durante eventos especiais:

```
/shop
/buy "Nome da Badge de Evento"
```

**Características:**
- Tempo limitado de compra
- Podem ter data de expiração
- Preços especiais durante eventos

## 📊 Progresso de Missões

O sistema rastreia automaticamente:

### ✅ Rastreamento Automático
- **Mensagens enviadas**: Cada mensagem conta
- **Tempo em voz**: Todo tempo em canal de voz
- **Daily coletado**: Sequência de dias consecutivos
- **Nível atual**: Atualizado ao ganhar XP

### 🎁 Recompensas
- **PityCoins**: Moeda do servidor
- **Badges**: Emblemas de conquista
- **Ambos**: Algumas missões dão coins + badge

## 🔧 Para Administradores

### Adicionar Novas Badges

1. Crie a imagem da badge (60x60px, PNG)
2. Salve em `/src/assets/`
3. Execute no banco:
```sql
INSERT INTO badges (name, description, image_path, badge_type, is_active)
VALUES ('Nome da Badge', 'Descrição', 'arquivo.png', 'mission', true);
```

### Criar Nova Missão

```sql
INSERT INTO missions (name, description, mission_type, target_value, reward_badge_id, reward_coins, is_active)
VALUES (
  'Nome da Missão',
  'Descrição',
  'messages', -- ou 'voice_time', 'daily_streak', 'level'
  1000, -- valor alvo
  1, -- ID da badge (ou NULL)
  500, -- coins de recompensa
  true
);
```

### Dar Badge Especial

```
/badge give @usuario "Nome da Badge"
```

## 📁 Estrutura de Arquivos

### Imagens de Badges
```
src/assets/
├── badge_rank_1.png      # Rank 1 - Iniciante
├── badge_rank_2.png      # Rank 2 - Aprendiz
├── badge_rank_3.png      # Rank 3 - Experiente
├── badge_rank_4.png      # Rank 4 - Veterano
├── badge_rank_5.png      # Rank 5 - Elite
├── badge_rank_6.png      # Rank 6 - Lendário
├── badge_mission_messages.png    # Conversador
├── badge_mission_voice.png       # Maratonista
├── badge_mission_daily.png       # Dedicado
├── badge_mission_collector.png   # Colecionador
└── badgexmas25.png              # Evento Natal 2025
```

## 🚀 Instalação

### 1. Migrar Database
```bash
npm run migrate:badges
```

### 2. Popular Badges e Missões
```bash
npm run seed:badges
```

### 3. Deploy Comandos
```bash
npm run deploy
```

### 4. Reiniciar Bot
```bash
npm run dev
```

## 💡 Dicas

- **Badges de rank são automáticas**: Não precisa fazer nada, elas atualizam sozinhas!
- **Complete missões para badges únicas**: Algumas badges só podem ser obtidas completando missões
- **Fique de olho em eventos**: Badges de evento são limitadas!
- **Cheque seu progresso**: Use `/missions` regularmente para ver como está indo

## 🎮 Exemplos de Uso

### Para Usuários
```bash
# Ver suas missões
/missions

# Ver suas badges
/mybadges

# Ver badges de outro usuário
/mybadges @amigo

# Ver seu perfil com badges
/profile
```

### Para Admins
```bash
# Listar todas as badges
/badge list

# Dar badge especial para evento
/badge give @usuario "Natal 2025"

# Remover badge
/badge remove @usuario "Nome da Badge"

# Ver badges de um usuário
/badge user @usuario
```

## ⚠️ Observações Importantes

1. **Badges de Rank**: Não podem ser dadas ou removidas manualmente
2. **Limite de Exibição**: Apenas 6 badges aparecem no perfil
3. **Missões Não Repetíveis**: A maioria das missões só pode ser completa uma vez
4. **Badges Expiradas**: São automaticamente removidas quando expiram
5. **Progresso Contínuo**: Seu progresso é salvo mesmo se a missão mudar

## 📞 Suporte

Dúvidas sobre badges ou missões? Entre em contato com a equipe de administração do servidor!

---

✨ **Boas conquistas e boa sorte nas missões!** ✨
