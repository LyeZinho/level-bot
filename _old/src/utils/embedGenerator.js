import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

/**
 * Gerador de Embeds Padronizado para Level Bot
 * Facilita a criação de embeds consistentes em todo o bot
 */

// Cores padrão do bot
export const Colors = {
  PRIMARY: '#667eea',
  SUCCESS: '#00FF00',
  ERROR: '#FF0000',
  WARNING: '#FFA500',
  INFO: '#3498db',
  GOLD: '#FFD700',
  PURPLE: '#9B59B6'
};

/**
 * Cria um embed padrão básico
 * @param {Object} options - Opções do embed
 * @param {string} options.title - Título do embed
 * @param {string} options.description - Descrição do embed
 * @param {string} [options.color] - Cor do embed (hex)
 * @param {string} [options.thumbnail] - URL da thumbnail
 * @param {string} [options.footer] - Texto do footer
 * @param {boolean} [options.timestamp] - Adicionar timestamp
 * @param {Array} [options.fields] - Array de campos {name, value, inline}
 * @returns {EmbedBuilder}
 */
export function createEmbed({
  title,
  description,
  color = Colors.PRIMARY,
  thumbnail = null,
  footer = null,
  timestamp = true,
  fields = []
}) {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description);

  if (thumbnail) embed.setThumbnail(thumbnail);
  if (footer) embed.setFooter({ text: footer });
  if (timestamp) embed.setTimestamp();
  if (fields.length > 0) embed.addFields(fields);

  return embed;
}

/**
 * Cria um embed com imagem
 * @param {Object} options - Opções do embed
 * @param {string} options.title - Título do embed
 * @param {string} [options.description] - Descrição do embed
 * @param {string} options.imageUrl - URL da imagem principal
 * @param {string} [options.color] - Cor do embed
 * @param {string} [options.thumbnail] - URL da thumbnail
 * @param {string} [options.footer] - Texto do footer
 * @returns {EmbedBuilder}
 */
export function createImageEmbed({
  title,
  description = null,
  imageUrl,
  color = Colors.PRIMARY,
  thumbnail = null,
  footer = null
}) {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setImage(imageUrl);

  if (description) embed.setDescription(description);
  if (thumbnail) embed.setThumbnail(thumbnail);
  if (footer) embed.setFooter({ text: footer });
  embed.setTimestamp();

  return embed;
}

/**
 * Cria um embed de sucesso
 * @param {string} title - Título do embed
 * @param {string} description - Descrição do embed
 * @returns {EmbedBuilder}
 */
export function createSuccessEmbed(title, description) {
  return createEmbed({
    title: `✅ ${title}`,
    description,
    color: Colors.SUCCESS
  });
}

/**
 * Cria um embed de erro
 * @param {string} title - Título do embed
 * @param {string} description - Descrição do embed
 * @returns {EmbedBuilder}
 */
export function createErrorEmbed(title, description) {
  return createEmbed({
    title: `❌ ${title}`,
    description,
    color: Colors.ERROR,
    timestamp: true
  });
}

/**
 * Cria um embed de aviso
 * @param {string} title - Título do embed
 * @param {string} description - Descrição do embed
 * @returns {EmbedBuilder}
 */
export function createWarningEmbed(title, description) {
  return createEmbed({
    title: `⚠️ ${title}`,
    description,
    color: Colors.WARNING
  });
}

/**
 * Cria um menu simples sem paginação
 * @param {Object} options - Opções do menu
 * @param {string} options.title - Título do menu
 * @param {string} [options.description] - Descrição do menu
 * @param {Array} options.items - Array de itens {name, value, inline}
 * @param {string} [options.color] - Cor do embed
 * @param {string} [options.footer] - Texto do footer
 * @returns {EmbedBuilder}
 */
export function createMenu({
  title,
  description = null,
  items,
  color = Colors.PRIMARY,
  footer = null
}) {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title);

  if (description) embed.setDescription(description);

  if (items && items.length > 0) {
    embed.addFields(items.map(item => ({
      name: item.name,
      value: item.value,
      inline: item.inline !== false
    })));
  }

  if (footer) embed.setFooter({ text: footer });
  embed.setTimestamp();

  return embed;
}

/**
 * Sistema de paginação para menus grandes
 * @param {Object} options - Opções do menu paginado
 * @param {string} options.title - Título do menu
 * @param {Array} options.items - Array de itens a paginar
 * @param {number} [options.itemsPerPage] - Itens por página (padrão: 10)
 * @param {string} [options.color] - Cor do embed
 * @param {Function} options.formatItem - Função para formatar cada item (item, index) => {name, value, inline}
 * @returns {Object} { embeds: EmbedBuilder[], currentPage: number, totalPages: number, buttons: ActionRowBuilder }
 */
export function createPaginatedMenu({
  title,
  items,
  itemsPerPage = 10,
  color = Colors.PRIMARY,
  formatItem
}) {
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const embeds = [];

  for (let page = 0; page < totalPages; page++) {
    const start = page * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = items.slice(start, end);

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(title)
      .setFooter({ text: `Página ${page + 1} de ${totalPages}` })
      .setTimestamp();

    const fields = pageItems.map((item, index) => formatItem(item, start + index));
    embed.addFields(fields);

    embeds.push(embed);
  }

  // Criar botões de navegação
  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('pagination_first')
      .setLabel('⏮️ Primeira')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('pagination_prev')
      .setLabel('◀️ Anterior')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('pagination_next')
      .setLabel('Próxima ▶️')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('pagination_last')
      .setLabel('Última ⏭️')
      .setStyle(ButtonStyle.Primary)
  );

  return {
    embeds,
    currentPage: 0,
    totalPages,
    buttons
  };
}

/**
 * Cria embed de perfil de usuário
 * @param {Object} options - Opções do perfil
 * @param {string} options.username - Nome do usuário
 * @param {string} options.avatarUrl - URL do avatar
 * @param {number} options.level - Nível do usuário
 * @param {number} options.xp - XP do usuário
 * @param {number} options.rank - Rank do usuário
 * @param {number} options.coins - PityCoins do usuário
 * @param {Array} [options.fields] - Campos adicionais
 * @returns {EmbedBuilder}
 */
export function createProfileEmbed({
  username,
  avatarUrl,
  level,
  xp,
  rank,
  coins,
  fields = []
}) {
  const embed = new EmbedBuilder()
    .setColor(Colors.PRIMARY)
    .setTitle(`📊 Perfil de ${username}`)
    .setThumbnail(avatarUrl)
    .addFields(
      { name: '🎯 Nível', value: `${level}`, inline: true },
      { name: '⭐ XP', value: `${xp}`, inline: true },
      { name: '🏆 Rank', value: `#${rank}`, inline: true },
      { name: '💰 PityCoins', value: `${coins}`, inline: true }
    )
    .setTimestamp();

  if (fields.length > 0) {
    embed.addFields(fields);
  }

  return embed;
}

/**
 * Cria embed de loja
 * @param {Object} options - Opções da loja
 * @param {Array} options.items - Array de itens da loja
 * @param {string} [options.footer] - Texto do footer
 * @returns {EmbedBuilder}
 */
export function createShopEmbed({ items, footer = null }) {
  const embed = new EmbedBuilder()
    .setColor(Colors.GOLD)
    .setTitle('🏪 Loja de Itens')
    .setDescription('Use `/buy <nome_do_item>` para comprar um item\n\n**Itens Disponíveis:**')
    .setTimestamp();

  for (const item of items) {
    embed.addFields({
      name: `${item.emoji} ${item.name}`,
      value: `${item.description || 'Sem descrição'}\n**Preço:** ${item.price} <:pitycoin:1448368905948102897> PityCoins\n**ID:** ${item.item_id}`,
      inline: false
    });
  }

  if (footer) {
    embed.setFooter({ text: footer });
  } else {
    embed.setFooter({ text: `Total de ${items.length} itens disponíveis` });
  }

  return embed;
}

/**
 * Cria embed de inventário
 * @param {Object} options - Opções do inventário
 * @param {string} options.username - Nome do usuário
 * @param {string} options.avatarUrl - URL do avatar
 * @param {Array} options.items - Array de itens do inventário
 * @returns {EmbedBuilder}
 */
export function createInventoryEmbed({ username, avatarUrl, items }) {
  const embed = new EmbedBuilder()
    .setColor(Colors.PURPLE)
    .setTitle(`🎒 Inventário de ${username}`)
    .setThumbnail(avatarUrl)
    .setFooter({ text: 'Use /use <nome_do_item> para usar um item' })
    .setTimestamp();

  if (items.length === 0) {
    embed.setDescription('O inventário está vazio. Compre itens na `/shop`!');
  } else {
    let description = '**Seus Itens:**\n\n';
    for (const item of items) {
      description += `${item.emoji} **${item.name}** x${item.quantity}\n`;
      description += `└ ${item.description || 'Sem descrição'}\n\n`;
    }
    embed.setDescription(description);
  }

  return embed;
}

/**
 * Cria embed de coins/balance
 * @param {Object} options - Opções do embed
 * @param {string} options.username - Nome do usuário
 * @param {string} options.avatarUrl - URL do avatar
 * @param {number} options.coins - Quantidade de coins
 * @returns {EmbedBuilder}
 */
export function createCoinsEmbed({ username, avatarUrl, coins }) {
  return new EmbedBuilder()
    .setColor(Colors.GOLD)
    .setTitle(`💰 Saldo de ${username}`)
    .setDescription(`**${coins}** <:pitycoin:1448368905948102897> PityCoins`)
    .setThumbnail(avatarUrl)
    .setFooter({ text: 'Ganhe coins ganhando XP! (1 coin a cada 100 XP)' })
    .setTimestamp();
}

/**
 * Cria embed de daily reward
 * @param {number} amount - Quantidade de coins recebida
 * @param {number} newBalance - Novo saldo total
 * @returns {EmbedBuilder}
 */
export function createDailyEmbed(amount, newBalance) {
  return new EmbedBuilder()
    .setColor(Colors.SUCCESS)
    .setTitle('🎉 Recompensa Diária Reivindicada!')
    .setDescription(`Você ganhou **${amount}** <:pitycoin:1448368905948102897> PityCoins!\n\nSaldo atual: **${newBalance}** PityCoins`)
    .setFooter({ text: 'Volte amanhã para receber mais!' })
    .setTimestamp();
}

/**
 * Cria embed de cooldown (quando já reivindicou daily)
 * @param {number} hoursLeft - Horas restantes
 * @param {number} minutesLeft - Minutos restantes
 * @returns {EmbedBuilder}
 */
export function createCooldownEmbed(hoursLeft, minutesLeft) {
  return new EmbedBuilder()
    .setColor(Colors.WARNING)
    .setTitle('⏰ Recompensa Já Reivindicada!')
    .setDescription(`Você já reivindicou sua recompensa diária hoje!\n\nTempo restante: **${hoursLeft}h ${minutesLeft}m**`)
    .setFooter({ text: 'Volte mais tarde!' })
    .setTimestamp();
}

/**
 * Cria um embed para solicitação VIP
 * @param {Object} options
 * @param {string} options.tier - Nome do tier (Boost VIP Gold, Boost VIP Platinum, Boost VIP Ruby)
 * @param {string} options.price - Preço do tier
 * @param {Array<string>} options.benefits - Lista de benefícios
 * @param {string} options.color - Cor do embed
 * @param {string} options.emoji - Emoji do tier
 * @param {string} options.username - Nome do usuário
 * @returns {EmbedBuilder}
 * 
 */
export function createVipEmbed({ tier, price, benefits, color, emoji, username }) {
  const benefitsList = benefits.map((benefit, index) => 
    `${emoji} ${benefit}`
  ).join('\n');
  
  const embed = new EmbedBuilder()
    .setTitle(`${emoji} ${tier} - Informações de Pagamento`)
    .setDescription(
      `**Olá, ${username}!** 👋\n\n` +
      `Obrigado por escolher o **${tier}**!\n\n` +
      `**✦ VANTAGENS ⚘**\n${benefitsList}\n\n` +
      `**💰 VALOR:** ${price}\n\n` +
      `**📋 COMO EFETUAR O PAGAMENTO:**\n` +
      `1️⃣ Use o QR Code PIX abaixo para realizar o pagamento\n` +
      `2️⃣ Após o pagamento, envie o comprovante aqui neste canal\n` +
      `3️⃣ Mencione um <@&1064210042049540161> para processar seu VIP\n` +
      `4️⃣ Aguarde a confirmação e ativação dos benefícios!\n\n` +
      `⚠️ **Importante:** Guarde seu comprovante de pagamento!`
    )
    .setColor(color)
    .setImage('attachment://qrcode-pix.png')
    .setFooter({ 
      text: 'Após o pagamento, envie o comprovante e mencione um moderador' 
    })
    .setTimestamp();
  
  return embed;
}

export default {
  Colors,
  createEmbed,
  createImageEmbed,
  createSuccessEmbed,
  createErrorEmbed,
  createWarningEmbed,
  createMenu,
  createPaginatedMenu,
  createProfileEmbed,
  createShopEmbed,
  createInventoryEmbed,
  createCoinsEmbed,
  createDailyEmbed,
  createCooldownEmbed,
  createVipEmbed
};
