const DeliveryCompany = require('../models/DeliveryCompany');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Helper to format text
const formatHorairesTexte = (horaires) => {
  if (!horaires || !Array.isArray(horaires) || horaires.length === 0) return '';
  return horaires
    .map(h => `${h.jourDebut === h.jourFin ? h.jourDebut : `${h.jourDebut} à ${h.jourFin}`} (${h.heureDebut} - ${h.heureFin})`)
    .join(', ');
};

// GET /api/delivery-companies
exports.getAllCompanies = catchAsync(async (req, res, next) => {
  try {
    const companies = await DeliveryCompany.find().sort({ createdAt: -1 });
    return res.status(200).json(companies);
  } catch (err) {
    // Graceful fallback if database is offline or empty
    return res.status(200).json([]);
  }
});

// POST /api/delivery-companies
exports.createCompany = catchAsync(async (req, res, next) => {
  const { nom, telephone, contact, zones, delaiMoyen, tarifDefaut, actif, horairesTravail, joursTravailTexte } = req.body;

  if (!nom || !nom.trim()) {
    return next(new AppError('Le nom de la société de livraison est obligatoire.', 400));
  }

  // Validate hourly interval obligation for each day interval
  if (Array.isArray(horairesTravail) && horairesTravail.length > 0) {
    for (const slot of horairesTravail) {
      if (!slot.heureDebut || !slot.heureFin) {
        return next(
          new AppError(
            `Obligation : L'intervalle horaire (heure de début et heure de fin) est obligatoire pour l'intervalle de jours ${slot.jourDebut} à ${slot.jourFin}.`,
            400
          )
        );
      }
    }
  }

  const formattedJours = joursTravailTexte || formatHorairesTexte(horairesTravail);

  const company = await DeliveryCompany.create({
    nom,
    telephone,
    contact,
    zones,
    delaiMoyen,
    tarifDefaut: Number(tarifDefaut) || 7,
    actif: actif !== false,
    horairesTravail: horairesTravail || [],
    joursTravailTexte: formattedJours
  });

  res.status(201).json(company);
});

// PUT /api/delivery-companies/:id
exports.updateCompany = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { horairesTravail, joursTravailTexte } = req.body;

  if (Array.isArray(horairesTravail) && horairesTravail.length > 0) {
    for (const slot of horairesTravail) {
      if (!slot.heureDebut || !slot.heureFin) {
        return next(
          new AppError(
            `Obligation : L'intervalle horaire est obligatoire pour l'intervalle de jours ${slot.jourDebut} à ${slot.jourFin}.`,
            400
          )
        );
      }
    }
  }

  const updates = { ...req.body };
  if (horairesTravail && !joursTravailTexte) {
    updates.joursTravailTexte = formatHorairesTexte(horairesTravail);
  }

  const updated = await DeliveryCompany.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!updated) {
    return next(new AppError('Société de livraison introuvable.', 404));
  }

  res.status(200).json(updated);
});

// DELETE /api/delivery-companies/:id
exports.deleteCompany = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const deleted = await DeliveryCompany.findByIdAndDelete(id);
  if (!deleted) {
    return next(new AppError('Société de livraison introuvable.', 404));
  }
  res.status(200).json({ success: true, message: 'Société de livraison supprimée avec succès.' });
});
