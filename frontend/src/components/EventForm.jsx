import React, { useState } from 'react';
import FormInput from './FormInput';
import FormTextarea from './FormTextarea';
import DurationSelector from './DurationSelector';
import BufferTimeInput from './BufferTimeInput';

export default function EventForm({ 
    initialData = null,
    onSubmit,
    submitButtonText = 'Save Event Type',
    title = 'New Event Type',
    description = 'Configure the details for your new scheduling link. This information will be visible to your invitees.'
}) {
    const [formData, setFormData] = useState(initialData || {
        name: '',
        description: '',
        duration: 30,
        slug: '',
        buffer_before: 0,
        buffer_after: 0
    });

    const handleNameChange = (e) => {
        const newName = e.target.value;
        setFormData(prev => ({
            ...prev, 
            name: newName, 
            slug: prev.slug === prev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || prev.slug === '' 
                ? newName.toLowerCase().replace(/[^a-z0-9]+/g, '-') 
                : prev.slug
        }));
    };

    const handleSlugChange = (e) => {
        setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')});
    };

    const handleDurationChange = (value) => {
        setFormData({...formData, duration: value});
    };

    const handleBufferChange = ({ before, after }) => {
        setFormData({...formData, buffer_before: before, buffer_after: after});
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
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
                            <FormInput 
                                label="Event Name"
                                type="text"
                                placeholder="e.g. 30 Minute Strategy Call"
                                value={formData.name}
                                onChange={handleNameChange}
                            />
                            <FormTextarea 
                                label="Description / Instructions"
                                placeholder="Briefly describe the purpose of the meeting..."
                                rows="4"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                            <div className="space-y-2">
                                <label className="font-label text-[11px] font-bold tracking-wider text-outline uppercase ml-1">Event Link (Slug)</label>
                                <div className="flex items-center bg-surface-container-low rounded-t-lg border-b-2 border-outline-variant/30 px-4 py-4">
                                    <span className="text-outline text-sm shrink-0">calendly.com/</span>
                                    <input 
                                        className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-on-surface font-medium p-0" 
                                        placeholder="strategy-call" 
                                        type="text"
                                        value={formData.slug}
                                        onChange={handleSlugChange}
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
                            <DurationSelector 
                                duration={formData.duration}
                                onChange={handleDurationChange}
                            />
                            <BufferTimeInput 
                                bufferBefore={formData.buffer_before}
                                bufferAfter={formData.buffer_after}
                                onChange={handleBufferChange}
                            />
                        </div>
                    </section>
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
                <button 
                    type="submit"
                    className="px-8 py-3 rounded-xl font-plus-jakarta text-sm font-semibold bg-gradient-to-br from-primary to-primary-container text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                    {submitButtonText}
                </button>
            </div>
        </form>
    );
}
