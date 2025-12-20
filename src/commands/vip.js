import { SlashCommandBuilder, ChannelType, PermissionFlagsBits, AttachmentBuilder } from 'discord.js';
import { createVipEmbed } from '../utils/embedGenerator.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuração dos tiers VIP
const VIP_TIERS = {
  gold: {
    name: 'VIP Gold',
    price: 'R$ 6,00',
    color: '#FFD700',
    emoji: '⚡',
    benefits: [
      'Cargo Fixado No Topo',
      'Direito a 2 Emojis Ou Figurinhas Permanente',
      'Fixar Arquivos No Chat Principal',
      '2X De Experiência e Pitty Coins',
      'Use Figurinhas Externas E Emojis',
      'Ganhe O Cargo De @VIP Gold'
    ],
    qrcode: 't1pix.png'
  },
  platinum: {
    name: 'VIP Platinum',
    price: 'R$ 12,00',
    color: '#E5E4E2',
    emoji: '💎',
    benefits: [
      'Cargo Fixado No Topo',
      'Direito a 2 Emojis Ou Figurinhas Permanente',
      'Fixar Arquivos No Chat Principal',
      '3X De Experiência e Pitty Coins',
      'Use Figurinhas Externas E Emojis',
      'Direito As Cores Exclusivas',
      'Mover Membros Na Call',
      'Ganhe O Cargo De @VIP Platinum'
    ],
    qrcode: 't2pix.png'
  },
  ruby: {
    name: 'VIP Ruby',
    price: 'R$ 30,00',
    color: '#E0115F',
    emoji: '💎',
    benefits: [
      'Cargo Fixado No Topo',
      'Crie 7 Emojis Ou Figurinhas Permanente',
      'Enviar Imagens No Chat Principal',
      'Direito Ao Canal De Cores Exclusivas',
      'Use Figurinhas Externas E Emoji',
      '5X De Experiência e Pitty Coins',
      'Mover Membros No Chat De Voz',
      '2 Cargos Personalizados Permanente',
      '1 Call Privada No Servidor Permanente',
      'Direito As Cores Exclusivas',
      'Direito As Cores Ultra Cromáticas (Exclusivo Só VIP Ruby)',
      'Ganha O Cargo De @VIP Ruby'
    ],
    qrcode: 't3pix.png'
  }
};

export default {
  data: new SlashCommandBuilder()
    .setName('vip')
    .setDescription('Solicita a criação de canal VIP para pagamento')
    .addStringOption(option =>
      option.setName('tier')
        .setDescription('Tier do VIP desejado')
        .setRequired(true)
        .addChoices(
          { name: '⚡ VIP Gold - R$ 6,00', value: 'gold' },
          { name: '💎 VIP Platinum - R$ 12,00', value: 'platinum' },
          { name: '💎 VIP Ruby - R$ 30,00', value: 'ruby' }
        )
    ),
  
  async execute(interaction) {
    const tier = interaction.options.getString('tier');
    const vipConfig = VIP_TIERS[tier];
    const categoryId = process.env.VIP_CATEGORY_ID || '1067725669150240818';
    
    try {
      await interaction.deferReply({ flags: 64 });
      
      // Buscar categoria
      const category = await interaction.guild.channels.fetch(categoryId);
      
      if (!category || category.type !== ChannelType.GuildCategory) {
        return interaction.editReply({
          content: '❌ Categoria VIP não encontrada. Contate um administrador.'
        });
      }
      
      // Criar canal privado na categoria
      const channelName = `vip-${interaction.user.username}-${tier}`;
      const vipChannel = await interaction.guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: categoryId,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.AttachFiles
            ]
          }
        ]
      });
      
      // Carregar QR Code
      const qrcodePath = join(__dirname, '..', 'media', vipConfig.qrcode);
      let qrcodeBuffer;
      
      try {
        qrcodeBuffer = readFileSync(qrcodePath);
      } catch (error) {
        console.error('Erro ao carregar QR Code:', error);
        return interaction.editReply({
          content: '❌ Erro ao carregar QR Code de pagamento. Contate um administrador.'
        });
      }
      
      const qrcodeAttachment = new AttachmentBuilder(qrcodeBuffer, { 
        name: 'qrcode-pix.png' 
      });
      
      // Criar embed de pagamento
      const embed = createVipEmbed({
        tier: vipConfig.name,
        price: vipConfig.price,
        benefits: vipConfig.benefits,
        color: vipConfig.color,
        emoji: vipConfig.emoji,
        username: interaction.user.username
      });
      
      // Enviar mensagem no canal criado
      await vipChannel.send({
        content: `${interaction.user}, bem-vindo ao seu canal de pagamento VIP! 🎉`,
        embeds: [embed],
        files: [qrcodeAttachment]
      });
      
      // Confirmar ao usuário
      await interaction.editReply({
        content: `✅ Canal VIP criado com sucesso! Acesse ${vipChannel} para ver as informações de pagamento.`
      });
      
    } catch (error) {
      console.error('Erro ao criar canal VIP:', error);
      
      const errorMessage = error.code === 50013 
        ? '❌ O bot não tem permissões suficientes para criar canais. Contate um administrador.'
        : '❌ Erro ao criar canal VIP. Tente novamente mais tarde.';
      
      if (interaction.deferred) {
        await interaction.editReply({ content: errorMessage });
      } else {
        await interaction.reply({ content: errorMessage, flags: 64 });
      }
    }
  }
};
