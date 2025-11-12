
import { useState, useEffect } from 'react';

export interface ToastMessage {
    id: number;
    message: string;
    type: 'success' | 'error' | 'warning';
}

type ToastListener = (toasts: ToastMessage[]) => void;

let toasts: ToastMessage[] = [];
let listeners: ToastListener[] = [];
let idCounter = 0;

const broadcast = () => {
    listeners.forEach((listener) => {
        listener([...toasts]);
    });
};

export const toastStore = {
    addToast(message: string, type: ToastMessage['type'] = 'success') {
        toasts.push({ id: idCounter++, message, type });
        broadcast();
    },
    removeToast(id: number) {
        toasts = toasts.filter((toast) => toast.id !== id);
        broadcast();
    },
    subscribe(listener: ToastListener): () => void {
        listeners.push(listener);
        return () => {
            listeners = listeners.filter((l) => l !== listener);
        };
    },
};

export const useToast = () => {
    return {
        addToast: toastStore.addToast,
    };
};
