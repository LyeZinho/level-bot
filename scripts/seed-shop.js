import { createItem } from '../src/database.js';

async function seedShop() {
  console.log('🌱 Populando a loja com itens...');
  
  try {
    // Boost VIPs (não vendidos na loja, apenas dados por admins)
    await createItem(
      'Boost VIP Gold',
      'Multiplicador 2x de XP e Coins por 30 dias',
      0, // Não tem preço (dado por admin)
      '⚡',
      'vip',
      true // Oculto da loja
    );
    
    await createItem(
      'Boost VIP Platinum',
      'Multiplicador 3x de XP e Coins por 30 dias',
      0,
      '💎',
      'vip',
      true // Oculto da loja
    );
    
    await createItem(
      'Boost VIP Ruby',
      'Multiplicador 5x de XP e Coins por 30 dias',
      0,
      '💎',
      'vip',
      true // Oculto da loja
    );
    
    // XP Boosts
    await createItem(
      'XP Boost 2x',
      'Multiplica por 2x todo XP ganho por 1 hora',
      50,
      '⚡',
      'boost',
      false
    );
    
    await createItem(
      'XP Boost 3x',
      'Multiplica por 3x todo XP ganho por 1 hora',
      150,
      '⚡⚡',
      'boost',
      true // Oculto da loja
    );
    
    await createItem(
      'XP Boost 5x',
      'Multiplica por 5x todo XP ganho por 1 hora',
      250,
      '⚡⚡⚡',
      'boost',
      true // Oculto da loja
    );
    
    // Pacotes de Experiência
    await createItem(
      'Pacote de Experiência Tier 1',
      'Ganhe 150 XP + 10 PityCoins instantaneamente',
      50,
      '📦',
      'consumable',
      false
    );
    
    await createItem(
      'Pacote de Experiência Tier 2',
      'Ganhe 250 XP + 20 PityCoins instantaneamente',
      150,
      '📦✨',
      'consumable',
      false
    );
    
    await createItem(
      'Pacote de Experiência Tier 3',
      'Ganhe 350 XP + 40 PityCoins instantaneamente',
      250,
      '📦💎',
      'consumable',
      false
    );

    console.log('✅ Loja populada com sucesso! 6 itens adicionados.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao popular loja:', error);
    process.exit(1);
  }
}

seedShop();
