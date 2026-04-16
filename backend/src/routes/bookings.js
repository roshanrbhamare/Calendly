const express = require('express');
const router = express.Router();
const bookingsController = require('../controllers/bookingsController');

router.post('/', bookingsController.createBooking);
router.get('/', bookingsController.getBookings);
router.delete('/:id', bookingsController.cancelBooking);
router.put('/:id/reschedule', bookingsController.rescheduleBooking);

module.exports = router;
