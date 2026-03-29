import { execSync } from 'child_process';
import fs from 'fs';

console.log('1. Checking if nest binary exists...');
const nestPath = './node_modules/.bin/nest';
console.log(`   Exists: ${fs.existsSync(nestPath)}`);

console.log('2. Checking nest-cli.json...');
const nestConfig = JSON.parse(fs.readFileSync('./nest-cli.json', 'utf8'));
console.log(`   tsConfigPath: ${nestConfig.compilerOptions.tsConfigPath}`);
console.log(`   outDir: ${nestConfig.compilerOptions.tsConfigPath}`);

console.log('3. Running: npx nest build --debug');
try {
  const output = execSync('npx nest build --debug 2>&1', { encoding: 'utf8' });
  console.log('   Output:', output);
} catch (e) {
  console.log('   Error:', e.message);
  console.log('   Exit code:', e.status);
}

console.log('4. Checking if dist/ exists...');
console.log(`   Exists: ${fs.existsSync('./dist')}`);
