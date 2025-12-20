#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '11900');
const DB_NAME = process.env.DB_NAME || 'levelbot';
const DB_USER = process.env.DB_USER || 'levelbot';
const DB_PASSWORD = process.env.DB_PASSWORD || 'levelbot123';

const BACKUP_DIR = './data/backups';

/**
 * Script para restaurar automaticamente o backup mais recente
 * Útil para setup inicial do container Docker
 */

function log(message, type = 'info') {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warning: '⚠️'
  };
  console.log(`${icons[type] || '•'} ${message}`);
}

function getLatestBackup() {
  if (!fs.existsSync(BACKUP_DIR)) {
    return null;
  }
  
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('levelbot_') && (f.endsWith('.sql') || f.endsWith('.sql.gz')))
    .sort()
    .reverse();
  
  return files.length > 0 ? files[0] : null;
}

async function restoreLatestBackup() {
  try {
    const latestBackup = getLatestBackup();
    
    if (!latestBackup) {
      log('Nenhum backup encontrado. Usando database vazia.', 'info');
      return;
    }
    
    const backupPath = path.join(BACKUP_DIR, latestBackup);
    log(`Restaurando backup: ${latestBackup}`);
    
    // Aguardar a database estar pronta
    let attempts = 0;
    const maxAttempts = 30;
    
    while (attempts < maxAttempts) {
      try {
        execSync(`PGPASSWORD="${DB_PASSWORD}" psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d postgres -c "SELECT 1" 2>/dev/null`, {
          stdio: 'pipe'
        });
        log('Database pronta para restauração', 'success');
        break;
      } catch (err) {
        attempts++;
        if (attempts < maxAttempts) {
          log(`Aguardando database ficar pronta... (${attempts}/${maxAttempts})`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    if (attempts >= maxAttempts) {
      throw new Error('Database não ficou pronta a tempo');
    }
    
    // Descomprimir se necessário
    let sqlFile = backupPath;
    if (backupPath.endsWith('.gz')) {
      log('Descomprimindo arquivo de backup...');
      const uncompressedFile = backupPath.slice(0, -3);
      execSync(`gunzip -c "${backupPath}" > "${uncompressedFile}"`);
      sqlFile = uncompressedFile;
    }
    
    // Restaurar
    log('Restaurando dados na database...');
    const sqlData = fs.readFileSync(sqlFile, 'utf-8');
    
    const env = { ...process.env, PGPASSWORD: DB_PASSWORD };
    const psqlProcess = execSync(`PGPASSWORD="${DB_PASSWORD}" psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME}`, {
      input: sqlData,
      encoding: 'utf-8',
      env: env,
      stdio: 'pipe'
    });
    
    log('Restauração concluída com sucesso!', 'success');
    
    // Limpar arquivo descomprimido
    if (backupPath.endsWith('.gz')) {
      fs.unlinkSync(sqlFile);
    }
    
  } catch (error) {
    log(`Erro ao restaurar backup: ${error.message}`, 'error');
    log('Continuando com database vazia...', 'warning');
  }
}

// Executar
restoreLatestBackup().catch(error => {
  log(`Erro fatal: ${error.message}`, 'error');
  process.exit(1);
});