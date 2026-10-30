const express = require('express');
const {
  getSettings, updateProfile, changePassword,
  updateNotifications, logoutAll, deleteAccount,
} = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');
const uploadAvatar = require('../middleware/uploadAvatar');

const router = express.Router();
router.use(protect);

router.get('/me', getSettings);
router.put('/update-profile', uploadAvatar.single('profileImage'), updateProfile);
router.put('/change-password', changePassword);
router.put('/notifications', updateNotifications);
router.post('/logout-all', logoutAll);
router.delete('/delete-account', deleteAccount);

module.exports = router;
