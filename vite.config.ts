import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { handleApiRequest, initStores, recordChatMessage } from './serverApi.js';
import { Server as SocketIOServer } from 'socket.io';

function multishopProductionPlugin() {
  return {
    name: 'multishop-production-plugin',
    async configureServer(server) {
      await initStores();

      // Attach Socket.IO to dev server http instance with buffer protection
      if (server.httpServer) {
        const io = new SocketIOServer(server.httpServer, {
          cors: { origin: '*', methods: ['GET', 'POST'] },
          pingTimeout: 30000,
          pingInterval: 25000,
          maxHttpBufferSize: 1e6
        });

        io.on('connection', (socket) => {
          socket.on('join_room', (userId) => {
            if (typeof userId === 'string' && userId.length < 100) {
              socket.join(userId);
            }
          });
          socket.on('admin_join', () => socket.join('admin_room'));
          socket.on('check_admin_status', () => socket.emit('admin_status', { online: true }));
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
      }

      // High-performance security & API middleware
      server.middlewares.use((req, res, next) => {
        // Enforce safe headers compatible with iframe embedding
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
      
      let shop = 'para';
      if (url.includes('shop=nutrition')) shop = 'nutrition';
      else if (url.includes('shop=cosmetic')) shop = 'cosmetic';
      else if (url.includes('shop=electro')) shop = 'electro';
      else if (url.includes('shop=youpi')) shop = 'youpi';

      const shopMeta: Record<string, { title: string; desc: string; image: string }> = {
        para: {
          title: 'PharmaShop | Parapharmacie & Soins Bio Tunisie',
          desc: 'Compléments alimentaires, micronutrition, phytothérapie et soins certifiés. Livraison express en Tunisie.',
          image: '/favicon.svg'
        },
        nutrition: {
          title: 'Fitness Shop | Nutrition Sportive & Équipements Fitness Tunisie',
          desc: 'Whey isolate, créatine, barres protéinées et matériel de musculation professionnel.',
          image: '/src/assets/images/hero_fitness_athlete_1790951685544.jpg'
        },
        cosmetic: {
          title: 'Cosmetics Shop | Beauté, Rituels & Soins Visage Tunisie',
          desc: 'Cosmétique haute tolérance, parfumerie fine, sérums anti-âge et maquillage haut de gamme.',
          image: '/favicon.svg'
        },
        electro: {
          title: 'Electro Shop | High-Tech & Petit Électroménager Tunisie',
          desc: 'Smartphones, TV 4K, robots culinaires et son haute-fidélité garantis 24 mois.',
          image: '/favicon.svg'
        },
        youpi: {
          title: "YoupiShop | Jeux d'Enfants & Jouets d'Éveil Tunisie",
          desc: "Des milliers de jouets pour faire rêver vos enfants à tous les âges. Livraison 24/48h partout en Tunisie.",
          image: '/src/assets/images/hero_youpishop_toys_1791240036994.jpg'
        }
      };

      const meta = shopMeta[shop] || shopMeta.para;
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
    strictPort: true
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true
  }
});
