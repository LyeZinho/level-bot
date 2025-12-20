# 💎 Sistema VIP - Guia Completo

## 🎯 Como Funciona

O sistema VIP permite que usuários solicitem e adquiram benefícios exclusivos através de pagamento via PIX.

### Fluxo de Compra

1. **Usuário solicita VIP** → `/vip <tier>` ou `!vip <tier>`
2. **Bot cria canal privado** → Canal exclusivo na categoria VIP
3. **Informações de pagamento** → Embed com benefícios + QR Code PIX
4. **Usuário paga via PIX** → Escaneia QR Code e efetua pagamento
5. **Envio de comprovante** → Usuário envia print/PDF do comprovante
6. **Moderador confirma** → Equipe verifica pagamento e ativa VIP
7. **VIP ativado** → Usuário recebe cargo e benefícios

---

## 💎 Tiers Disponíveis

### ⚡ VIP Gold - R$ 6,00

**Benefícios:**
- Cargo Fixado No Topo
- Direito a 2 Emojis Ou Figurinhas Permanente
- Fixar Arquivos No Chat Principal
- 2X De Experiência Na Loritta
- Use Figurinhas Externas E Emojis
- Ganhe O Cargo De @VIP Gold

**Comando:**
```
/vip gold
!vip gold
```

---

### 💎 VIP Platinum - R$ 12,00

**Benefícios:**
- Cargo Fixado No Topo
- Direito a 2 Emojis Ou Figurinhas Permanente
- Fixar Arquivos No Chat Principal
- 3X De Experiência Na Loritta
- Use Figurinhas Externas E Emojis
- Direito As Cores Exclusivas
- Mover Membros Na Call
- Ganhe O Cargo De @VIP Platinum

**Comando:**
```
/vip platinum
!vip platinum
```

---

### 💎 VIP Ruby - R$ 30,00

**Benefícios:**
- Cargo Fixado No Topo
- Crie 7 Emojis Ou Figurinhas Permanente
- Enviar Imagens No Chat Principal
- Direito Ao Canal De Cores Exclusivas
- Use Figurinhas Externas E Emoji
- 5X Experiência Na Loritta
- Mover Membros No Chat De Voz
- 2 Cargos Personalizados Permanente
- 1 Call Privada No Servidor Permanente
- Direito As Cores Exclusivas
- Direito As Cores Ultra Cromáticas (Exclusivo Só VIP Ruby)
- Ganha O Cargo De @VIP Ruby

**Comando:**
```
/vip ruby
!vip ruby
```

---

## 📋 Guia para Usuários

### Como Solicitar VIP

1. **Escolha seu tier:**
   - Gold (R$ 6,00)
   - Platinum (R$ 12,00)
   - Ruby (R$ 30,00)

2. **Use o comando:**
   ```
   /vip <tier>
   ```
   ou
   ```
   !vip <tier>
   ```

3. **Acesse o canal criado:**
   - Um canal privado será criado para você
   - Apenas você e os moderadores têm acesso

4. **Efetue o pagamento:**
   - Use o QR Code PIX fornecido
   - Faça o pagamento via app do seu banco

5. **Envie o comprovante:**
   - Tire print ou salve PDF do comprovante
   - Envie no canal VIP criado

6. **Mencione um moderador:**
   - Mencione um @Moderador no canal
   - Aguarde a confirmação

7. **VIP ativado!**
   - Moderador verifica e ativa seus benefícios
   - Você receberá o cargo correspondente

---

## 🛠️ Guia para Moderadores

### Processo de Confirmação

1. **Notificação:**
   - Usuário menciona moderador no canal VIP
   - Comprovante de pagamento enviado

2. **Verificação:**
   - Conferir se o valor está correto
   - Verificar se o comprovante é válido
   - Confirmar com a equipe financeira se necessário

3. **Ativação do VIP:**
   - Adicionar cargo VIP correspondente ao usuário
   - Configurar permissões especiais se necessário
   - Criar recursos exclusivos (call privada para Ruby, etc.)

4. **Confirmação:**
   - Marcar como concluído no canal VIP
   - Agradecer pela compra
   - Opcional: Deletar o canal após alguns dias

### Comandos Úteis

**Adicionar cargo VIP:**
```
/role add @usuario @VIP Gold
/role add @usuario @VIP Platinum
/role add @usuario @VIP Ruby
```

**Criar call privada (Ruby):**
```
Criar canal de voz → Configurar permissões → Apenas o usuário VIP Ruby
```

---

## ⚙️ Configuração Técnica

### Setup Inicial

1. **Criar categoria VIP no Discord:**
   - Nome sugerido: "🎫 VIP Checkout"
   - Copie o ID da categoria

2. **Configurar .env:**
   ```env
   VIP_CATEGORY_ID=1067725669150240818
   ```

3. **Adicionar imagens QR Code:**
   - Colocar em `/src/media/`:
     - `t1.png` → VIP Gold
     - `t2.png` → VIP Platinum
     - `t3.png` → VIP Ruby

4. **Registrar comandos:**
   ```bash
   npm run deploy
   ```

5. **Reiniciar bot:**
   ```bash
   npm start
   ```

### Permissões Necessárias

O bot precisa das seguintes permissões:

- ✅ **Gerenciar Canais** (criar canais VIP)
- ✅ **Ler Mensagens**
- ✅ **Enviar Mensagens**
- ✅ **Anexar Arquivos** (enviar QR Code)
- ✅ **Incorporar Links** (embeds)

### Estrutura de Arquivos

```
level_bot/
├── src/
│   ├── commands/
│   │   └── vip.js              # Comando slash /vip
│   ├── prefixCommands/
│   │   └── vip.js              # Comando prefix !vip
│   ├── utils/
│   │   └── embedGenerator.js   # createVipEmbed()
│   └── media/
│       ├── t1.png              # QR Code Gold
│       ├── t2.png              # QR Code Platinum
│       └── t3.png              # QR Code Ruby
├── .env                        # VIP_CATEGORY_ID
└── VIP_SYSTEM.md               # Esta documentação
```

---

## 🔧 Solução de Problemas

### Erro: Categoria VIP não encontrada

**Problema:** ID da categoria incorreto ou categoria deletada

**Solução:**
1. Verificar se a categoria existe no servidor
2. Copiar o ID correto da categoria
3. Atualizar `VIP_CATEGORY_ID` no `.env`
4. Reiniciar o bot

### Erro: Bot sem permissões

**Problema:** Bot não tem permissão para criar canais

**Solução:**
1. Ir em Configurações do Servidor → Funções
2. Encontrar o cargo do bot
3. Ativar "Gerenciar Canais"
4. Salvar alterações

### QR Code não aparece

**Problema:** Arquivo de imagem não encontrado

**Solução:**
1. Verificar se os arquivos existem em `/src/media/`
2. Verificar nomes: `t1.png`, `t2.png`, `t3.png`
3. Verificar extensão (deve ser `.png`)
4. Reiniciar o bot

### Canal não é criado privado

**Problema:** Permissões não foram configuradas corretamente

**Solução:**
O código já configura automaticamente, mas se necessário:
1. Verificar permissões do bot na categoria
2. Bot deve ter "Gerenciar Permissões"
3. Reiniciar tentativa de criação

---

## 📊 Estatísticas e Monitoramento

### Acompanhar Vendas

Para criar um sistema de log de vendas VIP:

1. **Canal de logs:**
   - Criar canal #vip-logs
   - Bot envia notificação quando canal VIP é criado

2. **Rastreamento:**
   - Quem solicitou
   - Qual tier
   - Quando foi solicitado
   - Status (pendente/confirmado/cancelado)

### Exemplo de Log:

```
✨ NOVA SOLICITAÇÃO VIP

👤 Usuário: @Usuario#1234
💎 Tier: VIP Gold
💰 Valor: R$ 6,00
📅 Data: 11/12/2025 às 14:30
🔗 Canal: #vip-usuario-gold
```

---

## 🎨 Personalização

### Alterar Cores dos Embeds

Editar em `src/commands/vip.js`:

```javascript
const VIP_TIERS = {
  gold: {
    color: '#FFD700',  // Alterar aqui
    // ...
  }
}
```

### Alterar Benefícios

Editar lista de benefícios em `VIP_TIERS`:

```javascript
benefits: [
  'Seu novo benefício aqui',
  'Outro benefício',
  // ...
]
```

### Alterar Preços

```javascript
gold: {
  price: 'R$ 10,00',  // Novo preço
  // ...
}
```

---

## ❓ FAQ

**P: Posso ter múltiplos VIPs ativos?**
R: Sim, mas o sistema atual cria um canal por solicitação. Configure manualmente se necessário.

**P: O VIP expira?**
R: Não automaticamente. Configure expiração manualmente se desejar.

**P: Como renovar VIP?**
R: Usuário usa o comando novamente e repete o processo.

**P: Posso fazer upgrade de tier?**
R: Sim, basta solicitar o tier superior e pagar a diferença (configuração manual).

**P: O que fazer se o pagamento falhar?**
R: Moderador pode deletar o canal VIP e usuário tenta novamente.

---

## 📝 Próximas Melhorias

Ideias para futuras versões:

- [ ] Sistema de expiração automática de VIP
- [ ] Comando para moderador ativar VIP direto pelo bot
- [ ] Integração com API de pagamento para confirmação automática
- [ ] Sistema de renovação automática
- [ ] Desconto para upgrade de tier
- [ ] Histórico de compras VIP
- [ ] Notificações antes do VIP expirar
- [ ] Dashboard de vendas VIP

---

## 🚀 Deploy Rápido

```bash
# 1. Adicionar imagens QR Code
# Colocar t1.png, t2.png, t3.png em /src/media/

# 2. Configurar categoria
# Copiar ID da categoria e adicionar ao .env

# 3. Registrar comandos
npm run deploy

# 4. Reiniciar bot
npm start
```

✅ **Sistema VIP pronto para uso!**
