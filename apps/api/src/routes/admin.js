const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');
const { protect } = require('../middlewares/auth');

// GET /api/admin/dashboard
router.get('/dashboard', (req, res) => {
  const storeSlug = req.storeSlug || req.query.storeSlug || req.query.store || null;
  const stats = dataStore.getDashboardStats(storeSlug);
  res.json(stats);
});

// GET /api/admin/stats
router.get('/stats', (req, res) => {
  const storeSlug = req.storeSlug || req.query.storeSlug || null;
  const stats = dataStore.getDashboardStats(storeSlug);
  res.json(stats);
});

// GET /api/admin/users
router.get('/users', (req, res) => {
  const safeUsers = dataStore.users.map(({ password, ...rest }) => rest);
  res.json(safeUsers);
});

// POST /api/admin/users
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role, storeSlug, phone, address, city } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: 'Nom et email requis.' });
    }
    const cleanEmail = email.toLowerCase().trim();
    if (dataStore.users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà.' });
    }

    const newUser = {
      id: `usr_${Date.now()}`,
      _id: `usr_${Date.now()}`,
      name,
      email: cleanEmail,
      password: password || 'admin123',
      role: role || 'STORE_ADMIN',
      storeSlug: storeSlug || null,
      phone: phone || '',
      address: address || '',
      city: city || '',
      createdAt: new Date().toISOString()
    };
    dataStore.users.push(newUser);
    const { password: _, ...safeUser } = newUser;
    res.status(201).json(safeUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/users/:id
router.put('/users/:id', (req, res) => {
  const user = dataStore.users.find(u => u.id === req.params.id || u._id === req.params.id);
  if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });

  if (req.body.name) user.name = req.body.name;
  if (req.body.role) user.role = req.body.role;
  if (req.body.storeSlug !== undefined) user.storeSlug = req.body.storeSlug;
  if (req.body.phone !== undefined) user.phone = req.body.phone;
  if (req.body.city !== undefined) user.city = req.body.city;
  if (req.body.password) user.password = req.body.password;

  const { password, ...safeUser } = user;
  res.json(safeUser);
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', (req, res) => {
  const idx = dataStore.users.findIndex(u => u.id === req.params.id || u._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Utilisateur introuvable.' });
  dataStore.users.splice(idx, 1);
  res.json({ message: 'Utilisateur supprimé avec succès.' });
});

// GET /api/admin/messages
router.get('/messages', (req, res) => {
  const storeSlug = req.storeSlug || req.query.storeSlug || null;
  const messages = dataStore.getContactMessages(storeSlug);
  res.json(messages);
});

module.exports = router;
