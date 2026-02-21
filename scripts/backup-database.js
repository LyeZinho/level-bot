#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync, spawn } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Backup Database Script - Enhancements
 * - Verifica dependências (pg_dump/psql) e faz fallback via Docker se necessário
 * - Retries com backoff exponencial (env: BACKUP_MAX_RETRIES, BACKUP_RETRY_BASE_MS)
 * - Rotação de backups mantendo BACKUPS_KEEP arquivos (env)
 * - Lockfile para evitar execuções concorrentes (./data/backups/backup.lock)
 * - Timeouts configuráveis (env: BACKUP_COMMAND_TIMEOUT_MS)
 * - Nome do container Docker configurável via DOCKER_PG_CONTAINER
 * - Auto-restore via env: AUTO_RESTORE_BACKUP=nome_do_backup.sql.gz
 */

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '11900';
const DB_NAME = process.env.DB_NAME || 'levelbot';
const DB_USER = process.env.DB_USER || 'levelbot';
const DB_PASSWORD = process.env.DB_PASSWORD || 'levelbot123';

const BACKUP_DIR = './data/backups';
const BACKUP_LOGS_DIR = './data/logs';
const BACKUP_LOCKFILE = path.join(BACKUP_DIR, 'backup.lock');
const BACKUPS_KEEP = parseInt(process.env.BACKUPS_KEEP || '7', 10);
const MAX_RETRIES = parseInt(process.env.BACKUP_MAX_RETRIES || '3', 10);
const RETRY_BASE_MS = parseInt(process.env.BACKUP_RETRY_BASE_MS || '2000', 10);
const DOCKER_PG_CONTAINER = process.env.DOCKER_PG_CONTAINER || 'levelbot-postgres';
const COMMAND_TIMEOUT_MS = parseInt(process.env.BACKUP_COMMAND_TIMEOUT_MS || '120000', 10);
const AUTO_RESTORE_BACKUP = process.env.AUTO_RESTORE_BACKUP || null; // timeout padrão (ms)


// Criar diretórios se não existirem
function ensureDirectories() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`📁 Diretório criado: ${BACKUP_DIR}`);
  }
  if (!fs.existsSync(BACKUP_LOGS_DIR)) {
    fs.mkdirSync(BACKUP_LOGS_DIR, { recursive: true });
  }
}

// Gerar timestamp para filename
function getTimestamp() {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').split('T').join('_').split('-').splice(0, 4).join('-') + '_' + 
         now.toISOString().split('T')[1].split(':').join('-').split('.')[0];
}

// Logging avançado com níveis
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const logFile = path.join(BACKUP_LOGS_DIR, 'backup.log');
  const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}\n`;

  const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' };
  console.log(`${icons[type] || '•'} ${message}`);
  try { fs.appendFileSync(logFile, logMessage); } catch (e) { console.error('❌ Falha ao escrever log:', e.message); }
}

// Checar se um comando existe no PATH local
function commandExists(cmd) {
  try {
    execSync(`command -v ${cmd}`, { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

// Checar se container Docker está rodando
function dockerContainerExists(container) {
  try {
    const out = execSync(`docker ps -q -f name=${container}`, { encoding: 'utf-8' });
    return out.trim().length > 0;
  } catch (e) {
    return false;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Executa um comando com retries e backoff exponencial
async function runCommandWithRetries(command, options = {}) {
  const maxAttempts = options.maxAttempts || MAX_RETRIES;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const stdout = execSync(command, { encoding: 'utf-8', timeout: options.timeout || COMMAND_TIMEOUT_MS });
      return { success: true, stdout };
    } catch (err) {
      const isLast = attempt === maxAttempts;
      const waitMs = RETRY_BASE_MS * Math.pow(2, attempt - 1);
      log(`Tentativa ${attempt} falhou: ${err.message}${isLast ? '' : ` — tentando novamente em ${waitMs}ms...`}`, isLast ? 'error' : 'warning');
      if (isLast) return { success: false, error: err };
      await sleep(waitMs);
    }
  }
}

// Lockfile para evitar execuções concorrentes
function acquireLock() {
  try {
    const fd = fs.openSync(BACKUP_LOCKFILE, 'wx'); // falha se já existe
    fs.writeSync(fd, `${process.pid}\n`);
    return fd;
  } catch (err) {
    if (err.code === 'EEXIST') return null;
    throw err;
  }
}

function releaseLock(fd) {
  try {
    if (fd) fs.closeSync(fd);
  } catch (e) {}
  try { if (fs.existsSync(BACKUP_LOCKFILE)) fs.unlinkSync(BACKUP_LOCKFILE); } catch (e) {}
}

// Rotacionar backups mantendo apenas os últimos N arquivos
function rotateBackups(dir, keep = BACKUPS_KEEP) {
  try {
    const files = fs.readdirSync(dir)
      .filter(f => f.startsWith('levelbot_') && (f.endsWith('.sql') || f.endsWith('.sql.gz')))
      .map(f => ({ name: f, time: fs.statSync(path.join(dir, f)).mtime.getTime() }))
      .sort((a, b) => b.time - a.time);

    const toRemove = files.slice(keep);
    for (const f of toRemove) {
      const p = path.join(dir, f.name);
      try { fs.unlinkSync(p); log(`Arquivo de backup antigo removido: ${f.name}`, 'info'); } catch (e) { log(`Falha ao remover ${f.name}: ${e.message}`, 'warning'); }
    }
  } catch (e) {
    log(`Erro ao rotacionar backups: ${e.message}`, 'warning');
  }
}

// Tenta conectar com psql (local ou via docker) com retries
async function testConnectionWithRetries() {
  // Preferir psql local se existir
  if (commandExists('psql')) {
    const cmd = `PGPASSWORD="${DB_PASSWORD}" psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -c "SELECT version();"`;
    return runCommandWithRetries(cmd, { timeout: COMMAND_TIMEOUT_MS });
  }

  // Fallback: tentar via docker container
  if (commandExists('docker') && dockerContainerExists(DOCKER_PG_CONTAINER)) {
    const cmd = `docker exec -i ${DOCKER_PG_CONTAINER} sh -c 'PGPASSWORD="${DB_PASSWORD}" psql -U ${DB_USER} -d ${DB_NAME} -c "SELECT version();"'`;
    return runCommandWithRetries(cmd, { timeout: COMMAND_TIMEOUT_MS });
  }

  return { success: false, error: new Error('psql não encontrado e fallback docker indisponível') };
}

// Fazer backup da database com retries, lock e fallback docker
async function backupDatabase() {
  let lockFd = null;
  try {
    ensureDirectories();

    // Lock para evitar execuções concorrentes
    lockFd = acquireLock();
    if (!lockFd) {
      log('Já existe um backup em andamento. Abortando.', 'error');
      throw new Error('backup_in_progress');
    }

    const timestamp = getTimestamp();
    const backupFile = path.join(BACKUP_DIR, `levelbot_${timestamp}.sql`);
    const backupFileGz = `${backupFile}.gz`;

    log(`🔄 Iniciando backup da database "${DB_NAME}"...`);

    // Escolher comando pg_dump: local ou docker fallback
    let dumpCmd = null;

    if (commandExists('pg_dump')) {
      dumpCmd = `PGPASSWORD="${DB_PASSWORD}" pg_dump -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} --verbose`;
      log('Usando pg_dump local', 'info');
    } else if (commandExists('docker') && dockerContainerExists(DOCKER_PG_CONTAINER)) {
      dumpCmd = `docker exec -i ${DOCKER_PG_CONTAINER} sh -c 'PGPASSWORD="${DB_PASSWORD}" pg_dump -U ${DB_USER} -d ${DB_NAME} --verbose'`;
      log(`pg_dump não encontrado localmente — usando docker exec em ${DOCKER_PG_CONTAINER}`, 'warning');
    } else {
      throw new Error('pg_dump não disponível localmente nem via docker');
    }

    const res = await runCommandWithRetries(dumpCmd, { timeout: COMMAND_TIMEOUT_MS });
    if (!res.success) {
      throw res.error || new Error('pg_dump falhou após tentativas');
    }

    // Salvar arquivo SQL
    fs.writeFileSync(backupFile, res.stdout);
    log(`📝 Arquivo SQL criado: ${backupFile}`);

    // Comprimir o arquivo
    try {
      execSync(`gzip -9 "${backupFile}"`);
      log(`🗜️ Arquivo comprimido: ${backupFileGz}`);

      const stats = fs.statSync(backupFileGz);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

      log(`✅ Backup concluído com sucesso!`, 'success');
      log(`📦 Tamanho do backup: ${sizeMB} MB`, 'success');
      log(`💾 Localização: ${backupFileGz}`, 'success');

      // Rotacionar backups antigos
      rotateBackups(BACKUP_DIR, BACKUPS_KEEP);

      return backupFileGz;
    } catch (err) {
      log(`Erro ao comprimir arquivo: ${err.message}`, 'error');
      // Mesmo sem compressão, tentar rotacionar e retornar arquivo
      rotateBackups(BACKUP_DIR, BACKUPS_KEEP);
      return backupFile;
    }
  } catch (error) {
    log(`Erro ao fazer backup: ${error.message}`, 'error');
    throw error;
  } finally {
    // Liberar lock
    releaseLock(lockFd);
  }
}

// Restaurar database de um backup
async function restoreDatabase(backupPath) {
  try {
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Arquivo de backup não encontrado: ${backupPath}`);
    }
    
    log(`🔄 Iniciando restauração da database de: ${backupPath}...`);
    
    let sqlFile = backupPath;
    
    // Se é um arquivo .gz, descomprimir primeiro
    if (backupPath.endsWith('.gz')) {
      const uncompressedFile = backupPath.slice(0, -3);
      log(`📦 Descomprimindo arquivo...`);
      
      const gunzipCommand = `gunzip -c "${backupPath}" > "${uncompressedFile}"`;
      execSync(gunzipCommand);
      sqlFile = uncompressedFile;
      log(`✅ Arquivo descomprimido`);
    }
    
    // Ler o arquivo SQL
    const sqlData = fs.readFileSync(sqlFile, 'utf-8');
    
    // Restaurar usando psql - local ou via docker
    log(`📥 Restaurando dados na database...`);
    
    let restoreCommand;
    let useDocker = false;
    
    if (commandExists('psql')) {
      restoreCommand = `PGPASSWORD="${DB_PASSWORD}" psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME}`;
    } else if (commandExists('docker') && dockerContainerExists(DOCKER_PG_CONTAINER)) {
      restoreCommand = `docker exec -i ${DOCKER_PG_CONTAINER} sh -c 'PGPASSWORD="${DB_PASSWORD}" psql -U ${DB_USER} -d ${DB_NAME}'`;
      useDocker = true;
      log('psql não encontrado localmente — usando docker exec', 'info');
    } else {
      throw new Error('psql não disponível localmente nem via docker');
    }
    
    return new Promise((resolve, reject) => {
      const psqlProcess = spawn('bash', ['-c', restoreCommand], {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      psqlProcess.stdin.write(sqlData);
      psqlProcess.stdin.end();
      
      let errorData = '';
      
      psqlProcess.stderr.on('data', (data) => {
        const message = data.toString();
        if (!message.includes('Warning')) {
          errorData += message;
        }
        process.stdout.write('.');
      });
      
      psqlProcess.on('close', (code) => {
        if (code === 0) {
          log(`✅ Restauração concluída com sucesso!`, 'success');
          resolve();
          
          // Limpar arquivo temporário se foi descomprimido
          if (backupPath.endsWith('.gz')) {
            fs.unlinkSync(sqlFile);
          }
        } else {
          reject(new Error(`psql falhou com código ${code}: ${errorData}`));
        }
      });
    });
  } catch (error) {
    log(`Erro ao restaurar backup: ${error.message}`, 'error');
    throw error;
  }
}

// Listar backups disponíveis
function listBackups() {
  ensureDirectories();
  
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('levelbot_') && (f.endsWith('.sql') || f.endsWith('.sql.gz')))
    .sort()
    .reverse();
  
  if (files.length === 0) {
    console.log('❌ Nenhum backup encontrado no diretório:', BACKUP_DIR);
    return [];
  }
  
  console.log(`\n📋 Backups disponíveis (${files.length}):\n`);
  files.forEach((file, index) => {
    const filePath = path.join(BACKUP_DIR, file);
    const stats = fs.statSync(filePath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    const date = new Date(stats.mtime);
    
    console.log(`  ${index + 1}. ${file}`);
    console.log(`     📦 Tamanho: ${sizeMB} MB`);
    console.log(`     📅 Data: ${date.toLocaleString('pt-BR')}\n`);
  });
  
  return files;
}

// Menu interativo
async function interactiveMenu() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║              BACKUP & RESTORE MANAGER - LEVEL BOT            ║
╚══════════════════════════════════════════════════════════════╝
`);
  
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Modo de uso:');
    console.log('  node backup-database.js backup      - Fazer backup da database');
    console.log('  node backup-database.js restore     - Restaurar de um backup');
    console.log('  node backup-database.js list        - Listar backups disponíveis');
    console.log('  node backup-database.js test        - Testar conexão com database\n');
    process.exit(0);
  }
  
  const command = args[0].toLowerCase();
  
  switch (command) {
    case 'backup':
      await backupDatabase();
      break;
      
    case 'restore':
      listBackups();
      
      if (args.length < 2) {
        console.log('\n⚠️ Specify which backup to restore:');
        console.log('  node backup-database.js restore <backup_filename>\n');
        console.log('Example:');
        const files = fs.readdirSync(BACKUP_DIR).filter(f => f.startsWith('levelbot_')).slice(0, 1);
        if (files.length > 0) {
          console.log(`  node backup-database.js restore ${files[0]}\n`);
        }
        process.exit(1);
      }
      
      const backupFile = args[1];
      const backupPath = path.join(BACKUP_DIR, backupFile);
      
      console.log(`\n⚠️ Aviso: Esto vai sobrescrever todos os dados da database atual!`);
      console.log(`Arquivo: ${backupFile}\n`);
      
      // Confirmation
      console.log('Digite "CONFIRMAR" para prosseguir com a restauração:');
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      rl.question('> ', async (answer) => {
        rl.close();
        
        if (answer.trim().toUpperCase() === 'CONFIRMAR') {
          await restoreDatabase(backupPath);
        } else {
          log('Restauração cancelada pelo usuário', 'info');
          process.exit(0);
        }
      });
      
      break;
      
    case 'list':
      listBackups();
      break;
      
    case 'test':
      log('🧪 Testando conexão com database...');
      testConnectionWithRetries()
        .then(res => {
          if (res.success) {
            log('✅ Conexão com database funcionando!', 'success');
            console.log(res.stdout);
            process.exit(0);
          } else {
            log(`❌ Erro ao conectar na database: ${res.error?.message || res.error}`, 'error');
            process.exit(1);
          }
        })
        .catch(err => {
          log(`❌ Erro ao conectar na database: ${err.message}`, 'error');
          process.exit(1);
        });
      break;
      
    default:
      console.log(`❌ Comando desconhecido: ${command}`);
      console.log('Comandos disponíveis: backup, restore, list, test\n');
      process.exit(1);
  }
}

// Cleanup handlers
process.on('SIGINT', () => { log('Interrompido (SIGINT). Limpando lockfile...', 'warning'); releaseLock(null); process.exit(130); });
process.on('SIGTERM', () => { log('Recebido SIGTERM. Limpando lockfile...', 'warning'); releaseLock(null); process.exit(143); });
process.on('exit', () => { releaseLock(null); });

// Auto-restore se variável de ambiente estiver definida
async function checkAutoRestore() {
  if (AUTO_RESTORE_BACKUP) {
    ensureDirectories();
    const backupPath = path.join(BACKUP_DIR, AUTO_RESTORE_BACKUP);
    
    if (!fs.existsSync(backupPath)) {
      log(`❌ Arquivo de backup não encontrado: ${backupPath}`, 'error');
      process.exit(1);
    }
    
    log(`🔄 AUTO-RESTORE: Restaurando de ${AUTO_RESTORE_BACKUP}...`, 'info');
    await restoreDatabase(backupPath);
    process.exit(0);
  }
}

// Executar
checkAutoRestore().then(() => {
  return interactiveMenu();
}).catch(error => {
  log(`Erro fatal: ${error.message}`, 'error');
  releaseLock(null);
  process.exit(1);
});