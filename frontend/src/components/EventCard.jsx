import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function EventCard({ 
    event, 
    onCopy, 
    onDelete 
}) {
    const navigate = useNavigate();

    return (
        <div className="bg-card-bg border border-border-color rounded-xl p-6 relative group overflow-hidden border-l-[3px] border-l-[#7c3aed]">
            <div className="flex items-start gap-4">
                <div className="flex-1">
                    <h3 className="text-lg font-bold mb-1">{event.name}</h3>
                    <div className="flex items-center gap-2 text-text-muted text-xs mb-1">
                        <span>•</span>
                        <span>{event.duration} min</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-text-muted">
                    <button 
                        onClick={() => navigate(`/edit-event/${event.slug}`)} 
                        className="flex items-center gap-1 text-sm font-semibold hover:text-primary transition-colors"
                    >
                        <span className="material-symbols-outlined text-base">edit</span>
                        Edit
                    </button>
                    <button 
                        onClick={() => onDelete(event)} 
                        className="flex items-center gap-1 text-sm font-semibold text-red-500 hover:text-red-400 transition-colors"
                    >
                        <span className="material-symbols-outlined text-base">delete</span>
                        Delete
                    </button>
                    <button 
                        onClick={() => onCopy(event.slug)} 
                        className="flex items-center gap-1 text-sm font-semibold text-white hover:text-primary transition-colors ml-2"
                    >
                        <span className="material-symbols-outlined text-base">link</span>
                        Copy link
                    </button>
                    <Link 
                        to={`/book/${event.slug}`} 
                        target="_blank" 
                        className="hover:text-primary group"
                    >
                        <span className="material-symbols-outlined group-hover:scale-110 transition-transform flex items-center">open_in_new</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
