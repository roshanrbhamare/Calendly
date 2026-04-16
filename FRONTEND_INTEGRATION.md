# Frontend Integration Guide: Email & Buffer Time Features

## Overview
This guide shows how to integrate email notifications and buffer time management into your React frontend.

## Components to Update

### 1. CreateEvent Component
**File:** `frontend/src/pages/CreateEvent.jsx`

Update the form to include buffer time inputs:

```jsx
// Add to form state
const [bufferBefore, setBufferBefore] = useState(0);
const [bufferAfter, setBufferAfter] = useState(0);

// Add to JSX
<div className="mb-4">
  <label className="block text-sm font-medium mb-2">
    Buffer Time Before (minutes)
  </label>
  <input
    type="number"
    min="0"
    value={bufferBefore}
    onChange={(e) => setBufferBefore(parseInt(e.target.value))}
    className="w-full px-3 py-2 border rounded-lg"
  />
  <p className="text-xs text-gray-500 mt-1">
    Time to reserve before the meeting
  </p>
</div>

<div className="mb-4">
  <label className="block text-sm font-medium mb-2">
    Buffer Time After (minutes)
  </label>
  <input
    type="number"
    min="0"
    value={bufferAfter}
    onChange={(e) => setBufferAfter(parseInt(e.target.value))}
    className="w-full px-3 py-2 border rounded-lg"
  />
  <p className="text-xs text-gray-500 mt-1">
    Time to reserve after the meeting
  </p>
</div>

// Update API call
const eventTypeData = {
  name,
  duration,
  slug,
  buffer_before: bufferBefore,  // NEW
  buffer_after: bufferAfter,    // NEW
  availabilities: /* ... */
};
```

### 2. EditEvent Component
**File:** `frontend/src/pages/EditEvent.jsx`

Add buffer time editing capabilities:

```jsx
// Load buffer times from event
useEffect(() => {
  const loadEventType = async () => {
    const response = await api.get(`/api/event-types/${id}`, {
      headers: { 'x-user-id': userId }
    });
    const event = response.data;
    
    setBufferBefore(event.buffer_before || 0);
    setBufferAfter(event.buffer_after || 0);
    // ... other fields
  };
  
  loadEventType();
}, [id]);

// Update API call in save handler
const updateData = {
  // ... other fields
  buffer_before: bufferBefore,
  buffer_after: bufferAfter,
};
```

### 3. Dashboard Component
**File:** `frontend/src/pages/Dashboard.jsx`

Display buffer times in event list:

```jsx
// In event type list rendering
{eventTypes.map((event) => (
  <div key={event.id} className="border rounded-lg p-4">
    <h3 className="font-semibold">{event.name}</h3>
    <p className="text-sm text-gray-600">{event.duration} minutes</p>
    
    {/* NEW: Display buffer times */}
    {(event.buffer_before > 0 || event.buffer_after > 0) && (
      <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
        <span>⏱️ Buffer Times: </span>
        {event.buffer_before > 0 && (
          <span>{event.buffer_before}min before</span>
        )}
        {event.buffer_before > 0 && event.buffer_after > 0 && <span> + </span>}
        {event.buffer_after > 0 && (
          <span>{event.buffer_after}min after</span>
        )}
      </div>
    )}
    
    {/* ... other event details */}
  </div>
))}
```

### 4. Bookings Component
**File:** `frontend/src/pages/Meetings.jsx`

Add booking status displays:

```jsx
// Show booking confirmation status
{bookings.map((booking) => (
  <div key={booking.id} className="border rounded-lg p-4">
    <div className="flex justify-between items-start">
      <div>
        <h4 className="font-semibold">{booking.booker_name}</h4>
        <p className="text-sm text-gray-600">{booking.booker_email}</p>
        <p className="text-sm text-gray-500">
          {new Date(booking.start_time).toLocaleString()}
        </p>
        
        {/* NEW: Show buffer consideration note */}
        <p className="text-xs text-blue-500 mt-2">
          ⏱️ Includes buffer time for meeting transition
        </p>
      </div>
      
      <div className="space-x-2">
        <button onClick={() => rescheduleBooking(booking.id)}>
          Reschedule
        </button>
        <button onClick={() => cancelBooking(booking.id)}>
          Cancel
        </button>
      </div>
    </div>
  </div>
))}
```

### 5. BookingFlow Component
**File:** `frontend/src/pages/BookingFlow.jsx`

Enhance with buffer time information:

```jsx
// Show buffer time calculation
const calculateTotalTime = (duration, bufferBefore, bufferAfter) => {
  return duration + bufferBefore + bufferAfter;
};

// In slot selection display
<div className="mb-4 p-3 bg-blue-50 rounded">
  <p className="text-sm font-semibold">Meeting Time Breakdown:</p>
  <div className="text-xs text-gray-600 mt-2 space-y-1">
    {bufferBefore > 0 && (
      <p>⏱️ Buffer before: {bufferBefore} minutes</p>
    )}
    <p>✓ Meeting: {duration} minutes</p>
    {bufferAfter > 0 && (
      <p>⏱️ Buffer after: {bufferAfter} minutes</p>
    )}
    <p className="font-semibold text-blue-600 mt-2">
      Total time reserved: {calculateTotalTime(duration, bufferBefore, bufferAfter)} minutes
    </p>
  </div>
</div>
```

## Toast/Notification Updates

### Email Confirmation Toast
**File:** `frontend/src/components/Toast.jsx` (if used)

```jsx
// After booking creation
const showBookingConfirmation = (booking) => {
  showToast({
    type: 'success',
    title: 'Booking Confirmed!',
    message: `Check your email (${booking.booker_email}) for confirmation. Host has also been notified.`,
    duration: 5000
  });
};

// After cancellation
const showCancellationConfirmation = () => {
  showToast({
    type: 'info',
    title: 'Booking Cancelled',
    message: 'Cancellation emails have been sent to both you and the host.',
    duration: 5000
  });
};

// After reschedule
const showRescheduleConfirmation = () => {
  showToast({
    type: 'success',
    title: 'Meeting Rescheduled',
    message: 'Update notifications have been sent to both parties.',
    duration: 5000
  });
};
```

## API Integration Examples

### Example 1: Create Event Type with Buffers
```javascript
// src/api.js or your API utility file

export const createEventType = async (eventData) => {
  const userId = localStorage.getItem('userId');
  
  const response = await api.post('/api/event-types', {
    name: eventData.name,
    duration: eventData.duration,
    slug: eventData.slug,
    buffer_before: eventData.bufferBefore || 0,  // NEW
    buffer_after: eventData.bufferAfter || 0,    // NEW
    availabilities: eventData.availabilities
  }, {
    headers: { 'x-user-id': userId }
  });
  
  return response.data;
};
```

### Example 2: Handle Booking with Email Status
```javascript
// In component
const handleBooking = async (bookingData) => {
  try {
    const response = await api.post('/api/bookings', {
      event_type_id: bookingData.eventTypeId,
      booker_name: bookingData.name,
      booker_email: bookingData.email,
      start_time: bookingData.startTime
    });
    
    // NEW: Show confirmation with email info
    showToast({
      type: 'success',
      title: 'Booking Confirmed!',
      message: `Confirmation email sent to ${bookingData.email}. Host also notified.`,
      link: 'Check your email'
    });
    
    return response.data;
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Booking Failed',
      message: error.response?.data?.message || 'Unable to create booking'
    });
  }
};
```

### Example 3: Handle Cancellation with Email
```javascript
// In component
const handleCancelBooking = async (bookingId) => {
  if (!window.confirm('Are you sure? Cancellation email will be sent.')) {
    return;
  }
  
  try {
    const userId = localStorage.getItem('userId');
    await api.delete(`/api/bookings/${bookingId}`, {
      headers: { 'x-user-id': userId }
    });
    
    showToast({
      type: 'info',
      title: 'Booking Cancelled',
      message: 'Cancellation emails sent to guest and you.'
    });
    
    // Refresh bookings list
    loadBookings();
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Cancellation Failed',
      message: error.response?.data?.error
    });
  }
};
```

### Example 4: Display Buffer Time Info
```javascript
// Helper function for frontend
export const formatMeetingTime = (duration, bufferBefore, bufferAfter) => {
  const total = duration + bufferBefore + bufferAfter;
  
  return {
    duration,
    bufferBefore,
    bufferAfter,
    total,
    display: `${duration}min meeting + ${bufferBefore}min before + ${bufferAfter}min after`,
    totalDisplay: `${total}min total`
  };
};

// In component
const timeInfo = formatMeetingTime(30, 15, 15);
// Returns:
// {
//   duration: 30,
//   bufferBefore: 15,
//   bufferAfter: 15,
//   total: 60,
//   display: "30min meeting + 15min before + 15min after",
//   totalDisplay: "60min total"
// }
```

## UI/UX Recommendations

### Buffer Time Display in Calendar
```jsx
// Show visual representation of buffer times
const getTimeBlockColor = (slot, bookings) => {
  const isBooked = bookings.some(b => 
    b.start_time === slot.start_time
  );
  
  if (isBooked) {
    return 'bg-red-200'; // Booked
  }
  
  const hasBuffer = bookings.some(b => {
    // Check if this slot is in a buffer zone
    // ...
  });
  
  if (hasBuffer) {
    return 'bg-gray-200'; // Buffer zone
  }
  
  return 'bg-green-200'; // Available
};
```

### Informational Messages
```jsx
// Help text for users
const bufferTimeInfo = {
  title: "What are buffer times?",
  content: `
    Buffer times automatically reserve time before and after each meeting 
    for preparation and transition. For example, with 15-minute buffers 
    around a 30-minute meeting, your total time blocked is 60 minutes.
  `
};
```

## Styling Classes (with Tailwind)

```css
/* Buffer time indicator */
.buffer-indicator {
  @apply text-xs text-blue-600 bg-blue-50 p-2 rounded;
}

/* Email sent status */
.email-success {
  @apply text-green-600 text-sm;
}

.email-error {
  @apply text-red-600 text-sm;
}

/* Meeting time breakdown */
.time-breakdown {
  @apply space-y-1 text-xs text-gray-600;
}

/* Available slot */
.slot-available {
  @apply bg-green-50 hover:bg-green-100 cursor-pointer;
}

/* Slot with buffer */
.slot-buffer {
  @apply bg-gray-100 cursor-not-allowed;
}

/* Booked slot */
.slot-booked {
  @apply bg-red-100 cursor-not-allowed;
}
```

## Environment Setup (Frontend)

Create `.env.local` in frontend directory:
```
VITE_API_URL=http://localhost:5000
VITE_BOOKING_PAGE_URL=http://localhost:5173
```

## Testing Checklist

### Feature Testing
- [ ] Create event type with buffer times
- [ ] Buffer times appear in event list
- [ ] Book a slot and verify email sent
- [ ] Cancel booking and verify cancellation email
- [ ] Reschedule booking and verify update email
- [ ] Buffer times prevent overlapping bookings
- [ ] Display correct total time (duration + buffers)

### Email Testing
- [ ] Guest receives booking confirmation
- [ ] Host receives booking notification
- [ ] Guest email failure is noted in host notification
- [ ] Cancellation emails sent to both parties
- [ ] Reschedule emails show old vs new time

### Buffer Time Testing
- [ ] Slots respect buffer_before calculation
- [ ] Slots respect buffer_after calculation
- [ ] No overlapping bookings within buffer windows
- [ ] Correct total time displayed in UI

## Troubleshooting

### Emails not showing in frontend
- Check browser console for errors
- Verify API calls are successful (check network tab)
- Ensure Resend is configured correctly

### Buffer times not working in slot display
- Verify event type has buffer values set
- Check if availability window allows buffers
- Confirm slot calculation includes all bookings

### Integration issues
- Check API response format matches frontend expectations
- Verify header `x-user-id` is being sent correctly
- Only include buffers in response if they exist

## Future Enhancements

- [ ] Buffer time configuration in dashboard
- [ ] Visual timeline with buffer zones
- [ ] Export calendar with buffer times (.ics)
- [ ] Recurring meetings with buffer management
- [ ] Custom buffer time per guest preference

## References

- See `API_REFERENCE.md` for endpoint details
- See `IMPLEMENTATION_GUIDE.md` for setup
- See `TEST_GUIDE.md` for cURL examples
