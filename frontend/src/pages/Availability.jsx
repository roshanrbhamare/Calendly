import React, { useState, useEffect } from 'react';
import { useToast } from '../components/Toast';
import api from '../api';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const TIMEZONES = [
    { id: 'UTC', label: 'UTC (Coordinated Universal Time)', offset: 'UTC±0' },
    { id: 'EST', label: 'EST (Eastern Standard Time)', offset: 'UTC-5' },
    { id: 'CST', label: 'CST (Central Standard Time)', offset: 'UTC-6' },
    { id: 'MST', label: 'MST (Mountain Standard Time)', offset: 'UTC-7' },
    { id: 'PST', label: 'PST (Pacific Standard Time)', offset: 'UTC-8' },
    { id: 'GMT', label: 'GMT (Greenwich Mean Time)', offset: 'UTC±0' },
    { id: 'CET', label: 'CET (Central European Time)', offset: 'UTC+1' },
    { id: 'IST', label: 'IST (Indian Standard Time)', offset: 'UTC+5:30' },
    { id: 'JST', label: 'JST (Japan Standard Time)', offset: 'UTC+9' },
    { id: 'AEST', label: 'AEST (Australian Eastern Standard Time)', offset: 'UTC+10' }
];

// Helper function to format time from 24-hour to 12-hour AM/PM format
const formatTimeToAMPM = (timeStr) => {
    try {
        const [hours, minutes] = timeStr.split(':');
        let hour = parseInt(hours);
        const minute = minutes;
        const period = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12;
        return `${hour}:${minute} ${period}`;
    } catch (e) {
        return timeStr;
    }
};

export default function Availability() {
    const [availabilities, setAvailabilities] = useState([]);
    const [timezone, setTimezone] = useState('UTC');
    const [editingIndex, setEditingIndex] = useState(null);
    const { showToast } = useToast();

    useEffect(() => {
        api.get('/availability').then(res => {
            setAvailabilities(res.data.availabilities || res.data);
            if (res.data.timezone) {
                setTimezone(res.data.timezone);
            }
        }).catch(console.error);
    }, []);

    const handleSave = async () => {
        try {
            await api.post('/availability', { availabilities, timezone });
            showToast('Availability and timezone saved successfully', 'success');
        } catch (e) {
            console.error(e);
            showToast('Failed to save availability', 'error');
        }
    };

    const addTimeBlock = (dayIndex) => {
        setAvailabilities([...availabilities, { day_of_week: dayIndex, start_time: '09:00:00', end_time: '17:00:00' }]);
    };

    const removeTimeBlock = (index) => {
        const newAvails = [...availabilities];
        newAvails.splice(index, 1);
        setAvailabilities(newAvails);
    };

    const updateTimeBlock = (index, field, value) => {
        const newAvails = [...availabilities];
        newAvails[index][field] = value;
        setAvailabilities(newAvails);
    };

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-dark-bg h-full overflow-hidden">
            <header className="h-14 flex items-center px-8 border-b border-border-gray shrink-0 justify-between">
                <h1 className="text-xl font-bold">Availability</h1>
                <button onClick={handleSave} className="px-4 py-2 bg-brand-blue text-white font-bold rounded hover:bg-blue-600 text-sm">Save Changes</button>
            </header>
            


            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-[1100px] border border-border-color rounded-xl overflow-hidden bg-card-bg/30">

                    
                    <div className="p-6 max-w-2xl">
                        {/* Timezone Selector */}
                        <div className="mb-8 pb-8 border-b border-border-color">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="material-symbols-outlined text-text-muted text-lg">public</span>
                                <h3 className="font-bold text-sm">Timezone</h3>
                            </div>
                            <p className="text-[11px] text-text-muted mb-4">Select your timezone for booking display</p>
                            <select 
                                value={timezone}
                                onChange={(e) => setTimezone(e.target.value)}
                                className="w-full md:w-80 px-4 py-2 bg-surface-container border border-border-color rounded-lg text-on-surface font-medium focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                            >
                                {TIMEZONES.map(tz => (
                                    <option key={tz.id} value={tz.id}>
                                        {tz.label} ({tz.offset})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Weekly Hours */}
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="material-symbols-outlined text-text-muted text-lg">sync</span>
                                <h3 className="font-bold text-sm">Weekly hours</h3>
                            </div>
                            <p className="text-[11px] text-text-muted mb-6">Set when you are typically available for meetings (Use HH:mm:ss Format)</p>
                            
                            <div className="space-y-4">
                                {DAYS.map((dayLabel, dIdx) => {
                                    const blocks = availabilities.filter(a => a.day_of_week === dIdx);
                                    return (
                                        <div key={dIdx} className="flex items-start gap-4">
                                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-black text-white shrink-0 mt-1">{dayLabel}</div>
                                            <div className="flex-1 space-y-2">
                                                {blocks.length === 0 ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-text-muted text-sm py-1.5">Unavailable</span>
                                                        <div className="flex items-center gap-2 ml-auto">
                                                            <button onClick={() => addTimeBlock(dIdx)} className="text-text-muted hover:text-white"><span className="material-symbols-outlined">add_circle</span></button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    blocks.map((block, bIdx) => {
                                                        const overallIndex = availabilities.indexOf(block);
                                                        const displayStart = formatTimeToAMPM(block.start_time);
                                                        const displayEnd = formatTimeToAMPM(block.end_time);
                                                        const isEditing = editingIndex === overallIndex;
                                                        return (
                                                            <div key={bIdx} className="flex items-center gap-3">
                                                                {isEditing ? (
                                                                    <>
                                                                        <input 
                                                                            className="w-24 h-9 bg-transparent border border-border-color rounded text-sm text-center focus:ring-1 focus:ring-primary focus:border-primary text-white" 
                                                                            type="text" 
                                                                            value={block.start_time}
                                                                            onChange={e => updateTimeBlock(overallIndex, 'start_time', e.target.value)}
                                                                            placeholder="HH:mm:ss"
                                                                        />
                                                                        <span className="text-text-muted">-</span>
                                                                        <input 
                                                                            className="w-24 h-9 bg-transparent border border-border-color rounded text-sm text-center focus:ring-1 focus:ring-primary focus:border-primary text-white" 
                                                                            type="text" 
                                                                            value={block.end_time}
                                                                            onChange={e => updateTimeBlock(overallIndex, 'end_time', e.target.value)}
                                                                            placeholder="HH:mm:ss"
                                                                        />
                                                                    </>
                                                                ) : (
                                                                    <div className="flex items-center gap-2 flex-1">
                                                                        <span className="text-sm text-on-surface font-medium min-w-max">{displayStart}</span>
                                                                        <span className="text-text-muted">-</span>
                                                                        <span className="text-sm text-on-surface font-medium min-w-max">{displayEnd}</span>
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center gap-2">
                                                                    <button 
                                                                        className="text-text-muted hover:text-white text-sm p-0.5"
                                                                        title={isEditing ? "Done editing" : "Edit times"}
                                                                        onClick={() => setEditingIndex(isEditing ? null : overallIndex)}
                                                                    >
                                                                        <span className="material-symbols-outlined text-base">{isEditing ? 'check_circle' : 'edit'}</span>
                                                                    </button>
                                                                    <button onClick={() => removeTimeBlock(overallIndex)} className="text-text-muted hover:text-white"><span className="material-symbols-outlined">close</span></button>
                                                                    {bIdx === blocks.length - 1 && (
                                                                        <button onClick={() => addTimeBlock(dIdx)} className="text-text-muted hover:text-white"><span className="material-symbols-outlined">add_circle</span></button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
