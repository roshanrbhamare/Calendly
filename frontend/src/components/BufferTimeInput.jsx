import React from 'react';

export default function BufferTimeInput({ bufferBefore, bufferAfter, onChange }) {
    const handleBefore = (value) => {
        onChange({ before: parseInt(value) || 0, after: bufferAfter });
    };

    const handleAfter = (value) => {
        onChange({ before: bufferBefore, after: parseInt(value) || 0 });
    };

    return (
        <div className="border-t border-outline-variant/20 pt-4 space-y-4">
            <label className="font-label text-[11px] font-bold tracking-wider text-outline uppercase block">
                Buffer Time (minutes)
            </label>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs text-on-surface-variant">Before Meeting</label>
                    <input 
                        type="number" 
                        min="0" 
                        max="120"
                        value={bufferBefore}
                        onChange={(e) => handleBefore(e.target.value)}
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
                        value={bufferAfter}
                        onChange={(e) => handleAfter(e.target.value)}
                        className="w-full bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors"
                        placeholder="0"
                    />
                </div>
            </div>
            <p className="text-[11px] text-on-surface-variant">Time to block before and after each meeting</p>
        </div>
    );
}
