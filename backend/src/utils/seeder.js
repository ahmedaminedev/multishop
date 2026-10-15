const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Pack = require('../models/Pack');
const Store = require('../models/Store');
const Advertisement = require('../models/Advertisement');
const Promotion = require('../models/Promotion');
const Order = require('../models/Order');
const BlogPost = require('../models/BlogPost');
const ContactMessage = require('../models/ContactMessage');
const { allProducts, categories, packs, stores, initialAdvertisements, promotions, sampleOrders, blogPosts, contactMessages } = require('../data/initialData');

const seedData = async () => {
  if (mongoose.connection.readyState !== 1) {
    console.log('[SEEDER] MongoDB non connecté, seeding MongoDB ignoré.');
    return;
  }
  try {
    // 1. Users (Admin & Client)
    await User.deleteMany({ email: { $in: ['admin@multishop.com', 'admin@multishop.tn', 'client@multishop.com', 'client@multishop.tn'] } });
    
    await User.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@multishop.com',
      password: 'password123',
      role: 'ADMIN',
      phone: '+216 71 000 000'
    });
    console.log('✅ Admin créé (Email: admin@multishop.com, MDP: password123)');

    await User.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@multishop.tn',
      password: 'password123',
      role: 'ADMIN',
      phone: '+216 71 000 000'
    });
    console.log('✅ Admin TN créé (Email: admin@multishop.tn, MDP: password123)');

    let clientUser = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'client@multishop.com',
      password: 'password123',
      role: 'CUSTOMER',
      phone: '12345678',
      addresses: [{
          type: 'Domicile',
          street: '123 Rue de la Liberté', 
          city: 'Tunis', 
          postalCode: '1002', 
          isDefault: true
      }]
    });
    console.log('✅ Client créé (Email: client@multishop.com, MDP: password123)');

    // 2. Products - Synchronisation complète des 36 produits de tous les sous-sites
    const productCount = await Product.countDocuments();
    if (productCount < allProducts.length) {
      for (const p of allProducts) {
        await Product.findOneAndUpdate({ id: p.id }, { $set: p }, { upsert: true, new: true });
      }
      console.log(`✅ Produits synchronisés (${allProducts.length} produits de tous les sous-sites dans MongoDB)`);
    } else {
      console.log(`✅ Produits vérifiés (${productCount} produits en base)`);
    }

    // 3. Categories
    const categoryCount = await Category.countDocuments();
    if (categoryCount < categories.length) {
      for (const c of categories) {
        await Category.findOneAndUpdate({ name: c.name, shop: c.shop || c.filialeKey || 'nutrition' }, { $set: c }, { upsert: true });
      }
      console.log(`✅ Catégories synchronisées (${categories.length} catégories)`);
    }

    // 4. Packs
    const packCount = await Pack.countDocuments();
    if (packCount < packs.length) {
      for (const pk of packs) {
        await Pack.findOneAndUpdate({ id: pk.id }, { $set: pk }, { upsert: true });
      }
      console.log(`✅ Packs synchronisés (${packs.length} packs)`);
    }

    // 5. Stores
    const storeCount = await Store.countDocuments();
    if (storeCount < stores.length) {
      for (const s of stores) {
        await Store.findOneAndUpdate({ id: s.id }, { $set: s }, { upsert: true });
      }
      console.log(`✅ Magasins synchronisés (${stores.length} magasins)`);
    }

    // 6. Advertisements (Singleton)
    const adCount = await Advertisement.countDocuments();
    if (adCount === 0) {
        await Advertisement.create(initialAdvertisements);
        console.log('✅ Publicités importées');
    }

    // 7. Promotions
    const promoCount = await Promotion.countDocuments();
    if (promoCount === 0) {
        const normalizedPromos = promotions.map((p, idx) => {
            const shopKey = p.shop || p.filialeKey || 'nutrition';
            const name = p.name || p.title || `Promotion ${idx + 1}`;
            return {
                ...p,
                name,
                title: p.title || name,
                discount: p.discount || p.discountPercentage || 0,
                discountPercentage: p.discountPercentage || p.discount || 0,
                shop: shopKey,
                filialeKey: shopKey
            };
        });
        await Promotion.insertMany(normalizedPromos);
        console.log(`✅ Promotions importées (${normalizedPromos.length} promotions dans MongoDB)`);
    }

    // 8. Orders
    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
        if (clientUser) {
            const ordersWithUser = sampleOrders.map(order => {
                const customerName = order.customerName || (order.customer ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() : 'Client MultiShop');
                const shippingAddress = order.shippingAddress || (order.customer ? `${order.customer.address || ''}, ${order.customer.city || ''}` : '123 Rue de la Liberté, Tunis');
                const itemCount = order.itemCount || (Array.isArray(order.items) ? order.items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 1);
                const paymentMethod = order.paymentMethod || 'Paiement à la livraison';
                const total = order.total || order.totalAmount || 0;

                return {
                    ...order,
                    user: clientUser._id,
                    customerName,
                    shippingAddress,
                    itemCount,
                    paymentMethod,
                    total,
                    status: order.status || 'En attente'
                };
            });
            await Order.insertMany(ordersWithUser);
            console.log(`✅ Commandes synchronisées (${ordersWithUser.length} commandes dans MongoDB)`);
        } else {
            console.warn('Ignoré: Commandes non importées (Client introuvable)');
        }
    }

    // 9. Blog Posts
    const blogCount = await BlogPost.countDocuments();
    if (blogCount === 0) {
        const normalizedBlogPosts = blogPosts.map((post, idx) => {
            const shopKey = post.shop || post.filialeKey || 'nutrition';
            const slug = post.slug || (post.title ? post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `post-${shopKey}-${idx + 1}`);
            return {
                ...post,
                id: post.id !== undefined ? `${shopKey}-blog-${post.id}` : `${shopKey}-blog-${idx + 1}`,
                slug,
                excerpt: post.excerpt || post.summary || '',
                summary: post.summary || post.excerpt || '',
                imageUrl: post.imageUrl || post.image || '',
                image: post.image || post.imageUrl || '',
                shop: shopKey,
                filialeKey: shopKey
            };
        });
        await BlogPost.insertMany(normalizedBlogPosts);
        console.log(`✅ Articles de blog synchronisés (${normalizedBlogPosts.length} articles dans MongoDB)`);
    }

    // 10. Contact Messages
    const msgCount = await ContactMessage.countDocuments();
    if (msgCount === 0) {
        const normalizedMessages = contactMessages.map((msg, idx) => {
            const shopKey = msg.shop || msg.filialeKey || 'nutrition';
            return {
                ...msg,
                id: msg.id !== undefined ? `${shopKey}-msg-${msg.id}` : `${shopKey}-msg-${idx + 1}`,
                shop: shopKey,
                filialeKey: shopKey
            };
        });
        await ContactMessage.insertMany(normalizedMessages);
        console.log(`✅ Messages de contact synchronisés (${normalizedMessages.length} messages dans MongoDB)`);
    }

    console.log('🎉 [MongoDB] Base de données "multishop" prête et synchronisée avec succès !');
  } catch (error) {
    console.error('Erreur Seeding:', error);
  }
};

module.exports = seedData;
