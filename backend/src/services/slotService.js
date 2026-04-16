const db = require('../config/db');
const { parseISO, format, addMinutes, isBefore, isAfter, getDay } = require('date-fns');

exports.calculateAvailableSlots = async (dateStr, slug, userId) => {
    // 1. Fetch Event Type Config by slug only (public booking — no ownership check)
    const [eventTypes] = await db.query('SELECT * FROM event_types WHERE slug = ?', [slug]);
    if (eventTypes.length === 0) throw new Error('Event type not found');
    const eventType = eventTypes[0];

    // Use the event type owner's userId for availability/booking lookups
    const ownerId = eventType.user_id;

    const { id: eventTypeId, duration, buffer_before, buffer_after } = eventType;

    // 2. Determine Day of Week target
    const targetDate = parseISO(dateStr); 
    const dayOfWeek = getDay(targetDate); // 0 = Sunday

    // 3. Fetch Generic Availabilities for that day
    const [genericAvailabilities] = await db.query('SELECT start_time, end_time FROM availabilities WHERE user_id = ? AND day_of_week = ?', [ownerId, dayOfWeek]);
    
    // Fetch Event Availabilities for that day
    const [eventAvailabilities] = await db.query('SELECT start_time, end_time FROM event_availabilities WHERE event_type_id = ? AND day_of_week = ?', [eventTypeId, dayOfWeek]);

    let effectiveAvailabilities = [];

    if (genericAvailabilities.length === 0) {
        return []; // No base generic availability
    }

    if (eventAvailabilities.length === 0) {
        // Fallback to generic if event specific not defined (or change logic if event specific is strictly required)
        effectiveAvailabilities = genericAvailabilities;
    } else {
        // Intersect generic and event availabilities
        for (const gen of genericAvailabilities) {
            for (const evt of eventAvailabilities) {
                const start = gen.start_time > evt.start_time ? gen.start_time : evt.start_time;
                const end = gen.end_time < evt.end_time ? gen.end_time : evt.end_time;

                if (start < end) {
                    effectiveAvailabilities.push({ start_time: start, end_time: end });
                }
            }
        }
    }

    if (effectiveAvailabilities.length === 0) return []; // No intersection

    // 4. Fetch Existing Bookings for this specific date range
    const targetDateStart = `${dateStr} 00:00:00`;
    const targetDateEnd = `${dateStr} 23:59:59`;

    const [bookings] = await db.query(
        "SELECT start_time, end_time FROM bookings WHERE user_id = ? AND status = 'SCHEDULED' AND start_time >= ? AND end_time <= ?",
        [ownerId, targetDateStart, targetDateEnd]
    );

    let allPotentialSlots = [];

    // 5. Generate slots for each availability block
    for (const block of effectiveAvailabilities) {
        const blockStart = parseISO(`${dateStr}T${block.start_time}`);
        const blockEnd = parseISO(`${dateStr}T${block.end_time}`);

        let currentSlotStart = blockStart;

        while (true) {
            const currentSlotEnd = addMinutes(currentSlotStart, duration);
            const slotEndWithBuffer = addMinutes(currentSlotEnd, buffer_after);

            if (isAfter(currentSlotEnd, blockEnd)) {
                break;
            }

            const slotData = {
                start_time: format(currentSlotStart, "yyyy-MM-dd'T'HH:mm:ss"),
                end_time: format(currentSlotEnd, "yyyy-MM-dd'T'HH:mm:ss")
            };

            const slotStartWithBuffer = addMinutes(currentSlotStart, -buffer_before);

            // 6. Check for overlaps against bookings
            let isOverlapping = false;
            for (const booking of bookings) {
                const bookingStart = parseISO(booking.start_time.replace(' ', 'T'));
                const bookingEnd = parseISO(booking.end_time.replace(' ', 'T'));

                if (isBefore(slotStartWithBuffer, bookingEnd) && isAfter(slotEndWithBuffer, bookingStart)) {
                    isOverlapping = true;
                    break;
                }
            }

            if (!isOverlapping) {
                if (isAfter(currentSlotStart, new Date())) {
                     allPotentialSlots.push(slotData);
                }
            }

            currentSlotStart = addMinutes(currentSlotStart, duration); 
        }
    }

    // Since intersection can result in out of order or overlapping pieces if ranges were bizarre,
    // ensure chronological sorting and maybe deduplicate start times just in case.
    allPotentialSlots.sort((a, b) => a.start_time.localeCompare(b.start_time));
    
    // Unique by start_time
    const uniqueSlots = [];
    const seenStarts = new Set();
    for(let s of allPotentialSlots) {
        if(!seenStarts.has(s.start_time)) {
            seenStarts.add(s.start_time);
            uniqueSlots.push(s);
        }
    }

    // Fetch user's timezone
    const [users] = await db.query('SELECT timezone FROM users WHERE id = ?', [ownerId]);
    const timezone = users.length > 0 ? users[0].timezone : 'UTC';

    return { slots: uniqueSlots, timezone };
};
