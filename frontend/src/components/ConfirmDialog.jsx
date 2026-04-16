import React from 'react';

export default function ConfirmDialog({ 
    isOpen, 
    title, 
    message, 
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDangerous = false,
    onConfirm, 
    onCancel 
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card-bg border border-border-color rounded-xl p-6 max-w-sm shadow-lg">
                <h2 className="text-lg font-bold mb-2">{title}</h2>
                <p className="text-text-muted text-sm mb-6">{message}</p>
                <div className="flex gap-3 justify-end">
                    <button 
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button 
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${
                            isDangerous 
                                ? 'bg-red-600 hover:bg-red-700' 
                                : 'bg-primary hover:bg-blue-600'
                        }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
