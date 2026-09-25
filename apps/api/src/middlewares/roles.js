// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Non authentifié.' });
    }
    // Accept ADMIN, SUPER_ADMIN, STORE_ADMIN
    const userRole = req.user.role;
    const isAllowed = roles.includes(userRole) || 
      (roles.includes('ADMIN') && (userRole === 'SUPER_ADMIN' || userRole === 'STORE_ADMIN')) ||
      (userRole === 'SUPER_ADMIN');

    if (!isAllowed) {
      return res.status(403).json({ message: `Accès interdit pour le rôle ${userRole}.` });
    }

    // If user is STORE_ADMIN and requested a different store
    if (userRole === 'STORE_ADMIN' && req.user.storeSlug && req.storeSlug && req.user.storeSlug !== req.storeSlug) {
      return res.status(403).json({ message: `Accès interdit à la boutique ${req.storeSlug}.` });
    }

    next();
  };
};

module.exports = { authorize };
