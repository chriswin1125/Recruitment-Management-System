const express = require('express');
const {
  applyJob, getJobApplications, getMyApplications,
  updateApplicationStatus, withdrawApplication, downloadResume
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/', protect, authorize('candidate'), upload.single('resume'), applyJob);
router.get('/my-applications', protect, authorize('candidate'), getMyApplications);
router.get('/job/:jobId', protect, authorize('recruiter', 'admin'), getJobApplications);
router.put('/:id/status', protect, authorize('recruiter', 'admin'), updateApplicationStatus);
router.put('/:id/withdraw', protect, authorize('candidate'), withdrawApplication);
router.get('/:id/resume', protect, downloadResume);

module.exports = router;
