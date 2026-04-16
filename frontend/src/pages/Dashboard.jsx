import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import api from '../api';

export default function Dashboard() {
    const [eventTypes, setEventTypes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('events'); // 'events' or 'integrations'
    const [eventToConfirmDelete, setEventToConfirmDelete] = useState(null);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const fetchEventTypes = () => {
        api.get('/event-types').then(res => setEventTypes(res.data)).catch(console.error);
    };

    useEffect(() => {
        fetchEventTypes();
    }, []);

    const filteredEventTypes = eventTypes.filter(event => 
        event.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCopy = (slug) => {
        const link = `${window.location.origin}/book/${slug}`;
        navigator.clipboard.writeText(link);
        showToast('Link copied to clipboard!', 'success');
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/event-types/${id}`);
            fetchEventTypes();
            setEventToConfirmDelete(null);
            showToast('Event type deleted successfully', 'success');
        } catch (error) {
            console.error('Failed to delete event type', error);
            showToast('Failed to delete event type', 'error');
        }
    };

    return (
        <div className="px-8 pb-20 pt-8 flex-1">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">Scheduling</h1>
                </div>
                <Link to="/create-event" className="bg-primary hover:bg-blue-600 px-4 py-2 rounded-full flex items-center gap-2 font-semibold text-sm transition-colors">
                    <span className="material-symbols-outlined text-sm">add</span>
                    Create
                    <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
                </Link>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-border-color mb-6">
                <button 
                    onClick={() => setActiveTab('events')}
                    className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                        activeTab === 'events' 
                            ? 'border-primary text-white' 
                            : 'border-transparent text-text-muted hover:text-white'
                    }`}
                >
                    Event types
                </button>
                <button 
                    onClick={() => setActiveTab('integrations')}
                    className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                        activeTab === 'integrations' 
                            ? 'border-primary text-white' 
                            : 'border-transparent text-text-muted hover:text-white'
                    }`}
                >
                    Integrations
                </button>
            </div>
            
            {activeTab === 'events' && (
                <>
                    {/* Search */}
                    <div className="relative max-w-sm mb-10">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">search</span>
                        <input 
                            className="w-full bg-transparent border border-border-color rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary transition-colors" 
                            placeholder="Search event types" 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Event List */}
                    <div className="space-y-6">
                        {filteredEventTypes.map(event => (
                            <div key={event.id} className="bg-card-bg border border-border-color rounded-xl p-6 relative group overflow-hidden border-l-[3px] border-l-[#7c3aed]">
                                <div className="flex items-start gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold mb-1">{event.name}</h3>
                                        <div className="flex items-center gap-2 text-text-muted text-xs mb-1">
                                            <span>•</span>
                                            <span>{event.duration} min</span>
                                        </div>

                                    </div>
                                    <div className="flex items-center gap-4 text-text-muted">
                                        <button onClick={() => navigate(`/edit-event/${event.slug}`)} className="flex items-center gap-1 text-sm font-semibold hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined text-base">edit</span>
                                            Edit
                                        </button>
                                        <button onClick={() => setEventToConfirmDelete(event)} className="flex items-center gap-1 text-sm font-semibold text-red-500 hover:text-red-400 transition-colors">
                                            <span className="material-symbols-outlined text-base">delete</span>
                                            Delete
                                        </button>
                                        <button onClick={() => handleCopy(event.slug)} className="flex items-center gap-1 text-sm font-semibold text-white hover:text-primary transition-colors ml-2">
                                            <span className="material-symbols-outlined text-base">link</span>
                                            Copy link
                                        </button>
                                        <Link to={`/book/${event.slug}`} target="_blank" className="hover:text-primary group"><span className="material-symbols-outlined group-hover:scale-110 transition-transform flex items-center">open_in_new</span></Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {eventTypes.length === 0 && <p className="text-text-muted">No event types created yet.</p>}
                    {eventTypes.length > 0 && filteredEventTypes.length === 0 && (
                        <p className="text-text-muted">No event types matched "{searchQuery}".</p>
                    )}
                </>
            )}

            {activeTab === 'integrations' && (
                <div className="space-y-6">
                    {/* Google Calendar Integration Card */}
                    <div className="bg-card-bg border border-border-color rounded-xl p-6 overflow-hidden">
                        <div className="flex items-start gap-6">
                            {/* Google Calendar Icon */}
                            <div className="flex-shrink-0">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white" style={{ fontSize: 28 }}>calendar_month</span>
                                </div>
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1">
                                <h3 className="text-lg font-bold mb-2">Google Calendar (For You - Host)</h3>
                                <p className="text-text-muted text-sm mb-4">
                                    Add your confirmed bookings directly to your Google Calendar. When you open a meeting in "Meetings", you have an "Add to Calendar" button.
                                </p>
                                <div className="flex items-center gap-2 text-xs text-text-muted mb-3">
                                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check_circle</span>
                                    <span>✓ Active for all your bookings</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 px-3 py-2 rounded-lg w-fit">
                                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>person</span>
                                    <span>Host-only feature (guests cannot access)</span>
                                </div>
                            </div>
                            
                            {/* CTA Button */}
                            <div className="flex-shrink-0">
                                <button 
                                    onClick={() => showToast('Go to Meetings tab and click Details to find the Add to Calendar button', 'info', 5000)}
                                    className="bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap"
                                >
                                    How to Use
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-20 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-blue-400 flex-shrink-0">info</span>
                            <div>
                                <p className="text-sm font-semibold text-white mb-1">HOST Calendar Integration</p>
                                <p className="text-xs text-text-muted">Google Calendar integration is exclusively for HOST accounts (your account). When you view a meeting in the "Meetings" tab and click "Details", you'll see an "Add to Calendar" button to add it to YOUR Google Calendar. Guests only receive the booking confirmation.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {eventToConfirmDelete && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm px-4">
                    <div className="bg-card-bg border border-border-color rounded-xl p-8 w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-2">Delete Event Type?</h2>
                        <p className="text-text-muted text-sm mb-6">Are you sure you want to delete <strong className="text-white">"{eventToConfirmDelete.name}"</strong>? This action cannot be undone, and all associated bookings will be affected.</p>
                        
                        <div className="bg-surface-container rounded-lg p-4 mb-6">
                            <p className="text-xs text-text-muted uppercase tracking-wider font-bold mb-2">Event Details</p>
                            <p className="text-white font-semibold">{eventToConfirmDelete.name}</p>
                            <p className="text-text-muted text-sm mt-1">{eventToConfirmDelete.duration} minute meeting</p>
                        </div>
                        
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setEventToConfirmDelete(null)} className="px-6 py-2.5 rounded-full text-text-muted font-semibold hover:bg-surface-container transition-colors">Keep Event</button>
                            <button onClick={() => handleDelete(eventToConfirmDelete.id)} className="px-6 py-2.5 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors">Confirm Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
