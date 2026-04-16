// Test Script for Email Notifications and Buffer Time Features
// Run these commands in your terminal to test the implementation

// ============================================================================
// 1. CREATE EVENT TYPE WITH BUFFER TIMES
// ============================================================================

// Example: Create a 30-minute event with 15 minutes buffer before and after
curl -X POST http://localhost:5000/api/event-types \
  -H "Content-Type: application/json" \
  -H "x-user-id: your-user-id-here" \
  -d '{
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
      },
      {
        "day_of_week": 2,
        "start_time": "09:00:00",
        "end_time": "17:00:00"
      }
    ]
  }'

// Response example:
// {
//   "id": "550e8400-e29b-41d4-a716-446655440000",
//   "name": "30-Min Consultation",
//   "duration": 30,
//   "slug": "consultation",
//   "buffer_before": 15,
//   "buffer_after": 15
// }

// ============================================================================
// 2. CREATE A BOOKING (TRIGGERS EMAIL NOTIFICATIONS)
// ============================================================================

curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "event_type_id": "550e8400-e29b-41d4-a716-446655440000",
    "booker_name": "John Smith",
    "booker_email": "john.smith@example.com",
    "start_time": "2026-04-25T14:00:00"
  }'

// Response example:
// {
//   "id": "660e8400-e29b-41d4-a716-446655440001",
//   "event_type_id": "550e8400-e29b-41d4-a716-446655440000",
//   "event_name": "30-Min Consultation",
//   "event_slug": "consultation",
//   "duration": 30,
//   "booker_name": "John Smith",
//   "booker_email": "john.smith@example.com",
//   "start_time": "2026-04-25 14:00:00",
//   "end_time": "2026-04-25 14:30:00",
//   "status": "SCHEDULED"
// }

// WHAT HAPPENS:
// ✓ Guest (john.smith@example.com) receives confirmation email
// ✓ Host receives booking notification with guest details
// ✓ If guest email fails, host is notified in their email
// ✓ Server console shows: Email delivery status

// ============================================================================
// 3. GET AVAILABLE SLOTS (RESPECTS BUFFER TIMES)
// ============================================================================

curl "http://localhost:5000/api/slots?date=2026-04-25&slug=consultation&userId=your-user-id"

// With buffer times applied:
// - If you book 14:00-14:30 with 15min buffers
// - Actual blocked time: 13:45-14:45
// - The system won't show 13:15-13:45 or 14:15-14:45 as available
// - Other attendees can't book overlapping time + buffer windows

// ============================================================================
// 4. CANCEL A BOOKING (TRIGGERS CANCELLATION EMAILS)
// ============================================================================

curl -X DELETE http://localhost:5000/api/bookings/660e8400-e29b-41d4-a716-446655440001 \
  -H "x-user-id: your-user-id-here"

// Response example:
// {
//   "message": "Booking canceled successfully"
// }

// WHAT HAPPENS:
// ✓ Guest receives cancellation email
// ✓ Host receives cancellation notification
// ✓ Server console shows: Email delivery status
// ✓ Booking status updated to CANCELED in database

// ============================================================================
// 5. RESCHEDULE A BOOKING (TRIGGERS RESCHEDULE EMAILS)
// ============================================================================

curl -X PUT http://localhost:5000/api/bookings/660e8400-e29b-41d4-a716-446655440001/reschedule \
  -H "Content-Type: application/json" \
  -d '{
    "start_time": "2026-04-26T10:00:00"
  }'

// Response example:
// {
//   "message": "Booking rescheduled successfully",
//   "start_time": "2026-04-26 10:00:00",
//   "end_time": "2026-04-26 10:30:00"
// }

// WHAT HAPPENS:
// ✓ Guest receives email showing old vs new time
// ✓ Host receives rescheduling notification
// ✓ Old time: 2026-04-25 14:00-14:30
// ✓ New time: 2026-04-26 10:00-10:30
// ✓ Server console shows: Email delivery status

// ============================================================================
// 6. UPDATE EVENT TYPE BUFFER TIMES
// ============================================================================

curl -X PUT http://localhost:5000/api/event-types/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -H "x-user-id: your-user-id-here" \
  -d '{
    "name": "30-Min Consultation",
    "duration": 30,
    "slug": "consultation",
    "buffer_before": 30,
    "buffer_after": 30,
    "availabilities": [
      {
        "day_of_week": 1,
        "start_time": "09:00:00",
        "end_time": "17:00:00"
      }
    ]
  }'

// Now the event has 30-30 minute buffers instead of 15-15

// ============================================================================
// EMAIL CONFIGURATION CHECKLIST
// ============================================================================

// Before emails will work, make sure you have:

// 1. Resend Account & API Key:
//    - Sign up at https://resend.com
//    - Get API key from https://resend.com/api-keys
//    - Add to backend/.env: RESEND_API_KEY=your_key_here

// 2. Domain Configuration:
//    - Update EMAIL_FROM in backend/.env with your verified domain
//    - Default: EMAIL_FROM=noreply@yourdomain.com
//    - Domain must be verified in Resend dashboard

// 3. Test Emails:
//    - Use Resend dashboard to verify emails were sent
//    - Check spam folder if emails aren't appearing
//    - Server console shows delivery status

// ============================================================================
// BUFFER TIME EXAMPLES
// ============================================================================

// Example 1: 1-Hour Meeting with 15 Min Buffers
// Event Duration: 60 minutes
// Buffer Before: 15 minutes
// Buffer After: 15 minutes
// Requested Slot: 10:00 - 11:00
// Actual Blocked Time: 9:45 - 11:15
// Total Reservation: 90 minutes

// Example 2: 30-Min Meeting with 30 Min Buffers
// Event Duration: 30 minutes
// Buffer Before: 30 minutes
// Buffer After: 30 minutes
// Requested Slot: 14:00 - 14:30
// Actual Blocked Time: 13:30 - 15:00
// Total Reservation: 90 minutes

// Example 3: No Buffers (Default)
// Event Duration: 45 minutes
// Buffer Before: 0 minutes
// Buffer After: 0 minutes
// Requested Slot: 15:00 - 15:45
// Actual Blocked Time: 15:00 - 15:45
// Total Reservation: 45 minutes

// ============================================================================
// TROUBLESHOOTING
// ============================================================================

// Problem: Emails not being sent
// Solution:
// 1. Check backend/.env has RESEND_API_KEY
// 2. Check EMAIL_FROM is set correctly
// 3. Verify domain is verified in Resend dashboard
// 4. Check server console for error messages
// 5. Check email addresses are valid

// Problem: Buffer times not blocking slots
// Solution:
// 1. Verify event_type has buffer_before and buffer_after set
// 2. Check database: SELECT * FROM event_types WHERE id = 'your-id'
// 3. Verify availability window is larger than duration + buffers
// 4. Check booked time slots include buffer calculations

// Problem: Guest email fails but booking still succeeds
// Solution: This is expected behavior!
// - Bookings are not blocked by email failures
// - Host is notified in their email about guest email issues
// - You can follow up with guest directly if email invalid

// ============================================================================
// EXPECTED EMAIL CONTENT (Examples)
// ============================================================================

// EMAIL 1 - Guest Confirmation:
// Subject: Booking Confirmation: 30-Min Consultation
// Content:
//   Hi John Smith,
//   Your booking with [Host Name] has been confirmed.
//   
//   30-Min Consultation
//   Date: 4/25/2026
//   Time: 2:00 PM - 2:30 PM
//   Host: [Host Name]

// EMAIL 2 - Host Notification:
// Subject: New Booking: 30-Min Consultation - 4/25/2026
// Content:
//   Hi [Host Name],
//   A new booking has been created for your 30-Min Consultation event.
//   
//   30-Min Consultation
//   Date: 4/25/2026
//   Time: 2:00 PM - 2:30 PM
//   Guest: John Smith
//   Email: john.smith@example.com
//   
//   ✓ Confirmation email successfully sent to guest

// EMAIL 3 - Cancellation (Guest):
// Subject: Booking Cancelled: 30-Min Consultation
// Content:
//   Hi John Smith,
//   Your booking with [Host Name] has been cancelled.

// EMAIL 4 - Reschedule (Guest):
// Subject: Meeting Rescheduled: 30-Min Consultation
// Content:
//   Hi John Smith,
//   Your meeting with [Host Name] has been rescheduled.
//   
//   ❌ Old Time (Cancelled)
//   4/25/2026 at 2:00 PM
//   
//   ✓ New Time (Confirmed)
//   4/26/2026 at 10:00 AM - 10:30 AM
