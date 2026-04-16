import React from 'react';

export default function DurationSelector({ duration, onChange }) {
    return (
        <div className="space-y-4">
            <label className="font-label text-[11px] font-bold tracking-wider text-outline uppercase">
                Meeting Duration
            </label>
            <div className="flex flex-wrap gap-2">
                {[15, 30, 45, 60].map(mins => (
                    <button 
                        key={mins}
                        onClick={() => onChange(mins)}
                        className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                            duration === mins 
                                ? 'bg-primary text-white' 
                                : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container'
                        }`}
                    >
                        {mins} min
                    </button>
                ))}
                <button className="px-4 py-2 rounded-full text-xs font-semibold bg-surface-container-low text-primary border border-primary/20 hover:bg-primary/5">
                    Custom
                </button>
            </div>
        </div>
    );
}
