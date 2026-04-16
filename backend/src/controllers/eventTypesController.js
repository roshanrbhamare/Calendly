const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { z } = require('zod');

const eventTypeSchema = z.object({
    name: z.string().min(1).max(255),
    description: z.string().max(1000).optional().default(''),
    duration: z.number().int().positive(),
    slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
    buffer_before: z.number().int().min(0).optional().default(0),
    buffer_after: z.number().int().min(0).optional().default(0),
    availabilities: z.array(z.object({
        day_of_week: z.number().int().min(0).max(6),
        start_time: z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/),
        end_time: z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    })).refine(data => {
        if (!data) return true;
        for (let s of data) {
            if (s.start_time >= s.end_time) return false;
        }
        return true;
    }, { message: "End time must be after start time" }).optional()
});

exports.getEventTypes = async (req, res) => {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'x-user-id header required' });

    const [eventTypes] = await db.query('SELECT * FROM event_types WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    
    // Fetch availabilities for each event type
    const [availabilities] = await db.query('SELECT * FROM event_availabilities WHERE event_type_id IN (SELECT id FROM event_types WHERE user_id = ?)', [userId]);
    
    const formattedEventTypes = eventTypes.map(et => {
        return {
            ...et,
            availabilities: availabilities.filter(a => a.event_type_id === et.id).map(a => ({
                day_of_week: a.day_of_week,
                start_time: a.start_time,
                end_time: a.end_time
            }))
        };
    });

    res.json(formattedEventTypes);
};

exports.getEventTypeBySlug = async (req, res) => {
    const { slug } = req.params;

    const [rows] = await db.query('SELECT * FROM event_types WHERE slug = ?', [slug]);
    if (rows.length === 0) return res.status(404).json({ error: 'Event type not found' });
    
    const eventType = rows[0];
    console.log('📝 Event fetched from DB:', {
        id: eventType.id,
        name: eventType.name,
        description: eventType.description,
        duration: eventType.duration,
        slug: eventType.slug,
        buffer_before: eventType.buffer_before,
        buffer_after: eventType.buffer_after
    });
    
    const [availabilities] = await db.query('SELECT day_of_week, start_time, end_time FROM event_availabilities WHERE event_type_id = ?', [eventType.id]);
    
    eventType.availabilities = availabilities;

    res.json(eventType);
};

exports.createEventType = async (req, res) => {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'x-user-id header required' });

    const data = eventTypeSchema.parse(req.body);
    const id = uuidv4();

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        await connection.query(
            'INSERT INTO event_types (id, user_id, name, description, duration, slug, buffer_before, buffer_after) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [id, userId, data.name, data.description, data.duration, data.slug, data.buffer_before, data.buffer_after]
        );

        if (data.availabilities && data.availabilities.length > 0) {
            for (const slot of data.availabilities) {
                await connection.query(
                    'INSERT INTO event_availabilities (id, event_type_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?, ?)',
                    [uuidv4(), id, slot.day_of_week, slot.start_time, slot.end_time]
                );
            }
        }

        await connection.commit();
        res.status(201).json({ id, ...data });
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

exports.updateEventType = async (req, res) => {
    const userId = req.headers['x-user-id'];
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: 'x-user-id header required' });

    const data = eventTypeSchema.parse(req.body);

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.query(
            'UPDATE event_types SET name = ?, description = ?, duration = ?, slug = ?, buffer_before = ?, buffer_after = ? WHERE id = ? AND user_id = ?',
            [data.name, data.description, data.duration, data.slug, data.buffer_before, data.buffer_after, id, userId]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Event type not found or unauthorized' });
        }

        if (data.availabilities) {
            await connection.query('DELETE FROM event_availabilities WHERE event_type_id = ?', [id]);
            for (const slot of data.availabilities) {
                await connection.query(
                    'INSERT INTO event_availabilities (id, event_type_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?, ?)',
                    [uuidv4(), id, slot.day_of_week, slot.start_time, slot.end_time]
                );
            }
        }

        await connection.commit();
        res.json({ message: 'Updated successfully' });
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

exports.deleteEventType = async (req, res) => {
    const userId = req.headers['x-user-id'];
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: 'x-user-id header required' });

    // Since event_availabilities has ON DELETE CASCADE, deleting event_type deletes availabilities too
    const [result] = await db.query('DELETE FROM event_types WHERE id = ? AND user_id = ?', [id, userId]);

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Event type not found or unauthorized' });

    res.json({ message: 'Deleted successfully' });
};
