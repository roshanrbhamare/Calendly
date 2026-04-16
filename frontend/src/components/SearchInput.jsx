import React from 'react';

export default function SearchInput({ 
    placeholder = 'Search...',
    value,
    onChange,
    className = ''
}) {
    return (
        <div className={`relative ${className}`}>
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                search
            </span>
            <input 
                className="w-full bg-transparent border border-border-color rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary transition-colors" 
                placeholder={placeholder}
                type="text"
                value={value}
                onChange={onChange}
            />
        </div>
    );
}
