import React, { useState } from 'react';
import { useStyleContext } from '../context/StyleContext';
import CollectionCard from '../components/CollectionCard';
import CollectionModal from '../components/CollectionModal';

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
);

const CollectionsPage: React.FC = () => {
    const { collections } = useStyleContext();
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div className="space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 pb-4">
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
                            Your Collections
                        </h1>
                        <p className="mt-4 text-lg text-slate-500 dark:text-slate-400 max-w-2xl">
                            Curate and organize your favorite styles into personalized collections.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex-shrink-0 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-3 px-6 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all transform hover:scale-105 shadow-lg"
                    >
                        <PlusIcon /> New Collection
                    </button>
                </div>

                {collections.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {collections.map(collection => (
                            <CollectionCard key={collection.id} collection={collection} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                        <h2 className="text-2xl font-bold text-slate-600 dark:text-slate-300">No Collections Yet</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Click "New Collection" to get started.</p>
                    </div>
                )}
            </div>
            <CollectionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
};

export default CollectionsPage;
