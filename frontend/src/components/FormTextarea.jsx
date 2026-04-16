import React from 'react';

export default function FormTextarea({
    label,
    placeholder = '',
    value,
    onChange,
    error,
    rows = 4,
    className = '',
    ...props
}) {
    return (
        <div className="space-y-2">
            {label && (
                <label className="font-label text-[11px] font-bold tracking-wider text-outline uppercase ml-1">
                    {label}
                </label>
            )}
            <textarea 
                className={`w-full bg-surface-container-low border-b-2 border-outline-variant/30 focus:border-primary focus:bg-white transition-all px-4 py-4 rounded-t-lg outline-none text-on-surface font-medium placeholder:text-outline/50 resize-none ${className}`}
                placeholder={placeholder}
                rows={rows}
                value={value}
                onChange={onChange}
                {...props}
            ></textarea>
            {error && <p className="text-xs text-red-500 ml-1">{error}</p>}
        </div>
    );
}
