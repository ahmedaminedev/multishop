import url from 'url';
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// In-memory data store per shop
export const storesData = {
  para: null,
  nutrition: null,
  cosmetic: null,
  electro: null,
};

let activeShop = 'para';

export const FILIALE_MAP = {
  para: {
    key: 'para',
    folder: 'templates/para',
    legacyFolder: 'ParaShop-main',
    name: 'PharmaShop',
    filialeType: 'produit_myshops_para',
    accentColor: '#008b5e',
    badge: 'Santé & Bio'
  },
  nutrition: {
    key: 'nutrition',
    folder: 'templates/nutrition',
    legacyFolder: 'NutritionShop-main',
    name: 'Fitness Shop',
    filialeType: 'produit_myshops_nutrition',
    accentColor: '#84cc16',
    badge: 'Fitness & Muscu'
  },
  cosmetic: {
    key: 'cosmetic',
    folder: 'templates/cosmetic',
    legacyFolder: 'cosmeticshop-main',
    name: 'Cosmetics Shop',
    filialeType: 'produit_myshops_cosmetique',
    accentColor: '#e11d48',
    badge: 'Luxe & Beauté'
  },
  electro: {
    key: 'electro',
    folder: 'templates/electro',
    legacyFolder: 'electro_shop-main',
    name: 'Electro Shop',
    filialeType: 'produit_myshops_electro',
    accentColor: '#2563eb',
    badge: 'High-Tech'
  }
};

function enrichProductWithFiliale(product, filialeKey) {
  const p = { ...product };
  const filiale = FILIALE_MAP[filialeKey];
  p.filialeType = filiale.filialeType;
  p.filialeName = filiale.name;
  p.filialeKey = filialeKey;
  p.codeArticleFiliale = p.codeArticleFiliale || `${filiale.filialeType.toUpperCase()}-${p.id}`;

  if (filialeKey === 'electro') {
    p.garantieMois = p.garantieMois || (p.price > 500 ? 36 : 24);
    p.puissanceWatts = p.puissanceWatts || (p.name.includes('Four') || p.name.includes('Cuisinière') ? '2800W' : p.name.includes('Aspirateur') ? '1800W' : '1200W');
    p.classeEnergetique = p.classeEnergetique || (p.price > 800 ? 'A+++' : 'A++');
    p.referenceTechnique = p.referenceTechnique || `AUX-${(p.brand || 'TECH').slice(0, 3).toUpperCase()}-${p.id}`;
    p.voltage = p.voltage || '220-240V / 50Hz';
  } else if (filialeKey === 'nutrition') {
    p.poidsKg = p.poidsKg || (p.name.includes('2x10kg') ? 20 : p.name.includes('50kg') ? 50 : p.name.includes('2.2') ? 2.2 : 1.0);
    p.garantieMois = p.garantieMois || (p.price > 500 ? 36 : p.price > 150 ? 24 : 12);
    p.chargeMaxKg = p.chargeMaxKg || (p.name.includes('Rack') ? 600 : p.name.includes('Banc') ? 450 : undefined);
    p.matiere = p.matiere || (p.name.includes('Haltère') ? 'Caoutchouc & Fonte' : p.name.includes('Rack') ? 'Acier Carbone 75x75mm' : undefined);
    p.goutSaveur = p.goutSaveur || (p.name.includes('Whey') ? 'Chocolat Belge' : p.name.includes('Créatine') ? 'Neutre' : undefined);
    p.objectifSportif = p.objectifSportif || (p.name.includes('Tapis') ? 'Endurance Cardio & Brûle-graisses' : 'Force & Hypertrophie Musculaire');
  } else if (filialeKey === 'cosmetic') {
    p.teinte = p.teinte || (p.category?.includes('Lèvres') ? 'Rouge Carmin 04' : p.category?.includes('Teint') ? 'Beige Doré 02' : 'Universel');
    p.volumeMl = p.volumeMl || (p.category?.includes('Parfum') ? 100 : p.category?.includes('Soin') ? 50 : 30);
    p.hypoallergenique = p.hypoallergenique !== undefined ? p.hypoallergenique : true;
    p.effetSoin = p.effetSoin || (p.name.includes('Sérum') ? 'Anti-âge & Éclat' : 'Hydratation 48h');
    p.parfumNotes = p.parfumNotes || 'Rose Damascena, Musc blanc et Vanille';
  } else if (filialeKey === 'para') {
    p.posologie = p.posologie || '1 à 2 prises par jour de préférence le matin';
    p.compositionBio = p.compositionBio !== undefined ? p.compositionBio : true;
    p.certification = p.certification || 'Certifié Bio ECOCERT & Norme ISO 22000';
    p.formeGalenique = p.formeGalenique || (p.name.includes('Huile') ? 'Huile végétale pure' : p.name.includes('Sérum') ? 'Flacon compte-gouttes' : 'Gélules végétales');
    p.typePeauOuBesoin = p.typePeauOuBesoin || 'Peaux sensibles & Défenses immunitaires';
  }

  return p;
}

export async function initStores() {
  for (const [key, cfg] of Object.entries(FILIALE_MAP)) {
    try {
      let p = path.resolve(process.cwd(), 'backend/src/data', `initialData_${key}.js`);
      if (!fs.existsSync(p)) {
        p = path.resolve(process.cwd(), cfg.legacyFolder || cfg.folder, 'backend/src/data/initialData.js');
      }
      if (!fs.existsSync(p)) {
        p = path.resolve(process.cwd(), cfg.folder, 'data/initialData.js');
      }
      const data = require(p);
      const rawProducts = Array.isArray(data.allProducts) ? JSON.parse(JSON.stringify(data.allProducts)) : [];
      const products = rawProducts.map(prod => enrichProductWithFiliale(prod, key));
      const categories = Array.isArray(data.categories) ? JSON.parse(JSON.stringify(data.categories)) : [];
      const packs = Array.isArray(data.packs) ? JSON.parse(JSON.stringify(data.packs)) : [];
      const stores = Array.isArray(data.stores) ? JSON.parse(JSON.stringify(data.stores)) : [];
      const advertisements = data.initialAdvertisements ? JSON.parse(JSON.stringify(data.initialAdvertisements)) : {};
      const promotions = Array.isArray(data.promotions) ? JSON.parse(JSON.stringify(data.promotions)) : [];
      const rawOrders = Array.isArray(data.sampleOrders) ? JSON.parse(JSON.stringify(data.sampleOrders)) : [];
      const orders = rawOrders.map(o => ({ ...o, filialeKey: key, filialeName: cfg.name }));
      const blogPosts = Array.isArray(data.blogPosts) ? JSON.parse(JSON.stringify(data.blogPosts)) : [];
      const contactMessages = Array.isArray(data.contactMessages) ? JSON.parse(JSON.stringify(data.contactMessages)) : [];
      const brands = [...new Set(products.map(pr => pr.brand).filter(Boolean))].map((name, i) => ({ id: i + 1, name }));

      storesData[key] = {
        key,
        name: cfg.name,
        filialeType: cfg.filialeType,
        products,
        categories,
        packs,
        stores,
        advertisements,
        promotions,
        orders,
        blogPosts,
        contactMessages,
        brands,
        offersConfig: {
          header: {
            title: `Offres Spéciales <span class="text-brand-primary">${cfg.name}</span>`,
            subtitle: `Découvrez toutes nos offres privilèges et promotions exclusives chez ${cfg.name}.`
          },
          performanceSection: {
            title: `Sélection <span class="text-brand-primary">Excellence</span>`,
            subtitle: "Une formule ciblée pour des résultats performants et immédiats.",
            buttonText: "DÉCOUVRIR L'OFFRE",
            image: products[0]?.imageUrl || "https://images.unsplash.com/photo-1570172619383-2ef40176191a?q=80&w=1200&auto=format&fit=crop",
            link: "#"
          },
          muscleBuilders: {
            title: `Cures & <span class="text-brand-primary">Packs Essentiels</span>`,
            subtitle: "Équilibrez vos besoins au quotidien avec notre sélection best-seller.",
            buttonText: "VOIR LE PACK",
            image: products[1]?.imageUrl || "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200&auto=format&fit=crop",
            link: "#"
          },
          glowRoutine: {
            title: `Routine <span class="text-rose-600">Éclat</span>`,
            subtitle: "L'harmonie parfaite pour sublimer votre beauté.",
            buttonText: "DÉCOUVRIR LE RITUEL",
            image: products[0]?.imageUrl || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200&auto=format&fit=crop",
            link: "#"
          },
          essentials: {
            title: `Les <span class="text-rose-600">Indispensables</span>`,
            subtitle: "Nos coups de cœur plébiscités par nos clients.",
            buttonText: "VOIR LA SÉLECTION",
            image: products[1]?.imageUrl || "https://images.unsplash.com/photo-1596462502278-27bfdd403cc2?q=80&w=1200&auto=format&fit=crop",
            link: "#"
          },
          dealOfTheDay: {
            productId: products[0]?.id || 1,
            titleColor: "#000000",
            subtitleColor: "#64748b"
          },
          allOffersGrid: {
            title: "Toutes les Promotions",
            useManualSelection: false,
            manualProductIds: [],
            limit: 12
          },
          bannerText: `Offre Spéciale ${cfg.name} : Livraison offerte dès 100 DT d'achats !`,
          promoDiscount: 10,
          isActive: true
        },
        reviews: [
          { _id: `rev-${key}-1`, userId: 'usr-1', userName: 'Yasmine B.', targetId: products[0]?.id || 1, targetType: 'product', rating: 5, comment: `Excellent produit ${cfg.name}, qualité au top !`, date: '2024-03-15' },
          { _id: `rev-${key}-2`, userId: 'usr-2', userName: 'Karim M.', targetId: products[1]?.id || 2, targetType: 'product', rating: 4, comment: 'Livraison express et service client très réactif.', date: '2024-03-18' }
        ]
      };
    } catch (err) {
      console.error(`Error loading store ${key}:`, err);
    }
  }
}

// In-memory users - Global SSO for MultiShop (MongoDB compatible user model)
const users = [
  {
    _id: 'usr-admin-1',
    id: 1,
    firstName: 'Super',
    lastName: 'Admin',
    email: 'admin@multishop.com',
    role: 'ADMIN',
    phone: '+216 71 000 000',
    addresses: [{ type: 'Siège MultiShop', street: 'Les Berges du Lac 2', city: 'Tunis', postalCode: '1053', isDefault: true }]
  },
  {
    _id: 'usr-client-1',
    id: 2,
    firstName: 'Ahmed',
    lastName: 'Ben Ali',
    email: 'client@multishop.com',
    role: 'CUSTOMER',
    phone: '+216 98 123 456',
    addresses: [{ type: 'Domicile', street: '12 Avenue Habib Bourguiba', city: 'Tunis', postalCode: '1001', isDefault: true }]
  }
];

// Active sessions mapping: token -> user
const sessions = new Map();
// Pre-register standard dev tokens for convenience
sessions.set('jwt-admin-token-super', users[0]);
sessions.set('jwt-client-token-default', users[1]);

function parseCookies(cookieHeader) {
  const list = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach(cookie => {
    let [name, ...rest] = cookie.split('=');
    name = name?.trim();
    if (!name) return;
    const value = rest.join('=').trim();
    list[name] = decodeURIComponent(value);
  });
  return list;
}

// Dynamically extracts the authenticated user from the Authorization header or cookies
function getAuthenticatedUser(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const cookies = parseCookies(req.headers.cookie);
  let token = null;

  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (cookies.token) {
    token = cookies.token;
  } else if (cookies.accessToken) {
    token = cookies.accessToken;
  }

  if (!token || token === 'null' || token === 'undefined') {
    return null;
  }

  if (sessions.has(token)) {
    return sessions.get(token);
  }

  // Check if token indicates a known user
  if (token.includes('admin')) {
    const adminUser = users.find(u => u.role === 'ADMIN') || users[0];
    sessions.set(token, adminUser);
    return adminUser;
  }
  if (token.includes('client')) {
    const clientUser = users.find(u => u.role === 'CUSTOMER') || users[1];
    sessions.set(token, clientUser);
    return clientUser;
  }

  return null;
}

export function handleApiRequest(req, res, next) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname || '';

  if (!pathname.startsWith('/api')) {
    return next();
  }

  const endpoint = pathname.replace(/^\/api/, '');
  const cookies = parseCookies(req.headers.cookie);
  const shopKey = req.headers['x-shop-id'] || parsedUrl.query.shop || cookies.shop || activeShop || 'para';
  const shop = storesData[shopKey] || storesData.para || storesData.nutrition || storesData.cosmetic || storesData.electro;

  // Set permissive CORS headers for iframe & preview environments
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Shop-Id, x-shop-id, Accept');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const sendJson = (statusCode, data) => {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };

  const getBody = () => new Promise((resolve) => {
    if (req.body) return resolve(req.body);
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });

  (async () => {
    try {
      // --- GLOBAL MULTISHOP ENDPOINTS (ADMIN PROTECTED) ---
      if (endpoint === '/global/stats' && req.method === 'GET') {
        const authUser = getAuthenticatedUser(req);
        if (!authUser || (authUser.role !== 'ADMIN' && authUser.role !== 'SUPER_ADMIN')) {
          return sendJson(403, { error: 'Forbidden', message: 'Accès interdit. Droits administrateur requis pour consulter les statistiques financières.' });
        }

        const stats = {
          totalRevenue: 0,
          totalOrders: 0,
          totalProducts: 0,
          pendingOrders: 0,
          filiales: {}
        };

        for (const [key, s] of Object.entries(storesData)) {
          if (!s) continue;
          const sRevenue = (s.orders || []).filter(o => o.status !== 'Annulée').reduce((sum, o) => sum + (o.total || 0), 0);
          const sOrders = (s.orders || []).length;
          const sProducts = (s.products || []).length;
          const sPending = (s.orders || []).filter(o => o.status === 'En attente' || o.status === 'Expédiée').length;

          stats.totalRevenue += sRevenue;
          stats.totalOrders += sOrders;
          stats.totalProducts += sProducts;
          stats.pendingOrders += sPending;

          stats.filiales[key] = {
            key,
            name: s.name,
            filialeType: s.filialeType,
            revenue: sRevenue,
            ordersCount: sOrders,
            productsCount: sProducts,
            pendingOrdersCount: sPending,
            brandsCount: (s.brands || []).length,
            categoriesCount: (s.categories || []).length,
            packsCount: (s.packs || []).length,
            messagesCount: (s.contactMessages || []).length
          };
        }

        return sendJson(200, stats);
      }

      if (endpoint === '/global/products' && req.method === 'GET') {
        let allProds = [];
        for (const [k, s] of Object.entries(storesData)) {
          if (s && s.products) {
            allProds.push(...s.products);
          }
        }

        const filialeFilter = parsedUrl.query.filiale;
        const typeFilter = parsedUrl.query.type;
        const searchFilter = parsedUrl.query.search?.toLowerCase();

        if (filialeFilter && filialeFilter !== 'all') {
          allProds = allProds.filter(p => p.filialeKey === filialeFilter);
        }
        if (typeFilter && typeFilter !== 'all') {
          allProds = allProds.filter(p => p.filialeType === typeFilter);
        }
        if (searchFilter) {
          allProds = allProds.filter(p => 
            p.name?.toLowerCase().includes(searchFilter) ||
            p.brand?.toLowerCase().includes(searchFilter) ||
            p.category?.toLowerCase().includes(searchFilter)
          );
        }

        return sendJson(200, allProds);
      }

      if (endpoint === '/global/orders' && req.method === 'GET') {
        const authUser = getAuthenticatedUser(req);
        if (!authUser || (authUser.role !== 'ADMIN' && authUser.role !== 'SUPER_ADMIN')) {
          return sendJson(403, { error: 'Forbidden', message: 'Accès interdit. Droits administrateur requis pour consulter les commandes du groupe.' });
        }

        let allOrders = [];
        for (const [k, s] of Object.entries(storesData)) {
          if (s && s.orders) {
            allOrders.push(...s.orders);
          }
        }
        allOrders.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
        return sendJson(200, allOrders);
      }

      if (endpoint.startsWith('/global/orders/') && req.method === 'PUT') {
        const orderId = endpoint.replace('/global/orders/', '');
        const body = await getBody();
        for (const s of Object.values(storesData)) {
          if (!s || !s.orders) continue;
          const idx = s.orders.findIndex(o => o.id === orderId);
          if (idx !== -1) {
            s.orders[idx] = { ...s.orders[idx], ...body };
            return sendJson(200, s.orders[idx]);
          }
        }
        return sendJson(404, { message: 'Commande introuvable' });
      }

      // --- FILIALE SWITCHING & CONFIG ---
      if (endpoint === '/set-shop' && req.method === 'POST') {
        const body = await getBody();
        if (body.shop && storesData[body.shop]) {
          activeShop = body.shop;
          res.setHeader('Set-Cookie', `shop=${activeShop}; Path=/; Max-Age=31536000; SameSite=Lax`);
          return sendJson(200, { success: true, activeShop });
        }
        return sendJson(400, { error: 'Invalid shop' });
      }

      // --- UNIFIED AUTH ROUTES (100% Dynamic with MongoDB schema) ---
      if (endpoint === '/auth/me' && req.method === 'GET') {
        const authUser = getAuthenticatedUser(req);
        if (!authUser) {
          return sendJson(401, { message: 'Non authentifié. Aucun utilisateur connecté.' });
        }
        return sendJson(200, authUser);
      }

      if ((endpoint === '/auth/profile' || endpoint === '/auth/me') && (req.method === 'PUT' || req.method === 'PATCH')) {
        const authUser = getAuthenticatedUser(req);
        if (!authUser) {
          return sendJson(401, { message: 'Non authentifié' });
        }
        const body = await getBody();
        if (body.firstName) authUser.firstName = body.firstName;
        if (body.lastName) authUser.lastName = body.lastName;
        if (body.phone) authUser.phone = body.phone;
        if (body.addresses) authUser.addresses = body.addresses;
        return sendJson(200, authUser);
      }

      if (endpoint === '/auth/login' && req.method === 'POST') {
        const body = await getBody();
        const email = (body.email || '').trim().toLowerCase();
        let found = users.find(u => u.email?.toLowerCase() === email);
        if (!found) {
          const isAdmin = email.includes('admin') || body.role === 'ADMIN';
          found = {
            _id: `usr-${Date.now()}`,
            id: Date.now(),
            firstName: body.firstName || email.split('@')[0] || 'Client',
            lastName: body.lastName || '',
            email: body.email,
            role: isAdmin ? 'ADMIN' : 'CUSTOMER',
            phone: body.phone || '+216 -- --- ---',
            addresses: [{ type: 'Domicile', street: 'Avenue Habib Bourguiba', city: 'Tunis', postalCode: '1000', isDefault: true }]
          };
          users.push(found);
        }
        
        const token = 'jwt_' + Date.now() + '_' + Math.random().toString(36).substring(2);
        sessions.set(token, found);
        
        res.setHeader('Set-Cookie', [
          `token=${token}; Path=/; Max-Age=604800; SameSite=Lax`,
          `accessToken=${token}; Path=/; Max-Age=604800; SameSite=Lax`
        ]);

        return sendJson(200, {
          accessToken: token,
          user: found
        });
      }

      if (endpoint === '/auth/register' && req.method === 'POST') {
        const body = await getBody();
        const email = (body.email || '').trim().toLowerCase();
        let existing = users.find(u => u.email?.toLowerCase() === email);
        if (existing) {
          return sendJson(400, { message: 'Cet email est déjà enregistré.' });
        }
        const isAdmin = email.includes('admin') || body.role === 'ADMIN';
        const newUser = {
          _id: `usr-${Date.now()}`,
          id: Date.now(),
          firstName: body.firstName || 'Client',
          lastName: body.lastName || '',
          email: body.email,
          role: isAdmin ? 'ADMIN' : 'CUSTOMER',
          phone: body.phone || '+216 -- --- ---',
          addresses: body.address ? [{ type: 'Domicile', street: body.address, city: body.city || 'Tunis', postalCode: '1000', isDefault: true }] : []
        };
        users.push(newUser);

        const token = 'jwt_' + Date.now() + '_' + Math.random().toString(36).substring(2);
        sessions.set(token, newUser);

        res.setHeader('Set-Cookie', [
          `token=${token}; Path=/; Max-Age=604800; SameSite=Lax`,
          `accessToken=${token}; Path=/; Max-Age=604800; SameSite=Lax`
        ]);

        return sendJson(201, {
          accessToken: token,
          user: newUser
        });
      }

      if (endpoint === '/auth/refresh' && req.method === 'POST') {
        const authUser = getAuthenticatedUser(req);
        if (!authUser) {
          return sendJson(401, { message: 'Session invalide' });
        }
        const newToken = 'jwt_' + Date.now() + '_' + Math.random().toString(36).substring(2);
        sessions.set(newToken, authUser);
        return sendJson(200, { accessToken: newToken });
      }

      if (endpoint === '/auth/logout') {
        const authHeader = req.headers['authorization'] || req.headers['Authorization'];
        const cookies = parseCookies(req.headers.cookie);
        const token = (authHeader && authHeader.startsWith('Bearer ')) ? authHeader.slice(7).trim() : (cookies.token || cookies.accessToken);
        if (token) {
          sessions.delete(token);
        }
        res.setHeader('Set-Cookie', [
          'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax',
          'accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax'
        ]);
        return sendJson(200, { message: 'Déconnecté avec succès' });
      }

      // --- STORE-SPECIFIC PRODUCTS ---
      if (endpoint === '/products' && req.method === 'GET') {
        let result = shop.products || [];
        const cat = parsedUrl.query.category;
        if (cat && cat !== 'product-list' && cat !== 'all') {
          result = result.filter(p => p.category?.toLowerCase() === cat.toLowerCase());
        }
        return sendJson(200, result);
      }

      if (endpoint.startsWith('/products/') && req.method === 'GET') {
        const id = parseInt(endpoint.replace('/products/', ''), 10);
        const prod = shop.products?.find(p => p.id === id);
        if (prod) return sendJson(200, prod);
        return sendJson(404, { message: 'Produit non trouvé' });
      }

      if (endpoint === '/products' && req.method === 'POST') {
        const body = await getBody();
        const newProduct = enrichProductWithFiliale({
          id: Date.now(),
          ...body,
          images: body.images?.length ? body.images : [body.imageUrl || 'https://picsum.photos/400/400']
        }, shop.key);
        shop.products.unshift(newProduct);
        return sendJson(201, newProduct);
      }

      if (endpoint.startsWith('/products/') && req.method === 'PUT') {
        const id = parseInt(endpoint.replace('/products/', ''), 10);
        const body = await getBody();
        const index = shop.products.findIndex(p => p.id === id);
        if (index !== -1) {
          shop.products[index] = enrichProductWithFiliale({ ...shop.products[index], ...body }, shop.key);
          return sendJson(200, shop.products[index]);
        }
        return sendJson(404, { message: 'Produit non trouvé' });
      }

      if (endpoint.startsWith('/products/') && req.method === 'DELETE') {
        const id = parseInt(endpoint.replace('/products/', ''), 10);
        shop.products = shop.products.filter(p => p.id !== id);
        return sendJson(200, { message: 'Produit supprimé' });
      }

      // --- CATEGORIES ---
      if (endpoint === '/categories' && req.method === 'GET') {
        return sendJson(200, shop.categories || []);
      }

      // --- PACKS ---
      if (endpoint === '/packs' && req.method === 'GET') {
        return sendJson(200, shop.packs || []);
      }
      if (endpoint.startsWith('/packs/') && req.method === 'GET') {
        const id = parseInt(endpoint.replace('/packs/', ''), 10);
        const pack = (shop.packs || []).find(p => p.id === id);
        if (pack) return sendJson(200, pack);
        return sendJson(404, { message: 'Pack non trouvé' });
      }

      // --- BRANDS ---
      if (endpoint === '/brands' && req.method === 'GET') {
        return sendJson(200, shop.brands || []);
      }
      if (endpoint === '/brands' && req.method === 'POST') {
        const body = await getBody();
        const newBrand = { id: Date.now(), ...body };
        shop.brands.push(newBrand);
        return sendJson(201, newBrand);
      }

      // --- STORES ---
      if (endpoint === '/stores' && req.method === 'GET') {
        return sendJson(200, shop.stores || []);
      }

      // --- ADVERTISEMENTS ---
      if (endpoint === '/advertisements' && req.method === 'GET') {
        return sendJson(200, shop.advertisements || {});
      }
      if (endpoint === '/advertisements' && (req.method === 'POST' || req.method === 'PUT')) {
        const body = await getBody();
        shop.advertisements = { 
          ...shop.advertisements, 
          ...body,
          logoConfig: { ...(shop.advertisements?.logoConfig || {}), ...(body?.logoConfig || {}) },
          fitnessHome: { ...(shop.advertisements?.fitnessHome || {}), ...(body?.fitnessHome || {}) }
        };
        return sendJson(200, shop.advertisements);
      }

      // --- OFFERS CONFIG ---
      if (endpoint === '/offers-config' && req.method === 'GET') {
        return sendJson(200, shop.offersConfig || {});
      }
      if (endpoint === '/offers-config' && req.method === 'POST') {
        const body = await getBody();
        shop.offersConfig = { ...shop.offersConfig, ...body };
        return sendJson(200, shop.offersConfig);
      }

      // --- PROMOTIONS ---
      if (endpoint === '/promotions' && req.method === 'GET') {
        return sendJson(200, shop.promotions || []);
      }

      // --- ORDERS ---
      if (endpoint === '/orders/myorders' && req.method === 'GET') {
        return sendJson(200, shop.orders || []);
      }
      if (endpoint === '/orders' && req.method === 'GET') {
        return sendJson(200, shop.orders || []);
      }
      if (endpoint === '/orders' && req.method === 'POST') {
        const body = await getBody();
        const authUser = getAuthenticatedUser(req);
        const customerName = authUser 
          ? `${authUser.firstName} ${authUser.lastName}`.trim() 
          : (body.customerInfo?.firstName ? `${body.customerInfo.firstName} ${body.customerInfo.lastName || ''}`.trim() : 'Client Invité');
        const newOrder = {
          id: `ORD-${shop.key.toUpperCase()}-${Date.now().toString().slice(-5)}`,
          customerName,
          date: new Date().toISOString().split('T')[0],
          status: 'En attente',
          filialeKey: shop.key,
          filialeName: shop.name,
          userId: authUser?._id || 'guest',
          ...body
        };
        shop.orders.unshift(newOrder);
        return sendJson(201, newOrder);
      }

      // --- PAYMENT ---
      if (endpoint === '/payment/create' && req.method === 'POST') {
        const body = await getBody();
        return sendJson(200, {
          success: true,
          paymentUrl: `#/order-history?payment=success&orderId=${body.orderId || 'ORD-NEW'}`
        });
      }

      // --- BLOG ---
      if (endpoint === '/blog' && req.method === 'GET') {
        return sendJson(200, shop.blogPosts || []);
      }
      if (endpoint.startsWith('/blog/') && req.method === 'GET') {
        const slug = endpoint.replace('/blog/', '');
        const post = (shop.blogPosts || []).find(b => b.slug === slug);
        if (post) return sendJson(200, post);
        return sendJson(404, { message: 'Article non trouvé' });
      }
      if (endpoint === '/blog' && req.method === 'POST') {
        const body = await getBody();
        const newPost = { id: Date.now(), ...body, date: new Date().toISOString().split('T')[0] };
        shop.blogPosts.unshift(newPost);
        return sendJson(201, newPost);
      }

      // --- CONTACT ---
      if (endpoint === '/contact' && req.method === 'POST') {
        const body = await getBody();
        const msg = { id: Date.now(), ...body, date: new Date().toISOString().split('T')[0], read: false };
        shop.contactMessages.unshift(msg);
        return sendJson(201, { success: true, message: 'Message envoyé avec succès.' });
      }
      if (endpoint === '/contact' && req.method === 'GET') {
        return sendJson(200, shop.contactMessages || []);
      }

      // --- REVIEWS ---
      if (endpoint.startsWith('/reviews/') && req.method === 'GET') {
        const parts = endpoint.split('/').filter(Boolean);
        const targetType = parts[1];
        const targetId = parseInt(parts[2], 10);
        const revs = (shop.reviews || []).filter(r => r.targetType === targetType && r.targetId === targetId);
        return sendJson(200, revs);
      }
      if (endpoint === '/reviews' && req.method === 'POST') {
        const body = await getBody();
        const authUser = getAuthenticatedUser(req);
        const rev = {
          _id: `rev-${Date.now()}`,
          userId: authUser ? authUser._id : 'guest',
          userName: authUser ? `${authUser.firstName} ${authUser.lastName}`.trim() : (body.userName || 'Client'),
          date: new Date().toISOString().split('T')[0],
          ...body
        };
        shop.reviews.unshift(rev);
        return sendJson(201, rev);
      }

      // --- CHAT ---
      if (endpoint.startsWith('/chat/') && req.method === 'GET') {
        return sendJson(200, []);
      }
      if (endpoint === '/chat/all' && req.method === 'GET') {
        return sendJson(200, []);
      }

      if (req.method === 'GET') {
        return sendJson(200, []);
      }
      return sendJson(200, { success: true });

    } catch (err) {
      console.error('API Error:', err);
      return sendJson(500, { error: 'Internal Server Error', message: err.message });
    }
  })();
}
