const db = require('../config/db');
const slotService = require('../services/slotService');

exports.getAvailableSlots = async (req, res) => {
    const { date, slug, userId } = req.query;

    if (!date || !slug || !userId) {
        return res.status(400).json({ error: 'date, slug, and userId are required parameters' });
    }

    try {
        const result = await slotService.calculateAvailableSlots(date, slug, userId);
        res.json({ date, slots: result.slots, timezone: result.timezone });
    } catch (error) {
        console.error('Slot generation error:', error);
        res.status(500).json({ error: 'Failed to generate slots', details: error.message });
    }
};
