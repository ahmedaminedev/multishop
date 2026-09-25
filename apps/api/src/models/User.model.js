const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['SUPER_ADMIN', 'STORE_ADMIN', 'ADMIN', 'USER'], 
    default: 'USER' 
  },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' }, // null for SUPER_ADMIN
  storeSlug: { type: String }, // specific store if STORE_ADMIN
  phone: String,
  address: String,
  city: String,
  refreshToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
