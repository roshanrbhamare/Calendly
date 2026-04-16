import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function PageHeader({ 
    backPath = '/',
    title,
    description,
    actions = []
}) {
    const navigate = useNavigate();

    return (
        <div className="mb-12 flex items-end justify-between">
            <div className="space-y-2">
                <button 
                    onClick={() => navigate(backPath)} 
                    className="flex items-center gap-2 text-primary font-label text-[11px] font-bold tracking-widest uppercase mb-4 hover:underline"
                >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Back
                </button>
                <h1 className="text-display-lg text-5xl font-extrabold tracking-tight text-on-surface">
                    {title}
                </h1>
                {description && (
                    <p className="text-on-surface-variant font-body leading-relaxed max-w-xl">
                        {description}
                    </p>
                )}
            </div>
            {actions.length > 0 && (
                <div className="flex gap-3">
                    {actions.map((action, i) => (
                        <button
                            key={i}
                            onClick={action.onClick}
                            className={`px-${action.size === 'large' ? '8' : '6'} py-3 rounded-xl font-plus-jakarta text-sm font-semibold ${
                                action.variant === 'primary'
                                    ? 'bg-gradient-to-br from-primary to-primary-container text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all'
                                    : 'text-primary hover:bg-surface-container transition-colors'
                            }`}
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
