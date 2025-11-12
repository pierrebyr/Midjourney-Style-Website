import React from 'react';
import { useToast, toastStore, ToastMessage } from '../hooks/useToast';

const Toast: React.FC<{ message: ToastMessage, onDismiss: (id: number) => void }> = ({ message, onDismiss }) => {
    React.useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(message.id);
        }, 3000);
        return () => clearTimeout(timer);
    }, [message.id, onDismiss]);

    const baseClasses = "flex items-center w-full max-w-xs p-4 my-2 text-slate-800 dark:text-slate-200 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg transition-all transform animate-fade-in-down";
    const typeClasses = {
        success: "text-green-500",
        error: "text-red-500",
        warning: "text-yellow-500",
    };
    const Icon = {
        success: () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>,
        error: () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>,
        warning: () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.636-1.213 2.45-1.213 3.086 0l6.24 11.858c.636 1.213-.273 2.71-1.543 2.71H3.56c-1.27 0-2.179-1.497-1.543-2.71l6.24-11.858zM10 14a1 1 0 110-2 1 1 0 010 2zm-1-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>,
    };
    
    const IconComponent = Icon[message.type];

    return (
        <div className={baseClasses} role="alert">
            <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 ${typeClasses[message.type]}`}>
                <IconComponent />
            </div>
            <div className="ml-3 text-sm font-medium">{message.message}</div>
            <button type="button" onClick={() => onDismiss(message.id)} className="ml-auto -mx-1.5 -my-1.5 text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-slate-100 rounded-lg focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 inline-flex h-8 w-8" aria-label="Close">
                <span className="sr-only">Close</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
            </button>
        </div>
    );
};


export const Toaster: React.FC = () => {
    const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

    React.useEffect(() => {
        const unsubscribe = toastStore.subscribe(setToasts);
        return () => unsubscribe();
    }, []);

    const handleDismiss = (id: number) => {
        toastStore.removeToast(id);
    };

    return (
        <div className="fixed top-5 right-5 z-50">
            {toasts.map((toast) => (
                <Toast key={toast.id} message={toast} onDismiss={handleDismiss} />
            ))}
        </div>
    );
};