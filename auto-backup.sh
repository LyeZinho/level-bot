#!/bin/bash

# Script de Backup Automático - Level Bot
# Execute este script periodicamente (via cron, scheduler, etc)
# Exemplo: 0 3 * * * /home/pedro/projetos/level_bot/auto-backup.sh

set -e

PROJECT_DIR="/home/pedro/projetos/level_bot"
BACKUP_DIR="$PROJECT_DIR/data/backups"
LOG_FILE="$PROJECT_DIR/data/logs/auto-backup.log"

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
    local message="[$timestamp] $1"
    echo -e "$message" | tee -a "$LOG_FILE"
}

# Função de erro
error() {
    echo -e "${RED}❌ Erro: $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

# Função de sucesso
success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

# Função de aviso
warning() {
    echo -e "${YELLOW}⚠️ $1${NC}" | tee -a "$LOG_FILE"
}

log "═══════════════════════════════════════════════════════════════"
log "Iniciando backup automático da database Level Bot"
log "═══════════════════════════════════════════════════════════════"

# Navegar para diretório do projeto
cd "$PROJECT_DIR" || error "Não foi possível navegar para $PROJECT_DIR"

# Fazer backup
log "🔄 Fazendo backup da database..."
npm run backup >> "$LOG_FILE" 2>&1 || error "Erro ao fazer backup"

# Listar backups
log ""
log "📋 Backups disponíveis:"
npm run backup:list >> "$LOG_FILE" 2>&1 || warning "Erro ao listar backups"

# Limpeza de backups antigos (manter apenas últimos 7)
log ""
log "🧹 Limpando backups antigos (mantendo últimos 7)..."
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/levelbot_*.sql.gz 2>/dev/null | wc -l)

if [ "$BACKUP_COUNT" -gt 7 ]; then
    OLD_BACKUPS=$(ls -1t "$BACKUP_DIR"/levelbot_*.sql.gz | tail -n +8)
    while IFS= read -r backup; do
        log "Removendo backup antigo: $(basename "$backup")"
        rm -f "$backup"
    done <<< "$OLD_BACKUPS"
    success "Limpeza concluída"
else
    log "Nenhuma limpeza necessária ($BACKUP_COUNT backups)"
fi

log ""
success "Backup automático concluído com sucesso!"
log "═══════════════════════════════════════════════════════════════"