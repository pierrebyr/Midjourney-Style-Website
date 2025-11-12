import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStyleContext } from '../context/StyleContext';
import StyleCard from '../components/StyleCard';
import { useToast } from '../hooks/useToast';
import CollectionModal from '../components/CollectionModal';
import ConfirmationModal from '../components/ConfirmationModal';

const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

const CollectionDetailPage: React.FC = () => {
    const { collectionId } = useParams<{ collectionId: string }>();
    const { getCollectionById, styles, deleteCollection } = useStyleContext();
    const { addToast } = useToast();
    const navigate = useNavigate();
    
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

    const collection = useMemo(() => {
        if (!collectionId) return undefined;
        return getCollectionById(collectionId);
    }, [collectionId, getCollectionById]);

    const collectionStyles = useMemo(() => {
        if (!collection) return [];
        return collection.styleIds.map(styleId => styles.find(s => s.id === styleId)).filter(Boolean);
    }, [collection, styles]);

    const handleDelete = () => {
        if (collection) {
            deleteCollection(collection.id);
            addToast(`Collection "${collection.name}" deleted.`, 'success');
            navigate('/collections');
        }
    };
    
    if (!collection) {
        return (
            <div className="text-center py-20">
                <h2 className="text-3xl font-bold">Collection Not Found</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-4">The collection you're looking for doesn't exist.</p>
                <Link to="/collections" className="mt-6 inline-block bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-secondary transition-colors">
                    Back to Collections
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-12">
                 <Link to="/collections" className="inline-flex items-center gap-2 text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 mb-8 transition-colors">
                    <ChevronLeftIcon /> Back to all collections
                </Link>
                <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-lg">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 mb-2">{collection.name}</h1>
                            <p className="text-slate-600 dark:text-slate-400">{collection.description}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            <button onClick={() => setEditModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-800 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                                <EditIcon /> Edit
                            </button>
                            <button onClick={() => setDeleteModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-100 bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
                                <TrashIcon /> Delete
                            </button>
                        </div>
                    </div>
                </div>

                 {collectionStyles.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {collectionStyles.map((style) => (
                           style && <StyleCard key={style.id} style={style} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                        <h2 className="text-2xl font-bold text-slate-600 dark:text-slate-300">This Collection is Empty</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Add styles to this collection from the home page or style detail pages.</p>
                         <Link to="/" className="mt-6 inline-block bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-secondary transition-colors">
                            Find Styles
                        </Link>
                    </div>
                )}
            </div>
            <CollectionModal 
                isOpen={isEditModalOpen}
                onClose={() => setEditModalOpen(false)}
                collectionToEdit={collection}
            />
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Collection"
                message={`Are you sure you want to delete the "${collection.name}" collection? This action cannot be undone.`}
            />
        </>
    );
};

export default CollectionDetailPage;
