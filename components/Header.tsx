
import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';

const LogoIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-500 dark:text-indigo-400">
      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const UserDropdown: React.FC<{ user: User, onLogout: () => void, onClose: () => void }> = ({ user, onLogout, onClose }) => {
    return (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-20 animate-fade-in-down overflow-hidden">
            <div className="p-2 border-b border-slate-200 dark:border-slate-700">
                <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 px-2 truncate">{user.name}</p>
            </div>
            <div className="py-1">
                <Link to={`/profile/${user.id}`} onClick={onClose} className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">My Profile</Link>
                <Link to="/profile/edit" onClick={onClose} className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Edit Profile</Link>
                <button onClick={() => { onLogout(); onClose(); }} className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Logout</button>
            </div>
        </div>
    );
};

const Header: React.FC = () => {
    const { currentUser, logout } = useAuth();
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const activeLinkClass = "bg-slate-200 dark:bg-slate-800 text-indigo-500 dark:text-indigo-400";
    const inactiveLinkClass = "text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200";

    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined' && localStorage.getItem('theme')) {
            return localStorage.getItem('theme')!;
        }
        if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'dark'; // Default to dark
    });

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [theme]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

  return (
    <header className="py-4">
      <nav className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3">
            <LogoIcon />
            <span className="text-xl font-bold text-slate-900 dark:text-slate-200 hidden sm:block">Style Library</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 p-1 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-full transition-colors">
              <NavLink to="/" className={({isActive}) => `${isActive ? activeLinkClass : inactiveLinkClass} px-3 py-1.5 rounded-full text-sm font-medium transition-colors`}>Home</NavLink>
              <NavLink to="/leaderboard" className={({isActive}) => `${isActive ? activeLinkClass : inactiveLinkClass} px-3 py-1.5 rounded-full text-sm font-medium transition-colors`}>Leaderboard</NavLink>
              <NavLink to="/collections" className={({isActive}) => `${isActive ? activeLinkClass : inactiveLinkClass} px-3 py-1.5 rounded-full text-sm font-medium transition-colors`}>Collections</NavLink>
              <NavLink to="/create" className={({isActive}) => `${isActive ? activeLinkClass : inactiveLinkClass} px-3 py-1.5 rounded-full text-sm font-medium transition-colors`}>Create</NavLink>
          </div>
          <div className="flex items-center gap-2 p-1 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-full transition-colors">
              <button onClick={toggleTheme} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800" aria-label="Toggle theme">
                  {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              </button>
              <div className="relative" ref={dropdownRef}>
                {currentUser ? (
                    <button onClick={() => setDropdownOpen(!isDropdownOpen)} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
                        <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full" />
                    </button>
                ) : (
                    <Link to="/login" className="px-4 py-1.5 rounded-full text-sm font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition-colors">Login</Link>
                )}
                {isDropdownOpen && currentUser && <UserDropdown user={currentUser} onLogout={logout} onClose={() => setDropdownOpen(false)} />}
              </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;