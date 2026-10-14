#!/usr/bin/env node
import { spawn } from 'child_process';
import http from 'http';
import path from 'path';
import fs from 'fs';
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

  if (backendProcess && backendProcess.pid) {
    try {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', String(backendProcess.pid), '/f', '/t'], { stdio: 'ignore' });
      } else {
        backendProcess.kill('SIGTERM');
      }
    } catch {}
  }

  if (frontendProcess && frontendProcess.pid) {
    try {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', String(frontendProcess.pid), '/f', '/t'], { stdio: 'ignore' });
      } else {
        frontendProcess.kill('SIGTERM');
      }
    } catch {}
  }

  setTimeout(() => process.exit(0), 400);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

function checkPortRunning(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}/`, (res) => {
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(350, () => {
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

    backendProcess = spawn(process.execPath, ['backend/src/server.js'], {
      cwd: rootDir,
      env: backendEnv,
      stdio: ['inherit', 'pipe', 'pipe']
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
        console.log(`\x1b[33m[Backend arrêté (${code || signal})]\x1b[0m`);
      }
    });

    // Attendre que le backend soit prêt
    let ready = false;
    for (let i = 0; i < 40; i++) {
      if (isShuttingDown) break;
      await new Promise((r) => setTimeout(r, 150));
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

  // Lancement direct de Vite via Node (fiable sur Windows, macOS et Linux sans invite ni wrapper .cmd)
  const viteBin = path.resolve(rootDir, 'node_modules/vite/bin/vite.js');

  frontendProcess = spawn(process.execPath, [viteBin, '--host', '0.0.0.0', '--port', String(FRONTEND_PORT)], {
    cwd: rootDir,
    env: process.env,
    stdio: 'inherit'
  });

  frontendProcess.on('error', (err) => {
    console.error('\x1b[31m[Frontend Error]\x1b[0m', err.message);
  });

  frontendProcess.on('exit', (code, signal) => {
    if (!isShuttingDown) {
      console.log(`\x1b[33m[Frontend arrêté (${code || signal})]\x1b[0m`);
      cleanup();
    }
  });
})();
