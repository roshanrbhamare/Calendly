import React, { useState, useEffect } from 'react';
import { format, parseISO, addDays } from 'date-fns';
import { useToast } from '../components/Toast';
import api from '../api';

export default function Meetings() {
    const [meetings, setMeetings] = useState([]);
    const [filter, setFilter] = useState('upcoming'); // 'upcoming' | 'past'
    const [eventTypes, setEventTypes] = useState([]);
    const [selectedEventTypeId, setSelectedEventTypeId] = useState('');
    const [selectedDuration, setSelectedDuration] = useState('');
    const { showToast } = useToast();
    const [showFilter, setShowFilter] = useState(false);

    useEffect(() => {
        api.get('/event-types')
            .then(res => setEventTypes(res.data))
            .catch(console.error);
    }, []);

    useEffect(() => {
        const typeQuery = selectedEventTypeId ? `&event_type_id=${selectedEventTypeId}` : '';
        const durQuery = selectedDuration ? `&duration=${selectedDuration}` : '';
        api.get(`/bookings?type=${filter}${typeQuery}${durQuery}`)
            .then(res => setMeetings(res.data))
            .catch(console.error);
    }, [filter, selectedEventTypeId, selectedDuration]);

    // Group meetings by date
    const groupedMeetings = meetings.reduce((acc, meeting) => {
        const dateKey = format(parseISO(meeting.start_time), 'yyyy-MM-dd');
        acc[dateKey] = acc[dateKey] || [];
        acc[dateKey].push(meeting);
        return acc;
    }, {});

    // Reschedule & Detail State
    const MOCK_USER_ID = 'demo-user-1';
    const [rescheduleMeeting, setRescheduleMeeting] = useState(null);
    const [detailsMeeting, setDetailsMeeting] = useState(null);
    const [meetingToConfirmCancel, setMeetingToConfirmCancel] = useState(null);
    const [rescheduleDate, setRescheduleDate] = useState(new Date());
    const [rescheduleSlots, setRescheduleSlots] = useState([]);
    const [selectedRescheduleSlot, setSelectedRescheduleSlot] = useState(null);
    const [rescheduling, setRescheduling] = useState(false);
    
    // Generate dates for the modal
    const dates = Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i));

    useEffect(() => {
        if (!rescheduleMeeting || !rescheduleDate) return;
        const dateStr = format(rescheduleDate, 'yyyy-MM-dd');
        setRescheduling(true);
        setRescheduleSlots([]);
        api.get(`/slots?slug=${rescheduleMeeting.event_slug}&date=${dateStr}&userId=${MOCK_USER_ID}`)
            .then(res => setRescheduleSlots(res.data.slots))
            .catch(console.error)
            .finally(() => setRescheduling(false));
    }, [rescheduleMeeting, rescheduleDate]);

    const handleRescheduleSubmit = async () => {
        if (!selectedRescheduleSlot) return;
        try {
            await api.put(`/bookings/${rescheduleMeeting.id}/reschedule`, {
                start_time: selectedRescheduleSlot.start_time
            });
            setRescheduleMeeting(null);
            setSelectedRescheduleSlot(null);
            // Refresh
            const typeQuery = selectedEventTypeId ? `&event_type_id=${selectedEventTypeId}` : '';
            const durQuery = selectedDuration ? `&duration=${selectedDuration}` : '';
            const res = await api.get(`/bookings?type=${filter}${typeQuery}${durQuery}`);
            setMeetings(res.data);
        } catch (err) {
            showToast('Failed to reschedule: ' + (err.response?.data?.message || err.message), 'error');
        }
    };

    const handleCancelMeeting = async () => {
        try {
            await api.delete(`/bookings/${meetingToConfirmCancel.id}`, { headers: {'x-user-id': MOCK_USER_ID} });
            setMeetingToConfirmCancel(null);
            setDetailsMeeting(null);
            showToast('Meeting canceled successfully', 'success');
            // Refresh
            const typeQuery = selectedEventTypeId ? `&event_type_id=${selectedEventTypeId}` : '';
            const durQuery = selectedDuration ? `&duration=${selectedDuration}` : '';
            const res = await api.get(`/bookings?type=${filter}${typeQuery}${durQuery}`);
            setMeetings(res.data);
        } catch (err) {
            showToast('Failed to cancel: ' + (err.response?.data?.message || err.message), 'error');
        }
    };

    // Generate Google Calendar link for HOST
    const generateGoogleCalendarLink = (meeting) => {
        const startDate = parseISO(meeting.start_time);
        const endDate = parseISO(meeting.end_time);
        const startTime = startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const endTime = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const title = encodeURIComponent(meeting.event_name);
        const description = encodeURIComponent(`Meeting with ${meeting.booker_name}\n\nEmail: ${meeting.booker_email}`);
        
        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${description}`;
    };

    return (
        <div className="flex-1 min-w-0 bg-[#0d1117] text-[#f1f1f1] h-full overflow-y-auto w-full">
            <header className="px-10 py-8">
                <div className="flex items-center gap-3 mb-8">
                    <h2 className="text-3xl font-bold text-white tracking-tight">Meetings</h2>
                    <button className="w-6 h-6 flex items-center justify-center rounded-full bg-surface-container text-outline hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-[18px]">help</span>
                    </button>
                </div>
                
                {/* Global Tabs & Filters */}
                <div className="flex flex-col space-y-6">
                    <div className="flex items-center justify-between border-b border-outline-variant/30">
                        <div className="flex gap-8">
                            <button 
                                onClick={() => setFilter('upcoming')}
                                className={`pb-4 text-sm font-semibold transition-colors ${filter === 'upcoming' ? 'text-primary border-b-2 border-primary' : 'text-outline hover:text-white'}`}
                            >
                                Upcoming
                            </button>
                            <button 
                                onClick={() => setFilter('past')}
                                className={`pb-4 text-sm font-semibold transition-colors ${filter === 'past' ? 'text-primary border-b-2 border-primary' : 'text-outline hover:text-white'}`}
                            >
                                Past
                            </button>
                            <div className="relative">
                                <button onClick={() => setShowFilter(!showFilter)} className={`flex items-center gap-2 text-sm font-medium transition-colors ${selectedEventTypeId || selectedDuration || showFilter ? 'text-primary' : 'text-on-surface hover:text-primary'}`}>
                                    <span className="material-symbols-outlined text-[20px]">filter_list</span>
                                    Filter {(selectedEventTypeId || selectedDuration) && <span className="w-2 h-2 rounded-full bg-primary ml-1"></span>}
                                </button>
                                
                                {showFilter && (
                                    <div className="absolute right-0 mt-3 w-64 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-2xl p-4 z-10 flex flex-col gap-6">
                                        
                                        {/* Event Type Filter */}
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Event Types</h4>
                                            </div>
                                            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                                <button 
                                                    onClick={() => setSelectedEventTypeId('')} 
                                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!selectedEventTypeId ? 'bg-primary/10 text-primary font-bold' : 'text-outline hover:bg-surface-container hover:text-white'}`}
                                                >
                                                    All Event Types
                                                </button>
                                                {eventTypes.map(et => (
                                                    <button 
                                                        key={et.id}
                                                        onClick={() => setSelectedEventTypeId(et.id)}
                                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedEventTypeId === et.id ? 'bg-primary/10 text-primary font-bold' : 'text-outline hover:bg-surface-container hover:text-white'}`}
                                                    >
                                                        {et.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Duration Filter */}
                                        <div>
                                            <div className="flex items-center justify-between mb-3 border-t border-outline-variant/30 pt-4">
                                                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Duration</h4>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <button 
                                                    onClick={() => setSelectedDuration('')} 
                                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${!selectedDuration ? 'bg-primary text-white border border-primary' : 'bg-transparent text-outline border border-outline-variant/30 hover:text-white hover:border-outline'}`}
                                                >
                                                    Any
                                                </button>
                                                {[...new Set(eventTypes.map(e => e.duration))].sort((a,b)=>a-b).map(duration => (
                                                    <button 
                                                        key={duration}
                                                        onClick={() => setSelectedDuration(duration)}
                                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${selectedDuration === duration ? 'bg-primary text-white border border-primary' : 'bg-transparent text-outline border border-outline-variant/30 hover:text-white hover:border-outline'}`}
                                                    >
                                                        {duration} min
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {(selectedEventTypeId || selectedDuration) && (
                                            <button onClick={() => { setSelectedEventTypeId(''); setSelectedDuration(''); }} className="mt-2 w-full py-2 bg-surface-container hover:bg-surface-container-high text-on-surface text-sm font-bold rounded-lg transition-colors">Clear All Filters</button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="px-10 pb-20">
                {Object.keys(groupedMeetings).sort().map(dateKey => (
                    <div key={dateKey} className="mb-8">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-outline mb-4">
                            {format(parseISO(dateKey), 'EEEE, d MMMM yyyy')}
                        </h3>
                        <div className="space-y-0 border-b border-outline-variant/30 pb-4">
                            {groupedMeetings[dateKey].map(meeting => {
                                const isCanceled = meeting.status === 'CANCELED';
                                return (
                                    <div key={meeting.id} className="group flex items-center justify-between py-4 border-t border-outline-variant/10 hover:bg-surface-container-lowest/50 transition-colors">
                                        <div className="flex items-center gap-8 flex-1">
                                            {/* Colored Circle indicator & Time */}
                                            <div className="flex items-center min-w-[200px] gap-6">
                                                <div className="w-5 h-5 rounded-full bg-purple-700 shrink-0"></div>
                                                <span className={`text-sm ${isCanceled ? 'line-through text-outline' : 'text-outline'}`}>
                                                    {format(parseISO(meeting.start_time), 'h:mm a').toLowerCase()} – {format(parseISO(meeting.end_time), 'h:mm a').toLowerCase()}
                                                </span>
                                            </div>

                                            {/* Meeting Info */}
                                            <div className="flex-1">
                                                <h4 className={`text-sm font-bold text-white mb-0.5 ${isCanceled ? 'line-through opacity-70' : ''}`}>{meeting.booker_name || 'Anonymous'}</h4>
                                                <p className={`text-sm text-outline ${isCanceled ? 'line-through opacity-70' : ''}`}>Event type <span className="font-bold text-white">{meeting.event_name}</span></p>
                                                {isCanceled && (
                                                    <p className="text-red-500 text-[11px] mt-1.5 font-medium">Canceled by {meeting.booker_name}: No reason provided.</p>
                                                )}
                                            </div>

                                            {/* Extra details right */}
                                            <div className="text-[13px] text-outline mr-24 min-w-[120px]">
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 pr-4">
                                            {!isCanceled && (
                                                <button onClick={() => {setRescheduleMeeting(meeting); setRescheduleDate(new Date()); setSelectedRescheduleSlot(null);}} className="opacity-0 group-hover:opacity-100 px-4 py-1.5 bg-surface-container text-white text-xs font-semibold rounded-lg hover:bg-surface-container-high transition-all">Reschedule</button>
                                            )}
                                            <button onClick={() => setDetailsMeeting(meeting)} className="flex items-center text-[13px] font-semibold text-outline hover:text-white transition-colors">
                                                <span className="material-symbols-outlined text-[15px] mr-1">play_arrow</span>
                                                Details
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {meetings.length === 0 && (
                     <div className="mt-20 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-surface-container-low rounded-full flex items-center justify-center mb-4 text-outline/40">
                             <span className="material-symbols-outlined text-[24px]">event_busy</span>
                        </div>
                        <p className="text-outline text-sm font-medium">No {filter} meetings found</p>
                    </div>
                )}

                {meetings.length > 0 && (
                    <div className="mt-20 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-surface-container-low rounded-full flex items-center justify-center mb-4 text-outline/40">
                             <span className="material-symbols-outlined text-[24px]">check_circle</span>
                        </div>
                        <p className="text-outline text-sm font-medium">You've reached the end of the list</p>
                    </div>
                )}
            </div>

            {/* Reschedule Modal */}
            {rescheduleMeeting && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm px-4">
                    <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl p-8 border border-outline-variant/30 text-white shadow-2xl">
                        <h2 className="text-2xl font-bold mb-2">Reschedule Meeting</h2>
                        <p className="text-outline text-sm mb-6">Pick a new time for <strong className="text-on-surface">{rescheduleMeeting.event_name}</strong> with <span className="text-on-surface">{rescheduleMeeting.booker_name}</span>.</p>
                        
                        <div className="flex gap-3 overflow-x-auto pb-4 mb-4 scrollbar-hide">
                            {dates.map((d, i) => {
                                const isSelected = format(d, 'yyyy-MM-dd') === format(rescheduleDate, 'yyyy-MM-dd');
                                return (
                                    <button key={i} onClick={() => {setRescheduleDate(d); setSelectedRescheduleSlot(null);}} className={`shrink-0 w-[72px] py-3 flex flex-col items-center rounded-[14px] transition-colors ${isSelected ? 'border-2 border-primary bg-primary/10' : 'border-2 border-transparent bg-surface-container hover:bg-surface-container-high'}`}>
                                        <span className="text-xs text-outline">{format(d, 'EEE')}</span>
                                        <span className="text-xl font-bold mt-1 text-on-surface">{format(d, 'd')}</span>
                                    </button>
                                );
                            })}
                        </div>
                        
                        <div className="h-[220px] overflow-y-auto pr-2 grid grid-cols-2 gap-3 mb-2 rounded-lg">
                            {rescheduling ? (
                                <div className="col-span-2 flex items-center justify-center"><p className="text-outline">Loading slots...</p></div>
                            ) : rescheduleSlots.length === 0 ? (
                                <div className="col-span-2 flex items-center justify-center"><p className="text-outline">No slots available for this date.</p></div>
                            ) : rescheduleSlots.map((slot, i) => {
                                const isSelected = selectedRescheduleSlot === slot;
                                return (
                                    <button key={i} onClick={() => setSelectedRescheduleSlot(isSelected ? null : slot)} className={`py-4 px-4 rounded-[12px] font-bold text-sm transition-all border-2 ${isSelected ? 'border-primary text-primary shadow-sm bg-primary/5' : 'border-transparent bg-surface-container text-on-surface hover:bg-surface-container-high'}`}>
                                        {format(parseISO(slot.start_time), 'hh:mm a')}
                                    </button>
                                )
                            })}
                        </div>
            
                        <div className="flex justify-end gap-3 mt-8">
                            <button onClick={() => setRescheduleMeeting(null)} className="px-6 py-2.5 rounded-full text-on-surface font-semibold hover:bg-surface-container transition-colors">Cancel</button>
                            <button onClick={handleRescheduleSubmit} disabled={!selectedRescheduleSlot} className="px-6 py-2.5 rounded-full bg-primary text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-container transition-colors">Confirm Reschedule</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Details Modal */}
            {detailsMeeting && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm px-4">
                    <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl p-8 border border-outline-variant/30 text-white shadow-2xl">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold mb-1">Meeting Details</h2>
                                <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-md ${detailsMeeting.status === 'SCHEDULED' ? 'bg-primary/20 text-primary' : 'bg-red-500/20 text-red-400'}`}>
                                    {detailsMeeting.status}
                                </span>
                            </div>
                            <button onClick={() => setDetailsMeeting(null)} className="text-outline hover:text-white transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        <div className="space-y-4 mb-8">
                            <div className="bg-surface-container rounded-xl p-4">
                                <p className="text-xs text-outline uppercase tracking-wider font-bold mb-1">Event Type</p>
                                <p className="text-on-surface font-semibold">{detailsMeeting.event_name}</p>
                            </div>
                            <div className="bg-surface-container rounded-xl p-4">
                                <p className="text-xs text-outline uppercase tracking-wider font-bold mb-1">When</p>
                                <p className="text-on-surface font-semibold">{format(parseISO(detailsMeeting.start_time), 'EEEE, MMMM d, yyyy')}</p>
                                <p className="text-outline text-sm mt-1">{format(parseISO(detailsMeeting.start_time), 'h:mm a')} - {format(parseISO(detailsMeeting.end_time), 'h:mm a')}</p>
                            </div>
                            <div className="bg-surface-container rounded-xl p-4">
                                <p className="text-xs text-outline uppercase tracking-wider font-bold mb-1">Booker</p>
                                <p className="text-on-surface font-semibold">{detailsMeeting.booker_name}</p>
                                <p className="text-outline text-sm mt-1">{detailsMeeting.booker_email}</p>
                            </div>
                            {detailsMeeting.description && (
                                <div className="bg-surface-container rounded-xl p-4">
                                    <p className="text-xs text-outline uppercase tracking-wider font-bold mb-1">Meeting Details</p>
                                    <p className="text-on-surface text-sm break-words whitespace-pre-wrap">{detailsMeeting.description}</p>
                                </div>
                            )}
                            {detailsMeeting.notes && (
                                <div className="bg-surface-container rounded-xl p-4">
                                    <p className="text-xs text-outline uppercase tracking-wider font-bold mb-1">Notes</p>
                                    <p className="text-on-surface text-sm break-words whitespace-pre-wrap">{detailsMeeting.notes}</p>
                                </div>
                            )}
                        </div>
            
                        <div className="flex justify-between items-center mt-2">
                            <div className="flex gap-2 items-center">
                                {detailsMeeting.status === 'SCHEDULED' && (
                                    <button 
                                        onClick={() => window.open(generateGoogleCalendarLink(detailsMeeting), '_blank')}
                                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-semibold text-sm transition-colors"
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>event</span>
                                        Add to Calendar
                                    </button>
                                )}
                                {detailsMeeting.status === 'SCHEDULED' ? (
                                    <button onClick={() => setMeetingToConfirmCancel(detailsMeeting)} className="text-red-400 hover:text-red-300 font-semibold text-sm transition-colors px-3 py-2">Cancel</button>
                                ) : (
                                    <div></div>
                                )}
                            </div>
                            <button onClick={() => setDetailsMeeting(null)} className="px-6 py-2.5 rounded-full bg-primary text-white font-semibold hover:bg-primary-container transition-colors">Close</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Cancel Confirmation Modal */}
            {meetingToConfirmCancel && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm px-4">
                    <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl p-8 border border-outline-variant/30 text-white shadow-2xl">
                        <h2 className="text-2xl font-bold mb-2">Cancel Meeting?</h2>
                        <p className="text-outline text-sm mb-6">Are you certain you wish to cancel this meeting with <strong className="text-on-surface">{meetingToConfirmCancel.booker_name}</strong>? A cancellation notification will be sent to them.</p>
                        
                        <div className="bg-surface-container rounded-xl p-4 mb-6">
                            <p className="text-xs text-outline uppercase tracking-wider font-bold mb-2">Meeting</p>
                            <p className="text-on-surface font-semibold mb-1">{meetingToConfirmCancel.event_name}</p>
                            <p className="text-outline text-sm">{format(parseISO(meetingToConfirmCancel.start_time), 'EEEE, MMMM d, yyyy')} at {format(parseISO(meetingToConfirmCancel.start_time), 'h:mm a')}</p>
                        </div>
                        
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setMeetingToConfirmCancel(null)} className="px-6 py-2.5 rounded-full text-on-surface font-semibold hover:bg-surface-container transition-colors">Keep Meeting</button>
                            <button onClick={handleCancelMeeting} className="px-6 py-2.5 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors">Confirm Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
