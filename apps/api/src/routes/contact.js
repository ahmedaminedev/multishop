const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');

// GET /api/contact
router.get('/', (req, res) => {
  const storeSlug = req.storeSlug || req.query.storeSlug || null;
  res.json(dataStore.getContactMessages(storeSlug));
});

// POST /api/contact
router.post('/', (req, res) => {
  const storeSlug = req.storeSlug || req.body.storeSlug || null;
  const msg = dataStore.createContactMessage(req.body, storeSlug);
  res.status(201).json(msg);
});

// PUT /api/contact/:id
router.put('/:id', (req, res) => {
  const storeSlug = req.storeSlug || req.body.storeSlug || null;
  const updated = dataStore.updateContactMessage(req.params.id, req.body, storeSlug);
  if (!updated) return res.status(404).json({ message: 'Message introuvable' });
  res.json(updated);
});

// DELETE /api/contact/:id
router.delete('/:id', (req, res) => {
  const storeSlug = req.storeSlug || req.query.storeSlug || null;
  const deleted = dataStore.deleteContactMessage(req.params.id, storeSlug);
  if (!deleted) return res.status(404).json({ message: 'Message introuvable' });
  res.json({ message: 'Message supprimé avec succès' });
});

module.exports = router;
