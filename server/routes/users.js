const express = require('express');
const { getProfile, updateProfile, uploadResume, getPublicProfile, updateMe } = require('../controllers/userController');
const {
  getSettings,
  updateProfile: updateSettingsProfile,
  changePassword,
  updateNotifications,
  logoutAll,
  deleteAccount
} = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const uploadAvatar = require('../middleware/uploadAvatar');

const router = express.Router();

// ── Candidate profile (existing) ─────────────────────────────
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/me', protect, updateMe);
router.post('/upload-resume', protect, authorize('candidate'), upload.single('resume'), uploadResume);
router.get('/:id/profile', protect, getPublicProfile);

// ── Settings endpoints (all roles) ───────────────────────────
router.get('/settings',                   protect, getSettings);
router.put('/update-profile',             protect, uploadAvatar.single('profileImage'), updateSettingsProfile);
router.put('/change-password',            protect, changePassword);
router.put('/notification-preferences',   protect, updateNotifications);
router.post('/logout-all',                protect, logoutAll);
router.delete('/delete-account',          protect, deleteAccount);

module.exports = router;
