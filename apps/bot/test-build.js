const { execSync } = require('child_process');
try {
  console.log('Starting build...');
  const result = execSync('npx nest build', { 
    cwd: process.cwd(),
    stdio: ['pipe', 'pipe', 'pipe'],
    encoding: 'utf8'
  });
  console.log('Build stdout:', result);
} catch (e) {
  console.log('Build stderr:', e.stderr);
  console.log('Build stdout:', e.stdout);
  console.log('Exit code:', e.status);
}
