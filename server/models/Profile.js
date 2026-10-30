const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  headline: {
    type: String,
    trim: true,
    maxlength: 200
  },
  bio: {
    type: String,
    maxlength: 2000
  },
  location: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  linkedin: {
    type: String,
    trim: true
  },
  github: {
    type: String,
    trim: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  experience: [{
    title: String,
    company: String,
    location: String,
    from: Date,
    to: Date,
    current: { type: Boolean, default: false },
    description: String
  }],
  education: [{
    school: String,
    degree: String,
    fieldOfStudy: String,
    from: Date,
    to: Date,
    current: { type: Boolean, default: false },
    description: String
  }],
  resume: {
    filename: String,
    originalName: String,
    path: String,
    uploadedAt: { type: Date, default: Date.now },
    size: Number
  },
  expectedSalary: {
    type: Number
  },
  availableFrom: {
    type: Date
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship'],
    default: 'full-time'
  }
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
