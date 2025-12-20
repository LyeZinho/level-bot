# 🎮 Sistema de Economia - Guia Visual Rápido

```
┌─────────────────────────────────────────────────────────────┐
│                    💰 PITYCOINS SYSTEM                      │
│                Level Bot - Economy Update                    │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────── GANHO DE COINS ────────────────────────┐
│                                                                 │
│  📈 AUTOMÁTICO (via XP)                                        │
│  ├─ Enviar mensagens: 15-25 XP/msg (cooldown 60s)            │
│  ├─ Tempo de voz: 1 XP/minuto                                 │
│  └─ Conversão: 1 PityCoin a cada 100 XP                       │
│                                                                 │
│  🎁 RECOMPENSA DIÁRIA                                          │
│  └─ 100 PityCoins/dia com /daily                              │
│                                                                 │
│  💸 TRANSFERÊNCIAS                                             │
│  └─ Receber de outros usuários                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────── COMANDOS SLASH ─────────────────────────┐
│                                                                 │
│  💰 ECONOMIA                                                   │
│  ├─ /coins [@usuario]         → Ver saldo                     │
│  ├─ /daily                    → Recompensa diária (100 coins) │
│  └─ /transfer @user <qtd>     → Transferir coins              │
│                                                                 │
│  🏪 LOJA & INVENTÁRIO                                          │
│  ├─ /shop                     → Ver itens à venda             │
│  ├─ /buy <item> [qtd]         → Comprar item                  │
│  ├─ /inventory [@usuario]     → Ver inventário                │
│  └─ /use <item>               → Usar item                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌────────────────────── COMANDOS PREFIX ─────────────────────────┐
│                                                                 │
│  !coins / !balance / !bal     → Ver saldo                     │
│  !daily / !diaria             → Recompensa diária             │
│  !shop / !loja                → Ver loja                      │
│  !inventory / !inv            → Ver inventário                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌───────────────────── ITENS DA LOJA ────────────────────────────┐
│                                                                 │
│  🧪 Poção de XP              250 coins  │ +500 XP             │
│  ⚡ Multiplicador 2x          500 coins  │ Dobra XP por 1h     │
│  📦 Caixa Misteriosa         150 coins  │ Item aleatório      │
│  🏅 Badge Raro              1000 coins  │ Badge especial      │
│  🎟️ Ticket VIP               750 coins  │ Acesso VIP 7 dias   │
│  🎁 Kit Iniciante            100 coins  │ 100 XP + 50 coins   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────── SETUP RÁPIDO ───────────────────────────┐
│                                                                 │
│  🆕 INSTALAÇÃO NOVA                                            │
│  1. npm install                                                │
│  2. npm run deploy                                             │
│  3. npm run seed                                               │
│  4. npm start                                                  │
│                                                                 │
│  🔄 ATUALIZAR BOT EXISTENTE                                    │
│  1. npm run migrate    ⚠️ IMPORTANTE                           │
│  2. npm run seed                                               │
│  3. npm run deploy                                             │
│  4. npm start                                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌────────────────────── FLUXO DO USUÁRIO ────────────────────────┐
│                                                                 │
│  1. 💬 Enviar Mensagens                                        │
│     └─> Ganhar XP                                              │
│         └─> Ganhar Coins automaticamente                       │
│                                                                 │
│  2. 🎁 /daily                                                  │
│     └─> +100 coins/dia                                         │
│                                                                 │
│  3. 🏪 /shop                                                   │
│     └─> Ver itens disponíveis                                  │
│         └─> /buy <item>                                        │
│             └─> Item adicionado ao inventário                   │
│                                                                 │
│  4. 🎒 /inventory                                              │
│     └─> Ver seus itens                                         │
│         └─> /use <item>                                        │
│             └─> Aplicar efeito do item                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────── SCRIPTS NPM ────────────────────────────┐
│                                                                 │
│  npm start           │ Iniciar bot (produção)                 │
│  npm run dev         │ Iniciar com auto-reload                │
│  npm run deploy      │ Registrar comandos no Discord          │
│  npm run migrate     │ Migrar banco de dados                  │
│  npm run seed        │ Popular loja com itens                 │
│  npm run test:economy│ Testar sistema de economia             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌───────────────────── TROUBLESHOOTING ──────────────────────────┐
│                                                                 │
│  ❌ Error: column "coins" does not exist                       │
│  ✅ Solução: npm run migrate                                   │
│                                                                 │
│  ❌ Loja está vazia                                            │
│  ✅ Solução: npm run seed                                      │
│                                                                 │
│  ❌ Comandos não aparecem no Discord                           │
│  ✅ Solução: npm run deploy (aguarde até 1h)                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────── ARQUITETURA ───────────────────────────┐
│                                                                 │
│  DATABASE (PostgreSQL)                                         │
│  ├─ users                    (com coins e last_daily_claim)   │
│  ├─ items                    (loja de itens)                   │
│  └─ user_inventory           (inventário dos usuários)         │
│                                                                 │
│  COMMANDS                                                       │
│  ├─ src/commands/            (slash commands)                  │
│  └─ src/prefixCommands/      (prefix commands)                 │
│                                                                 │
│  LOGIC                                                          │
│  └─ src/database.js          (funções de economia)             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────── DOCUMENTAÇÃO ──────────────────────────┐
│                                                                 │
│  📖 README.md         │ Guia principal                         │
│  📖 ECONOMY.md        │ Sistema de economia detalhado          │
│  📖 EXAMPLES.md       │ Exemplos práticos                      │
│  📖 IMPLEMENTATION.md │ Detalhes da implementação              │
│  📖 QUICKSTART.md     │ Este guia visual (você está aqui!)    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌────────────────────── STATUS DA IMPLEMENTAÇÃO ─────────────────┐
│                                                                 │
│  ✅ Banco de dados migrado                                     │
│  ✅ Sistema de coins funcionando                               │
│  ✅ Loja implementada                                          │
│  ✅ Inventário funcionando                                     │
│  ✅ Comandos slash criados (10 novos)                          │
│  ✅ Comandos prefix criados (4 novos)                          │
│  ✅ Testes passando                                            │
│  ✅ Documentação completa                                      │
│  ✅ Scripts de setup prontos                                   │
│                                                                 │
│  🎉 SISTEMA 100% FUNCIONAL E PRONTO PARA USO!                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

                        Made with ❤️ for Level Bot
                    Economia implementada com sucesso!
