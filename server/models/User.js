// Updated User model — includes phone, profileImage,
// notificationPreferences, tokensValidAfter (logout-all)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'recruiter', 'candidate'],
    default: 'candidate'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: true
  },

  // ── Profile fields ───────────────────────────────────────────
  phone: {
    type: String,
    trim: true,
    default: '',
    match: [/^[+]?[\d\s\-().]{0,20}$/, 'Please enter a valid phone number']
  },
  profileImage: {
    type: String,
    default: ''   // relative URL: /uploads/avatars/<filename>
  },
  avatar: {
    type: String,
    default: ''   // kept for backward-compat
  },

  // ── Notification preferences ─────────────────────────────────
  notificationPreferences: {
    emailNotifications: { type: Boolean, default: true  },
    jobAlerts:          { type: Boolean, default: true  },
    applicationUpdates: { type: Boolean, default: true  },
    marketingEmails:    { type: Boolean, default: false }
  },

  // ── Token management (logout-all) ────────────────────────────
  // Any JWT issued before this timestamp is rejected by the protect middleware.
  // Set to Date.now() on logout-all to invalidate every existing session.
  tokensValidAfter: {
    type: Date,
    default: null,
    select: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// ── Hooks ────────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Instance methods ─────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.activeTokens;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
