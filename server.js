const dotenv = require('dotenv');
dotenv.config();

const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const apiApp = require('./apps/api/src/app');
const { connectDB } = require('./apps/api/src/config/db');
const dataStore = require('./apps/api/src/services/dataStore');

const PORT = 3000;
const HOST = '0.0.0.0';

const app = express();
const server = http.createServer(app);

// Socket.io configuration attached to port 3000
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

let isAdminOnline = false;

io.on('connection', (socket) => {
  socket.on('join_room', (userId) => {
    socket.join(userId);
  });

  socket.on('admin_join', () => {
    socket.join('admin_room');
    isAdminOnline = true;
    io.emit('admin_status', { online: true });
  });

  socket.on('admin_leave', () => {
    isAdminOnline = false;
    io.emit('admin_status', { online: false });
  });

  socket.on('check_admin_status', () => {
    socket.emit('admin_status', { online: isAdminOnline });
  });

  socket.on('send_message', async (data) => {
    const { userId, sender, content, type } = data;
    const newMessage = {
      sender,
      content,
      type: type || 'text',
      timestamp: new Date(),
      read: false
    };
    io.to(userId).emit('receive_message', newMessage);
    io.to('admin_room').emit('refresh_chats', { userId, lastMessage: newMessage });
  });
});

// 1. Mount API App
app.use(apiApp);

// 2. Serve static builds for the 4 storefronts + Admin Backoffice
const apps = [
  { slug: 'parashop', name: 'PharmaNature', dir: path.join(__dirname, 'apps/parashop/dist') },
  { slug: 'nutritionshop', name: 'IronFuel Nutrition', dir: path.join(__dirname, 'apps/nutritionshop/dist') },
  { slug: 'cosmeticshop', name: 'Cosmetics Shop', dir: path.join(__dirname, 'apps/cosmeticshop/dist') },
  { slug: 'electroshop', name: 'Electro Shop', dir: path.join(__dirname, 'apps/electroshop/dist') },
  { slug: 'admin', name: 'Backoffice Centralisé', dir: path.join(__dirname, 'apps/admin/dist') }
];

apps.forEach(({ slug, dir }) => {
  app.use(`/${slug}`, express.static(dir));
  app.get(`/${slug}/*`, (req, res) => {
    res.sendFile(path.join(dir, 'index.html'));
  });
});

// 3. Central MultiShop Portal Hub at root `/`
app.get('/', (req, res) => {
  const stores = dataStore.getStores();
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MultiShop Suite | Architecture Multi-Tenant E-Commerce</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: { sans: ['Inter', 'sans-serif'] }
        }
      }
    }
  </script>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
  <!-- Top Global Navigation Bar -->
  <header class="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-500/20">
          M
        </div>
        <div>
          <span class="font-extrabold text-white text-lg tracking-tight">MultiShop<span class="text-indigo-400">.suite</span></span>
          <span class="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-mono font-semibold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded">Multi-Tenant v2.0</span>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <a href="/admin" class="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-600/30 transition-all border border-indigo-400/30">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Accéder au Backoffice</span>
        </a>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full">
    <div class="text-center max-w-3xl mx-auto mb-12">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        API Unique Multi-Tenant Opérationnelle • MongoDB / In-Memory Active
      </div>
      <h1 class="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
        4 Boutiques Uniques.<br>
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
          Un Seul Cœur Backend & Backoffice.
        </span>
      </h1>
      <p class="text-slate-400 text-sm sm:text-base mt-4 leading-relaxed">
        Chaque boutique conserve son identité visuelle d'origine, son design et ses parcours clients distincts. Toutes communiquent avec la même API via le header d'identification <code class="bg-slate-800 text-indigo-300 px-1.5 py-0.5 rounded text-xs font-mono">x-store-slug</code>.
      </p>
    </div>

    <!-- 4 Storefront Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <!-- Store 1: PharmaNature -->
      <div class="bg-slate-800/80 rounded-2xl border border-slate-700/80 p-6 flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all group">
        <div>
          <div class="flex items-center justify-between mb-4">
            <span class="w-3 h-3 rounded-full bg-[#008b5e] shadow-md shadow-[#008b5e]/50"></span>
            <span class="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900/60 text-slate-400 border border-slate-700">/parashop</span>
          </div>
          <div class="w-12 h-12 rounded-xl bg-[#008b5e]/20 text-[#008b5e] flex items-center justify-center font-black text-xl mb-4 group-hover:scale-110 transition-transform">
            🌿
          </div>
          <h2 class="text-xl font-bold text-white mb-1">PharmaNature</h2>
          <p class="text-xs text-emerald-400 font-medium mb-3">Parapharmacie & Soins Naturels</p>
          <p class="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
            Dermo-cosmétique bio, micronutrition, phytothérapie certifiée et conseils d'experts pharmaciens.
          </p>
        </div>
        <div class="pt-4 border-t border-slate-700/60 flex items-center justify-between">
          <span class="text-xs text-slate-400 font-medium">15+ Articles</span>
          <a href="/parashop" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#008b5e] hover:bg-[#00704c] rounded-lg shadow transition-colors">
            Ouvrir la boutique →
          </a>
        </div>
      </div>

      <!-- Store 2: IronFuel -->
      <div class="bg-slate-800/80 rounded-2xl border border-slate-700/80 p-6 flex flex-col justify-between hover:border-lime-400/50 hover:shadow-xl hover:shadow-lime-400/10 transition-all group">
        <div>
          <div class="flex items-center justify-between mb-4">
            <span class="w-3 h-3 rounded-full bg-[#ccff00] shadow-md shadow-[#ccff00]/50"></span>
            <span class="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900/60 text-slate-400 border border-slate-700">/nutritionshop</span>
          </div>
          <div class="w-12 h-12 rounded-xl bg-[#ccff00]/20 text-[#ccff00] flex items-center justify-center font-black text-xl mb-4 group-hover:scale-110 transition-transform">
            ⚡
          </div>
          <h2 class="text-xl font-bold text-white mb-1">IronFuel</h2>
          <p class="text-xs text-lime-400 font-medium mb-3">Elite Sports Nutrition</p>
          <p class="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
            Whey isolate native, créatine micronisée, pre-workouts puissants et suppléments forgés pour la performance.
          </p>
        </div>
        <div class="pt-4 border-t border-slate-700/60 flex items-center justify-between">
          <span class="text-xs text-slate-400 font-medium">15+ Articles</span>
          <a href="/nutritionshop" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-900 bg-[#ccff00] hover:bg-lime-400 rounded-lg shadow transition-colors">
            Ouvrir la boutique →
          </a>
        </div>
      </div>

      <!-- Store 3: Cosmetics Shop -->
      <div class="bg-slate-800/80 rounded-2xl border border-slate-700/80 p-6 flex flex-col justify-between hover:border-rose-500/50 hover:shadow-xl hover:shadow-rose-500/10 transition-all group">
        <div>
          <div class="flex items-center justify-between mb-4">
            <span class="w-3 h-3 rounded-full bg-[#e11d48] shadow-md shadow-[#e11d48]/50"></span>
            <span class="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900/60 text-slate-400 border border-slate-700">/cosmeticshop</span>
          </div>
          <div class="w-12 h-12 rounded-xl bg-[#e11d48]/20 text-[#e11d48] flex items-center justify-center font-black text-xl mb-4 group-hover:scale-110 transition-transform">
            💄
          </div>
          <h2 class="text-xl font-bold text-white mb-1">Cosmetics Shop</h2>
          <p class="text-xs text-rose-400 font-medium mb-3">Haute Beauté & Parfumerie</p>
          <p class="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
            Maquillage prestigieux, sérums anti-âge, parfums de luxe et rituels d'exception (Lancôme, Huda Beauty, MAC).
          </p>
        </div>
        <div class="pt-4 border-t border-slate-700/60 flex items-center justify-between">
          <span class="text-xs text-slate-400 font-medium">20+ Articles</span>
          <a href="/cosmeticshop" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#e11d48] hover:bg-rose-700 rounded-lg shadow transition-colors">
            Ouvrir la boutique →
          </a>
        </div>
      </div>

      <!-- Store 4: Electro Shop -->
      <div class="bg-slate-800/80 rounded-2xl border border-slate-700/80 p-6 flex flex-col justify-between hover:border-red-500/50 hover:shadow-xl hover:shadow-red-500/10 transition-all group">
        <div>
          <div class="flex items-center justify-between mb-4">
            <span class="w-3 h-3 rounded-full bg-[#ef4444] shadow-md shadow-[#ef4444]/50"></span>
            <span class="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900/60 text-slate-400 border border-slate-700">/electroshop</span>
          </div>
          <div class="w-12 h-12 rounded-xl bg-[#ef4444]/20 text-[#ef4444] flex items-center justify-center font-black text-xl mb-4 group-hover:scale-110 transition-transform">
            🔌
          </div>
          <h2 class="text-xl font-bold text-white mb-1">Electro Shop</h2>
          <p class="text-xs text-red-400 font-medium mb-3">Électroménager & Multimédia</p>
          <p class="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
            Téléviseurs 4K, gros et petit électroménager, packs encastrables cuisine, climatisation et son haute fidélité.
          </p>
        </div>
        <div class="pt-4 border-t border-slate-700/60 flex items-center justify-between">
          <span class="text-xs text-slate-400 font-medium">15+ Articles</span>
          <a href="/electroshop" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#ef4444] hover:bg-red-700 rounded-lg shadow transition-colors">
            Ouvrir la boutique →
          </a>
        </div>
      </div>
    </div>

    <!-- Live Preview Interactive Console -->
    <div class="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-xl">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-700">
        <div>
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            <span>Console & Visualiseur Multi-Store</span>
            <span class="text-[10px] font-mono font-normal px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">Live Preview</span>
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">Changez d'onglet pour tester instantanément chaque application sans recharger la page.</p>
        </div>
        <div class="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-700/80 overflow-x-auto">
          <button onclick="switchTab('/admin')" id="tab-admin" class="tab-btn px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white transition-all shadow-sm">
            ⚙️ Backoffice
          </button>
          <button onclick="switchTab('/parashop')" id="tab-parashop" class="tab-btn px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-400 hover:text-white transition-all">
            🌿 PharmaNature
          </button>
          <button onclick="switchTab('/nutritionshop')" id="tab-nutritionshop" class="tab-btn px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-400 hover:text-white transition-all">
            ⚡ IronFuel
          </button>
          <button onclick="switchTab('/cosmeticshop')" id="tab-cosmeticshop" class="tab-btn px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-400 hover:text-white transition-all">
            💄 Cosmetics
          </button>
          <button onclick="switchTab('/electroshop')" id="tab-electroshop" class="tab-btn px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-400 hover:text-white transition-all">
            🔌 Electro
          </button>
        </div>
      </div>

      <div class="mt-4 rounded-xl overflow-hidden border border-slate-700 bg-black relative" style="height: 720px;">
        <iframe id="preview-frame" src="/admin" class="w-full h-full border-0"></iframe>
      </div>
    </div>
  </main>

  <footer class="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
    MultiShop Architecture • Monorepo Workspaces • API Mongoose Multi-Tenant
  </footer>

  <script>
    function switchTab(path) {
      document.getElementById('preview-frame').src = path;
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-sm');
        btn.classList.add('text-slate-400');
      });
      const activeId = 'tab-' + path.replace('/', '');
      const activeBtn = document.getElementById(activeId);
      if (activeBtn) {
        activeBtn.classList.remove('text-slate-400');
        activeBtn.classList.add('bg-indigo-600', 'text-white', 'shadow-sm');
      }
    }
  </script>
</body>
</html>`;
  res.send(html);
});

async function start() {
  await connectDB();
  server.listen(PORT, HOST, () => {
    console.log(`[MultiShop] Serveur opérationnel sur http://${HOST}:${PORT}`);
    console.log(`[MultiShop] - Portail Hub: http://${HOST}:${PORT}/`);
    console.log(`[MultiShop] - Backoffice: http://${HOST}:${PORT}/admin`);
    console.log(`[MultiShop] - PharmaNature: http://${HOST}:${PORT}/parashop`);
    console.log(`[MultiShop] - IronFuel: http://${HOST}:${PORT}/nutritionshop`);
    console.log(`[MultiShop] - Cosmetics: http://${HOST}:${PORT}/cosmeticshop`);
    console.log(`[MultiShop] - ElectroShop: http://${HOST}:${PORT}/electroshop`);
    console.log(`[MultiShop] - API Multi-tenant: http://${HOST}:${PORT}/api/health`);
  });
}

start();
