import { getExpiredVips, deactivateVip } from '../database.js';

/**
 * Worker que verifica e desativa VIPs expirados diariamente
 * @param {object} client - Discord client
 * @param {number} intervalMs - Intervalo em ms (padrão: 1 hora)
 */
export function startVipWorker(client, intervalMs = 60 * 60 * 1000) {
  async function checkExpiredVips() {
    try {
      const expiredVips = await getExpiredVips();
      
      if (expiredVips && expiredVips.length > 0) {
        console.log(`🔄 Encontrados ${expiredVips.length} Boost VIPs expirados`);
        
        for (const vip of expiredVips) {
          try {
            // Desativar VIP no banco
            await deactivateVip(vip.user_id, vip.guild_id);
            
            // Tentar remover cargo se houver
            if (vip.role_id && client) {
              try {
                const guild = await client.guilds.fetch(vip.guild_id);
                const member = await guild.members.fetch(vip.user_id);
                const role = await guild.roles.fetch(vip.role_id);
                
                if (member && role) {
                  await member.roles.remove(role);
                  console.log(`✅ Cargo VIP removido de ${member.user.tag}`);
                }
              } catch (roleError) {
                console.log(`⚠️ Não foi possível remover cargo: ${roleError.message}`);
              }
            }
            
            // Tentar notificar usuário
            if (client) {
              try {
                const user = await client.users.fetch(vip.user_id);
                const guild = await client.guilds.fetch(vip.guild_id);
                
                await user.send({
                  content: `⏰ Seu **Boost VIP ${vip.tier.toUpperCase()}** no servidor **${guild.name}** expirou.\n\n` +
                    `Obrigado por ser VIP! Para renovar, entre em contato com a administração.`
                });
              } catch (dmError) {
                console.log(`⚠️ Não foi possível enviar DM: ${dmError.message}`);
              }
            }
            
            console.log(`✅ Boost VIP ${vip.tier} desativado para user ${vip.user_id} no guild ${vip.guild_id}`);
            
          } catch (error) {
            console.error(`❌ Erro ao desativar VIP:`, error);
          }
        }
        
        console.log(`✅ Processamento de VIPs expirados concluído`);
      } else {
        console.log('✅ Nenhum VIP expirado encontrado');
      }
    } catch (error) {
      console.error('❌ Erro ao verificar VIPs expirados:', error);
    }
  }

  // Executar imediatamente e depois no intervalo
  checkExpiredVips();
  const id = setInterval(checkExpiredVips, intervalMs);

  // Retornar função para parar o worker
  const stop = () => clearInterval(id);
  return { stop };
}
