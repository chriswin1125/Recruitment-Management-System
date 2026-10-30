const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc    Get all jobs (public)
// @route   GET /api/jobs
const getJobs = async (req, res) => {
  try {
    const {
      page = 1, limit = 10, search, category, jobType,
      experienceLevel, location, minSalary, maxSalary, status = 'active'
    } = req.query;

    const query = { status };

    if (search) {
      query.$text = { $search: search };
    }
    if (category) query.category = category;
    if (jobType) query.jobType = jobType;
    if (experienceLevel) query.experienceLevel = experienceLevel;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (minSalary || maxSalary) {
      query['salary.min'] = {};
      if (minSalary) query['salary.min'].$gte = Number(minSalary);
      if (maxSalary) query['salary.max'] = { $lte: Number(maxSalary) };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Job.countDocuments(query);

    const jobs = await Job.find(query)
      .populate('postedBy', 'name email avatar')
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      jobs,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email avatar');

    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Increment view count
    job.viewCount += 1;
    await job.save();

    res.json({ success: true, job });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create job (recruiter)
// @route   POST /api/jobs
const createJob = async (req, res) => {
  try {
    const jobData = { ...req.body, postedBy: req.user.id };
    const job = await Job.create(jobData);
    await job.populate('postedBy', 'name email');
    res.status(201).json({ success: true, job });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
const updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this job' });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    }).populate('postedBy', 'name email');

    res.json({ success: true, job });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await Job.findByIdAndDelete(req.params.id);
    await Application.deleteMany({ job: req.params.id });

    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get jobs by recruiter
// @route   GET /api/jobs/recruiter/my-jobs
const getMyJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { postedBy: req.user.id };
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Job.countDocuments(query);

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Add application count to each job
    const jobsWithCounts = await Promise.all(jobs.map(async (job) => {
      const count = await Application.countDocuments({ job: job._id });
      return { ...job.toObject(), applicationCount: count };
    }));

    res.json({
      success: true,
      jobs: jobsWithCounts,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getJobs, getJob, createJob, updateJob, deleteJob, getMyJobs };
