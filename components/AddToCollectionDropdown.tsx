import React, { useEffect, useRef } from 'react';
import { useStyleContext } from '../context/StyleContext';
import { useToast } from '../hooks/useToast';

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

interface AddToCollectionDropdownProps {
    styleId: string;
    onClose: () => void;
    onOpenCreateModal: () => void;
    parentRef: React.RefObject<HTMLElement>;
    align?: 'left' | 'right';
}

const AddToCollectionDropdown: React.FC<AddToCollectionDropdownProps> = ({ styleId, onClose, onOpenCreateModal, parentRef, align = 'left' }) => {
    const { collections, isStyleInCollection, toggleStyleInCollection } = useStyleContext();
    const { addToast } = useToast();
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                parentRef.current &&
                !parentRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose, parentRef]);

    const handleToggle = (collectionId: string, collectionName: string) => {
        const wasInCollection = isStyleInCollection(styleId, collectionId);
        toggleStyleInCollection(styleId, collectionId);
        if (wasInCollection) {
            addToast(`Removed from "${collectionName}"`, 'success');
        } else {
            addToast(`Added to "${collectionName}"`, 'success');
        }
    };

    const alignmentClass = align === 'right' ? 'right-0' : 'left-0';

    return (
        <div
            ref={dropdownRef}
            className={`absolute top-full mt-2 ${alignmentClass} w-64 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-20 animate-fade-in-down overflow-hidden`}
        >
            <div className="p-2 border-b border-slate-200 dark:border-slate-700">
                <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 px-2">Add to Collection</h4>
            </div>
            <div className="max-h-48 overflow-y-auto">
                {collections.length > 0 ? (
                    collections.map(collection => (
                        <button
                            key={collection.id}
                            onClick={() => handleToggle(collection.id, collection.name)}
                            className="w-full text-left px-4 py-2 text-sm flex items-center justify-between text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            <span className="truncate">{collection.name}</span>
                            {isStyleInCollection(styleId, collection.id) && <CheckIcon />}
                        </button>
                    ))
                ) : (
                    <p className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">No collections yet.</p>
                )}
            </div>
            <div className="p-2 border-t border-slate-200 dark:border-slate-700">
                <button
                    onClick={onOpenCreateModal}
                    className="w-full flex items-center px-2 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
                >
                    <PlusIcon /> Create new collection
                </button>
            </div>
        </div>
    );
};

export default AddToCollectionDropdown;
