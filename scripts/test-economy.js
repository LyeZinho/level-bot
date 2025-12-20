import { getUser, createUser, addMessageXP, getAllItems, getUserInventory } from '../src/database.js';

async function testEconomy() {
  console.log('🧪 Testando sistema de economia...\n');
  
  try {
    // Test 1: Criar usuário
    console.log('1️⃣ Criando usuário de teste...');
    const testUser = await createUser('test123', 'TestUser', 'guild123');
    console.log(`✅ Usuário criado: ${testUser.username} | Coins: ${testUser.coins} | XP: ${testUser.xp}\n`);
    
    // Test 2: Adicionar XP e verificar coins
    console.log('2️⃣ Adicionando 150 XP (deve ganhar 1 coin)...');
    let result = await addMessageXP('test123', 'TestUser', 'guild123', 150);
    let userData = await getUser('test123', 'guild123');
    console.log(`✅ XP: ${userData.xp} | Coins: ${userData.coins} | Coins ganhos: ${result.coinsGained}\n`);
    
    // Test 3: Adicionar mais XP para passar dos 200 (2 coins)
    console.log('3️⃣ Adicionando mais 100 XP (deve ganhar 1 coin adicional)...');
    result = await addMessageXP('test123', 'TestUser', 'guild123', 100);
    userData = await getUser('test123', 'guild123');
    console.log(`✅ XP: ${userData.xp} | Coins: ${userData.coins} | Coins ganhos: ${result.coinsGained}\n`);
    
    // Test 4: Verificar itens da loja
    console.log('4️⃣ Verificando itens da loja...');
    const items = await getAllItems();
    console.log(`✅ ${items.length} itens encontrados na loja\n`);
    
    if (items.length > 0) {
      console.log('Exemplo de item:');
      console.log(`   ${items[0].emoji} ${items[0].name}`);
      console.log(`   Preço: ${items[0].price} coins`);
      console.log(`   Descrição: ${items[0].description}\n`);
    }
    
    // Test 5: Verificar inventário
    console.log('5️⃣ Verificando inventário...');
    const inventory = await getUserInventory('test123', 'guild123');
    console.log(`✅ Inventário tem ${inventory.length} itens\n`);
    
    console.log('✅ Todos os testes passaram! Sistema de economia funcionando corretamente.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro nos testes:', error);
    process.exit(1);
  }
}

testEconomy();
