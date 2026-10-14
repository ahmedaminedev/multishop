#!/usr/bin/env node
import { spawn } from 'child_process';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const BACKEND_PORT = process.env.BACKEND_PORT || 5000;
const FRONTEND_PORT = 3000;

console.log('\n======================================================');
console.log('🚀 [MultiShop] Démarrage du projet MultiShop (Backend + Frontend)');
console.log('======================================================\n');

let backendProcess = null;
let frontendProcess = null;
let isShuttingDown = false;

function cleanup() {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log('\n🛑 [MultiShop] Arrêt des serveurs Backend et Frontend...');
  if (backendProcess) {
    try { backendProcess.kill('SIGTERM'); } catch {}
  }
  if (frontendProcess) {
    try { frontendProcess.kill('SIGTERM'); } catch {}
  }
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

function checkPortRunning(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}/`, (res) => {
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(400, () => {
      req.destroy();
      resolve(false);
    });
  });
}

(async () => {
  const isAlreadyRunning = await checkPortRunning(BACKEND_PORT);

  if (isAlreadyRunning) {
    console.log(`📡 [1/2] Le Backend Express est déjà actif sur le port ${BACKEND_PORT}.`);
  } else {
    console.log(`📡 [1/2] Lancement du Backend Express sur le port ${BACKEND_PORT}...`);

    const backendEnv = {
      ...process.env,
      PORT: String(BACKEND_PORT),
      BACKEND_PORT: String(BACKEND_PORT)
    };

    backendProcess = spawn('node', ['backend/src/server.js'], {
      cwd: rootDir,
      env: backendEnv,
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: process.platform === 'win32'
    });

    backendProcess.stdout.on('data', (data) => {
      const lines = data.toString().split('\n');
      for (const line of lines) {
        if (line.trim()) {
          console.log(`\x1b[36m[Backend]\x1b[0m ${line}`);
        }
      }
    });

    backendProcess.stderr.on('data', (data) => {
      const lines = data.toString().split('\n');
      for (const line of lines) {
        if (line.trim()) {
          console.error(`\x1b[31m[Backend Err]\x1b[0m ${line}`);
        }
      }
    });

    backendProcess.on('error', (err) => {
      console.error('\x1b[31m[Backend Error]\x1b[0m', err.message);
    });

    backendProcess.on('exit', (code, signal) => {
      if (!isShuttingDown) {
        console.log(`\x1b[33m[Backend info: processus arrêté (${code || signal})]\x1b[0m`);
      }
    });

    // Attendre que le backend soit prêt
    let ready = false;
    for (let i = 0; i < 30; i++) {
      if (isShuttingDown) break;
      await new Promise((r) => setTimeout(r, 250));
      if (await checkPortRunning(BACKEND_PORT)) {
        ready = true;
        break;
      }
    }

    if (ready) {
      console.log(`\n\x1b[32m✅ [MultiShop] Backend démarré avec succès sur le port ${BACKEND_PORT} !\x1b[0m`);
    } else {
      console.log(`\n\x1b[32m✅ [MultiShop] Backend initialisé. Lancement du Frontend...\x1b[0m`);
    }
  }

  console.log(`🌐 [2/2] Lancement du Frontend (Vite) sur le port ${FRONTEND_PORT}...\n`);

  frontendProcess = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', String(FRONTEND_PORT)], {
    cwd: rootDir,
    env: process.env,
    stdio: 'inherit',
    shell: true
  });

  frontendProcess.on('exit', (code, signal) => {
    if (!isShuttingDown) {
      console.log(`\x1b[33m[Frontend terminé (code ${code || signal})]\x1b[0m`);
      cleanup();
    }
  });
})();
