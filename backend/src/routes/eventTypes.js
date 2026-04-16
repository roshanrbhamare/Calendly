const express = require('express');
const router = express.Router();
const eventTypesController = require('../controllers/eventTypesController');

// For MVP, we pass a user_id via query param or headers, or assume a fixed one.
// We will use a header 'x-user-id' for simplicity.

router.get('/', eventTypesController.getEventTypes);
router.get('/:slug', eventTypesController.getEventTypeBySlug);
router.post('/', eventTypesController.createEventType);
router.put('/:id', eventTypesController.updateEventType);
router.delete('/:id', eventTypesController.deleteEventType);

module.exports = router;
