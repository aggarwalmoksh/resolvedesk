import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

console.log('\n=============================================================');
console.log('🚀 ResolveDesk Fullstack Development Environment Starting...');
console.log('=============================================================\n');

// 1. Spawn Backend (Port 4000)
const backend = spawn(npmCmd, ['--prefix', path.join(__dirname, 'backend'), 'run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

// 2. Spawn Frontend (Port 5173)
const frontend = spawn(npmCmd, ['--prefix', path.join(__dirname, 'frontend'), 'run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

const cleanup = () => {
  console.log('\n🛑 Shutting down ResolveDesk dev servers...');
  backend.kill();
  frontend.kill();
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
