import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import http from 'http';
import { spawn } from 'child_process';

function checkPortRunning(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}/`, () => resolve(true));
    req.on('error', () => resolve(false));
    req.setTimeout(250, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function multishopPlugin() {
  return {
    name: 'multishop-plugin',
    configureServer(server) {
      // Auto-start backend Express on port 5000 if not already active
      checkPortRunning(5000).then((running) => {
        if (!running) {
          const backendPath = path.resolve(__dirname, 'backend/src/server.js');
          const backendProcess = spawn(process.execPath, [backendPath], {
            cwd: __dirname,
            env: {
              ...process.env,
              PORT: '5000',
              BACKEND_PORT: '5000'
            },
            stdio: 'inherit'
          });

          backendProcess.on('error', (err) => {
            console.warn('[Vite AutoBackend] Process notice:', err.message);
          });

          server.httpServer?.on('close', () => {
            try {
              backendProcess.kill('SIGTERM');
            } catch {}
          });
        }
      }).catch(() => {});

      server.middlewares.use((req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        next();
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
  plugins: [react(), multishopPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: false,
    allowedHosts: 'all',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
        ws: true
      },
      '/socket.io': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
        ws: true
      },
      '/uploads': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
        ws: true
      },
      '/socket.io': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
        ws: true
      },
      '/uploads': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
