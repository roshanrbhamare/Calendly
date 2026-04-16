import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useToast } from '../components/Toast';

export default function CreateEvent() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        duration: 30,
        slug: '',
        buffer_before: 0,
        buffer_after: 0
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
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
            {/* Header Section */}
            <div className="mb-12 flex items-end justify-between">
                <div className="space-y-2">
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 text-primary font-label text-[11px] font-bold tracking-widest uppercase mb-4 hover:underline">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Back to Event Types
                    </button>
                    <h1 className="text-display-lg text-5xl font-extrabold tracking-tight text-on-surface">New Event Type</h1>
                    <p className="text-on-surface-variant font-body leading-relaxed max-w-xl">Configure the details for your new scheduling link. This information will be visible to your invitees.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => navigate('/')} className="px-6 py-3 rounded-xl font-plus-jakarta text-sm font-semibold text-primary hover:bg-surface-container transition-colors">Cancel</button>
                    <button onClick={handleSubmit} className="px-8 py-3 rounded-xl font-plus-jakarta text-sm font-semibold bg-gradient-to-br from-primary to-primary-container text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">Save Event Type</button>
                </div>
            </div>

            {/* Form Layout: Asymmetric Bento Grid */}
            <div className="grid grid-cols-12 gap-8">
                {/* Left Column: Core Identity (2/3 width) */}
                <div className="col-span-8 space-y-8">
                    {/* Section: Basic Information */}
                    <section className="bg-surface-container-lowest p-8 rounded-xl ring-1 ring-outline-variant/15">
                        <h2 className="text-xl font-bold font-headline mb-8 flex items-center gap-3">
                            <span className="w-2 h-8 bg-primary rounded-full"></span>
                            Event Information
                        </h2>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="font-label text-[11px] font-bold tracking-wider text-outline uppercase ml-1">Event Name</label>
                                <input 
                                    className="w-full bg-surface-container-low border-b-2 border-outline-variant/30 focus:border-primary focus:bg-white transition-all px-4 py-4 rounded-t-lg outline-none text-on-surface font-medium placeholder:text-outline/50" 
                                    placeholder="e.g. 30 Minute Strategy Call" 
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => {
                                        const newName = e.target.value;
                                        setFormData(prev => ({
                                            ...prev, 
                                            name: newName, 
                                            slug: prev.slug === prev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || prev.slug === '' ? newName.toLowerCase().replace(/[^a-z0-9]+/g, '-') : prev.slug
                                        }));
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="font-label text-[11px] font-bold tracking-wider text-outline uppercase ml-1">Description / Instructions</label>
                                <textarea 
                                    className="w-full bg-surface-container-low border-b-2 border-outline-variant/30 focus:border-primary focus:bg-white transition-all px-4 py-4 rounded-t-lg outline-none text-on-surface font-medium placeholder:text-outline/50 resize-none" 
                                    placeholder="Briefly describe the purpose of the meeting..." 
                                    rows="4"
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                ></textarea>
                            </div>
                            <div className="space-y-2">
                                <label className="font-label text-[11px] font-bold tracking-wider text-outline uppercase ml-1">Event Link (Slug)</label>
                                <div className="flex items-center bg-surface-container-low rounded-t-lg border-b-2 border-outline-variant/30 px-4 py-4">
                                    <span className="text-outline text-sm shrink-0">calendly.com/</span>
                                    <input 
                                        className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-on-surface font-medium p-0" 
                                        placeholder="strategy-call" 
                                        type="text"
                                        value={formData.slug}
                                        onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                                    />
                                </div>
                                <p className="text-[11px] text-outline ml-1">Only lowercase letters, numbers, and hyphens.</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Settings */}
                <div className="col-span-4 space-y-8">
                    {/* Section: Duration & Capacity */}
                    <section className="bg-white p-8 rounded-xl shadow-[0_12px_32px_rgba(26,28,28,0.06)] ring-1 ring-outline-variant/10">
                        <h3 className="text-lg font-bold font-headline mb-6">Duration &amp; Limits</h3>
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <label className="font-label text-[11px] font-bold tracking-wider text-outline uppercase">Meeting Duration</label>
                                <div className="flex flex-wrap gap-2">
                                    {[15, 30, 45, 60].map(mins => (
                                        <button 
                                            key={mins}
                                            onClick={() => setFormData({...formData, duration: mins})}
                                            className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${formData.duration === mins ? 'bg-primary text-white' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container'}`}
                                        >
                                            {mins} min
                                        </button>
                                    ))}
                                    <button className="px-4 py-2 rounded-full text-xs font-semibold bg-surface-container-low text-primary border border-primary/20 hover:bg-primary/5">Custom</button>
                                </div>
                            </div>
                            <div className="border-t border-outline-variant/20 pt-4">
                                <label className="font-label text-[11px] font-bold tracking-wider text-outline uppercase mb-4 block">Buffer Time (minutes)</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs text-on-surface-variant">Before Meeting</label>
                                        <input 
                                            type="number" 
                                            min="0" 
                                            max="120"
                                            value={formData.buffer_before}
                                            onChange={(e) => setFormData({...formData, buffer_before: parseInt(e.target.value) || 0})}
                                            className="w-full bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-on-surface-variant">After Meeting</label>
                                        <input 
                                            type="number" 
                                            min="0" 
                                            max="120"
                                            value={formData.buffer_after}
                                            onChange={(e) => setFormData({...formData, buffer_after: parseInt(e.target.value) || 0})}
                                            className="w-full bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <p className="text-[11px] text-on-surface-variant mt-2">Time to block before and after each meeting</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
