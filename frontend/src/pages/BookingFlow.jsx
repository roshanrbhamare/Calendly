import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import {
    format, addMonths, subMonths, startOfMonth, endOfMonth,
    startOfWeek, endOfWeek, eachDayOfInterval,
    isSameDay, isSameMonth, isBefore, parseISO, startOfDay
} from 'date-fns';
import api, { MOCK_USER_ID } from '../api';

const DAY_HEADERS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

function buildCalendarWeeks(monthDate) {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: calStart, end: calEnd });
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
    return weeks;
}

export default function BookingFlow() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [step, setStep] = useState(1);
    const [eventType, setEventType] = useState(null);
    const [calendarMonth, setCalendarMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [slots, setSlots] = useState([]);
    const [timezone, setTimezone] = useState('UTC');
    const [timezoneOffset, setTimezoneOffset] = useState('UTC±0');
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [loading, setLoading] = useState(false);
    const today = startOfDay(new Date());
    
    // Map of timezone IDs to offsets
    const TIMEZONE_OFFSETS = {
        'UTC': 'UTC±0',
        'EST': 'UTC-5',
        'CST': 'UTC-6',
        'MST': 'UTC-7',
        'PST': 'UTC-8',
        'GMT': 'UTC±0',
        'CET': 'UTC+1',
        'IST': 'UTC+5:30',
        'JST': 'UTC+9',
        'AEST': 'UTC+10'
    };

    useEffect(() => {
        api.get(`/event-types/${slug}`)
            .then(res => setEventType(res.data))
            .catch(console.error);
    }, [slug]);

    useEffect(() => {
        if (!selectedDate) return;
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        setLoading(true);
        setSlots([]);
        api.get(`/slots?slug=${slug}&date=${dateStr}&userId=${MOCK_USER_ID}`)
            .then(res => {
                // Extract timezone and offset if provided
                if (res.data.timezone) {
                    setTimezone(res.data.timezone);
                    setTimezoneOffset(TIMEZONE_OFFSETS[res.data.timezone] || 'Unknown');
                }
                setSlots(res.data.slots || []);
            })
            .catch(() => setSlots([]))
            .finally(() => setLoading(false));
    }, [selectedDate, slug]);

    const handleConfirmSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/bookings', {
                event_type_id: eventType?.id,
                start_time: selectedSlot.start_time,
                booker_name: formData.name,
                booker_email: formData.email
            });
            navigate('/booking-confirmed', { state: { booking: res.data } });
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || error.message;
            showToast('Booking failed: ' + msg, 'error');
        }
    };

    const weeks = buildCalendarWeeks(calendarMonth);

    /* ───── STEP 1: Date & time picker ───── */
    if (step === 1) {
        return (
            <div style={{ minHeight: '100vh', width: '100vw', background: '#181a1f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', boxSizing: 'border-box' }}>
                <div style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '960px',
                    background: '#1e2128',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
                    display: 'flex',
                    overflow: 'hidden',
                    minHeight: '520px'
                }}>


                    {/* ── Left: Event info ── */}
                    <div style={{ width: 220, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.08)', padding: '36px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <p style={{ color: '#8896a5', fontSize: 13, fontWeight: 600, margin: 0 }}>Host</p>
                        <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
                            {eventType?.name || slug}
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#8896a5', fontSize: 13 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>schedule</span>
                            <span>{eventType?.duration || 30} min</span>
                        </div>
                        {eventType?.description && (
                            <div style={{ fontSize: 12, color: '#c5d1d8', lineHeight: 1.4, marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                {eventType.description}
                            </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: '#8896a5', fontSize: 13 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 17, marginTop: 2 }}>videocam</span>
                            <span>Web conferencing details provided upon confirmation.</span>
                        </div>
                    </div>

                    {/* ── Center: Calendar ── */}
                    <div style={{ flex: 1, padding: '36px 32px', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
                        <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: '0 0 24px' }}>Select a Date &amp; Time</h2>

                        {/* Month navigation */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <button
                                onClick={() => setCalendarMonth(prev => subMonths(prev, 1))}
                                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
                            </button>
                            <span style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{format(calendarMonth, 'MMMM yyyy')}</span>
                            <button
                                onClick={() => setCalendarMonth(prev => addMonths(prev, 1))}
                                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
                            </button>
                        </div>

                        {/* Day headers */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 8 }}>
                            {DAY_HEADERS.map(d => (
                                <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#8896a5', padding: '4px 0' }}>{d}</div>
                            ))}
                        </div>

                        {/* Calendar days */}
                        {weeks.map((week, wi) => (
                            <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
                                {week.map((day, di) => {
                                    const inMonth = isSameMonth(day, calendarMonth);
                                    const isPast = isBefore(startOfDay(day), today);
                                    const isSelected = isSameDay(day, selectedDate);
                                    const isToday = isSameDay(day, today);
                                    const isAvailable = inMonth && !isPast;

                                    return (
                                        <div key={di} style={{ display: 'flex', justifyContent: 'center' }}>
                                            {inMonth ? (
                                                <button
                                                    disabled={!isAvailable}
                                                    onClick={() => { setSelectedDate(day); setSelectedSlot(null); }}
                                                    style={{
                                                        width: 36, height: 36, borderRadius: '50%', border: 'none',
                                                        cursor: isAvailable ? 'pointer' : 'default',
                                                        fontWeight: 600, fontSize: 13,
                                                        background: isSelected ? '#006BFF' : 'transparent',
                                                        color: isSelected ? '#fff' : isAvailable ? '#4d9fff' : '#3a3f4a',
                                                        outline: isToday && !isSelected ? '1px solid #006BFF' : 'none',
                                                        transition: 'background 0.15s'
                                                    }}
                                                    onMouseEnter={e => { if (isAvailable && !isSelected) e.currentTarget.style.background = 'rgba(0,107,255,0.15)'; }}
                                                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                                                >
                                                    {format(day, 'd')}
                                                </button>
                                            ) : <div style={{ width: 36, height: 36 }} />}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    {/* ── Right: Time slots ── */}
                    <div style={{ width: 230, flexShrink: 0, padding: '36px 20px', overflowY: 'auto' }}>
                        <p style={{ color: '#fff', fontWeight: 600, fontSize: 14, margin: '0 0 20px' }}>
                            {format(selectedDate, 'EEEE, MMMM d')}
                        </p>
                        {loading && <p style={{ color: '#8896a5', fontSize: 13 }}>Loading...</p>}
                        {!loading && slots.length === 0 && (
                            <p style={{ color: '#8896a5', fontSize: 13 }}>No slots available</p>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                            {!loading && slots.map((slot, i) => {
                                const isSel = selectedSlot === slot;
                                return (
                                    <button
                                        key={i}
                                        onClick={() => { setSelectedSlot(isSel ? null : slot); if (!isSel) setStep(2); }}
                                        style={{
                                            width: '100%', padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 600,
                                            background: isSel ? '#006BFF' : 'transparent',
                                            color: '#006BFF',
                                            border: '1px solid #006BFF',
                                            cursor: 'pointer',
                                            transition: 'background 0.15s, color 0.15s'
                                        }}
                                        onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = 'rgba(0,107,255,0.12)'; }}
                                        onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        {format(parseISO(slot.start_time), 'h:mmaaa')}
                                    </button>
                                );
                            })}
                        </div>
                        
                        {/* Timezone Display */}
                        <div style={{ paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, color: '#8896a5', fontSize: 12 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 18, flexShrink: 0, marginTop: 2 }}>language</span>
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#c5d1d8' }}>{timezone}</p>
                                    <p style={{ margin: 0, color: '#8896a5' }}>{timezoneOffset}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* ───── STEP 2: Booking form ───── */
    return (
        <div style={{ minHeight: '100vh', background: '#181a1f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{
                width: '100%', maxWidth: '720px',
                background: '#1e2128', borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
                display: 'flex', overflow: 'hidden', minHeight: '460px'
            }}>
                {/* Left info */}
                <div style={{ width: 260, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.08)', padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <button
                        onClick={() => { setStep(1); setSelectedSlot(null); }}
                        style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
                    </button>
                    <p style={{ color: '#8896a5', fontSize: 13, fontWeight: 600, margin: 0 }}>Host</p>
                    <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: 0, lineHeight: 1.3 }}>{eventType?.name || slug}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#8896a5', fontSize: 13 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 17 }}>schedule</span>
                        <span>{eventType?.duration || 30} min</span>
                    </div>
                    {selectedSlot && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: '#8896a5', fontSize: 13 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 17, marginTop: 2 }}>calendar_today</span>
                            <span>{format(parseISO(selectedSlot.start_time), 'h:mmaaa, EEEE, MMMM d, yyyy')}</span>
                        </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: '#8896a5', fontSize: 13 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 17, marginTop: 2 }}>videocam</span>
                        <span>Web conferencing details provided upon confirmation.</span>
                    </div>
                </div>

                {/* Right: Form */}
                <div style={{ flex: 1, padding: '36px 40px' }}>
                    <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: '0 0 28px' }}>Enter Details</h2>
                    <form onSubmit={handleConfirmSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 380 }}>
                        <div>
                            <label style={{ display: 'block', color: '#8896a5', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Name *</label>
                            <input
                                required type="text" placeholder="Your name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                style={{ width: '100%', background: '#13151a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px 16px', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', color: '#8896a5', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Email *</label>
                            <input
                                required type="email" placeholder="you@example.com"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                style={{ width: '100%', background: '#13151a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px 16px', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div style={{ paddingTop: 8 }}>
                            <button
                                type="submit"
                                style={{ padding: '12px 32px', borderRadius: 50, background: '#006BFF', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}
                            >
                                Schedule Event
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
