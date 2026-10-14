import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import http from 'http';
import { handleApiRequest, initStores, recordChatMessage, attachSocketIO, calculateGlobalStats, calculateShopStats } from './serverApi.js';
import { Server as SocketIOServer } from 'socket.io';

function multishopProductionPlugin() {
  return {
    name: 'multishop-production-plugin',
    async configureServer(server) {
      await initStores();

      // If local MongoDB daemon is running, connect and seed automatically for MongoDB Compass
      try {
        const { createRequire } = await import('module');
        const req = createRequire(import.meta.url);
        const connectDB = req('./backend/src/config/db.js');
        const seedData = req('./backend/src/utils/seeder.js');
        connectDB().then(() => {
          seedData().catch(() => {});
        }).catch(() => {});
      } catch {}

      // Attach Socket.IO to dev server http instance with buffer protection
      if (server.httpServer) {
        const io = new SocketIOServer(server.httpServer, {
          cors: { origin: '*', methods: ['GET', 'POST'] },
          pingTimeout: 30000,
          pingInterval: 25000,
          maxHttpBufferSize: 1e6
        });

        attachSocketIO(io);

        io.on('connection', (socket) => {
          socket.on('join_room', (userId) => {
            if (typeof userId === 'string' && userId.length < 100) {
              socket.join(userId);
            }
          });
          socket.on('admin_join', () => {
            socket.join('admin_room');
            socket.emit('stats_updated', calculateGlobalStats());
            ['nutrition', 'youpi', 'dari'].forEach(k => {
              socket.emit(`shop_stats_updated_${k}`, calculateShopStats(k));
            });
          });
          socket.on('check_admin_status', () => socket.emit('admin_status', { online: true }));
          socket.on('request_global_stats', () => {
            socket.emit('stats_updated', calculateGlobalStats());
            ['nutrition', 'youpi', 'dari'].forEach(k => {
              socket.emit(`shop_stats_updated_${k}`, calculateShopStats(k));
            });
          });
          socket.on('request_shop_stats', (shopKey) => {
            if (shopKey && typeof shopKey === 'string') {
              socket.emit(`shop_stats_updated_${shopKey}`, calculateShopStats(shopKey));
            }
          });
          socket.on('send_message', (data) => {
            if (!data || typeof data !== 'object') return;
            const shopId = data.shopId || 'youpi';
            const recorded = recordChatMessage(shopId, data);
            const newMessage = recorded.message;
            if (data.userId) {
              io.to(data.userId).emit('receive_message', newMessage);
              io.to('admin_room').emit('refresh_chats', { userId: data.userId, lastMessage: newMessage });
            }
          });
        });

        server.httpServer.on('close', () => {
          try {
            io.close();
          } catch {}
        });
      }

      let isBackendLive = false;
      let lastCheckTime = 0;

      function checkBackendHealth(): Promise<boolean> {
        const now = Date.now();
        if (now - lastCheckTime < 2500) {
          return Promise.resolve(isBackendLive);
        }
        lastCheckTime = now;
        return new Promise((resolve) => {
          const r = http.get('http://127.0.0.1:5000/', (res) => {
            isBackendLive = Boolean(res.statusCode && res.statusCode < 500);
            resolve(isBackendLive);
          });
          r.on('error', () => {
            isBackendLive = false;
            resolve(false);
          });
          r.setTimeout(350, () => {
            r.destroy();
            isBackendLive = false;
            resolve(false);
          });
        });
      }

      // High-performance security & API middleware
      server.middlewares.use(async (req, res, next) => {
        // Enforce safe headers compatible with iframe embedding
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

        if (req.url && req.url.startsWith('/api')) {
          const backendUp = await checkBackendHealth();
          if (backendUp) {
            const proxyReq = http.request({
              hostname: '127.0.0.1',
              port: 5000,
              path: req.url,
              method: req.method,
              headers: {
                ...req.headers,
                host: '127.0.0.1:5000'
              }
            }, (proxyRes) => {
              res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
              proxyRes.pipe(res);
            });

            proxyReq.on('error', () => {
              handleApiRequest(req, res, next);
            });

            req.pipe(proxyReq);
          } else {
            handleApiRequest(req, res, next);
          }
        } else {
          next();
        }
      });
    },
    async configurePreviewServer(server) {
      await initStores();
      server.middlewares.use((req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

        if (req.url && req.url.startsWith('/api')) {
          handleApiRequest(req, res, next);
        } else {
          next();
        }
      });
    },
    transformIndexHtml(html, ctx) {
      const req = ctx?.req;
      const url = ctx?.originalUrl || req?.originalUrl || req?.url || '/';
      
      let shop = 'nutrition';
      if (url.includes('shop=youpi')) shop = 'youpi';
      else if (url.includes('shop=dari')) shop = 'dari';
      else if (url.includes('shop=nutrition')) shop = 'nutrition';

      const shopMeta: Record<string, { title: string; desc: string; image: string }> = {
        nutrition: {
          title: 'Fitness Shop | Nutrition Sportive & Équipements Fitness Tunisie',
          desc: 'Whey isolate, créatine, barres protéinées et matériel de musculation professionnel.',
          image: '/src/assets/images/hero_fitness_athlete_1790951685544.jpg'
        },
        youpi: {
          title: "YoupiShop | Jeux d'Enfants & Jouets d'Éveil Tunisie",
          desc: "Des milliers de jouets pour faire rêver vos enfants à tous les âges. Livraison 24/48h partout en Tunisie.",
          image: '/src/assets/images/hero_youpishop_toys_1791240036994.jpg'
        },
        dari: {
          title: "DariShop | Mobilier & Décoration d'Intérieur Haut de Gamme Tunisie",
          desc: "Mobilier contemporain, luminaires design et décoration raffinée pour sublimer votre intérieur.",
          image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200'
        }
      };

      const meta = shopMeta[shop] || shopMeta.nutrition;
      let resHtml = html;

      resHtml = resHtml.replace(/<title>.*?<\/title>/, `<title>${meta.title}</title>`);
      resHtml = resHtml.replace(/<meta name="title" content=".*?" \/>/, `<meta name="title" content="${meta.title}" />`);
      resHtml = resHtml.replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${meta.desc}" />`);

      resHtml = resHtml.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${meta.title}" />`);
      resHtml = resHtml.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${meta.desc}" />`);
      resHtml = resHtml.replace(/<meta property="og:image" content=".*?" \/>/, `<meta property="og:image" content="${meta.image}" />`);

      resHtml = resHtml.replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${meta.title}" />`);
      resHtml = resHtml.replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${meta.desc}" />`);
      resHtml = resHtml.replace(/<meta name="twitter:image" content=".*?" \/>/, `<meta name="twitter:image" content="${meta.image}" />`);

      return resHtml;
    }
  };
}

export default defineConfig({
  plugins: [react(), multishopProductionPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: false
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: false
  }
});
