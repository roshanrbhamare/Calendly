const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { z } = require('zod');

const availabilitySchema = z.array(z.object({
    day_of_week: z.number().int().min(0).max(6),
    start_time: z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, "Invalid time format (HH:MM:SS)"),
    end_time: z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, "Invalid time format (HH:MM:SS)")
}).refine(data => data.start_time < data.end_time, {
    message: "End time must be cleanly after start time",
    path: ["end_time"]
})).refine(data => {
    // Check for overlaps within the same day
    for (let day = 0; day <= 6; day++) {
        const daySlots = data.filter(s => s.day_of_week === day).sort((a, b) => a.start_time.localeCompare(b.start_time));
        for (let i = 0; i < daySlots.length - 1; i++) {
            if (daySlots[i].end_time > daySlots[i+1].start_time) {
                return false; // overlapping detected
            }
        }
    }
    return true;
}, { message: "Time intervals cannot overlap on the same day" });

exports.getAvailability = async (req, res) => {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'x-user-id header required' });

    const [userRows] = await db.query('SELECT timezone FROM users WHERE id = ?', [userId]);
    const userTimezone = userRows[0]?.timezone || 'UTC';

    const [rows] = await db.query('SELECT day_of_week, start_time, end_time FROM availabilities WHERE user_id = ? ORDER BY day_of_week, start_time', [userId]);
    
    res.json({
        availabilities: rows,
        timezone: userTimezone
    });
};

exports.setAvailability = async (req, res) => {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'x-user-id header required' });

    const { availabilities, timezone } = req.body;
    
    // Validate availabilities array
    const validatedAvailabilities = availabilitySchema.parse(availabilities || []);

    // Using a transaction to replace old availability completely
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Update timezone if provided
        if (timezone) {
            await connection.query('UPDATE users SET timezone = ? WHERE id = ?', [timezone, userId]);
        }

        await connection.query('DELETE FROM availabilities WHERE user_id = ?', [userId]);

        for (const slot of validatedAvailabilities) {
            await connection.query(
                'INSERT INTO availabilities (id, user_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?, ?)',
                [uuidv4(), userId, slot.day_of_week, slot.start_time, slot.end_time]
            );
        }

        await connection.commit();
        res.json({ message: 'Availability and timezone updated successfully' });
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};
