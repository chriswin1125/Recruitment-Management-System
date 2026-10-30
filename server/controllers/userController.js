const User = require('../models/User');
const Profile = require('../models/Profile');

// @desc    Get profile
// @route   GET /api/users/profile
const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id })
      .populate('user', 'name email phone avatar role');
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update profile
// @route   PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, headline, bio, location, website, linkedin, github,
      skills, experience, education, expectedSalary, availableFrom, jobType } = req.body;

    // Update user
    await User.findByIdAndUpdate(req.user.id, { name, phone });

    // Update or create profile
    let profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new Profile({ user: req.user.id });
    }

    Object.assign(profile, {
      headline, bio, location, website, linkedin, github,
      skills: skills ? (Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim())) : profile.skills,
      experience: experience || profile.experience,
      education: education || profile.education,
      expectedSalary, availableFrom, jobType
    });

    await profile.save();
    await profile.populate('user', 'name email phone avatar role');

    res.json({ success: true, message: 'Profile updated successfully', profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Upload resume
// @route   POST /api/users/upload-resume
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    let profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new Profile({ user: req.user.id });
    }

    profile.resume = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      uploadedAt: new Date()
    };

    await profile.save();

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      resume: profile.resume
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get public profile
// @route   GET /api/users/:id/profile
const getPublicProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.id })
      .populate('user', 'name email avatar role createdAt');
    
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    
    // Hide resume path for privacy
    const profileObj = profile.toObject();
    if (profileObj.resume) delete profileObj.resume.path;
    
    res.json({ success: true, profile: profileObj });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user info
// @route   PUT /api/users/me
const updateMe = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getProfile, updateProfile, uploadResume, getPublicProfile, updateMe };
