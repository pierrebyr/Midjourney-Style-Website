import React, { useState, useEffect } from 'react';
import { useStyleContext } from '../context/StyleContext';
import { useToast } from '../hooks/useToast';
import { Collection } from '../types';

interface CollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    collectionToEdit?: Collection;
}

const CollectionModal: React.FC<CollectionModalProps> = ({ isOpen, onClose, collectionToEdit }) => {
    const { addCollection, updateCollection } = useStyleContext();
    const { addToast } = useToast();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const isEditMode = !!collectionToEdit;

    useEffect(() => {
        if (isEditMode) {
            setName(collectionToEdit.name);
            setDescription(collectionToEdit.description);
        } else {
            setName('');
            setDescription('');
        }
    }, [collectionToEdit, isEditMode, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            addToast('Collection name is required.', 'error');
            return;
        }

        if (isEditMode) {
            updateCollection(collectionToEdit.id, name, description);
            addToast('Collection updated successfully!', 'success');
        } else {
            addCollection(name, description);
            addToast('Collection created successfully!', 'success');
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 dark:bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-8 animate-fade-in-down"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">
                    {isEditMode ? 'Edit Collection' : 'Create New Collection'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="collection-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Name*
                        </label>
                        <input
                            type="text"
                            id="collection-name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100 transition-colors"
                            placeholder="e.g., Cinematic Shots"
                        />
                    </div>
                    <div>
                        <label htmlFor="collection-description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Description
                        </label>
                        <textarea
                            id="collection-description"
                            rows={3}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100 transition-colors"
                            placeholder="A brief description of this collection."
                        ></textarea>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-sm font-semibold rounded-md bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 text-sm font-semibold rounded-md text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-all disabled:from-slate-400"
                        >
                            {isEditMode ? 'Save Changes' : 'Create Collection'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CollectionModal;
