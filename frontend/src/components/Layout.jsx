import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
    const location = useLocation();

    return (
        <div className="flex w-full h-screen overflow-hidden bg-surface text-on-surface">
            {/* Left Sidebar */}
            <aside className="w-64 flex flex-col border-r border-outline-variant/30 h-screen bg-surface-container-lowest">
                <div className="p-6 flex items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 flex items-center justify-center">
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="20" cy="20" r="18" stroke="#006BFF" strokeWidth="4"></circle>
                                <path d="M12 20C12 15.5817 15.5817 12 20 12" stroke="#006BFF" strokeLinecap="round" strokeWidth="4"></path>
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-primary">Calendly</span>
                    </div>
                </div>
                <div className="px-6 mb-8">
                    <Link to="/create-event" className="w-full flex items-center justify-center gap-2 py-2 border border-outline-variant/30 rounded-full text-sm font-semibold hover:bg-surface-container transition-colors">
                        <span className="material-symbols-outlined text-lg">add</span>
                        Create
                    </Link>
                </div>
                <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
                    <NavLink to="/" end className={({isActive}) => isActive 
                        ? "flex items-center gap-3 px-3 py-2 rounded-lg text-primary bg-primary/10 font-medium text-sm"
                        : "flex items-center gap-3 px-3 py-2 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors text-sm"}>
                        <span className="material-symbols-outlined">link</span>
                        Scheduling
                    </NavLink>
                    <NavLink to="/meetings" className={({isActive}) => isActive 
                        ? "flex items-center gap-3 px-3 py-2 rounded-lg text-primary bg-primary/10 font-medium text-sm"
                        : "flex items-center gap-3 px-3 py-2 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors text-sm"}>
                        <span className="material-symbols-outlined">calendar_today</span>
                        Meetings
                    </NavLink>
                    <NavLink to="/availability" className={({isActive}) => isActive 
                        ? "flex items-center gap-3 px-3 py-2 rounded-lg text-primary bg-primary/10 font-medium text-sm"
                        : "flex items-center gap-3 px-3 py-2 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors text-sm"}>
                        <span className="material-symbols-outlined">schedule</span>
                        Availability
                    </NavLink>

                </nav>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Top Nav */}
                <header className="h-16 flex items-center justify-end px-8 gap-4 shrink-0 border-b border-outline-variant/30">
                </header>

                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
