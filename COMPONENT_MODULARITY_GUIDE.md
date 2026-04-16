# Frontend Modularity & Component Reusability Guide

## 🎯 Overview
This guide shows how to refactor your frontend to improve modularity and code reusability by extracting common patterns into reusable components.

## 📦 New Reusable Components Created

### 1. **FormInput** (`FormInput.jsx`)
Reusable text input component with consistent styling and error handling.

**Usage:**
```jsx
<FormInput 
    label="Email"
    type="email"
    placeholder="you@example.com"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    error={errors.email}
/>
```

**Where to use:** CreateEvent, EditEvent, any form fields

---

### 2. **FormTextarea** (`FormTextarea.jsx`)
Reusable textarea component with consistent styling.

**Usage:**
```jsx
<FormTextarea 
    label="Description"
    placeholder="Enter description..."
    rows="4"
    value={description}
    onChange={(e) => setDescription(e.target.value)}
/>
```

**Where to use:** CreateEvent, EditEvent, event description fields

---

### 3. **DurationSelector** (`DurationSelector.jsx`)
Reusable duration button group for selecting meeting duration.

**Usage:**
```jsx
<DurationSelector 
    duration={formData.duration}
    onChange={(mins) => setFormData({...formData, duration: mins})}
/>
```

**Where to use:** CreateEvent, EditEvent

---

### 4. **BufferTimeInput** (`BufferTimeInput.jsx`)
Reusable component for buffer time configuration (before/after meeting).

**Usage:**
```jsx
<BufferTimeInput 
    bufferBefore={formData.buffer_before}
    bufferAfter={formData.buffer_after}
    onChange={({before, after}) => setFormData({...formData, buffer_before: before, buffer_after: after})}
/>
```

**Where to use:** CreateEvent, EditEvent

---

### 5. **EventForm** (`EventForm.jsx`) ⭐ MAIN COMPONENT
Combines FormInput, FormTextarea, DurationSelector, and BufferTimeInput. This is the main form for both creating and editing events.

**Usage:**
```jsx
import EventForm from '../components/EventForm';

export default function CreateEvent() {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const handleSubmit = async (formData) => {
        try {
            await api.post('/event-types', formData);
            showToast('Event created successfully', 'success');
            navigate('/');
        } catch (error) {
            showToast('Failed to create event', 'error');
        }
    };

    return (
        <div className="p-12 max-w-6xl w-full bg-background text-on-surface h-full overflow-y-auto">
            <PageHeader 
                backPath="/"
                title="New Event Type"
                description="Configure the details for your new scheduling link."
                actions={[
                    { label: 'Cancel', onClick: () => navigate('/'), variant: 'secondary' },
                    { label: 'Save Event Type', onClick: null, variant: 'primary' }
                ]}
            />
            <EventForm 
                onSubmit={handleSubmit}
                submitButtonText="Save Event Type"
                title="New Event Type"
            />
        </div>
    );
}
```

**Where to use:** Replace CreateEvent.jsx and EditEvent.jsx form sections

---

### 6. **ConfirmDialog** (`ConfirmDialog.jsx`)
Reusable modal component for confirmations (delete, cancel, etc.).

**Usage:**
```jsx
<ConfirmDialog 
    isOpen={isOpen}
    title="Delete Event?"
    message="This action cannot be undone."
    confirmText="Delete"
    cancelText="Cancel"
    isDangerous={true}
    onConfirm={handleDelete}
    onCancel={() => setIsOpen(false)}
/>
```

**Where to use:** Dashboard (delete event), Meetings (cancel meeting)

---

### 7. **EventCard** (`EventCard.jsx`)
Reusable card component for displaying events in a list.

**Usage:**
```jsx
<EventCard 
    event={event}
    onCopy={(slug) => copyToClipboard(slug)}
    onDelete={(event) => setEventToDelete(event)}
/>
```

**Where to use:** Dashboard event list

---

### 8. **PageHeader** (`PageHeader.jsx`)
Reusable header with back button, title, description, and action buttons.

**Usage:**
```jsx
<PageHeader 
    backPath="/"
    title="New Event Type"
    description="Configure details for your new scheduling link."
    actions={[
        { label: 'Cancel', onClick: () => navigate('/') },
        { label: 'Save', onClick: handleSave, variant: 'primary' }
    ]}
/>
```

**Where to use:** CreateEvent, EditEvent, and other pages with headers

---

### 9. **SearchInput** (`SearchInput.jsx`)
Reusable search input with icon and styling.

**Usage:**
```jsx
<SearchInput 
    placeholder="Search event types"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
/>
```

**Where to use:** Dashboard search, any search functionality

---

### 10. **Tabs** (`Tabs.jsx`)
Reusable tab component for switching between sections.

**Usage:**
```jsx
<Tabs 
    tabs={[
        { id: 'events', label: 'Event Types' },
        { id: 'integrations', label: 'Integrations' }
    ]}
    activeTab={activeTab}
    onTabChange={(tab) => setActiveTab(tab)}
/>
```

**Where to use:** Dashboard (Events/Integrations tabs)

---

## 🔄 Refactoring Guide by Page

### **CreateEvent.jsx** (Before: 150 lines → After: ~40 lines)
```jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useToast } from '../components/Toast';
import EventForm from '../components/EventForm';
import PageHeader from '../components/PageHeader';

export default function CreateEvent() {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const handleSubmit = async (formData) => {
        try {
            if (!formData.name.trim() || !formData.slug.trim()) {
                showToast('Event name and slug are required', 'error');
                return;
            }
            await api.post('/event-types', formData);
            showToast('Event created successfully', 'success');
            navigate('/');
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to create event', 'error');
        }
    };

    return (
        <div className="p-12 max-w-6xl w-full bg-background text-on-surface h-full overflow-y-auto">
            <PageHeader 
                backPath="/"
                title="New Event Type"
                description="Configure the details for your new scheduling link. This information will be visible to your invitees."
                actions={[
                    { label: 'Cancel', onClick: () => navigate('/') },
                    { label: 'Save Event Type', onClick: null, variant: 'primary' }
                ]}
            />
            <EventForm 
                onSubmit={handleSubmit}
                submitButtonText="Save Event Type"
            />
        </div>
    );
}
```

---

### **EditEvent.jsx** (Before: 250 lines → After: ~60 lines)
```jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../components/Toast';
import api, { MOCK_USER_ID } from '../api';
import EventForm from '../components/EventForm';
import PageHeader from '../components/PageHeader';

export default function EditEvent() {
    const navigate = useNavigate();
    const { slug } = useParams();
    const { showToast } = useToast();
    const [eventId, setEventId] = useState(null);
    const [initialData, setInitialData] = useState(null);

    useEffect(() => {
        if (slug) {
            api.get(`/event-types/${slug}`)
                .then(res => {
                    setEventId(res.data.id);
                    setInitialData({
                        name: res.data.name,
                        description: res.data.description || '',
                        duration: res.data.duration,
                        slug: res.data.slug,
                        buffer_before: res.data.buffer_before,
                        buffer_after: res.data.buffer_after
                    });
                })
                .catch(err => {
                    showToast('Event not found or failed to load', 'error');
                    navigate('/');
                });
        }
    }, [slug]);

    const handleSubmit = async (formData) => {
        try {
            if (eventId) {
                await api.put(`/event-types/${eventId}`, formData);
                showToast('Event updated successfully', 'success');
                navigate('/');
            }
        } catch (error) {
            showToast('Failed to update event type', 'error');
        }
    };

    if (!initialData) return <div>Loading...</div>;

    return (
        <div className="p-12 max-w-6xl w-full bg-background text-on-surface h-full overflow-y-auto">
            <PageHeader 
                backPath="/"
                title="Edit Event Type"
                description="Update the details for your scheduling link."
                actions={[
                    { label: 'Cancel', onClick: () => navigate('/') },
                    { label: 'Update Event Type', onClick: null, variant: 'primary' }
                ]}
            />
            <EventForm 
                initialData={initialData}
                onSubmit={handleSubmit}
                submitButtonText="Update Event Type"
            />
        </div>
    );
}
```

---

### **Dashboard.jsx** (Refactored sections)
```jsx
import EventCard from '../components/EventCard';
import ConfirmDialog from '../components/ConfirmDialog';
import SearchInput from '../components/SearchInput';
import Tabs from '../components/Tabs';

export default function Dashboard() {
    // ... existing code ...

    return (
        <div className="px-8 pb-20 pt-8 flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">Scheduling</h1>
                <Link to="/create-event" className="bg-primary hover:bg-blue-600 px-4 py-2 rounded-full flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">add</span>Create
                </Link>
            </div>

            {/* Tabs - REUSABLE */}
            <Tabs 
                tabs={[
                    { id: 'events', label: 'Event types' },
                    { id: 'integrations', label: 'Integrations' }
                ]}
                activeTab={activeTab}
                onTabChange={(tab) => setActiveTab(tab)}
            />

            {activeTab === 'events' && (
                <>
                    {/* Search - REUSABLE */}
                    <SearchInput 
                        placeholder="Search event types"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-sm mb-10"
                    />

                    {/* Event List */}
                    <div className="space-y-6">
                        {filteredEventTypes.map(event => (
                            <EventCard 
                                key={event.id}
                                event={event}
                                onCopy={handleCopy}
                                onDelete={(evt) => setEventToConfirmDelete(evt)}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Confirm Dialog - REUSABLE */}
            <ConfirmDialog 
                isOpen={!!eventToConfirmDelete}
                title="Delete Event?"
                message={`Are you sure you want to delete "${eventToConfirmDelete?.name}"? This cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                isDangerous={true}
                onConfirm={() => handleDelete(eventToConfirmDelete.id)}
                onCancel={() => setEventToConfirmDelete(null)}
            />
        </div>
    );
}
```

---

## 📊 Benefits of Modularity

| Aspect | Before | After |
|--------|--------|-------|
| **Code Duplication** | CreateEvent & EditEvent have 80% identical code | Single EventForm component, 0% duplication |
| **Maintenance** | Update form in 2 places | Update once in EventForm.jsx |
| **Testing** | Test each page separately | Test reusable components once |
| **Consistency** | Manual style consistency | Built-in consistency across all pages |
| **New Features** | Add to 2+ places | Add once to shared component |
| **Lines of Code** | CreateEvent: 150, EditEvent: 250 | CreateEvent: 40, EditEvent: 60 |

---

## 🛠️ Next Steps to Implement

1. ✅ **Reusable components already created** in `/components/`
2. ⏳ **Refactor CreateEvent.jsx** to use EventForm + PageHeader
3. ⏳ **Refactor EditEvent.jsx** to use EventForm + PageHeader
4. ⏳ **Refactor Dashboard.jsx** to use EventCard, SearchInput, Tabs, ConfirmDialog
5. ⏳ **Refactor Meetings.jsx** to use ConfirmDialog for deletions
6. ⏳ **Create additional components** as needed (Modal, Button, etc.)

---

## 📁 Component Organization

```
frontend/src/
├── components/
│   ├── FormInput.jsx              ← New
│   ├── FormTextarea.jsx           ← New
│   ├── DurationSelector.jsx       ← New
│   ├── BufferTimeInput.jsx        ← New
│   ├── EventForm.jsx              ← New (Main)
│   ├── ConfirmDialog.jsx          ← New
│   ├── EventCard.jsx              ← New
│   ├── PageHeader.jsx             ← New
│   ├── SearchInput.jsx            ← New
│   ├── Tabs.jsx                   ← New
│   ├── Layout.jsx                 ← Existing
│   └── Toast.jsx                  ← Existing
├── pages/
│   ├── CreateEvent.jsx            ← Refactor
│   ├── EditEvent.jsx              ← Refactor
│   ├── Dashboard.jsx              ← Refactor
│   ├── Availability.jsx
│   ├── BookingFlow.jsx
│   ├── BookingConfirmation.jsx
│   ├── Meetings.jsx               ← Refactor
│   └── ...
└── ...
```

---

## 💡 Best Practices for Modularity

1. **Single Responsibility** - Each component does ONE thing well
2. **Props Not State** - Pass data via props, not global state
3. **Composition** - Build complex components from simple ones (EventForm uses FormInput, DurationSelector, etc.)
4. **Consistent Props** - Similar components use similar prop names
5. **Documentation** - JSDoc comments explaining prop interfaces
6. **Naming** - Clear, descriptive names (FormInput not Input, DurationSelector not Duration)

---

## 🎓 Example: Component Composition Pattern

```jsx
// EventForm is built by COMPOSING smaller components
<EventForm>
  └─ FormInput (Event Name)
  └─ FormTextarea (Description)
  └─ DurationSelector
  └─ BufferTimeInput
```

This makes it easy to:
- Update styling in one place (FormInput)
- Reuse components elsewhere (SearchInput in Dashboard)
- Test components independently
- Add new features (custom validation in FormInput)

