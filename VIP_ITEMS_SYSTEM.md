# 💎 Sistema VIP Completo - Guia de Implementação

## 🎯 Como Funciona

O novo sistema VIP funciona como **itens ativáveis** que os usuários recebem e podem usar quando quiserem.

### Fluxo Completo

1. **Admin concede Boost VIP** → `!vip-activate @usuario <tier>`
2. **Usuário recebe item VIP** → Vai para o inventário
3. **Usuário ativa quando quiser** → `/use Boost VIP Gold` ou `!use Boost VIP Gold`
4. **VIP começa a contar** → 30 dias de duração
5. **Multiplicadores ativos** → 2x, 3x ou 5x em XP e Coins
6. **Worker verifica expiração** → Roda a cada 1 hora
7. **VIP expira automaticamente** → Usuário é notificado

---

## 💎 Tiers VIP

### ⚡ Boost VIP Gold - 2x

**Multiplicador:** 2x XP e Coins  
**Duração:** 30 dias  
**Benefícios:**
- Cargo Fixado No Topo
- Direito a 2 Emojis Ou Figurinhas Permanente
- Fixar Arquivos No Chat Principal
- 2X De Experiência e Pitty Coins
- Use Figurinhas Externas E Emojis
- Ganhe O Cargo De @VIP Gold

### 💎 Boost VIP Platinum - 3x

**Multiplicador:** 3x XP e Coins  
**Duração:** 30 dias  
**Benefícios:**
- Cargo Fixado No Topo
- Direito a 2 Emojis Ou Figurinhas Permanente
- Fixar Arquivos No Chat Principal
- 3X De Experiência e Pitty Coins
- Use Figurinhas Externas E Emojis
- Direito As Cores Exclusivas
- Mover Membros Na Call
- Ganhe O Cargo De @VIP Platinum

### 💎 Boost VIP Ruby - 5x

**Multiplicador:** 5x XP e Coins  
**Duração:** 30 dias  
**Benefícios:**
- Cargo Fixado No Topo
- Crie 7 Emojis Ou Figurinhas Permanente
- Enviar Imagens No Chat Principal
- Direito Ao Canal De Cores Exclusivas
- Use Figurinhas Externas E Emoji
- 5X De Experiência e Pitty Coins
- Mover Membros No Chat De Voz
- 2 Cargos Personalizados Permanente
- 1 Call Privada No Servidor Permanente
- Direito As Cores Exclusivas
- Direito As Cores Ultra Cromáticas (Exclusivo Só VIP Ruby)
- Ganha O Cargo De @VIP Ruby

---

## 🛠️ Setup e Instalação

### 1. Migração do Banco de Dados

```bash
npm run migrate:vips
```

Isso cria a tabela `user_vips` com:
- `user_id`, `guild_id` - Identificação
- `vip_tier` - gold, platinum ou ruby
- `multiplier` - 2, 3 ou 5
- `role_id` - ID do cargo VIP (opcional)
- `activated_at` - Quando foi ativado
- `expires_at` - Quando expira
- `created_at` - Timestamp de criação

### 2. Popular Itens VIP

```bash
npm run seed
```

Isso adiciona os 3 itens VIP ao banco (não aparecem na loja, pois preço = 0).

### 3. Registrar Comandos

```bash
npm run deploy
```

Registra os comandos slash do bot (level, inventory, use, etc).

### 4. Reiniciar Bot

```bash
npm start
```

O bot iniciará com:
- ✅ Level recalc worker
- ✅ **VIP expiration worker** (verifica a cada 1 hora)
- ✅ Voice tracking

---

## 📋 Comandos

### Para Administradores

> ⚠️ **IMPORTANTE:** Apenas membros com a permissão **Administrator** podem usar o comando `!vip-activate`.

**Conceder VIP:** *(Requer permissão de Administrador)*
```
!vip-activate @usuario gold
!vip-activate @usuario platinum
!vip-activate @usuario ruby
```

**Aliases:**
```
!vipactivate @usuario gold
!vip-give @usuario platinum
!givevip @usuario ruby
```

O usuário recebe o item no inventário e é notificado via DM.

### Para Usuários

**Ver inventário:**
```
/inventory
!inv
```

**Ativar Boost VIP:**
```
/use Boost VIP Gold
/use Boost VIP Platinum
/use Boost VIP Ruby
```

**Verificar VIP ativo:**
```
/inventory
```
(Mostra quando o VIP expira)

---

## 🔄 Sistema de Multiplicadores

### Como Funcionam

Os multiplicadores VIP **se combinam** com boosts temporários:

**Exemplo 1: Boost VIP Gold + XP Boost 2x**
- Boost VIP: 2x
- Boost temporário: 2x
- **Total: 4x** (2 × 2)

**Exemplo 2: Boost VIP Ruby sozinho**
- Boost VIP: 5x
- Boost temporário: nenhum
- **Total: 5x**

**Exemplo 3: Apenas XP Boost**
- VIP: nenhum
- Boost: 3x
- **Total: 3x**

### Onde Aplica

Os multiplicadores afetam:
- ✅ **XP de mensagens** (15-25 base)
- ✅ **XP de voz** (1 XP/minuto base)
- ✅ **PityCoins ganhos** (1 coin a cada 100 XP)

### Cálculo Exato

```javascript
// Mensagem (20 XP base)
20 XP × 5 (Boost VIP Ruby) = 100 XP ganho

// Coins (de 100 XP ganho)
100 XP / 100 = 1 coin base
1 coin × 5 (Boost VIP Ruby) = 5 coins ganhos

// Com Boost VIP Ruby: 1 mensagem = 100 XP + 5 coins
```

---

## ⏰ Sistema de Expiração

### VIP Worker

Roda **a cada 1 hora** e:

1. Busca VIPs expirados no banco
2. Remove o VIP do banco
3. Tenta remover o cargo do Discord
4. Envia DM ao usuário notificando expiração
5. Log no console

### Logs

```
🔄 Encontrados 2 VIPs expirados
✅ Cargo VIP removido de Usuario#1234
✅ Boost VIP gold desativado para user 123456 no guild 789012
✅ Processamento de VIPs expirados concluído
```

### Notificação ao Usuário

```
⏰ Seu Boost VIP GOLD no servidor Nome do Servidor expirou.

Obrigado por ser VIP! Para renovar, entre em contato com a administração.
```

---

## 💡 Casos de Uso

### Caso 1: Pagamento Via PIX

1. Usuário usa `/vip gold` ou `!vip gold` e paga via PIX
2. Moderador confirma pagamento
3. Admin usa `!vip-activate @usuario gold`
4. Usuário recebe item no inventário
5. Usuário ativa quando quiser com `/use VIP Gold` ou `!use VIP Gold`

### Caso 2: Recompensa de Evento

1. Admin usa `!vip-activate @vencedor ruby`
2. Vencedor do evento recebe VIP Ruby
3. Pode ativar imediatamente ou guardar

### Caso 3: Renovação

1. VIP expira após 30 dias
2. Usuário paga novamente
3. Admin dá novo VIP com `!vip-activate @usuario <tier>`
4. Usuário ativa e reinicia 30 dias

### Caso 4: Upgrade de Tier

1. Usuário tem VIP Gold ativo
2. Decide fazer upgrade para Platinum
3. Admin dá VIP Platinum com `!vip-activate @usuario platinum`
4. Usuário usa `/use VIP Platinum` ou `!use VIP Platinum`
5. VIP Gold é substituído por Platinum
5. VIP Gold é substituído por Platinum

---

## 🗄️ Estrutura do Banco de Dados

### Tabela `user_vips`

```sql
CREATE TABLE user_vips (
  user_id TEXT NOT NULL,
  guild_id TEXT NOT NULL,
  vip_tier TEXT NOT NULL,
  multiplier FLOAT NOT NULL,
  role_id TEXT,
  activated_at BIGINT NOT NULL,
  expires_at BIGINT NOT NULL,
  created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT * 1000,
  PRIMARY KEY (user_id, guild_id)
);
```

### Exemplo de Dados

| user_id | guild_id | vip_tier | multiplier | expires_at | activated_at |
|---------|----------|----------|------------|------------|--------------|
| 123456 | 789012 | gold | 2 | 1736614800000 | 1734022800000 |
| 234567 | 789012 | ruby | 5 | 1738000000000 | 1735408000000 |

---

## 🔧 Funções do Database

### `getActiveVip(userId, guildId)`
Retorna VIP ativo do usuário (auto-limpa expirados).

### `activateVip(userId, guildId, tier, multiplier, durationDays, roleId)`
Ativa um VIP para o usuário.

### `giveVipItem(userId, guildId, tier)`
Admin dá item VIP ao inventário do usuário.

### `getExpiredVips()`
Busca todos os VIPs expirados.

### `deactivateVip(userId, guildId)`
Remove VIP do banco.

### `getTotalMultiplier(userId, guildId)`
Calcula multiplicador total (VIP + Boost).

---

## 🎨 Personalização

### Alterar Duração do VIP

Em `src/commands/vip-activate.js`:

```javascript
const VIP_TIERS = {
  gold: {
    duration: 30, // Alterar para 60 dias, por exemplo
    // ...
  }
}
```

### Alterar Frequência do Worker

Em `src/events/ready.js`:

```javascript
// Verificar a cada 30 minutos em vez de 1 hora
startVipWorker(client, 30 * 60 * 1000);
```

### Adicionar Mais Tiers

1. Adicionar em `VIP_TIERS`
2. Adicionar opção no comando
3. Criar item no seed
4. Adicionar lógica no `useItem()`

---

## 📊 Monitoramento

### Ver VIPs Ativos

```sql
SELECT * FROM user_vips WHERE expires_at > EXTRACT(EPOCH FROM NOW())::BIGINT * 1000;
```

### Ver VIPs Expirados Hoje

```sql
SELECT * FROM user_vips 
WHERE expires_at <= EXTRACT(EPOCH FROM NOW())::BIGINT * 1000
  AND expires_at >= EXTRACT(EPOCH FROM NOW())::BIGINT * 1000 - (24 * 60 * 60 * 1000);
```

### Estatísticas

```sql
SELECT vip_tier, COUNT(*) as total 
FROM user_vips 
WHERE expires_at > EXTRACT(EPOCH FROM NOW())::BIGINT * 1000
GROUP BY vip_tier;
```

---

## ❓ FAQ

**P: O VIP funciona em todos os servidores?**  
R: Não, o VIP é por servidor (guild_id).

**P: Posso ter 2 VIPs ao mesmo tempo?**  
R: Não, apenas 1 VIP ativo por vez. O novo substitui o antigo.

**P: VIP e Boost se somam ou multiplicam?**  
R: Multiplicam! VIP 2x + Boost 3x = 6x total.

**P: O que acontece se o bot ficar offline?**  
R: O worker não roda, mas quando voltar online, processa todos os VIPs expirados.

**P: Posso dar VIP sem usar o comando?**  
R: Sim, pode inserir diretamente no banco, mas não é recomendado.

**P: Como saber quem tem VIP ativo?**  
R: Use a query SQL acima ou crie um comando `/vip-list`.

---

## 🚀 Próximos Passos

### Melhorias Futuras

- [ ] Comando `!vip-list` para listar todos os VIPs ativos
- [ ] Comando `!vip-status @user` para admins verificarem
- [ ] Sistema de renovação automática
- [ ] Notificação 3 dias antes do VIP expirar
- [ ] Logs de ativações em canal dedicado
- [ ] Dashboard web para gerenciar VIPs
- [ ] VIP de diferentes durações (15, 30, 60 dias)
- [ ] Sistema de "pause" para VIP (pausar contagem)

---

## ✅ Checklist de Implementação

- [x] Criar tabela `user_vips`
- [x] Criar comando `!vip-activate` para admins (prefix only, Admin permission)
- [x] Criar items VIP no seed
- [x] Integrar multiplicador VIP no sistema XP
- [x] Criar VIP worker para expiração
- [x] Atualizar comando `/use` para ativar VIPs
- [x] Notificações via DM
- [x] Logs no console
- [x] Combinar multiplicadores VIP + Boost
- [x] Documentação completa

**Sistema 100% funcional e pronto para produção!** 🎉
