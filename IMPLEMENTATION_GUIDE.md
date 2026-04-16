# Implementation Guide: Email Notifications & Buffer Time

## Overview
This guide explains the email notification system and buffer time management for the booking application.

## Features Implemented

### 1. Email Notifications

#### A. Booking Confirmation
When a booking is created:
- **Guest receives**: Confirmation email with meeting details
- **Host receives**: Booking notification with guest info, including status of guest email delivery

#### B. Booking Cancellation
When a booking is cancelled:
- **Guest receives**: Cancellation notice
- **Host receives**: Cancellation notification with guest name

#### C. Meeting Rescheduling
When a booking is rescheduled:
- **Guest receives**: Updated meeting time with old vs new time comparison
- **Host receives**: Reschedule notification with guest name and time change details

### 2. Buffer Time Management

Buffer times are already integrated in the system:
- **buffer_before**: Time reserved before a meeting (in minutes)
- **buffer_after**: Time reserved after a meeting (in minutes)
- These are stored per event type in the database
- They are automatically considered when calculating available slots

## Setup Instructions

### Step 1: Configure Resend Email Service

1. **Create Resend Account** (if you don't have one):
   - Visit https://resend.com
   - Sign up and create an account

2. **Get API Key**:
   - Go to: https://resend.com/api-keys
   - Create a new API key
   - Copy the API key

3. **Update .env file** in `backend/.env`:
   ```
   RESEND_API_KEY=your_actual_resend_api_key
   EMAIL_FROM=noreply@yourdomain.com
   ```

### Step 2: Set Buffer Times for Event Types

You can set buffer times via API or database:

#### Option A: Via Database
```sql
UPDATE event_types 
SET buffer_before = 15, buffer_after = 15 
WHERE id = 'your-event-type-id';
```

#### Option B: Extend the Event Types API
Update the event type creation/update endpoint to accept buffer parameters:

```javascript
exports.updateEventType = async (req, res) => {
    const { id } = req.params;
    const { buffer_before, buffer_after } = req.body;
    
    await db.query(
        'UPDATE event_types SET buffer_before = ?, buffer_after = ? WHERE id = ?',
        [buffer_before || 0, buffer_after || 0, id]
    );
    
    res.json({ message: 'Event type updated successfully' });
};
```

### Step 3: How Buffer Times Work

**Example Scenario:**
- Event duration: 60 minutes
- Buffer before: 15 minutes
- Buffer after: 30 minutes
- Slot time requested: 10:00 - 11:00

**What happens:**
- 9:45 - 10:00: Buffer before (blocked)
- 10:00 - 11:00: Meeting
- 11:00 - 11:30: Buffer after (blocked)
- **Total blocked:** 9:45 - 11:30 (105 minutes)

When checking for conflicts, the system ensures that no other bookings overlap with the total time window (including buffers).

### Step 4: Test the Implementation

#### Test Booking Creation with Email:
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "event_type_id": "your-event-id",
    "booker_name": "John Doe",
    "booker_email": "john@example.com",
    "start_time": "2026-04-25T15:00:00"
  }'
```

#### Expected Response:
- Booking created successfully
- Emails sent to:
  1. Guest (confirmation email)
  2. Host (booking notification)
- Status logged in server console

#### Test Cancellation with Email:
```bash
curl -X DELETE http://localhost:5000/api/bookings/{booking-id} \
  -H "x-user-id: host-user-id"
```

#### Test Rescheduling with Email:
```bash
curl -X PUT http://localhost:5000/api/bookings/{booking-id}/reschedule \
  -H "Content-Type: application/json" \
  -d '{
    "start_time": "2026-04-26T14:00:00"
  }'
```

## Email Service Details

### File: `src/services/emailService.js`

**Key Functions:**

1. **sendBookingConfirmation**
   - Sends confirmation to guest
   - Sends notification to host with delivery status
   - Includes meeting details and attendee info

2. **sendCancellationNotification**
   - Notifies both guest and host of cancellation
   - Includes original meeting time

3. **sendRescheduleNotification**
   - Shows old vs new time comparison
   - Alerts both parties of the change

### Email Response Format:
```javascript
{
  guestEmail: "guest@example.com",
  hostEmail: "host@example.com",
  success: true,
  guestEmailSent: true,
  hostEmailSent: true,
  messages: [
    "✓ Confirmation email sent to guest: guest@example.com",
    "✓ Booking notification sent to host: host@example.com (Guest email sent successfully)"
  ]
}
```

### Error Handling:
- If guest email is invalid or fails to send:
  - Host is notified in the booking notification email
  - Message indicates guest email failed to deliver
  - Booking still succeeds (email failure doesn't block booking)

- If host email fails:
  - Error is logged to console
  - Booking still succeeds

## Database Schema

### event_types table (already has these fields):
```sql
CREATE TABLE IF NOT EXISTS event_types (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    duration INT NOT NULL COMMENT 'duration in minutes',
    slug VARCHAR(255) NOT NULL,
    buffer_before INT DEFAULT 0 COMMENT 'buffer before in minutes',
    buffer_after INT DEFAULT 0 COMMENT 'buffer after in minutes',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_slug (user_id, slug)
);
```

### bookings table (no changes needed):
```sql
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(36) PRIMARY KEY,
    event_type_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    booker_name VARCHAR(255) NOT NULL,
    booker_email VARCHAR(255) NOT NULL,
    start_time DATETIME NOT NULL COMMENT 'Stored in UTC',
    end_time DATETIME NOT NULL COMMENT 'Stored in UTC',
    status ENUM('SCHEDULED', 'CANCELED') DEFAULT 'SCHEDULED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_type_id) REFERENCES event_types(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_event_start (event_type_id, start_time)
);
```

## Important Notes

1. **Email Service Reliability**:
   - Emails are sent asynchronously (non-blocking)
   - Email failures don't prevent booking operations
   - All email operations are logged to console

2. **Buffer Time Requirements**:
   - Must have sufficient availability window for buffer times
   - If buffer times exceed available slot window, no slots will appear

3. **Timezone Handling**:
   - All times are stored in UTC in database
   - User timezone is stored in users table
   - Emails display times in user's local timezone

4. **Testing Email Delivery**:
   - Use Resend dashboard to verify emails were sent
   - Check spam folder if emails aren't appearing
   - Verify EMAIL_FROM domain is authenticated in Resend

## Troubleshooting

### Emails not sending:
1. Check RESEND_API_KEY in .env file
2. Verify EMAIL_FROM domain is verified in Resend
3. Check server console for error messages
4. Verify guest email is valid

### Buffer times not working:
1. Confirm buffer_before and buffer_after are set for event type
2. Verify availability window is larger than duration + buffers
3. Check database values match expected configuration

### Booking conflicts when buffers set:
1. This is expected behavior - buffers reserve extra time
2. Reduce buffer times if too restrictive
3. Increase availability windows

## Future Enhancements

1. Email templates customization per user
2. Admin panel to configure buffer times
3. Email delivery tracking
4. Timezone conversion for email display
5. Calendar/ICS attachment in emails
6. SMS notifications option
7. Webhook integration for email status
8. Retry logic for failed emails
