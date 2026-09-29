
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const AddressSchema = new mongoose.Schema({
  type: { type: String, default: 'DOMICILE' },
  street: String,
  city: String,
  postalCode: String,
  isDefault: { type: Boolean, default: false }
});

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  
  // Le mot de passe est requis UNIQUEMENT pour les comptes locaux
  password: { 
    type: String, 
    required: function() { return this.provider === 'local'; } 
  },
  
  phone: { type: String, default: 'N/A' },
  role: { type: String, enum: ['CUSTOMER', 'ADMIN', 'GARAGISTE'], default: 'CUSTOMER' },
  addresses: [AddressSchema],
  age: Number,
  photo_profil: String,
  
  // OAuth Fields
  googleId: String,
  facebookId: String,
  provider: { type: String, default: 'local' }, // 'local', 'google', 'facebook'
  status_validation: { type: String, default: 'validé' },
  isProfileComplete: { type: Boolean, default: true },

  // Security Fields (Tokens)
  refreshToken: { type: String }, 
  refreshTokenExpiry: { type: Date },
  derniere_connexion: { type: Date },
  
  passwordResetToken: String,
  passwordResetExpires: Date
}, { timestamps: true });

UserSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

  return resetToken;
};

// Hook pour hacher le mot de passe avant la sauvegarde
UserSchema.pre('save', async function (next) {
  // Si le mot de passe n'est pas modifié ou s'il n'existe pas (cas OAuth), on passe
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
  } catch (error) {
      return next(error);
  }
});

module.exports = mongoose.model('User', UserSchema);
