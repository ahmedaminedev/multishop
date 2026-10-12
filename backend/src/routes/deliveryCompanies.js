const express = require('express');
const router = express.Router();
const deliveryCompanyController = require('../controllers/deliveryCompany');
const { protect, restrictTo } = require('../middleware/auth');

router
  .route('/')
  .get(deliveryCompanyController.getAllCompanies)
  .post(protect, restrictTo('ADMIN'), deliveryCompanyController.createCompany);

router
  .route('/:id')
  .put(protect, restrictTo('ADMIN'), deliveryCompanyController.updateCompany)
  .delete(protect, restrictTo('ADMIN'), deliveryCompanyController.deleteCompany);

module.exports = router;
