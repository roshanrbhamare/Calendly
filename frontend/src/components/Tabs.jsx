import React from 'react';

export default function Tabs({ 
    tabs,
    activeTab,
    onTabChange,
    className = ''
}) {
    return (
        <div className={`flex border-b border-border-color mb-6 ${className}`}>
            {tabs.map(tab => (
                <button 
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                        activeTab === tab.id
                            ? 'border-primary text-white' 
                            : 'border-transparent text-text-muted hover:text-white'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
