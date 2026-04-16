# API Reference: Email Notifications & Buffer Time

## Quick Start

### Prerequisites
1. Backend running: `npm run dev`
2. Database connected
3. Resend API key in `.env`

## Endpoint Reference

### Event Types Management

#### Create Event Type (with buffer times)
```http
POST /api/event-types
Header: x-user-id: [user-id]
Content-Type: application/json

Body:
{
  "name": "30-Min Consultation",
  "duration": 30,
  "slug": "consultation",
  "buffer_before": 15,
  "buffer_after": 15,
  "availabilities": [
    {
      "day_of_week": 1,
      "start_time": "09:00:00",
      "end_time": "17:00:00"
    }
  ]
}

Response: 201 Created
{
  "id": "uuid",
  "name": "30-Min Consultation",
  "duration": 30,
  "slug": "consultation",
  "buffer_before": 15,
  "buffer_after": 15
}
```

#### Update Event Type (with buffer times)
```http
PUT /api/event-types/{id}
Header: x-user-id: [user-id]
Content-Type: application/json

Body:
{
  "name": "30-Min Consultation",
  "duration": 30,
  "slug": "consultation",
  "buffer_before": 30,    // Updated
  "buffer_after": 30,     // Updated
  "availabilities": [...]
}

Response: 200 OK
{
  "message": "Updated successfully"
}
```

#### Get Event Types (with buffer info)
```http
GET /api/event-types
Header: x-user-id: [user-id]

Response: 200 OK
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "name": "30-Min Consultation",
    "duration": 30,
    "slug": "consultation",
    "buffer_before": 15,
    "buffer_after": 15,
    "created_at": "2026-04-16T10:00:00",
    "availabilities": [...]
  }
]
```

### Bookings with Email Notifications

#### Create Booking (Triggers Emails)
```http
POST /api/bookings
Content-Type: application/json

Body:
{
  "event_type_id": "uuid",
  "booker_name": "John Smith",
  "booker_email": "john@example.com",
  "start_time": "2026-04-25T14:00:00"
}

Response: 201 Created
{
  "id": "booking-uuid",
  "event_type_id": "event-uuid",
  "event_name": "30-Min Consultation",
  "event_slug": "consultation",
  "duration": 30,
  "booker_name": "John Smith",
  "booker_email": "john@example.com",
  "start_time": "2026-04-25 14:00:00",
  "end_time": "2026-04-25 14:30:00",
  "status": "SCHEDULED"
}

Emails Sent Automatically:
1. Guest: Confirmation email with meeting details
2. Host: Booking notification with guest info + email delivery status
```

#### Cancel Booking (Triggers Cancellation Emails)
```http
DELETE /api/bookings/{id}
Header: x-user-id: [user-id]

Response: 200 OK
{
  "message": "Booking canceled successfully"
}

Emails Sent Automatically:
1. Guest: Cancellation notice
2. Host: Cancellation confirmation
```

#### Reschedule Booking (Triggers Reschedule Emails)
```http
PUT /api/bookings/{id}/reschedule
Content-Type: application/json

Body:
{
  "start_time": "2026-04-26T10:00:00"
}

Response: 200 OK
{
  "message": "Booking rescheduled successfully",
  "start_time": "2026-04-26 10:00:00",
  "end_time": "2026-04-26 10:30:00"
}

Emails Sent Automatically:
1. Guest: Old time marked with ❌, new time marked with ✓
2. Host: Rescheduling notification with time change
```

#### Get Bookings (with filtering)
```http
GET /api/bookings?type=upcoming&event_type_id=uuid&duration=30
Header: x-user-id: [user-id]

Query Parameters:
- type: 'upcoming' | 'past' (optional)
- event_type_id: uuid (optional)
- duration: minutes (optional)

Response: 200 OK
[
  {
    "id": "booking-uuid",
    "event_type_id": "event-uuid",
    "user_id": "user-uuid",
    "booker_name": "John Smith",
    "booker_email": "john@example.com",
    "start_time": "2026-04-25 14:00:00",
    "end_time": "2026-04-25 14:30:00",
    "status": "SCHEDULED",
    "created_at": "2026-04-16T10:00:00",
    "event_name": "30-Min Consultation",
    "event_slug": "consultation"
  }
]
```

### Slots with Buffer Time Consideration

#### Get Available Slots (buffer times applied)
```http
GET /api/slots?date=2026-04-25&slug=consultation&userId=user-id

Query Parameters:
- date: YYYY-MM-DD (required)
- slug: event slug (required)
- userId: user id (required)

Response: 200 OK
{
  "date": "2026-04-25",
  "slots": [
    {
      "start_time": "2026-04-25T09:00:00",
      "end_time": "2026-04-25T09:30:00"
    },
    {
      "start_time": "2026-04-25T10:00:00",
      "end_time": "2026-04-25T10:30:00"
    }
    // ... more slots
  ]
}

Note: Slots are calculated considering:
- Event duration
- buffer_before (time before meeting)
- buffer_after (time after meeting)
- Existing bookings
- User availability
```

## Email Examples

### Email 1: Guest Booking Confirmation
```
Subject: Booking Confirmation: 30-Min Consultation

Hi John Smith,

Your booking with Host Name has been confirmed.

30-Min Consultation
📅 Date: 4/25/2026
🕐 Time: 2:00 PM - 2:30 PM
👤 Host: Host Name

Thank you for booking! If you need to reschedule or cancel, 
please contact the host.
```

### Email 2: Host Booking Notification
```
Subject: New Booking: 30-Min Consultation - 4/25/2026

Hi Host Name,

A new booking has been created for your 30-Min Consultation event.

30-Min Consultation
📅 Date: 4/25/2026
🕐 Time: 2:00 PM - 2:30 PM
👤 Guest: John Smith
📧 Email: john@example.com

✓ Confirmation email successfully sent to guest (john@example.com)
```

### Email 3: Guest Cancellation Notice
```
Subject: Booking Cancelled: 30-Min Consultation

Hi John Smith,

Your booking with Host Name has been cancelled.

30-Min Consultation
📅 Date: 4/25/2026
🕐 Time: 2:00 PM
👤 Host: Host Name

If you have any questions, please contact the host directly.
```

### Email 4: Guest Reschedule Notification
```
Subject: Meeting Rescheduled: 30-Min Consultation

Hi John Smith,

Your meeting with Host Name has been rescheduled.

30-Min Consultation

❌ Old Time (Cancelled)
4/25/2026 at 2:00 PM

✓ New Time (Confirmed)
4/26/2026 at 10:00 AM - 10:30 AM

Please update your calendar. If you cannot attend the new time, 
please contact the host.
```

## Error Responses

### Missing Required Fields
```http
400 Bad Request

{
  "error": "Invalid email format",
  "details": "Invalid email address"
}
```

### Conflict - Double Booking (respects buffer times)
```http
409 Conflict

{
  "error": "Conflict Error",
  "message": "Resource already exists or double booking detected."
}
```

### Event Type Not Found
```http
404 Not Found

{
  "error": "Event type not found"
}
```

### Unauthorized
```http
401 Unauthorized

{
  "error": "x-user-id header required"
}
```

## Configuration

### Environment Variables (.env)
```
# Required for email notifications
RESEND_API_KEY=re_XXXXXXXXXXXXX
EMAIL_FROM=noreply@yourdomain.com

# Database
DB_HOST=localhost
DB_USER=user
DB_PASSWORD=password
DB_NAME=dbname
DB_PORT=3306
DB_SSL=false

# Server
PORT=5000
```

## Status Codes Reference

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid auth |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Double booking or duplicate |
| 500 | Server Error - Internal error |

## Email Delivery Status

### Successful Delivery
- Both guest and host emails sent
- Status shown in host notification email
- Console log: "✓ Confirmation email sent to guest"

### Partial Failure (Guest email invalid)
- Host is notified about guest email failure
- Host receives booking notification with warning
- Booking still created successfully
- Console log: "✗ Failed to send email to guest"

### Host Email Failure
- Booking still created
- Error logged to console
- Guest email sent if valid
- No blocking of operations

## Rate Limiting Notes

**Resend API:**
- Free tier: 100 emails/day
- Pro tier: Unlimited (with quotas)
- Monitor usage in Resend dashboard

**Database:**
- Unique constraint: one booking per slot per event type
- Prevents double booking with buffer times

**Frontend:**
- Consider debouncing slot availability checks
- Cache slots for 30-60 seconds

## Debugging Tips

### Email not sending:
1. Check `RESEND_API_KEY` in `.env`
2. Verify domain verified in Resend dashboard
3. Check console for error messages
4. Verify guest email is valid format

### Buffer times not working:
1. Confirm `buffer_before` and `buffer_after` values set
2. Check availability window > duration + buffers
3. Verify bookings include buffer times in conflict check

### Integration test:
```bash
# 1. Create event type
curl -X POST http://localhost:5000/api/event-types \
  -H "x-user-id: test" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "duration": 30,
    "slug": "test",
    "buffer_before": 15,
    "buffer_after": 15
  }'

# 2. Create booking (should trigger emails)
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "event_type_id": "uuid-from-step-1",
    "booker_name": "Test User",
    "booker_email": "test@example.com",
    "start_time": "2026-04-25T14:00:00"
  }'

# 3. Check Resend dashboard for emails
```

## Support Scripts

See `TEST_GUIDE.md` for complete testing examples with cURL
