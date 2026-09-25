const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const apps = ['admin', 'parashop', 'nutritionshop', 'cosmeticshop', 'electroshop'];

console.log('[MultiShop Build] Début du build des 5 applications...');

for (const app of apps) {
  const appDir = path.join(__dirname, 'apps', app);
  if (fs.existsSync(appDir)) {
    console.log(`[MultiShop Build] Compilation de apps/${app}...`);
    try {
      execSync(`npx vite build ${appDir}`, {
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'production' }
      });
      console.log(`[MultiShop Build] ✓ apps/${app} compilé avec succès.`);
    } catch (err) {
      console.error(`[MultiShop Build] Erreur compilation apps/${app}:`, err.message);
      process.exit(1);
    }
  }
}

console.log('[MultiShop Build] ✓ Toutes les applications ont été compilées avec succès !');
