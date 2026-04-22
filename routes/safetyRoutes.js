const express = require('express');
const router = express.Router();
const safetyController = require('../controllers/safetyController');
const { protect } = require('../middleware/auth');

router.get('/', protect, safetyController.getAllPermits);
router.post('/', protect, safetyController.createPermit);
router.patch('/:id', protect, safetyController.updatePermitStatus);
router.delete('/:id', protect, safetyController.deletePermit);

module.exports = router;
