const express = require('express');
const {
  getDashboardStats, getAllUsers, toggleUserStatus,
  updateJobStatus, deleteUser, createAdmin
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.delete('/users/:id', deleteUser);
router.post('/create-admin', createAdmin);
router.put('/jobs/:id/status', updateJobStatus);

module.exports = router;
