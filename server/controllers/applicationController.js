const Application = require('../models/Application');
const Job = require('../models/Job');
const Profile = require('../models/Profile');
const path = require('path');
const fs = require('fs');

// @desc    Apply for a job
// @route   POST /api/applications
const applyJob = async (req, res) => {
  try {
    const { jobId, coverLetter, expectedSalary, availableFrom } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.status !== 'active') return res.status(400).json({ message: 'This job is no longer accepting applications' });

    // Check if already applied
    const existing = await Application.findOne({ job: jobId, candidate: req.user.id });
    if (existing) return res.status(400).json({ message: 'You have already applied for this job' });

    let resumeData = null;
    if (req.file) {
      resumeData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        uploadedAt: new Date()
      };
    } else {
      // Use resume from profile
      const profile = await Profile.findOne({ user: req.user.id });
      if (profile && profile.resume && profile.resume.path) {
        resumeData = profile.resume;
      }
    }

    if (!resumeData) {
      return res.status(400).json({ message: 'Please upload a resume or add one to your profile' });
    }

    const application = await Application.create({
      job: jobId,
      candidate: req.user.id,
      recruiter: job.postedBy,
      coverLetter,
      expectedSalary,
      availableFrom,
      resume: resumeData,
      statusHistory: [{ status: 'applied', changedBy: req.user.id }]
    });

    // Increment job application count
    await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } });

    await application.populate([
      { path: 'job', select: 'title company location' },
      { path: 'candidate', select: 'name email' }
    ]);

    res.status(201).json({ success: true, message: 'Application submitted successfully', application });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get applications for a job (recruiter)
// @route   GET /api/applications/job/:jobId
const getJobApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const query = { job: req.params.jobId };
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Application.countDocuments(query);

    const applications = await Application.find(query)
      .populate('candidate', 'name email phone avatar')
      .populate('job', 'title company')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      applications,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get candidate's applications
// @route   GET /api/applications/my-applications
const getMyApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { candidate: req.user.id };
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Application.countDocuments(query);

    const applications = await Application.find(query)
      .populate('job', 'title company location jobType salary status deadline')
      .populate('recruiter', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      applications,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update application status (recruiter)
// @route   PUT /api/applications/:id/status
const updateApplicationStatus = async (req, res) => {
  try {
    const { status, comment } = req.body;
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    const job = await Job.findById(application.job);
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const validStatuses = ['reviewing', 'shortlisted', 'interview', 'offered', 'hired', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    application.status = status;
    application.isShortlisted = status === 'shortlisted' || status === 'interview' || status === 'offered' || status === 'hired';
    application.statusHistory.push({ status, changedBy: req.user.id, comment });

    await application.save();
    await application.populate('candidate', 'name email');

    res.json({ success: true, message: 'Application status updated', application });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Withdraw application (candidate)
// @route   PUT /api/applications/:id/withdraw
const withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    if (application.candidate.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (['hired', 'rejected', 'withdrawn'].includes(application.status)) {
      return res.status(400).json({ message: 'Cannot withdraw this application' });
    }

    application.status = 'withdrawn';
    application.statusHistory.push({ status: 'withdrawn', changedBy: req.user.id });
    await application.save();

    res.json({ success: true, message: 'Application withdrawn successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Download resume
// @route   GET /api/applications/:id/resume
const downloadResume = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    const job = await Job.findById(application.job);

    // Only recruiter/admin can download
    if (
      req.user.role === 'candidate' &&
      application.candidate.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (req.user.role === 'recruiter' && job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const filePath = application.resume.path;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Resume file not found' });
    }

    res.download(filePath, application.resume.originalName);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  applyJob,
  getJobApplications,
  getMyApplications,
  updateApplicationStatus,
  withdrawApplication,
  downloadResume
};
