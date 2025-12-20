# 💾 Sistema de Backup & Restauração - Level Bot

Guia completo para fazer backup e restaurar a database do Level Bot.

## 📋 Visão Geral

O sistema de backup permite:
- ✅ Fazer backup completo da database
- ✅ Comprimir backups automaticamente (gzip)
- ✅ Restaurar de qualquer backup anterior
- ✅ Restauração automática ao iniciar container
- ✅ Log detalhado de todas as operações

## 🚀 Início Rápido

### Fazer Backup
```bash
npm run backup
```

Isso vai:
1. Exportar toda a database usando `pg_dump`
2. Comprimir o arquivo (gzip)
3. Salvar em `data/backups/levelbot_YYYY-MM-DD_HH-MM-SS.sql.gz`
4. Registrar a operação em `data/logs/backup.log`

### Listar Backups Disponíveis
```bash
npm run backup:list
```

Mostra todos os backups com:
- Nome do arquivo
- Tamanho (em MB)
- Data de criação

### Testar Conexão com Database
```bash
npm run backup:test
```

Verifica se a conexão com PostgreSQL está funcionando corretamente.

### Restaurar de um Backup
```bash
npm run restore <backup_filename>
```

**Exemplo:**
```bash
npm run restore levelbot_2025-12-15_14-30-45.sql.gz
```

⚠️ **Aviso:** A restauração vai **sobrescrever** todos os dados atuais!

### Restaurar Automaticamente (Último Backup)
```bash
npm run restore:latest
```

Restaura o backup mais recente automaticamente.

## 📁 Estrutura de Diretórios

```
level_bot/
├── data/
│   ├── backups/              # Arquivos de backup
│   │   ├── levelbot_2025-12-15_14-30-45.sql.gz
│   │   ├── levelbot_2025-12-15_13-15-20.sql.gz
│   │   └── ...
│   └── logs/
│       └── backup.log        # Log de todas operações
├── backup-database.js        # Script principal de backup/restore
├── restore-latest-backup.js  # Script de restauração automática
└── ...
```

## 🐳 Com Docker

### Fazer Backup (dentro do container)
```bash
docker exec level-bot npm run backup
```

### Restaurar (dentro do container)
```bash
docker exec level-bot npm run restore levelbot_2025-12-15_14-30-45.sql.gz
```

### Restauração Automática ao Iniciar

Adicione ao seu `docker-compose.yml`:

```yaml
level-bot:
  # ... outras configurações ...
  entrypoint: 
    - sh
    - -c
    - |
      npm run restore:latest || true
      node src/index.js
```

Isso vai tentar restaurar o último backup ao iniciar. Se não houver backup, continua com database vazia.

## 📊 Exemplo de Workflow

### Antes de Atualizar o Bot

1. **Fazer backup:**
   ```bash
   npm run backup
   ```

2. **Verificar que foi salvo:**
   ```bash
   npm run backup:list
   ```

3. **Atualizar o código:**
   ```bash
   git pull origin main
   npm install
   npm run deploy
   ```

4. **Reiniciar o bot:**
   ```bash
   docker compose down
   docker compose up -d
   ```

5. **Se algo der errado, restaurar:**
   ```bash
   npm run restore levelbot_2025-12-15_14-30-45.sql.gz
   docker compose restart level-bot
   ```

## 🔧 Configuração

Os scripts usam as variáveis de ambiente do `.env`:

```env
DB_HOST=localhost
DB_PORT=11900
DB_NAME=levelbot
DB_USER=levelbot
DB_PASSWORD=levelbot123
```

Se estiver usando valores diferentes, atualize o `.env`.

## 📝 Log de Operações

Todos as operações são registradas em `data/logs/backup.log`:

```
[2025-12-15T14:30:45.123Z] [INFO] 🔄 Iniciando backup da database "levelbot"...
[2025-12-15T14:30:50.456Z] [SUCCESS] 📦 Tamanho do backup: 12.45 MB
[2025-12-15T14:30:50.789Z] [SUCCESS] 💾 Localização: ./data/backups/levelbot_2025-12-15_14-30-45.sql.gz
```

## 🆘 Troubleshooting

### Erro: "pg_dump not found"
Instale o PostgreSQL client:
```bash
# Linux (Ubuntu/Debian)
sudo apt-get install postgresql-client

# macOS
brew install postgresql

# Windows
# Baixe de https://www.postgresql.org/download/windows/
```

### Erro: "PGPASSWORD not recognized"
Certifique-se de que a variável está configurada corretamente no `.env`.

### Erro: "Database connection refused"
Verifique se:
1. PostgreSQL está rodando: `npm run backup:test`
2. Host/Port estão corretos no `.env`
3. Credenciais estão corretas

### Arquivo de backup muito grande
Os backups são comprimidos automaticamente com gzip. Para economizar mais espaço:

```bash
# Remover backups antigos manualmente
rm ./data/backups/levelbot_2025-12-01*.sql.gz
```

## 💡 Dicas

### Backup Automático com Cron (Linux/macOS)

Adicione ao seu crontab:

```bash
crontab -e
```

E adicione a linha:

```
# Fazer backup diariamente às 3 da manhã
0 3 * * * cd /home/pedro/projetos/level_bot && npm run backup >> /dev/null 2>&1
```

### Backup para Cloud (AWS S3, Google Cloud, etc)

Após fazer o backup, você pode fazer upload:

```bash
# Exemplo com AWS S3
aws s3 cp data/backups/levelbot_*.sql.gz s3://seu-bucket/backups/
```

### Manter apenas últimos N backups

Script para limpar backups antigos:

```bash
# Manter apenas os últimos 7 backups
cd data/backups
ls -t levelbot_*.sql.gz | tail -n +8 | xargs rm -f
```

## 📌 Notas Importantes

- **Espaço em disco:** Cada backup geralmente ocupa 10-50 MB (comprimido)
- **Tempo de backup:** Depende do tamanho da database (geralmente < 1 minuto)
- **Tempo de restauração:** Geralmente 1-5 minutos
- **Backups são incrementais?** Não, cada backup é completo
- **Posso restaurar em outra database?** Sim, basta alterar `DB_NAME` no `.env`

## 🔐 Segurança

- ⚠️ Os arquivos de backup contêm dados da database
- ⚠️ Nunca compartilhe arquivos `.sql` publicamente
- ✅ Armazene backups em local seguro
- ✅ Considere criptografar backups em produção

## 📞 Suporte

Para problemas ou dúvidas, verifique:
1. `data/logs/backup.log` para mais detalhes
2. PostgreSQL está rodando: `docker exec levelbot-postgres psql -U levelbot -d levelbot -c "SELECT 1"`
3. Permissões de arquivo: `ls -la data/backups/`