import React from 'react';

export default function FormInput({
    label,
    type = 'text',
    placeholder = '',
    value,
    onChange,
    error,
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
            <input 
                className={`w-full bg-surface-container-low border-b-2 border-outline-variant/30 focus:border-primary focus:bg-white transition-all px-4 py-4 rounded-t-lg outline-none text-on-surface font-medium placeholder:text-outline/50 ${className}`}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                {...props}
            />
            {error && <p className="text-xs text-red-500 ml-1">{error}</p>}
        </div>
    );
}
