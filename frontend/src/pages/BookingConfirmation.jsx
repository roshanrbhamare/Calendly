import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';

export default function BookingConfirmation() {
    const location = useLocation();
    const navigate = useNavigate();
    const booking = location.state?.booking;

    // Fallback if someone navigates directly without state
    if (!booking) {
        return (
            <div style={{ minHeight: '100vh', width: '100vw', background: '#181a1f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: '#8896a5' }}>
                    <p style={{ fontSize: 16, marginBottom: 16 }}>No booking information found.</p>
                    <button
                        onClick={() => navigate('/')}
                        style={{ padding: '10px 28px', borderRadius: 50, background: '#006BFF', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 14 }}
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    const startDate = parseISO(booking.start_time.replace(' ', 'T'));
    const endDate = parseISO(booking.end_time.replace(' ', 'T'));

    return (
        <div style={{
            minHeight: '100vh',
            width: '100vw',
            background: '#181a1f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            boxSizing: 'border-box',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
            <div style={{
                width: '100%',
                maxWidth: '520px',
                background: '#1e2128',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
                overflow: 'hidden'
            }}>
                {/* Green top banner */}
                <div style={{
                    background: 'linear-gradient(135deg, #0d7230 0%, #0a5c27 100%)',
                    padding: '36px 40px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: 12
                }}>
                    {/* Animated checkmark */}
                    <div style={{
                        width: 64, height: 64,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: 4
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 36, color: '#fff', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </div>
                    <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: '-0.3px' }}>
                        You're scheduled!
                    </h1>
                </div>

                {/* Meeting details */}
                <div style={{ padding: '32px 40px 16px' }}>
                    <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: '0 0 24px', letterSpacing: '-0.2px' }}>
                        {booking.event_name}
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        {/* Attendee */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#2a2f3a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#8896a5' }}>person</span>
                            </div>
                            <div>
                                <p style={{ color: '#8896a5', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 2px' }}>Attendee</p>
                                <p style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: 0 }}>{booking.booker_name}</p>
                                <p style={{ color: '#8896a5', fontSize: 13, margin: '2px 0 0' }}>{booking.booker_email}</p>
                            </div>
                        </div>

                        {/* Date */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#2a2f3a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#8896a5' }}>calendar_today</span>
                            </div>
                            <div>
                                <p style={{ color: '#8896a5', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 2px' }}>Date & Time</p>
                                <p style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: 0 }}>
                                    {format(startDate, 'EEEE, MMMM d, yyyy')}
                                </p>
                                <p style={{ color: '#8896a5', fontSize: 13, margin: '2px 0 0' }}>
                                    {format(startDate, 'h:mm a')} – {format(endDate, 'h:mm a')}
                                </p>
                            </div>
                        </div>

                        {/* Duration */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#2a2f3a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#8896a5' }}>schedule</span>
                            </div>
                            <div>
                                <p style={{ color: '#8896a5', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 2px' }}>Duration</p>
                                <p style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: 0 }}>{booking.duration} minutes</p>
                            </div>
                        </div>

                        {/* Meeting type */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#2a2f3a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#8896a5' }}>videocam</span>
                            </div>
                            <div>
                                <p style={{ color: '#8896a5', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 2px' }}>Meeting</p>
                                <p style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: 0 }}>Web conferencing</p>
                                <p style={{ color: '#8896a5', fontSize: 13, margin: '2px 0 0' }}>Details sent to your email</p>
                            </div>
                        </div>

                        {/* Description */}
                        {booking.description && (
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#2a2f3a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#8896a5' }}>info</span>
                                </div>
                                <div>
                                    <p style={{ color: '#8896a5', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 2px' }}>Meeting Details</p>
                                    <p style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{booking.description}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Divider */}
                <div style={{ margin: '8px 40px', height: 1, background: 'rgba(255,255,255,0.06)' }} />

                {/* Actions */}
                <div style={{ padding: '20px 40px 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <button
                        onClick={() => navigate(`/book/${booking.event_slug}`)}
                        style={{
                            width: '100%', padding: '13px', borderRadius: 10,
                            background: 'transparent', color: '#006BFF',
                            border: '1px solid #006BFF',
                            fontWeight: 700, fontSize: 14, cursor: 'pointer',
                            fontFamily: 'inherit', transition: 'background 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,107,255,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        Schedule Another Meeting
                    </button>
                </div>
            </div>
        </div>
    );
}
