
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
  try {
    // 1. Users (Admin & Client)
    // Force delete admin to ensure clean password hash generation
    await User.deleteOne({ email: 'admin@electroshop.com' });
    
    await User.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@electroshop.com',
      password: 'password123',
      role: 'ADMIN',
      phone: '00000000'
    });
    console.log('Admin recréé (Email: admin@electroshop.com, MDP: password123)');

    let clientUser = await User.findOne({ email: 'client@electroshop.com' });
    if (!clientUser) {
      clientUser = await User.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'client@electroshop.com',
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
      console.log('Client créé');
    }

    // 2. Products
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
        await Product.insertMany(allProducts);
        console.log('Produits importés');
    }

    // 3. Categories
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
        await Category.insertMany(categories);
        console.log('Catégories importées');
    }

    // 4. Packs
    const packCount = await Pack.countDocuments();
    if (packCount === 0) {
        await Pack.insertMany(packs);
        console.log('Packs importées');
    }

    // 5. Stores
    const storeCount = await Store.countDocuments();
    if (storeCount === 0) {
        await Store.insertMany(stores);
        console.log('Magasins importés');
    }

    // 6. Advertisements (Singleton)
    const adCount = await Advertisement.countDocuments();
    if (adCount === 0) {
        await Advertisement.create(initialAdvertisements);
        console.log('Publicités importées');
    }

    // 7. Promotions
    const promoCount = await Promotion.countDocuments();
    if (promoCount === 0) {
        await Promotion.insertMany(promotions);
        console.log('Promotions importées');
    }

    // 8. Orders
    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
        if (clientUser) {
            const ordersWithUser = sampleOrders.map(order => ({
                ...order,
                user: clientUser._id
            }));
            await Order.insertMany(ordersWithUser);
            console.log('Commandes importées');
        } else {
            console.warn('Ignoré: Commandes non importées (Client introuvable)');
        }
    }

    // 9. Blog Posts
    const blogCount = await BlogPost.countDocuments();
    if (blogCount === 0) {
        await BlogPost.insertMany(blogPosts);
        console.log('Articles de blog importés');
    }

    // 10. Contact Messages
    const msgCount = await ContactMessage.countDocuments();
    if (msgCount === 0) {
        await ContactMessage.insertMany(contactMessages);
        console.log('Messages de contact importés');
    }

  } catch (error) {
    console.error('Erreur Seeding:', error);
  }
};

module.exports = seedData;
