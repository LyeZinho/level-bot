# 🚀 Guia Rápido de Backup - Level Bot

## ⚡ Comandos Principais

### 1️⃣ Fazer Backup
```bash
npm run backup
```
- ✅ Exporta toda a database
- ✅ Comprime automaticamente
- ✅ Salva em `data/backups/`

### 2️⃣ Listar Backups
```bash
npm run backup:list
```
Mostra todos os backups com tamanho e data.

### 3️⃣ Restaurar de um Backup
```bash
npm run restore levelbot_2025-12-15_00-27_00-27-50.sql.gz
```
⚠️ Vai sobrescrever todos os dados!

### 4️⃣ Restaurar o Último Backup
```bash
npm run restore:latest
```

### 5️⃣ Testar Conexão
```bash
npm run backup:test
```

## 📋 Fluxo Recomendado

### Antes de Atualizar o Bot

1. **Fazer backup:**
   ```bash
   npm run backup
   ```

2. **Verificar tamanho:**
   ```bash
   npm run backup:list
   ```

3. **Atualizar o código:**
   ```bash
   git pull
   npm install
   npm run deploy
   ```

4. **Reiniciar:**
   ```bash
   docker compose down
   docker compose up -d
   ```

### Se Algo Dar Errado

1. **Listar backups:**
   ```bash
   npm run backup:list
   ```

2. **Restaurar:**
   ```bash
   npm run restore levelbot_2025-12-15_00-27_00-27-50.sql.gz
   ```

3. **Reiniciar o bot:**
   ```bash
   docker compose restart level-bot
   ```

## 📁 Arquivos Criados

| Arquivo | Descrição |
|---------|-----------|
| `backup-database.js` | Script principal de backup/restore |
| `restore-latest-backup.js` | Script de restauração automática |
| `BACKUP_GUIDE.md` | Guia completo (mais detalhes) |
| `data/backups/` | Pasta com arquivos de backup |
| `data/logs/backup.log` | Log de todas operações |

## 🐳 Com Docker

```bash
# Fazer backup dentro do container
docker exec level-bot npm run backup

# Listar backups
docker exec level-bot npm run backup:list

# Restaurar
docker exec level-bot npm run restore levelbot_2025-12-15_00-27_00-27-50.sql.gz
```

## 💡 Dicas

- 🗜️ Backups são comprimidos automaticamente (ocupam ~100KB)
- ⚡ Operações rápidas (< 1 minuto)
- 📅 Cada backup tem timestamp
- 📝 Tudo é logado em `data/logs/backup.log`

## ❓ Precisa de Ajuda?

Veja o arquivo `BACKUP_GUIDE.md` para:
- Configurações avançadas
- Troubleshooting
- Backup automático com cron
- Upload para cloud
