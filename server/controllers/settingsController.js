const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Application = require('../models/Application');
const Profile = require('../models/Profile');

const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    console.error('getSettings:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const userId = req.user.id;

    if (!name || name.trim().length < 2)
      return res.status(400).json({ message: 'Name must be at least 2 characters' });

    if (email) {
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email))
        return res.status(400).json({ message: 'Please enter a valid email address' });
      const existing = await User.findOne({ email: email.toLowerCase(), _id: { $ne: userId } });
      if (existing)
        return res.status(400).json({ message: 'Email is already in use by another account' });
    }

    if (phone && phone.trim() !== '') {
      const phoneRegex = /^[+]?[\d\s\-().]{7,20}$/;
      if (!phoneRegex.test(phone.trim()))
        return res.status(400).json({ message: 'Please enter a valid phone number' });
    }

    const updateFields = {
      name: name.trim(),
      phone: phone ? phone.trim() : '',
    };
    if (email) updateFields.email = email.toLowerCase().trim();

    if (req.file) {
      const currentUser = await User.findById(userId);
      if (currentUser.profileImage) {
        const oldPath = path.join(process.cwd(), currentUser.profileImage);
        if (fs.existsSync(oldPath)) { try { fs.unlinkSync(oldPath); } catch (_) {} }
      }
      updateFields.profileImage = `/uploads/avatars/${req.file.filename}`;
      updateFields.avatar = updateFields.profileImage;
    }

    const user = await User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true, runValidators: true });

    res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (err) {
    console.error('updateProfile:', err);
    if (err.code === 11000)
      return res.status(400).json({ message: 'Email is already in use' });
    if (err.name === 'ValidationError')
      return res.status(400).json({ message: Object.values(err.errors)[0]?.message || 'Validation error' });
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword)
      return res.status(400).json({ message: 'All password fields are required' });
    if (newPassword.length < 6)
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    if (newPassword !== confirmPassword)
      return res.status(400).json({ message: 'New password and confirm password do not match' });
    if (currentPassword === newPassword)
      return res.status(400).json({ message: 'New password must be different from your current password' });

    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch)
      return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error('changePassword:', err);
    res.status(500).json({ message: 'Server error while changing password' });
  }
};

const updateNotifications = async (req, res) => {
  try {
    const { emailNotifications, jobAlerts, applicationUpdates, marketingEmails } = req.body;
    const prefs = {};
    if (emailNotifications !== undefined) prefs['notificationPreferences.emailNotifications'] = Boolean(emailNotifications);
    if (jobAlerts !== undefined)          prefs['notificationPreferences.jobAlerts']           = Boolean(jobAlerts);
    if (applicationUpdates !== undefined) prefs['notificationPreferences.applicationUpdates']  = Boolean(applicationUpdates);
    if (marketingEmails !== undefined)    prefs['notificationPreferences.marketingEmails']      = Boolean(marketingEmails);

    const user = await User.findByIdAndUpdate(req.user.id, { $set: prefs }, { new: true });
    res.json({ success: true, message: 'Notification preferences saved', notificationPreferences: user.notificationPreferences });
  } catch (err) {
    console.error('updateNotifications:', err);
    res.status(500).json({ message: 'Server error while updating preferences' });
  }
};

const logoutAll = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $set: { tokensValidAfter: new Date() } });
    res.json({ success: true, message: 'Logged out from all devices successfully' });
  } catch (err) {
    console.error('logoutAll:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password)
      return res.status(400).json({ message: 'Please enter your password to confirm deletion' });

    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: 'Incorrect password — account not deleted' });

    if (user.role === 'admin')
      return res.status(403).json({ message: 'Admin accounts cannot be self-deleted' });

    if (user.profileImage) {
      const imgPath = path.join(process.cwd(), user.profileImage);
      if (fs.existsSync(imgPath)) { try { fs.unlinkSync(imgPath); } catch (_) {} }
    }

    await Profile.deleteOne({ user: req.user.id });
    await Application.deleteMany({ candidate: req.user.id });
    await User.findByIdAndDelete(req.user.id);

    res.json({ success: true, message: 'Your account has been permanently deleted' });
  } catch (err) {
    console.error('deleteAccount:', err);
    res.status(500).json({ message: 'Server error while deleting account' });
  }
};

module.exports = { getSettings, updateProfile, changePassword, updateNotifications, logoutAll, deleteAccount };
