# Guia de Migrações do Level Bot

## ⚠️ Informação Crítica

**Esta aplicação usa NestJS com Drizzle ORM. As tabelas já estão definidas e sincronizadas com o banco de dados.**

Os scripts de migração neste diretório são **únicos para bots existentes que precisam atualizar seu esquema** de forma segura sem sobrescrever dados.

## Scripts Essenciais

### `migrate-all.js` ⭐ **RECOMENDADO**

Execute para atualizar um banco de dados existente com o novo esquema (adiciona tabelas de economia, VIP, badges, etc.):

```bash
npm run migrate:all
```

**O que faz:**
- ✅ Cria tabelas se não existirem (`IF NOT EXISTS`)
- ✅ Adiciona colunas faltantes (`ADD COLUMN IF NOT EXISTS`)
- ✅ Cria índices para performance
- ✅ **PRESERVA todos os registros existentes** (sem DELETE)

**Quando usar:**
- Primeira vez configurando uma nova instância do bot
- Atualizando um bot existente com novos recursos
- Sincronizando banco de dados com novo schema

---

## Scripts de Segurança (Backup/Restore)

### `backup-database.js`

Cria backup do banco de dados PostgreSQL:

```bash
npm run backup              # Criar backup novo
npm run backup:list        # Listar backups existentes
npm run backup:test        # Testar integridade do backup mais recente
npm run restore:latest     # Restaurar do backup mais recente
```

**Recomendação:** Execute `npm run backup` antes de qualquer migração em produção.

---

## Scripts Obsoletos (em `scripts/legacy/`)

Os seguintes scripts foram movidos para `scripts/legacy/` porque seus objetivos estão agora integrados no `migrate-all.js`:

- `migrate-economy.js` - Substituído por `migrate-all.js`
- `migrate-boosts.js` - Substituído por `migrate-all.js` (FIXO: removeu DELETE)
- `migrate-badges.js` - Substituído por `migrate-all.js`
- `migrate-vips.js` - Substituído por `migrate-all.js`
- `migrate-hidden-items.js` - Substituído por `migrate-all.js`
- `seed-badges.js` - Obsoleto (use `npm run seed` em vez disso)
- `test-economy.js` - Obsoleto (testes via NestJS)
- `query-commands.js` - Obsoleto (use Discord.js em vez disso)
- `fix-vip-tier.js` - Obsoleto (ajustes via admin commands)

**Se você precisar destes scripts para qualquer motivo legítimo, estão em `scripts/legacy/`.**

---

## Processo de Setup (Novo Bot)

1. **Clonar repositório:**
   ```bash
   git clone <repo>
   cd level-bot
   ```

2. **Instalar dependências:**
   ```bash
   npm install
   ```

3. **Configurar `.env`:**
   ```bash
   cp .env.example .env
   # Editar .env com seus tokens Discord, credenciais do banco, etc.
   ```

4. **Setup com Docker (recomendado):**
   ```bash
   docker compose up -d
   ```

5. **Ou setup manual (desenvolvimento):**
   ```bash
   # Certificar que PostgreSQL + Redis estão rodando
   npm run migrate:all    # Setup do banco de dados
   npm run seed           # Popular loja com itens
   npm run deploy         # Registrar commands no Discord
   npm run dev            # Iniciar bot em modo desenvolvimento
   ```

---

## Processo de Atualização (Bot Existente)

1. **Fazer backup do banco:**
   ```bash
   npm run backup
   ```

2. **Atualizar código:**
   ```bash
   git pull origin master
   npm install
   ```

3. **Executar migração:**
   ```bash
   npm run migrate:all    # Adiciona novas tabelas/colunas sem perder dados
   ```

4. **Atualizar loja (opcional):**
   ```bash
   npm run seed           # Adiciona novos itens se não existirem
   ```

5. **Registrar novos commands:**
   ```bash
   npm run deploy
   ```

6. **Reiniciar bot:**
   ```bash
   npm start
   ```

---

## Importância: Proteção de Dados

**Todos os scripts foram auditados para garantir:**

✅ Nenhum `DELETE` em tabelas de usuários  
✅ Uso de `CREATE TABLE IF NOT EXISTS`  
✅ Uso de `ADD COLUMN IF NOT EXISTS`  
✅ Índices criados apenas se não existirem  
✅ Dados históricos totalmente preservados  

**Se você escrever um novo script de migração, NUNCA faça:**

```javascript
// ❌ PROIBIDO - Sobrescreve dados!
await db.query('DELETE FROM items');
await db.query('DELETE FROM user_inventory');
```

**Em vez disso, sempre use:**

```javascript
// ✅ BOM - Apenas cria se não existe
await db.query('CREATE TABLE IF NOT EXISTS items (...)');
await db.query('INSERT INTO items (...) WHERE NOT EXISTS (...)');
```

---

## Troubleshooting

### Erro: "Column already exists"
Isso não é um erro! Os scripts usam `ADD COLUMN IF NOT EXISTS`, então é completamente seguro executá-los novamente.

### Erro: "Table already exists"
Também é seguro! Os scripts usam `CREATE TABLE IF NOT EXISTS`.

### Perdi dados!
Se acidentalmente executou um script que deletou dados:
1. Restaure do backup: `npm run restore:latest`
2. Abra uma issue relatando o problema

---

## Versionamento

- **NestJS Migration**: v2.0 (com Drizzle ORM e proteção de dados)
- **Compatibilidade**: Bots com Node.js v20+

Última atualização: 2026-03-28
