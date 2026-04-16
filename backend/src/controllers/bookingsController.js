const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { z } = require('zod');
const { addMinutes, parseISO, format } = require('date-fns');
const emailService = require('../services/emailService');

const bookingSchema = z.object({
    event_type_id: z.string().uuid(),
    booker_name: z.string().min(1),
    booker_email: z.string().email(),
    start_time: z.string() // ISO format expected like '2026-04-20T09:00:00'
});

exports.createBooking = async (req, res) => {
    const data = bookingSchema.parse(req.body);

    // Fetch event type to determine duration and user id
    const [eventTypes] = await db.query('SELECT user_id, duration, description FROM event_types WHERE id = ?', [data.event_type_id]);
    if (eventTypes.length === 0) return res.status(404).json({ error: 'Event type not found' });
    
    const eventType = eventTypes[0];
    const { user_id, duration, description } = eventType;

    const startDateTime = parseISO(data.start_time);
    const endDateTime = addMinutes(startDateTime, duration);

    const formattedStart = format(startDateTime, "yyyy-MM-dd HH:mm:ss");
    const formattedEnd = format(endDateTime, "yyyy-MM-dd HH:mm:ss");

    const id = uuidv4();

    // Use a transaction to safely check for existing SCHEDULED bookings
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [existing] = await connection.query(
            "SELECT id FROM bookings WHERE event_type_id = ? AND start_time = ? AND status = 'SCHEDULED' FOR UPDATE",
            [data.event_type_id, formattedStart]
        );

        if (existing.length > 0) {
            await connection.rollback();
            return res.status(409).json({ error: 'Conflict Error', message: 'Resource already exists or double booking detected.' });
        }

        await connection.query(
            'INSERT INTO bookings (id, event_type_id, user_id, booker_name, booker_email, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [id, data.event_type_id, user_id, data.booker_name, data.booker_email, formattedStart, formattedEnd, 'SCHEDULED']
        );

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }

    // Also fetch event name for the confirmation page
    const [eventInfo] = await db.query('SELECT name, slug, duration FROM event_types WHERE id = ?', [data.event_type_id]);
    const eventName = eventInfo[0]?.name || '';
    const eventSlug = eventInfo[0]?.slug || '';

    // Fetch host details for email notifications
    const [hostInfo] = await db.query('SELECT name, email FROM users WHERE id = ?', [user_id]);
    const hostName = hostInfo[0]?.name || 'Host';
    const hostEmail = hostInfo[0]?.email || '';

    // Send booking confirmation emails asynchronously
    if (hostEmail) {
        emailService.sendBookingConfirmation(
            hostEmail,
            hostName,
            data.booker_email,
            data.booker_name,
            eventName,
            description,
            formattedStart,
            formattedEnd
        ).then(emailResult => {
            console.log('📧 Email service completed:', emailResult);
            if (emailResult.success) {
                console.log('✅ Both emails sent successfully!');
            } else {
                console.warn('⚠️  Some emails failed to send:', emailResult.messages);
            }
        }).catch(err => {
            console.error('❌ Error sending booking confirmation email:', err);
            // Log but don't fail the request
        });
    } else {
        console.warn('⚠️  No host email found for user:', user_id);
    }

    res.status(201).json({
        id,
        event_type_id: data.event_type_id,
        event_name: eventName,
        event_slug: eventSlug,
        duration,
        booker_name: data.booker_name,
        booker_email: data.booker_email,
        start_time: formattedStart,
        end_time: formattedEnd,
        status: 'SCHEDULED'
    });
};

exports.getBookings = async (req, res) => {
    const userId = req.headers['x-user-id'];
    const { type, event_type_id, duration } = req.query; // 'upcoming' or 'past'
    if (!userId) return res.status(401).json({ error: 'x-user-id header required' });

    let query = 'SELECT b.*, e.name as event_name, e.slug as event_slug FROM bookings b JOIN event_types e ON b.event_type_id = e.id WHERE b.user_id = ?';
    const params = [userId];

    if (type === 'upcoming') {
        query += ' AND b.end_time >= NOW()';
    } else if (type === 'past') {
        query += ' AND b.end_time < NOW()';
    }

    if (event_type_id) {
        query += ' AND b.event_type_id = ?';
        params.push(event_type_id);
    }
    
    if (duration) {
        query += ' AND e.duration = ?';
        params.push(Number(duration));
    }

    query += ' ORDER BY b.start_time DESC';

    const [rows] = await db.query(query, params);

    res.json(rows);
};

exports.cancelBooking = async (req, res) => {
    const userId = req.headers['x-user-id'];
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: 'x-user-id header required' });

    // Fetch booking details before canceling for email notification
    const [bookings] = await db.query(
        `SELECT b.*, e.name as event_name, u.name as host_name, u.email as host_email 
         FROM bookings b 
         JOIN event_types e ON b.event_type_id = e.id 
         JOIN users u ON b.user_id = u.id
         WHERE b.id = ? AND b.user_id = ?`,
        [id, userId]
    );

    if (bookings.length === 0) {
        return res.status(404).json({ error: 'Booking not found or already canceled' });
    }

    const booking = bookings[0];

    // Update booking status
    const [result] = await db.query("UPDATE bookings SET status = 'CANCELED' WHERE id = ? AND user_id = ?", [id, userId]);

    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Booking not found or already canceled' });
    }

    // Send cancellation emails asynchronously
    emailService.sendCancellationNotification(
        booking.host_email,
        booking.host_name,
        booking.booker_email,
        booking.booker_name,
        booking.event_name,
        booking.start_time,
        booking.end_time
    ).catch(err => {
        console.error('Error sending cancellation email:', err);
        // Log but don't fail the request
    });
    
    res.json({ message: 'Booking canceled successfully' });
};

exports.rescheduleBooking = async (req, res) => {
    const { id } = req.params;
    const { start_time } = req.body;

    if (!start_time) {
        return res.status(400).json({ error: 'start_time is required' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Fetch existing booking and check if valid (with details for email notification)
        const [bookings] = await connection.query(
            `SELECT b.*, e.name as event_name, u.name as host_name, u.email as host_email
             FROM bookings b
             JOIN event_types e ON b.event_type_id = e.id
             JOIN users u ON b.user_id = u.id
             WHERE b.id = ? FOR UPDATE`,
            [id]
        );

        if (bookings.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Booking not found' });
        }

        const booking = bookings[0];
        if (booking.status === 'CANCELED') {
            await connection.rollback();
            return res.status(400).json({ error: 'Cannot reschedule a canceled booking' });
        }

        // 2. Determine duration from event type
        const [eventTypes] = await connection.query('SELECT duration FROM event_types WHERE id = ?', [booking.event_type_id]);
        if (eventTypes.length === 0) {
            await connection.rollback();
            return res.status(500).json({ error: 'Associated event type not found' });
        }
        
        const { duration } = eventTypes[0];

        // 3. Calculate new times
        const startDateTime = parseISO(start_time);
        const endDateTime = addMinutes(startDateTime, duration);

        const formattedStart = format(startDateTime, "yyyy-MM-dd HH:mm:ss");
        const formattedEnd = format(endDateTime, "yyyy-MM-dd HH:mm:ss");

        // 4. Check for conflicts with the new time (excluding this exact booking ID)
        const [existing] = await connection.query(
            "SELECT id FROM bookings WHERE event_type_id = ? AND start_time = ? AND id != ? AND status = 'SCHEDULED' FOR UPDATE",
            [booking.event_type_id, formattedStart, id]
        );

        if (existing.length > 0) {
            await connection.rollback();
            return res.status(409).json({ error: 'Conflict Error', message: 'The new time slot is already booked.' });
        }

        // 5. Update the booking
        await connection.query(
            "UPDATE bookings SET start_time = ?, end_time = ? WHERE id = ?",
            [formattedStart, formattedEnd, id]
        );

        await connection.commit();

        // 6. Send reschedule notification emails asynchronously
        emailService.sendRescheduleNotification(
            booking.host_email,
            booking.host_name,
            booking.booker_email,
            booking.booker_name,
            booking.event_name,
            booking.start_time,
            formattedStart,
            formattedEnd
        ).catch(err => {
            console.error('Error sending reschedule email:', err);
            // Log but don't fail the request
        });

        res.json({ message: 'Booking rescheduled successfully', start_time: formattedStart, end_time: formattedEnd });
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};
