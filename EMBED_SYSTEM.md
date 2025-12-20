# 📖 Sistema de Embeds Padronizados - Guia de Uso

## 🎨 Visão Geral

O sistema de embeds padronizados facilita a criação de mensagens visuais consistentes em todo o bot, utilizando o arquivo `src/utils/embedGenerator.js`.

## 🎯 Tipos de Embeds Disponíveis

### 1. **Embed Padrão** (`createEmbed`)
Embed básico e customizável para qualquer propósito.

```javascript
import { createEmbed, Colors } from '../utils/embedGenerator.js';

const embed = createEmbed({
  title: 'Título do Embed',
  description: 'Descrição aqui',
  color: Colors.PRIMARY, // Opcional
  thumbnail: user.displayAvatarURL(), // Opcional
  footer: 'Texto do footer', // Opcional
  timestamp: true, // Opcional (padrão: true)
  fields: [ // Opcional
    { name: 'Campo 1', value: 'Valor 1', inline: true },
    { name: 'Campo 2', value: 'Valor 2', inline: true }
  ]
});
```

### 2. **Embed com Imagem** (`createImageEmbed`)
Para exibir imagens em destaque.

```javascript
import { createImageEmbed } from '../utils/embedGenerator.js';

const embed = createImageEmbed({
  title: 'Título',
  description: 'Descrição', // Opcional
  imageUrl: 'https://exemplo.com/imagem.png',
  color: Colors.INFO, // Opcional
  thumbnail: user.displayAvatarURL(), // Opcional
  footer: 'Footer' // Opcional
});
```

### 3. **Embed de Sucesso** (`createSuccessEmbed`)
Para confirmar ações bem-sucedidas.

```javascript
import { createSuccessEmbed } from '../utils/embedGenerator.js';

const embed = createSuccessEmbed(
  'Ação Concluída',
  'A operação foi realizada com sucesso!'
);
```

### 4. **Embed de Erro** (`createErrorEmbed`)
Para notificar erros.

```javascript
import { createErrorEmbed } from '../utils/embedGenerator.js';

const embed = createErrorEmbed(
  'Erro',
  'Algo deu errado. Tente novamente.'
);
```

### 5. **Embed de Aviso** (`createWarningEmbed`)
Para alertas e avisos.

```javascript
import { createWarningEmbed } from '../utils/embedGenerator.js';

const embed = createWarningEmbed(
  'Atenção',
  'Você está prestes a realizar uma ação irreversível.'
);
```

### 6. **Menu Simples** (`createMenu`)
Lista de itens sem paginação.

```javascript
import { createMenu } from '../utils/embedGenerator.js';

const embed = createMenu({
  title: '📋 Menu de Opções',
  description: 'Escolha uma opção abaixo:',
  items: [
    { name: '1️⃣ Opção 1', value: 'Descrição da opção 1', inline: false },
    { name: '2️⃣ Opção 2', value: 'Descrição da opção 2', inline: false }
  ],
  footer: 'Use !comando <número> para escolher'
});
```

### 7. **Menu com Paginação** (`createPaginatedMenu`)
Para listas grandes que precisam de navegação.

```javascript
import { createPaginatedMenu } from '../utils/embedGenerator.js';

const items = [/* array de 50 itens */];

const paginatedMenu = createPaginatedMenu({
  title: '📚 Lista de Itens',
  items: items,
  itemsPerPage: 10, // Opcional (padrão: 10)
  color: Colors.PURPLE, // Opcional
  formatItem: (item, index) => ({
    name: `${index + 1}. ${item.name}`,
    value: item.description,
    inline: false
  })
});

// Enviar primeira página
await interaction.reply({ 
  embeds: [paginatedMenu.embeds[0]], 
  components: [paginatedMenu.buttons] 
});

// Implementar navegação de páginas via botões
```

### 8. **Embeds Específicos da Economia**

#### Coins/Balance
```javascript
import { createCoinsEmbed } from '../utils/embedGenerator.js';

const embed = createCoinsEmbed({
  username: user.username,
  avatarUrl: user.displayAvatarURL(),
  coins: 1500
});
```

#### Daily Reward
```javascript
import { createDailyEmbed } from '../utils/embedGenerator.js';

const embed = createDailyEmbed(100, 1600); // amount, newBalance
```

#### Cooldown
```javascript
import { createCooldownEmbed } from '../utils/embedGenerator.js';

const embed = createCooldownEmbed(23, 45); // hoursLeft, minutesLeft
```

#### Shop
```javascript
import { createShopEmbed } from '../utils/embedGenerator.js';

const embed = createShopEmbed({ 
  items: shopItems,
  footer: 'Use /buy para comprar' // Opcional
});
```

#### Inventory
```javascript
import { createInventoryEmbed } from '../utils/embedGenerator.js';

const embed = createInventoryEmbed({
  username: user.username,
  avatarUrl: user.displayAvatarURL(),
  items: inventoryItems
});
```

#### Profile
```javascript
import { createProfileEmbed } from '../utils/embedGenerator.js';

const embed = createProfileEmbed({
  username: user.username,
  avatarUrl: user.displayAvatarURL(),
  level: 25,
  xp: 5000,
  rank: 3,
  coins: 1500,
  fields: [ // Opcional
    { name: '📝 Mensagens', value: '250', inline: true }
  ]
});
```

## 🎨 Cores Disponíveis

```javascript
import { Colors } from '../utils/embedGenerator.js';

Colors.PRIMARY   // #667eea - Azul primário
Colors.SUCCESS   // #00FF00 - Verde sucesso
Colors.ERROR     // #FF0000 - Vermelho erro
Colors.WARNING   // #FFA500 - Laranja aviso
Colors.INFO      // #3498db - Azul informação
Colors.GOLD      // #FFD700 - Dourado
Colors.PURPLE    // #9B59B6 - Roxo
```

## 📁 Estrutura de Arquivos

```
src/
├── events/              # Handlers de eventos
│   ├── ready.js
│   ├── messageCreate.js
│   ├── interactionCreate.js
│   └── voiceStateUpdate.js
├── commands/            # Slash commands
│   ├── coins.js
│   ├── daily.js
│   ├── shop.js
│   └── ...
├── prefixCommands/      # Prefix commands
│   ├── coins.js
│   ├── daily.js
│   └── ...
├── utils/
│   ├── embedGenerator.js  # Sistema de embeds
│   ├── svgGenerator.js
│   └── ...
└── index.js             # Main file (limpo)
```

## ✨ Benefícios

1. **Consistência**: Todos os embeds seguem o mesmo padrão visual
2. **Manutenibilidade**: Mudanças de estilo podem ser feitas em um único lugar
3. **Produtividade**: Criação rápida de embeds sem código repetitivo
4. **Legibilidade**: Código mais limpo e fácil de entender
5. **Escalabilidade**: Fácil adicionar novos tipos de embeds

## 🔧 Exemplo Prático

**Antes** (sem embedGenerator):
```javascript
const embed = new EmbedBuilder()
  .setColor('#FFD700')
  .setTitle(`💰 Saldo de ${user.username}`)
  .setDescription(`**${coins}** PityCoins`)
  .setThumbnail(user.displayAvatarURL())
  .setFooter({ text: 'Ganhe coins ganhando XP!' })
  .setTimestamp();
```

**Depois** (com embedGenerator):
```javascript
const embed = createCoinsEmbed({
  username: user.username,
  avatarUrl: user.displayAvatarURL(),
  coins: coins
});
```

## 🚀 Próximos Passos

- ✅ Sistema de eventos modular implementado
- ✅ EmbedGenerator com 10+ tipos de embeds
- ✅ Comandos atualizados para usar o novo sistema
- 🔄 Adicionar mais tipos de embeds conforme necessário
- 🔄 Implementar sistema de paginação interativa
- 🔄 Criar temas customizáveis por servidor
