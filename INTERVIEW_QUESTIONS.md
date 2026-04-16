# Calendly Clone - 100 Interview Questions & Answers

## 🎯 Purpose
This document covers the most likely interview questions for your Calendly clone assignment. As per the assignment requirements, you must understand every line of code and be prepared to explain your implementation decisions.

---

## **SECTION 1: ARCHITECTURE & SYSTEM DESIGN (Q1-10)**

### Q1: What is the overall architecture of your application?
**Answer:** 
The application follows a **3-tier architecture**:
1. **Frontend (React + Vite)**: User interface with routing, state management, and API communication
2. **Backend (Node.js + Express)**: REST API with business logic, validation, and database operations
3. **Database (MySQL)**: Persistent data storage with proper schema and indexes

The frontend and backend are decoupled, allowing independent scaling and development.

---

### Q2: Why did you choose this tech stack? What are the alternatives?
**Answer:**
- **Frontend - React**: Component-based, reusable UI, large ecosystem, perfect for booking interface
  - Alternatives: Vue (simpler), Angular (heavier), Svelte (lighter)
- **Backend - Node.js + Express**: JavaScript end-to-end, fast development, non-blocking I/O
  - Alternatives: Python (Django/Flask), Java (Spring), Go (faster but less ecosystem)
- **Database - MySQL**: Relational data (users, events, bookings), ACID compliance, complex queries
  - Alternatives: PostgreSQL (more features), MongoDB (NoSQL), Firebase (serverless)

This stack is chosen for **rapid development** and **simplicity** ideal for an assignment.

---

### Q3: Draw the data flow in your application
**Answer:**
```
User (Frontend) 
  → HTTP Request (JSON)
  → Express Router
  → Controller (validation + business logic)
  → Database Query
  → MySQL Response
  → Controller (format response)
  → HTTP Response (JSON)
  → React Component (update state)
  → UI Re-render
```

---

### Q4: What are the main API endpoints and their purposes?
**Answer:**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/event-types` | GET | Fetch all event types |
| `/api/event-types` | POST | Create new event type |
| `/api/event-types/:id` | PUT | Update event type |
| `/api/event-types/:id` | DELETE | Delete event type |
| `/api/slots` | GET | Get available slots for a date |
| `/api/bookings` | GET | Fetch all bookings for a user |
| `/api/bookings` | POST | Create booking |
| `/api/bookings/:id/reschedule` | PUT | Reschedule a booking |
| `/api/bookings/:id` | DELETE | Cancel booking |
| `/api/availability` | GET/POST | Manage user availability |

---

### Q5: Why is it important to separate Frontend and Backend?
**Answer:**
- **Modularity**: Each tier has single responsibility
- **Scalability**: Can scale frontend and backend independently
- **Maintainability**: Easier to debug and update
- **Security**: Backend handles sensitive operations
- **Reusability**: Backend API can serve mobile app, desktop client, third-party integrations
- **Team**: Frontend and backend engineers can work in parallel

---

### Q6: What is a REST API? Why did you use REST instead of GraphQL?
**Answer:**
**REST (Representational State Transfer)**:
- Uses HTTP methods: GET, POST, PUT, DELETE
- Resources as URLs: `/api/bookings`, `/api/event-types`
- Stateless communication
- Caching-friendly

**Why REST over GraphQL**:
- **Simplicity**: GraphQL has higher learning curve
- **Assignment scope**: REST is sufficient for this project
- **Performance**: For simple queries, REST is adequate
- **Maturity**: REST is battle-tested, fewer edge cases

Could use GraphQL for more complex nested data requirements.

---

### Q7: What is the role of routing in your application?
**Answer:**
**Frontend Routing** (React Router):
- Maps URLs to components
- Enables SPA (Single Page Application) navigation
- Preserves state when navigating
- Examples: `/`, `/create-event`, `/meetings`, `/book/:slug`

**Backend Routing** (Express Router):
- Maps API endpoints to controllers
- Handles HTTP methods
- Applies middleware (validation, error handling)
- Examples: `POST /api/bookings`, `PUT /api/event-types/:id`

Without routing, we'd need full page reloads and complex server-side rendering.

---

### Q8: Explain the booking flow step-by-step
**Answer:**
1. **User visits booking page** → `/book/:slug`
2. **Fetch event type** → `GET /api/event-types/:slug`
3. **Select date** → Calendar shows available dates
4. **Fetch available slots** → `GET /api/slots?date=2026-04-20&slug=call`
5. **Select time slot** → User picks a time
6. **Enter name & email** → Form submission
7. **Create booking** → `POST /api/bookings` with validation
8. **Transaction check** → Prevent double-booking
9. **Confirmation page** → Display booking details
10. **Add to calendar** → User can add to Google Calendar

---

### Q9: How do you prevent double-bookings?
**Answer:**
**Using Database Transactions**:
```javascript
BEGIN TRANSACTION
  1. Lock the row: SELECT ... WHERE event_type_id = ? AND start_time = ? FOR UPDATE
  2. Check if booking exists: SELECT count(*) FROM bookings WHERE ...
  3. If exists, ROLLBACK and return 409 Conflict
  4. If not, INSERT new booking
  5. COMMIT transaction
```

This ensures **atomicity** - either the entire booking succeeds or fails, no partial states.

---

### Q10: What would you do differently if building this for production?
**Answer:**
1. **Authentication**: Real login system with JWT or OAuth
2. **Authorization**: Role-based access control (only user can see their events)
3. **Email notifications**: Send confirmation emails to guests
4. **Error logging**: Log all errors to external service (Sentry, DataDog)
5. **Rate limiting**: Prevent API abuse
6. **HTTPS/Security headers**: Encrypt data in transit
7. **Database backups**: Daily automated backups
8. **Monitoring**: Track API performance, uptime
9. **Caching**: Redis for frequent queries
10. **Testing**: Unit, integration, e2e tests (currently 0%)

---

## **SECTION 2: FRONTEND (Q11-40)**

### Q11: What is React and why use components?
**Answer:**
**React** is a JavaScript library for building UIs with components - reusable, self-contained pieces of UI.

**Benefits of components**:
- **Reusability**: Button component used 100 times
- **Maintainability**: Update button in one place
- **Testability**: Easy to test isolated components
- **Composition**: Build complex UIs from simple pieces
- **State isolation**: Each component manages its own state

Example: `<Dashboard />` component renders event types, with `<EventCard />` components inside.

---

### Q12: What is the difference between functional and class components?
**Answer:**
| Functional | Class |
|---|---|
| Plain JavaScript functions | ES6 classes extending React.Component |
| Use Hooks (useState, useEffect) | Use this.state and lifecycle methods |
| Simpler, less boilerplate | More verbose |
| Modern standard | Legacy (still works) |

Your code uses **functional components with hooks**, which is the modern approach.

---

### Q13: Explain useState hook - what does it do?
**Answer:**
`useState` allows functional components to have local state.

```javascript
const [meetings, setMeetings] = useState([]);
```

- `meetings`: current state value
- `setMeetings`: function to update state
- `[]`: initial state value

When state updates, component re-renders with new data.

Usage in your app:
```javascript
const [eventTypes, setEventTypes] = useState([]); // Store events
const [activeTab, setActiveTab] = useState('events'); // Track which tab is open
```

---

### Q14: Explain useEffect hook - when is it used?
**Answer:**
`useEffect` runs side effects (API calls, subscriptions, DOM updates) after rendering.

```javascript
useEffect(() => {
    fetchEventTypes();
}, []); // Empty dependency array = run once on mount
```

**Dependency array**:
- `[]` = run once (on mount)
- `[meetings]` = run when `meetings` changes
- No array = run after every render (performance issue!)

Used in your app:
```javascript
useEffect(() => {
    api.get('/event-types').then(res => setEventTypes(res.data));
}, []); // Fetch events when Dashboard loads
```

---

### Q15: What is the Dependency Injection pattern used in useEffect?
**Answer:**
The dependency array is a form of dependency injection - it tells React: "Only re-run this effect if these dependencies change."

Without it:
```javascript
useEffect(() => {
    // Runs EVERY render - infinite loops possible!
});
```

With it:
```javascript
useEffect(() => {
    // Runs only when `slug` changes
}, [slug]);
```

This prevents performance issues and infinite loops.

---

### Q16: How does React Router work? Explain routing in your app
**Answer:**
React Router maps URLs to components:

```javascript
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/meetings" element={<Meetings />} />
    <Route path="/book/:slug" element={<BookingFlow />} />
  </Routes>
</BrowserRouter>
```

When URL changes:
1. Router matches URL against routes
2. Renders matching component
3. URL parameter extracted: `:slug` → `useParams().slug`

In `BookingFlow.jsx`:
```javascript
const { slug } = useParams(); // Get "call" from /book/call
```

**Why not full page reload?**
- Single Page Application (SPA): JavaScript handles navigation
- State preserved between pages
- Faster transitions
- Better UX

---

### Q17: What is the difference between params and query strings?
**Answer:**
- **Params** (route parameters): Part of path
  - `/book/:slug` → `/book/call` → `slug = "call"`
  - Used for required data
  
- **Query strings**: After `?` in URL
  - `/bookings?type=upcoming&duration=30`
  - Used for optional filters

In your code:
```javascript
// Params
const { slug } = useParams();

// Query strings (if used)
const queryParams = new URLSearchParams(window.location.search);
const type = queryParams.get('type');
```

---

### Q18: Explain state lifting - when is it needed?
**Answer:**
When multiple components need shared state, lift it to common parent.

**Example**: Multiple components need `meetings` data:
```javascript
// ❌ Wrong: Each component has own copy of meetings
// Meetings.jsx
const [meetings, setMeetings] = useState([]);

// Other component tries to use same data
// But has different state!

// ✅ Correct: Lift to parent
function App() {
    const [meetings, setMeetings] = useState([]);
    return (
        <>
            <MeetingsList meetings={meetings} />
            <MeetingDetails meetings={meetings} />
        </>
    );
}
```

In your app: `Dashboard` component has `eventTypes` state, passes to child components via props.

---

### Q19: What is the difference between props and state?
**Answer:**
| Props | State |
|---|---|
| Read-only data passed from parent | Mutable data owned by component |
| Cannot be modified by child | Child can modify via setState |
| Used to communicate parent→child | Used for component's own data |
| Immutable | Mutable |

Example:
```javascript
function EventCard({ event }) { // 'event' is prop (read-only)
    const [expanded, setExpanded] = useState(false); // 'expanded' is state
    
    return <div onClick={() => setExpanded(!expanded)}>
        {event.name} {expanded ? 'Show details' : 'Hide'}
    </div>;
}
```

---

### Q20: What is Context API? Why use it instead of prop drilling?
**Answer:**
**Prop drilling**: Passing props through many layers
```javascript
<App events={events}>
  <Layout events={events}>
    <Dashboard events={events}>
      <EventList events={events} /> {/* Too many levels! */}
    </Dashboard>
  </Layout>
</App>
```

**Context API**: Provide data globally
```javascript
const EventContext = createContext();

<EventProvider value={events}>
  <App>
    <EventList /> {/* Can access events directly! */}
  </App>
</EventProvider>
```

Your app uses Context API for **Toast notifications**:
```javascript
// Toast.jsx
export const ToastContext = React.createContext();

export function ToastProvider({ children }) {
    // Toast logic here
}

// In any component
const { showToast } = useToast();
showToast('Success', 'success');
```

---

### Q21: Explain the Toast notification system in your app
**Answer:**
**Toast Component** (`Toast.jsx`):
1. **ToastContext**: Stores toast messages
2. **ToastProvider**: Wraps app, manages toast state
3. **useToast hook**: Custom hook to access toast functions anywhere

**How it works**:
```javascript
// In App.jsx
<ToastProvider>
  <Router>
    {/* All routes have access to toast */}
  </Router>
</ToastProvider>

// In any component
const { showToast } = useToast();
showToast('Success!', 'success', 3000); // Auto-dismisses
```

**Types**: error, success, info, warning

**Advantages over `alert()`**:
- Non-blocking (user can continue working)
- Styled consistently
- Multiple toasts can stack
- Auto-dismiss with manual close option

---

### Q22: What is API and how do you make API calls from React?
**Answer:**
**API (Application Programming Interface)**: Contract between frontend and backend for communication.

**Making API calls**:
```javascript
// Method 1: Using fetch (native browser API)
fetch('/api/bookings')
    .then(res => res.json())
    .then(data => setBookings(data))
    .catch(err => console.error(err));

// Method 2: Using axios (library)
import axios from 'axios';
axios.get('/api/bookings')
    .then(res => setBookings(res.data))
    .catch(err => showToast(err.message, 'error'));
```

Your code creates `api.js` wrapper:
```javascript
// api.js
const api = axios.create({
    baseURL: 'http://localhost:5000/api'
});

export default api;

// Usage
api.get('/bookings').then(res => setMeetings(res.data));
```

**Why wrapper?**
- Centralized configuration
- Consistent error handling
- Base URL once, not repeated

---

### Q23: What is conditional rendering? Show examples from your code
**Answer:**
Rendering different content based on conditions.

```javascript
// Example 1: Ternary operator
{isLoggedIn ? <Dashboard /> : <LoginPage />}

// Example 2: Logical AND
{meetings.length > 0 && <MeetingsList meetings={meetings} />}

// Example 3: if-else before JSX
if (loading) return <Spinner />;
if (error) return <ErrorMessage />;
return <Dashboard />;
```

From your code (Dashboard.jsx):
```javascript
{activeTab === 'events' && (
    <>
        {/* Event types content */}
    </>
)}

{activeTab === 'integrations' && (
    <div className="space-y-6">
        {/* Integrations content */}
    </div>
)}
```

---

### Q24: What is array mapping? Why use it for lists?
**Answer:**
`map()` transforms array and renders each item:

```javascript
const events = [
    { id: 1, name: 'Call' },
    { id: 2, name: 'Demo' }
];

{events.map(event => (
    <EventCard key={event.id} event={event} />
))}
```

**Why not a for loop?**
- `map()` is declarative (what to render)
- for loop is imperative (how to render)
- React prefers declarative

**Important**: Always use `key` prop!
```javascript
// ❌ Bad: Don't use index as key (causes bugs if list reorders)
{events.map((event, index) => <EventCard key={index} />)}

// ✅ Good: Use unique identifier
{events.map(event => <EventCard key={event.id} />)}
```

From your code:
```javascript
{filteredEventTypes.map(event => (
    <div key={event.id} className="...">
        <h3>{event.name}</h3>
    </div>
))}
```

---

### Q25: Explain event handling in React
**Answer:**
Attaching functions to DOM events:

```javascript
function handleClick(e) {
    e.preventDefault(); // Stop default behavior
    console.log('Button clicked');
}

<button onClick={handleClick}>Click me</button>
```

**Common events**:
- `onClick`: Button, link clicks
- `onChange`: Input value changes
- `onSubmit`: Form submission
- `onHover`: Mouse over element

```javascript
// From your code (Dashboard.jsx)
<button onClick={() => navigate(`/edit-event/${event.slug}`)}>
    Edit
</button>

<input onChange={(e) => setSearchQuery(e.target.value)} />

<button onClick={() => setActiveTab('events')}>
    Event types
</button>
```

**Arrow functions**: Preserve `this` context, but create new function on each render (can be inefficient).

---

### Q26: What is form handling in React?
**Answer:**
Controlled inputs - React controls form state:

```javascript
function BookingForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData); // { name: 'John', email: 'john@...' }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
            />
            <button type="submit">Submit</button>
        </form>
    );
}
```

From your code (BookingFlow.jsx):
```javascript
<input
    value={formData.name}
    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
/>
```

---

### Q27: Explain CSS-in-JS and Tailwind CSS usage in your app
**Answer:**
Your app uses **Tailwind CSS** (utility-first CSS framework):

```javascript
// Tailwind classes
<div className="px-8 pb-20 pt-8 flex-1 bg-primary">
    {/* px-8 = padding left+right 8 units */}
    {/* pb-20 = padding-bottom 20 units */}
    {/* bg-primary = background color primary */}
</div>
```

**Advantages**:
- No separate CSS files
- Consistent styling
- Responsive design easy: `md:text-xl lg:text-2xl`
- PurgeCSS removes unused styles

**vs Inline styles** (also used in your code):
```javascript
// Inline styles
<div style={{ 
    background: '#1f7a3d', 
    color: '#fff'
}}>
    Content
</div>

// Drawbacks: No media queries, no hover states, verbose
```

Your code mixes:
- **Tailwind** for most components (cleaner)
- **Inline styles** for dynamic colors (necessary)

---

### Q28: What is responsive design? How is it implemented?
**Answer:**
Responsive design adapts to different screen sizes.

**Mobile-first approach**:
```javascript
<div className="
    w-full              {/* 100% width on mobile */}
    md:w-1/2           {/* 50% width on tablet+ */}
    lg:w-1/3           {/* 33% width on desktop+ */}
    px-4
    md:px-8
">
    Content
</div>
```

**Breakpoints in Tailwind**:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

Your booking page is responsive - looks good on phone and desktop.

---

### Q29: What is the virtual DOM? Why is it important?
**Answer:**
**Virtual DOM**: JavaScript representation of actual DOM.

**How it works**:
1. Component state changes
2. React creates new Virtual DOM
3. Compares with old Virtual DOM
4. Only changed DOM nodes are updated (diffing)
5. Actual DOM updated (efficient!)

**Why important**:
- Direct DOM manipulation is slow
- Virtual DOM is fast (memory, not actual rendering)
- Batches updates together
- Only necessary reflows/repaints

Example:
```javascript
// Without Virtual DOM (jQuery style)
document.getElementById('meetings').innerHTML = newHTML; // Slow!

// With React
setMeetings(newData); // Virtual DOM, efficient!
```

---

### Q30: Explain performance optimization in React
**Answer:**
**Common optimization techniques**:

1. **useMemo** - Memoize expensive calculations:
```javascript
const expensiveValue = useMemo(() => {
    return filteredEventTypes.filter(...).sort(...);
}, [filteredEventTypes]); // Only recalculate if dependency changes
```

2. **useCallback** - Memoize functions:
```javascript
const handleDelete = useCallback((id) => {
    api.delete(`/event-types/${id}`);
}, []); // Function doesn't recreate on each render
```

3. **React.memo** - Prevent component re-render if props unchanged:
```javascript
const EventCard = React.memo(({ event }) => (
    <div>{event.name}</div>
));
```

4. **Code splitting** - Load components on demand:
```javascript
const Dashboard = React.lazy(() => import('./Dashboard'));
```

Your code doesn't use these yet (could improve performance for large datasets).

---

### Q31-40: (Continuing with more Frontend questions)

### Q31: What is localStorage and how to use it?
**Answer:**
Browser storage for persisting data across sessions:

```javascript
// Save
localStorage.setItem('user', JSON.stringify({ name: 'John' }));

// Retrieve
const user = JSON.parse(localStorage.getItem('user'));

// Remove
localStorage.removeItem('user');
```

**Use cases**:
- Remember last search
- Store user preferences
- Cache API responses
- Login tokens

Could use in your app:
```javascript
// Remember which tab was open
const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('activeTab') || 'events';
});

useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
}, [activeTab]);
```

---

### Q32: What is debouncing? How to implement it?
**Answer:**
Limit how often a function executes (useful for search, resize events).

```javascript
function debounce(fn, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}

// Usage
const handleSearch = debounce((query) => {
    api.get(`/search?q=${query}`);
}, 500);

<input onChange={(e) => handleSearch(e.target.value)} />
// Only searches 500ms after user stops typing
```

Your code searches on every keystroke (not debounced):
```javascript
<input 
    onChange={(e) => setSearchQuery(e.target.value)}
    {/* This re-runs filter on every character */}
/>
```

Could optimize with debouncing for large datasets.

---

### Q33: What is lazy loading?
**Answer:**
Load components/images only when needed.

```javascript
// Lazy load component
const Meetings = React.lazy(() => import('./pages/Meetings'));

// Must wrap in Suspense
<Suspense fallback={<Spinner />}>
    <Meetings />
</Suspense>
```

**Benefits**:
- Smaller initial bundle
- Faster page load
- Only load what user accesses

Applied to your app:
- Load `Meetings` page only when user clicks tab
- Load booking flow only when user visits `/book/:slug`

---

### Q34: How to handle errors in React?
**Answer:**
Multiple layers:

```javascript
// Layer 1: Try-catch in async functions
const fetchMeetings = async () => {
    try {
        const res = await api.get('/bookings');
        setMeetings(res.data);
    } catch (error) {
        showToast(error.message, 'error');
    }
};

// Layer 2: Error boundary (catches render errors)
<ErrorBoundary>
    <Dashboard />
</ErrorBoundary>

// Layer 3: API error response handling
api.interceptors.response.use(
    res => res,
    error => {
        if (error.response?.status === 401) {
            // Redirect to login
        }
        return Promise.reject(error);
    }
);
```

Your code uses try-catch, could add Error Boundary for production.

---

### Q35: What is the difference between onchange and oninput?
**Answer:**
| onChange | onInput |
|----------|---------|
| Fires when value commits (blur, enter) | Fires on every keystroke |
| Less frequent updates | More frequent updates |
| Use for: Form validation | Use for: Real-time search |

Your search box uses `onChange`:
```javascript
<input 
    onChange={(e) => setSearchQuery(e.target.value)}
    {/* Updates state on every keystroke */}
/>
```

For better performance, could use `onInput` with debounce.

---

### Q36: Explain the booking confirmation page design
**Answer:**
Shows booking details after successful booking:

```javascript
// BookingConfirmation.jsx
export default function BookingConfirmation() {
    const location = useLocation();
    const booking = location.state?.booking; // Get from navigation state

    return (
        <div className="...">
            <h1>You're scheduled!</h1>
            <div>
                <p>Event: {booking.event_name}</p>
                <p>Date: {format(parseISO(booking.start_time), '...')}</p>
                <p>Attendee: {booking.booker_name}</p>
            </div>
            <button onClick={() => window.open(generateGoogleCalendarLink())}>
                Add to Google Calendar
            </button>
        </div>
    );
}
```

**Key features**:
- Shows all booking details
- Green success banner
- "Add to Calendar" button (Google Calendar integration)
- "Schedule Another" button for quick re-booking

---

### Q37: How does the Google Calendar integration work?
**Answer:**
Uses Google Calendar's URL scheme (no OAuth needed):

```javascript
function generateGoogleCalendarLink(meeting) {
    const startTime = parseISO(meeting.start_time)
        .toISOString()
        .replace(/[-:]/g, '')
        .split('.')[0] + 'Z';
    
    const title = encodeURIComponent(meeting.event_name);
    const description = encodeURIComponent(`Meeting with ${meeting.booker_name}`);
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/...&details=${description}`;
}

// User clicks button → Google Calendar opens in new tab with pre-filled event
window.open(generateGoogleCalendarLink(), '_blank');
```

**Limitations**:
- Not full integration (no OAuth)
- No automatic sync
- User manually adds event

**Production alternative**: Use Google Calendar API with OAuth.

---

### Q38: Explain the Meetings page layout and features
**Answer:**
Displays all bookings for the HOST user:

```
┌─────────────────────────────────┐
│  Upcoming / Past (tabs)         │
│  Filter by event type & duration│
├─────────────────────────────────┤
│ Wednesday, April 20, 2026       │
│  9:00 AM – 10:00 AM            │
│  John Smith → Event Type: Call  │
│  [Reschedule] [Details]         │
│                                 │
│  10:30 AM – 11:00 AM           │
│  Jane Doe → Event Type: Demo    │
│  [Reschedule] [Details]         │
└─────────────────────────────────┘
```

**Features**:
- Grouped by date
- Tab filter (upcoming/past)
- Additional filters (event type, duration)
- Actions: Reschedule, Details, Cancel

---

### Q39: What is the `useParams` hook and how is it used?
**Answer:**
Extracts route parameters from URL:

```javascript
// Route definition
<Route path="/book/:slug" element={<BookingFlow />} />

// Component usage
function BookingFlow() {
    const { slug } = useParams(); // Get "call" from /book/call
    
    useEffect(() => {
        api.get(`/event-types/${slug}`);
    }, [slug]);
}
```

Used in your app:
- `/edit-event/:slug` → Extract slug to edit that event
- `/book/:slug` → Extract slug to show booking for that event

---

### Q40: Explain the create/edit event flow
**Answer:**
Two separate pages (CreateEvent.jsx, EditEvent.jsx):

**Create Event**:
1. User fills form (name, duration, buffer times)
2. Generates unique slug
3. `POST /api/event-types` with validation
4. Success → Show toast → Redirect to dashboard

**Edit Event**:
1. Fetch existing event by slug
2. Pre-fill form with current values
3. User modifies fields
4. `PUT /api/event-types/:id`
5. Success → Redirect to dashboard

Key difference: Create generates new ID, Edit updates existing.

---

## **SECTION 3: BACKEND (Q41-70)**

### Q41: What is Node.js and why use it for backend?
**Answer:**
**Node.js**: JavaScript runtime that runs on server (not just browser).

**Why Node.js**:
- Single language (JavaScript) frontend + backend
- Fast, non-blocking I/O (handles many connections)
- NPM ecosystem (thousands of packages)
- Event-driven architecture
- Good for I/O-bound operations (APIs, databases)

**When NOT to use**:
- CPU-intensive tasks (image processing, ML)
- Need strict type safety (TypeScript helps)
- Real-time limits critical (Go/Rust faster)

---

### Q42: What is Express.js? Why use it?
**Answer:**
**Express**: Minimal Node.js web framework for building APIs.

```javascript
const express = require('express');
const app = express();

app.get('/api/events', (req, res) => {
    res.json({ data: [...] });
});

app.listen(5000);
```

**Key features**:
- Routing: `app.get()`, `app.post()`, etc.
- Middleware: `app.use(middleware)`
- Error handling: `app.use((err, req, res, next) => {})`
- JSON parsing: `app.use(express.json())`

**Alternatives**:
- Hapi (more opinionated)
- Fastify (faster)
- NestJS (TypeScript, more structured)

Express chosen for simplicity.

---

### Q43: What is middleware? Show examples from your code
**Answer:**
Functions that run before route handlers, can modify request/response.

```javascript
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next(); // Pass to next middleware
});

app.use(express.json()); // Parse JSON bodies

app.use(cors()); // Enable CORS

app.use((err, req, res, next) => {
    // Error handling middleware
    res.status(500).json({ error: err.message });
});
```

From your code (app.js):
```javascript
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON

app.use('/api/event-types', eventTypeRoutes);
app.use('/api/bookings', bookingRoutes);
// Each route has its own middleware (validation, auth)
```

**Middleware chain**:
```
Request → cors() → express.json() → router.post() → errorHandler
```

---

### Q44: Explain CORS - what is it and why needed?
**Answer:**
**CORS (Cross-Origin Resource Sharing)**: Allows requests from different domains.

**Problem**: Frontend (localhost:5173) requests backend (localhost:5000)
```
// Browser blocks this by default (security)
fetch('http://localhost:5000/api/bookings') // ❌ Different port
```

**Solution**: Add CORS headers
```javascript
const cors = require('cors');
app.use(cors()); // Allow all origins

// Or specific origin
app.use(cors({
    origin: 'http://localhost:5173'
}));
```

Response headers added:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type
```

Now browser allows request.

---

### Q45: What is a Controller? Why separate from routes?
**Answer:**
**Separation of Concerns**: Routes handle HTTP, controllers handle business logic.

```javascript
// ❌ Bad: Mixed concerns
app.post('/api/bookings', (req, res) => {
    // Too much logic here!
    const data = req.body;
    if (!data.email) res.status(400).json({ error: 'Email required' });
    const booking = new Booking(data);
    booking.save();
    res.json(booking);
});

// ✅ Good: Separated
// routes/bookings.js
router.post('/', bookingsController.createBooking);

// controllers/bookingsController.js
exports.createBooking = (req, res) => {
    // Clean, testable logic
};
```

**Benefits**:
- Testable (can test controller independently)
- Reusable (same controller for different routes)
- Maintainable (clear structure)

Your app structure:
```
routes/
  bookings.js → controllers/bookingsController.js
  eventTypes.js → controllers/eventTypesController.js
```

---

### Q46: Explain validation - where and why?
**Answer:**
Ensure data is correct before processing.

```javascript
const { z } = require('zod');

const bookingSchema = z.object({
    event_type_id: z.string().uuid(),
    booker_name: z.string().min(1),
    booker_email: z.string().email(),
    start_time: z.string()
});

exports.createBooking = (req, res) => {
    const data = bookingSchema.parse(req.body); // Throws if invalid
    // Now safe to use data
};
```

**Where to validate**:
- **Frontend**: User feedback (prevent submission)
- **Backend**: Security (don't trust frontend)

**Why**:
- Prevent invalid data in database
- Prevent crashes from unexpected data
- Security (SQL injection, XSS)

From your code (bookingsController.js):
```javascript
const bookingSchema = z.object({
    event_type_id: z.string().uuid(),
    booker_name: z.string().min(1),
    booker_email: z.string().email(),
    start_time: z.string()
});

exports.createBooking = async (req, res) => {
    const data = bookingSchema.parse(req.body);
    // Type-safe data
};
```

---

### Q47: What is Database Connection Pooling?
**Answer:**
Reuse database connections instead of creating new ones.

```javascript
// Without pooling: Expensive!
// Each request: Connect → Query → Disconnect

// With pooling: Efficient!
// Keep 5 connections open, reuse them
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'calendly'
});

// Reuse connection
pool.query('SELECT * FROM users', (error, results) => {
    // Connection returned to pool automatically
});
```

Your code uses mysql2 with pooling by default.

---

### Q48: Explain database transactions - when/why?
**Answer:**
Group multiple operations as one atomic unit.

**Problem**: Double-booking without transaction
```
User A: Check slot available ✓
User B: Check slot available ✓
User A: Book slot ✓ (slot taken)
User B: Book slot ✓ (ERROR: double-booked!)
```

**Solution**: Transaction
```javascript
BEGIN TRANSACTION
  1. Lock row: SELECT ... FOR UPDATE
  2. Check: if exists, ROLLBACK
  3. Insert: INSERT into bookings
  4. COMMIT
```

From your code (bookingsController.js):
```javascript
const connection = await db.getConnection();
try {
    await connection.beginTransaction();
    
    // Check existing
    const [existing] = await connection.query(
        "SELECT id FROM bookings WHERE event_type_id = ? AND start_time = ? 
         AND status = 'SCHEDULED' FOR UPDATE"
        [data.event_type_id, data.start_time]
    );
    
    if (existing.length > 0) {
        await connection.rollback();
        return res.status(409).json({ error: 'Double-booking' });
    }
    
    // Insert
    await connection.query('INSERT INTO bookings ...', [...]);
    
    await connection.commit();
} catch (error) {
    await connection.rollback();
}
```

**ACID properties**:
- **Atomicity**: All or nothing
- **Consistency**: Data stays valid
- **Isolation**: Concurrent operations don't interfere
- **Durability**: Once committed, stays committed

---

### Q49: What are HTTP Status Codes? Explain common ones
**Answer:**
Numbers indicating request result:

**2xx Success**:
- `200 OK`: Request succeeded
- `201 Created`: Resource created
- `204 No Content`: Success but no data

**4xx Client Error**:
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized
- `404 Not Found`: Resource doesn't exist
- `409 Conflict`: Resource conflict (double-booking)

**5xx Server Error**:
- `500 Internal Server Error`: Server bug
- `503 Service Unavailable`: Server down

Your code uses:
```javascript
res.status(404).json({ error: 'Event type not found' });
res.status(409).json({ error: 'Double-booking detected' });
res.status(201).json(booking); // Created successfully
```

---

### Q50: Explain REST principles - what makes API RESTful?
**Answer:**
**REST constraints**:

1. **Client-Server**: Separated concerns
2. **Statelessness**: Each request contains all info
3. **Resource-based URLs**: `/bookings` not `/getBookings`
4. **Standard HTTP methods**:
   - GET: Fetch
   - POST: Create
   - PUT: Update
   - DELETE: Remove
5. **Representations**: Data in JSON/XML

**Good RESTful API**:
```
GET /api/bookings → List all bookings
GET /api/bookings/:id → Get specific booking
POST /api/bookings → Create booking
PUT /api/bookings/:id → Update booking
DELETE /api/bookings/:id → Cancel booking
```

**Not RESTful**:
```
GET /api/getBookings
GET /api/createBooking?name=John
GET /api/deleteBooking?id=123
```

Your API follows REST principles.

---

### Q51: What is request and response in HTTP?
**Answer:**
**Request** (Client → Server):
```
POST /api/bookings HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
    "event_type_id": "123",
    "booker_name": "John",
    "start_time": "2026-04-20T14:00:00"
}
```

**Response** (Server → Client):
```
HTTP/1.1 201 Created
Content-Type: application/json

{
    "id": "booking-123",
    "status": "SCHEDULED"
}
```

**Common properties**:
- **Status**: 200, 404, 500, etc.
- **Headers**: Content-Type, Authorization
- **Body**: JSON data

In Express:
```javascript
app.post('/api/bookings', (req, res) => {
    const data = req.body; // Request body
    res.status(201).json({ data }); // Response status + body
});
```

---

### Q52: What are Query Parameters?
**Answer:**
Additional data sent in URL:

```
GET /api/slots?slug=call&date=2026-04-20&userId=user123

// In Express
app.get('/api/slots', (req, res) => {
    const { slug, date, userId } = req.query;
    // slug = 'call'
    // date = '2026-04-20'
    // userId = 'user123'
});
```

**Difference from path parameters**:
```
Path: /api/bookings/:id → /api/bookings/123
Query: /api/bookings?id=123
```

From your code (slotService.js):
```javascript
// Request
GET /api/slots?slug=call&date=2026-04-20&userId=user123

// Controller
const { slug, date, userId } = req.query;
```

---

### Q53: Explain async/await vs Promises
**Answer:**
**Promises**:
```javascript
function fetchBookings() {
    return api.get('/bookings')
        .then(res => res.data)
        .catch(err => console.error(err));
}
```

**Async/Await** (cleaner):
```javascript
async function fetchBookings() {
    try {
        const res = await api.get('/bookings');
        return res.data;
    } catch (err) {
        console.error(err);
    }
}

const bookings = await fetchBookings();
```

**Benefits of async/await**:
- Looks synchronous (easier to read)
- Better error handling with try-catch
- Easier debugging (linear stack trace)

Your code uses async/await extensively:
```javascript
const handleRescheduleSubmit = async () => {
    try {
        await api.put(`/bookings/${id}/reschedule`, {});
    } catch (err) {
        // Error handling
    }
};
```

---

### Q54: What are HTTP headers?
**Answer:**
Metadata sent with requests/responses:

**Common Request Headers**:
```
Content-Type: application/json
Authorization: Bearer token123
User-Agent: Mozilla/5.0
```

**Common Response Headers**:
```
Content-Type: application/json
Set-Cookie: session=abc123
Access-Control-Allow-Origin: *
```

In Express:
```javascript
app.post('/api/bookings', (req, res) => {
    // Read header
    const authHeader = req.headers.authorization;
    
    // Set header
    res.setHeader('X-Total-Count', 100);
    res.json(data);
});
```

Your code uses:
```javascript
api.delete(`/bookings/${id}`, {
    headers: { 'x-user-id': MOCK_USER_ID }
});
```

---

### Q55: Explain error handling in Express
**Answer:**
Three approaches:

1. **Try-catch** (async routes):
```javascript
app.post('/api/bookings', async (req, res) => {
    try {
        const booking = await createBooking(req.body);
        res.json(booking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
```

2. **Error middleware** (catches all errors):
```javascript
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
        error: err.message
    });
});
```

3. **wrapper function** (avoid try-catch):
```javascript
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

app.post('/api/bookings', asyncHandler(async (req, res) => {
    const booking = await createBooking(req.body);
    res.json(booking);
}));
```

Your code uses approach 1 (try-catch).

---

### Q56: What is dependency injection?
**Answer:**
Pass dependencies instead of creating them inside function.

```javascript
// ❌ Bad: Hard to test, tightly coupled
function fetchBookings() {
    const db = mysql.createConnection(...); // Created here
    return db.query('SELECT * FROM bookings');
}

// ✅ Good: Dependency injected
function fetchBookings(db) {
    return db.query('SELECT * FROM bookings');
}

// Can inject different db for testing
const db = {
    query: () => Promise.resolve([mockData])
};
fetchBookings(db);
```

Your code implicitly uses DI:
```javascript
// Controllers receive db via imports
const db = require('../config/db');

exports.createBooking = async (req, res) => {
    const [result] = await db.query(...);
};

// For testing, could mock db
```

---

### Q57: Explain the slots calculation logic
**Answer:**
Finds available time slots for a date:

```
1. Get event duration (e.g., 60 min)
2. Get user availability (e.g., 9 AM - 5 PM)
3. Get existing bookings for that day
4. Calculate free slots
   - 9:00 AM → Booked (user 1), slot NOT available
   - 10:00 AM → Free, slot available
   - 11:00 AM → Existing booking (user 2), slot NOT available
   - 12:00 PM → Free, slot available
5. Return available slots as array
```

From your code (slotService.js):
```javascript
function generateSlots(availabilities, existingBookings, duration, date) {
    let slots = [];
    
    // For each availability on that day
    availabilities.forEach(avail => {
        if (avail.day_of_week !== date.getDay()) return;
        
        let current = parseTime(avail.start_time);
        const end = parseTime(avail.end_time);
        
        while (current + duration <= end) {
            // Check if slot booked
            const isBooked = existingBookings.some(b => 
                b.start_time === current
            );
            
            if (!isBooked) {
                slots.push({ start_time: current });
            }
            
            current += duration;
        }
    });
    
    return slots;
}
```

**Example**:
- User available: 9 AM - 5 PM
- Bookings: 10 AM, 2 PM
- Duration: 1 hour
- Available slots: 9 AM, 11 AM, 12 PM, 1 PM, 3 PM, 4 PM

---

### Q58: What is Object-Relational Mapping (ORM)?
**Answer:**
Maps database tables to JavaScript objects.

**Without ORM**:
```javascript
const result = await db.query('SELECT * FROM bookings WHERE id = ?', [id]);
const booking = result[0];
```

**With ORM** (Sequelize):
```javascript
const booking = await Booking.findById(id);
```

**Benefits**:
- Type-safe queries
- Automatic SQL escaping (prevents SQL injection)
- Easier to maintain
- Chainable queries

**Your app**: Uses raw SQL with mysql2 (no ORM)

**When to use ORM**:
- Large projects
- Complex relationships
- Team using multiple databases

**When NOT to use**:
- Simple queries (your case)
- Complex aggregate queries
- Performance-critical operations

---

### Q59: Explain SQL JOIN operations
**Answer:**
Combine data from multiple tables:

```sql
-- INNER JOIN: Only matching records
SELECT b.id, u.name, b.start_time
FROM bookings b
INNER JOIN users u ON b.user_id = u.id
WHERE b.id = '123';

-- LEFT JOIN: All left table + matching right
SELECT e.name, COUNT(b.id)
FROM event_types e
LEFT JOIN bookings b ON e.id = b.event_type_id
GROUP BY e.id;
```

Your code uses JOINs implicitly:
```javascript
// Get bookings with event info
SELECT b.*, e.name as event_name, e.duration
FROM bookings b
JOIN event_types e ON b.event_type_id = e.id
WHERE b.user_id = ?;
```

---

### Q60: What causes N+1 query problem?
**Answer:**
Inefficient queries that multiply with data.

```javascript
// ❌ N+1 Problem: 1 + N queries!
const users = await db.query('SELECT * FROM users'); // 1 query
for (const user of users) {
    const bookings = await db.query(
        'SELECT * FROM bookings WHERE user_id = ?', 
        [user.id]
    ); // N queries (one per user)
}
// Total: 1 + N queries. If 100 users: 101 queries!

// ✅ Solution: Use JOIN (1 query)
const data = await db.query(`
    SELECT u.*, b.*
    FROM users u
    LEFT JOIN bookings b ON u.id = b.user_id
`); // 1 query!
```

Your code doesn't have N+1 problems (uses JOINs appropriately).

---

### Q61-70: (Remaining Backend questions)

### Q61: Explain password hashing
**Answer:**
Never store passwords in plain text!

```javascript
const bcrypt = require('bcrypt');

// Hash password (one-way)
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);
// Store hashedPassword in database

// Verify password on login
const isValid = await bcrypt.compare(userInputPassword, hashedPassword);
```

Your app doesn't have user authentication yet (uses MOCK_USER_ID).

Production setup:
```javascript
// Register
const user = {
    email: 'john@example.com',
    password: await bcrypt.hash('password123', 10)
};

// Login
const user = await db.query('SELECT * FROM users WHERE email = ?');
const isValid = await bcrypt.compare(inputPassword, user.password);
```

---

### Q62: What are environment variables?
**Answer:**
Configuration values outside code:

```javascript
// .env file
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=secret
NODE_ENV=development

// app.js
require('dotenv').config();
const PORT = process.env.PORT || 5000;
const DB_HOST = process.env.DB_HOST;
```

**Benefits**:
- Secrets not in code
- Different configs per environment
- Easy to deploy
- Prevent accidental exposure

Your app should use .env for:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=***
DB_NAME=calendly
PORT=5000
```

---

### Q63: Explain the database schema design
**Answer:**
Normalized schema with proper relationships:

```sql
USERS
├── id (PK)
├── email
└── timezone

EVENT_TYPES
├── id (PK)
├── user_id (FK → USERS)
├── name
├── duration
└── slug

AVAILABILITIES
├── id (PK)
├── user_id (FK → USERS)
├── day_of_week
├── start_time
└── end_time

BOOKINGS
├── id (PK)
├── event_type_id (FK → EVENT_TYPES)
├── user_id (FK → USERS)
├── booker_name
├── booker_email
└── start_time
```

**Relationships**:
- 1 user → many event types (1:N)
- 1 event type → many bookings (1:N)
- 1 event type → many availabilities (1:N)

---

### Q64: What are database indexes? Why important?
**Answer:**
Speed up queries by pre-sorting data:

```sql
-- Without index: Full table scan (slow for 10M rows)
SELECT * FROM bookings WHERE user_id = 'user123'; -- 10M scans

-- With index: Direct lookup (fast!)
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
SELECT * FROM bookings WHERE user_id = 'user123'; -- 10 scans
```

Your schema has indexes:
```sql
CREATE INDEX idx_user_id ON event_types(user_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_start_time ON bookings(start_time);
```

**When to index**:
- Columns in WHERE clause
- Foreign keys
- Columns in ORDER BY

**Cost of indexes**:
- Slower INSERT/UPDATE (must update index)
- More disk space
- Use wisely!

---

### Q65: What is sanitization and why needed?
**Answer:**
Clean input to prevent malicious code:

```javascript
// ❌ Dangerous: SQL Injection!
const email = req.body.email; // Could be: '); DROP TABLE users; --
const query = `SELECT * FROM users WHERE email = '${email}'`;
db.query(query); // Deletes table!

// ✅ Safe: Parameterized queries
db.query('SELECT * FROM users WHERE email = ?', [email]);
// Email treated as value, not SQL code
```

Your code uses parameterized queries:
```javascript
const [rows] = await db.query(
    'SELECT * FROM event_types WHERE slug = ?',
    [slug] // Parameter, not string interpolation
);
```

**Types of attacks prevented**:
- SQL Injection
- XSS (Cross-Site Scripting)
- Command Injection

---

### Q66: Explain the createBooking logic step-by-step
**Answer:**
```javascript
exports.createBooking = async (req, res) => {
    // Step 1: Validate input
    const data = bookingSchema.parse(req.body);
    
    // Step 2: Fetch event type (get user_id, duration)
    const [eventTypes] = await db.query(
        'SELECT user_id, duration FROM event_types WHERE id = ?',
        [data.event_type_id]
    );
    
    // Step 3: Calculate end time
    const endDateTime = addMinutes(
        parseISO(data.start_time), 
        eventType.duration
    );
    
    // Step 4: Start transaction (prevent double-booking)
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    // Step 5: Check for existing booking (pessimistic lock)
    const [existing] = await connection.query(
        "SELECT id FROM bookings WHERE ... FOR UPDATE"
    );
    if (existing.length > 0) {
        await connection.rollback();
        return res.status(409).json({ error: 'Conflict' });
    }
    
    // Step 6: Insert booking
    await connection.query(
        'INSERT INTO bookings (...) VALUES (...)',
        [id, event_type_id, user_id, ...]
    );
    
    // Step 7: Commit transaction
    await connection.commit();
    
    // Step 8: Fetch event info
    const [eventInfo] = await db.query(
        'SELECT name, slug FROM event_types WHERE id = ?',
        [data.event_type_id]
    );
    
    // Step 9: Return response
    res.status(201).json({
        id, event_type_id, event_name, ...
    });
};
```

---

### Q67: Explain the reschedule booking logic
**Answer:**
```javascript
exports.rescheduleBooking = async (req, res) => {
    const { id } = req.params;
    const { start_time } = req.body;
    
    // Update booking with new time
    await db.query(
        'UPDATE bookings SET start_time = ?, end_time = ? WHERE id = ?',
        [start_time, endTime, id]
    );
    
    // Transaction not needed here (no conflict possible)
    // Only one booking being updated
    
    res.json({ message: 'Rescheduled' });
};
```

**Note**: Could add validation:
- Check if slot available
- Check if user authorized
- Prevent rescheduling to past

---

### Q68: What is Express routing? How does it work?
**Answer:**
Maps HTTP requests to controllers:

```javascript
// routes/bookings.js
const express = require('express');
const router = express.Router();
const bookingsController = require('../controllers/bookingsController');

router.get('/', bookingsController.getBookings);
router.post('/', bookingsController.createBooking);
router.put('/:id/reschedule', bookingsController.rescheduleBooking);
router.delete('/:id', bookingsController.deleteBooking);

module.exports = router;

// app.js
app.use('/api/bookings', bookingsRoutes);
```

**Request flow**:
```
POST /api/bookings
  → Express matches `/api/bookings`
  → Calls bookingsRoutes
  → Matches `POST /`
  → Calls bookingsController.createBooking
  → Returns response
```

---

### Q69: What is the difference between PUT and PATCH?
**Answer:**
| PUT | PATCH |
|---|---|
| Replace entire resource | Update partial resource |
| `PUT /bookings/123 { start_time, end_time }` | `PATCH /bookings/123 { start_time }` |
| If missing fields, set to NULL | Keep existing fields |

Your code uses PUT:
```javascript
router.put('/:id/reschedule', bookingsController.rescheduleBooking);
// Entire booking object updated
```

Could use PATCH for partial updates.

---

### Q70: Explain the error handling middleware
**Answer:**
Catches all errors from routes:

```javascript
app.post('/api/bookings', (req, res, next) => {
    try {
        // If error is thrown here
        throw new Error('Something broke');
    } catch (err) {
        next(err); // Pass to error handler
    }
});

// Error middleware (must have 4 params!)
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    res.status(err.status || 500).json({
        error: err.message,
        status: err.status || 500
    });
});
```

From your code (middlewares/errorHandler.js):
Should implement proper error handling for production.

---

## **SECTION 4: DATABASE & SQL (Q71-85)**

### Q71: What is SQL?
**Answer:**
**SQL (Structured Query Language)**: Language for managing databases.

```sql
SELECT * FROM users;
INSERT INTO users (name, email) VALUES ('John', 'john@...');
UPDATE users SET email = 'new@...' WHERE id = 1;
DELETE FROM users WHERE id = 1;
```

Your app uses SQL via mysql2:
```javascript
const [rows] = await db.query('SELECT * FROM bookings WHERE id = ?', [id]);
```

---

### Q72: Explain the SELECT statement
**Answer:**
Fetch data from database:

```sql
-- All rows
SELECT * FROM bookings;

-- Specific columns
SELECT id, booker_name, start_time FROM bookings;

-- With conditions
SELECT * FROM bookings WHERE status = 'SCHEDULED';

-- Ordering
SELECT * FROM bookings ORDER BY start_time DESC;

-- Limiting
SELECT * FROM bookings LIMIT 10;

-- Grouping
SELECT COUNT(*) as total, status FROM bookings GROUP BY status;

-- Aggregate functions
SELECT AVG(duration), MAX(start_time), COUNT(*) FROM bookings;
```

---

### Q73: Explain WHERE clause and conditions
**Answer:**
Filter rows:

```sql
-- Equality
SELECT * FROM bookings WHERE status = 'SCHEDULED';

-- Comparison
SELECT * FROM bookings WHERE start_time > '2026-04-20';

-- Logical operators
SELECT * FROM bookings 
WHERE status = 'SCHEDULED' AND user_id = 'user1';

-- IN clause
SELECT * FROM bookings 
WHERE event_type_id IN ('type1', 'type2');

-- LIKE pattern
SELECT * FROM users WHERE email LIKE '%@gmail.com';

-- NULL check
SELECT * FROM bookings WHERE notes IS NULL;
```

---

### Q74: Explain JOINs (covered in detail)
**Answer:**
Already covered in Q59.

---

### Q75: What is GROUP BY?
**Answer:**
Group rows and aggregate:

```sql
-- Count bookings per event type
SELECT event_type_id, COUNT(*) as total
FROM bookings
GROUP BY event_type_id;

-- Average duration per event
SELECT event_type_id, AVG(duration) as avg_duration
FROM event_types
GROUP BY event_type_id;

-- With HAVING (filter after grouping)
SELECT event_type_id, COUNT(*) as total
FROM bookings
GROUP BY event_type_id
HAVING COUNT(*) > 5; -- Only events with >5 bookings
```

---

### Q76: What is ORDER BY?
**Answer:**
Sort results:

```sql
-- Ascending (default)
SELECT * FROM bookings ORDER BY start_time ASC;

-- Descending
SELECT * FROM bookings ORDER BY start_time DESC;

-- Multiple columns
SELECT * FROM bookings 
ORDER BY status ASC, start_time DESC;

-- With LIMIT (top N)
SELECT * FROM bookings 
ORDER BY start_time DESC 
LIMIT 10; -- 10 most recent bookings
```

---

### Q77: What is LIMIT and OFFSET?
**Answer:**
Pagination:

```sql
-- Get first 10
SELECT * FROM bookings LIMIT 10;

-- Get next 10 (skip first 10)
SELECT * FROM bookings LIMIT 10 OFFSET 10;

-- Common pagination
-- Page 1: LIMIT 10 OFFSET 0
-- Page 2: LIMIT 10 OFFSET 10
-- Page 3: LIMIT 10 OFFSET 20
```

Important for large datasets (your app doesn't implement pagination).

---

### Q78: Explain UPDATE statement
**Answer:**
Modify data:

```sql
-- Update single row
UPDATE bookings SET status = 'CANCELED' WHERE id = 'booking123';

-- Update multiple rows
UPDATE bookings SET status = 'PAST' WHERE start_time < NOW();

-- Update multiple columns
UPDATE bookings 
SET start_time = '2026-04-21 10:00', status = 'RESCHEDULED'
WHERE id = 'booking123';
```

**DANGER**: UPDATE without WHERE updates ALL rows!
```sql
-- ❌ DANGEROUS: Updates entire table!
UPDATE bookings SET status = 'CANCELED';

-- ✅ SAFE: Updates specific booking
UPDATE bookings SET status = 'CANCELED' WHERE id = ?;
```

---

### Q79: Explain DELETE statement
**Answer:**
Remove data:

```sql
-- Delete single row
DELETE FROM bookings WHERE id = 'booking123';

-- Delete multiple rows
DELETE FROM bookings WHERE status = 'CANCELED';

-- Delete all (DANGEROUS!)
DELETE FROM bookings; -- All bookings gone!
```

Your code uses DELETE safely:
```javascript
await db.query('DELETE FROM bookings WHERE id = ?', [id]);
```

---

### Q80: What are TRANSACTIONS? (covered in detail)
**Answer:**
Already covered in Q48.

---

### Q81: Explain the UNIQUE constraint
**Answer:**
Prevent duplicate values:

```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL, -- No duplicate emails
    name VARCHAR(255) NOT NULL
);

-- This succeeds:
INSERT INTO users VALUES ('1', 'john@example.com', 'John');

-- This fails (email already exists):
INSERT INTO users VALUES ('2', 'john@example.com', 'Jane');
-- Error: Duplicate entry 'john@example.com'
```

Your schema uses UNIQUE:
```sql
CREATE TABLE event_types (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    UNIQUE KEY unique_user_slug (user_id, slug)
);
-- Prevents duplicate slug per user
```

---

### Q82: What are Foreign Keys?
**Answer:**
Link tables, ensure referential integrity:

```sql
CREATE TABLE event_types (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- This succeeds (user exists):
INSERT INTO event_types VALUES ('type1', 'user123');

-- This fails (user doesn't exist):
INSERT INTO event_types VALUES ('type2', 'nonexistent_user');
-- Error: Foreign key constraint failed
```

**ON DELETE CASCADE**: Deletes child records when parent deleted
```sql
DELETE FROM users WHERE id = 'user123';
-- All event_types for that user also deleted
```

Your schema uses foreign keys properly.

---

### Q83: What are view vs actual queries?
**Answer:**
**Views**: Saved queries that act like tables:

```sql
CREATE VIEW upcoming_bookings AS
SELECT b.*, e.name as event_name
FROM bookings b
JOIN event_types e ON b.event_type_id = e.id
WHERE b.start_time > NOW();

-- Query view like normal table
SELECT * FROM upcoming_bookings WHERE status = 'SCHEDULED';
```

**Benefits**:
- Simplify complex queries
- Security (expose limited data)
- Reusability

Your app doesn't use views (could improve code).

---

### Q84: Explain database normalization
**Answer:**
Organize data to reduce redundancy:

```sql
-- ❌ Not normalized (data repeated)
bookings table:
id    | event_name  | event_duration | user_name | user_email
123   | "Call"      | 60             | "John"    | "john@..."
124   | "Call"      | 60             | "Jane"    | "jane@..."
{lots of duplication!}

-- ✅ Normalized
event_types table: id, name, duration
bookings table: id, event_type_id, user_id
users table: id, name, email
{no duplication!}
```

**Benefits**:
- Less storage
- Easy updates (change once, not 1000 times)
- Maintains data consistency

Your schema is well-normalized.

---

### Q85: Explain the booking flow with SQL
**Answer:**
Complete SQL flow for booking:

```sql
-- Step 1: Verify event exists
SELECT user_id, duration FROM event_types WHERE id = 'type123';

-- Step 2: Check availability
SELECT * FROM availabilities 
WHERE user_id = 'user123' AND day_of_week = 2; -- Monday

-- Step 3: Check for conflicts
SELECT * FROM bookings 
WHERE event_type_id = 'type123' AND start_time = '2026-04-20 14:00:00'
AND status = 'SCHEDULED' FOR UPDATE; -- Lock row

-- Step 4: If no conflict, insert booking
INSERT INTO bookings 
(id, event_type_id, user_id, booker_name, booker_email, start_time, end_time, status)
VALUES 
('booking123', 'type123', 'user123', 'Guest', 'guest@...', '2026-04-20 14:00:00', '2026-04-20 15:00:00', 'SCHEDULED');

-- Step 5: Commit transaction (or rollback if step 3 found conflict)
COMMIT;
```

---

## **SECTION 5: TESTING & DEBUGGING (Q86-95)**

### Q86: Why is testing important?
**Answer:**
**Benefits**:
- Catch bugs early
- Prevent regressions
- Document expected behavior
- Confidence in changes
- Easier refactoring

Your app has **0 tests** (production red flag).

**Types**:
- **Unit tests**: Test functions in isolation
- **Integration tests**: Test components together
- **E2E tests**: Test entire workflow

---

### Q87: How to write unit tests for your controller?
**Answer:**
```javascript
// bookingsController.test.js
const { createBooking } = require('./bookingsController');

describe('createBooking', () => {
    it('should create booking with valid data', async () => {
        const req = {
            body: {
                event_type_id: 'type123',
                booker_name: 'John',
                booker_email: 'john@...',
                start_time: '2026-04-20T14:00:00'
            }
        };
        
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        
        await createBooking(req, res);
        
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalled();
    });
    
    it('should reject invalid email', async () => {
        const req = {
            body: {
                booker_email: 'invalid-email'
            }
        };
        
        expect(() => createBooking(req, res)).toThrow();
    });
});
```

---

### Q88: How to write API tests?
**Answer:**
```javascript
const request = require('supertest');
const app = require('../app');

describe('POST /api/bookings', () => {
    it('should create booking', async () => {
        const res = await request(app)
            .post('/api/bookings')
            .send({
                event_type_id: 'type123',
                booker_name: 'John',
                booker_email: 'john@...',
                start_time: '2026-04-20T14:00:00'
            });
        
        expect(res.status).toBe(201);
        expect(res.body.id).toBeDefined();
    });
    
    it('should prevent double-booking', async () => {
        // Create first booking
        await request(app).post('/api/bookings').send(...);
        
        // Try same slot
        const res = await request(app).post('/api/bookings').send(...);
        
        expect(res.status).toBe(409); // Conflict
    });
});
```

---

### Q89: How to debug Node.js code?
**Answer:**
```javascript
// Method 1: Console logging
console.log('Booking:', booking);
console.error('Error:', error);

// Method 2: VS Code debugger
// .vscode/launch.json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "program": "${workspaceFolder}/server.js"
        }
    ]
}

// Run: F5, then use breakpoints

// Method 3: Node inspector
// node --inspect server.js
// Visit chrome://inspect in Chrome
```

---

### Q90: What is Postman? How to use it?
**Answer:**
**Postman**: Tool to test APIs manually.

```
1. Import/Create request
   - Method: POST
   - URL: http://localhost:5000/api/bookings
   - Headers: Content-Type: application/json
   - Body (JSON):
     {
         "event_type_id": "type123",
         "booker_name": "John",
         "booker_email": "john@example.com",
         "start_time": "2026-04-20T14:00:00"
     }

2. Send request

3. Check response
   - Status: 201
   - Body: { id: "...", status: "SCHEDULED" }
```

Great for manual testing before automation.

---

### Q91: What are common bugs in booking systems?
**Answer:**
1. **Double-booking**: Without transaction locking (RESOLVED in your code)
2. **Time zone issues**: Storing/converting timezones incorrectly
3. **Past bookings**: Allowing bookings in past
4. **Overlapping slots**: Not considering buffer time
5. **Race conditions**: Concurrent requests cause issues
6. **Memory leaks**: Not closing database connections
7. **N+1 queries**: Inefficient loading

Your code addresses #1 (double-booking). Others could improve.

---

### Q92: How to handle race conditions?
**Answer:**
Multiple requests at same time causing conflicts:

```javascript
// ❌ Without locking (race condition):
const booking = await db.query('SELECT * FROM bookings WHERE ...');
if (!booking) {
    // Two requests could both see no booking
    await db.query('INSERT INTO bookings ...');
    // Both insert! Double-booking!
}

// ✅ With pessimistic locking:
BEGIN TRANSACTION
  SELECT ... FOR UPDATE; // Lock row
  CHECK if exists
  IF not exists:
    INSERT
  ELSE:
    ROLLBACK
COMMIT
```

Your code uses pessimistic locking (correct approach).

---

### Q93: How to log errors?
**Answer:**
```javascript
// Development
console.error('Error:', error);

// Production
const logger = require('winston');

logger.error({
    message: error.message,
    stack: error.stack,
    timestamp: new Date(),
    userId: req.user?.id,
    endpoint: req.path
});

// Sends to external service (Sentry, DataDog, ELK)
```

Your code uses console.error (acceptable for dev).

---

### Q94: What is load testing?
**Answer:**
Test system with many concurrent requests:

```javascript
// Apache JMeter or Artillery
// Simulate 100 users making bookings simultaneously
// Check if system breaks or stays stable
```

**Results**:
- Response time
- Throughput
- Error rate
- CPU/Memory usage

Your app needs load testing for production.

---

### Q95: How to monitor application health?
**Answer:**
```javascript
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Monitoring dashboard
// Alerts if:
// - Response time > 1s
// - Error rate > 1%
// - CPU > 80%
// - Memory leak detected
```

Your code has basic health check, needs full monitoring for production.

---

## **SECTION 6: ARCHITECTURE CHOICES (Q96-100)**

### Q96: Why use Vite instead of Create React App?
**Answer:**
**Vite**:
- **Faster dev server** (ESM native)
- **Faster builds** (esbuild)
- **Faster HMR** (instant updates)
- **Modern**: Uses native ES modules
- **Lightweight**: Minimal config

**Create React App**:
- More batteries included
- Slower builds
- Complex webpack config

For new projects, Vite is better choice.

---

### Q97: Why separate frontend and backend?
**Answer:**
Already covered in Q5. Benefits:
- Independent scaling
- Different tech stacks possible
- Clear separation of concerns

Drawbacks:
- CORS complexity
- More deployment steps
- Network latency

Worth it for this project.

---

### Q98: What would you change for production?
**Answer:**
From code review:
1. **Add authentication** (JWT, OAuth)
2. **Add tests** (Jest, Supertest)
3. **Add logging** (Winston, Sentry)
4. **Add rate limiting** (express-rate-limit)
5. **Add HTTPS/SSL** (nginx, Let's Encrypt)
6. **Add monitoring** (DataDog, New Relic)
7. **Add caching** (Redis)
8. **Add CI/CD** (GitHub Actions, GitLab CI)
9. **Database backups** (automated)
10. **API documentation** (Swagger, OpenAPI)
11. **Email notifications**
12. **Error boundaries** (frontend)
13. **Security headers** (helmet)
14. **Input sanitization** (joi, yup)
15. **Pagination** (for large datasets)

---

### Q99: How would you scale this application?
**Answer:**
**Vertical scaling** (bigger machine):
- Increase RAM, CPU
- Easy but hits ceiling

**Horizontal scaling** (more machines):
1. **Load balancer** (nginx, HAProxy) distributes requests
2. **Multiple API servers** handle requests in parallel
3. **Database replica** for read-heavy operations
4. **Cache layer** (Redis) reduces database hits
5. **CDN** for static assets
6. **Message queue** (RabbitMQ) for async operations

Architecture:
```
Users
  ↓
Load Balancer
  ↓
API Server 1, 2, 3 (horizontal)
  ↓
Redis Cache
  ↓
Database + Replica
```

---

### Q100: If rebuilding this from scratch, what would you do differently?
**Answer:**
**Frontend**:
1. Add TypeScript (catch bugs early)
2. Add Zustand/Redux (state management for complex state)
3. Add testing library (React Testing Library)
4. Add Storybook (component library)
5. Add Vitest (unit tests)
6. Add Playwright (E2E tests)
7. Add error boundary
8. Add analytics

**Backend**:
1. Use TypeScript (type safety)
2. Use NestJS (more structure than Express)
3. Add authentication layer
4. Add validation with Joi
5. Add logging with Winston
6. Add tests with Jest
7. Use ORM (TypeORM, Prisma)
8. Add API documentation with Swagger
9. Add rate limiting
10. Use environment variables with Zod validation

**DevOps**:
1. Docker containers
2. Docker Compose for local dev
3. GitHub Actions CI/CD
4. Automated tests on PR
5. Staging environment
6. Production deployment

**Database**:
1. Database migration tools (Flyway, Knex)
2. Backup strategy
3. Query optimization
4. Monitoring (slow query logs)

**Summary**: Current app is solid MVP. For production, add type safety, testing, logging, and automation.

---

## **FINAL TIPS FOR INTERVIEW**

### How to Answer Interview Questions:
1. **Understand the code**: Every line should make sense to you
2. **Start simple**: Explain basic concept first
3. **Give examples**: Show code or real-world analogy
4. **Consider trade-offs**: What's good and bad about your choice?
5. **Think about edge cases**: What could go wrong?
6. **Ask clarifying questions**: "Do you want me to...?"
7. **Be honest**: "I don't know, but I would..." is better than guessing
8. **Show enthusiasm**: This project shows real skill

### What Interviewers Really Want to See:
1. **Deep understanding**: Not just copy-paste
2. **Problem-solving**: How you approach problems
3. **Communication**: Can you explain clearly?
4. **Ownership**: Pride in your work
5. **Humility**: Willing to learn and improve
6. **Practical knowledge**: Real-world thinking

### Common Follow-ups:
- "How would you optimize this?"
- "What if requirements changed?"
- "How would you test this?"
- "What's a potential security issue?"
- "How would you debug this in production?"

Be ready for any of these!

---

**Good luck with your interview! You've built a solid project. Understand it deeply, and you'll do great! 🚀**
