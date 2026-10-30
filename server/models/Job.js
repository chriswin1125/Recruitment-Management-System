const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: 200
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  companyLogo: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    required: [true, 'Job description is required']
  },
  requirements: [{
    type: String
  }],
  responsibilities: [{
    type: String
  }],
  skills: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship', 'remote'],
    default: 'full-time'
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
    default: 'mid'
  },
  salary: {
    min: { type: Number },
    max: { type: Number },
    currency: { type: String, default: 'USD' },
    period: { type: String, enum: ['hourly', 'monthly', 'yearly'], default: 'yearly' },
    isVisible: { type: Boolean, default: true }
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Technology', 'Marketing', 'Sales', 'Finance', 'HR', 'Operations',
      'Design', 'Engineering', 'Healthcare', 'Education', 'Legal', 'Other'
    ]
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'active', 'closed', 'rejected'],
    default: 'active'
  },
  deadline: {
    type: Date
  },
  vacancies: {
    type: Number,
    default: 1,
    min: 1
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicationCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String
  }]
}, { timestamps: true });

// Text index for search
jobSchema.index({
  title: 'text',
  description: 'text',
  company: 'text',
  location: 'text',
  skills: 'text'
});

module.exports = mongoose.model('Job', jobSchema);
