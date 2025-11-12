import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Collection } from '../types';
import { useStyleContext } from '../context/StyleContext';

const CollectionIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" viewBox="0 0 20 20" fill="currentColor">
        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
    </svg>
);


const CollectionCard: React.FC<{ collection: Collection }> = ({ collection }) => {
    const navigate = useNavigate();
    const { styles } = useStyleContext();

    const previewStyles = collection.styleIds.slice(0, 4).map(id => styles.find(s => s.id === id)).filter(Boolean);

    return (
        <div
            onClick={() => navigate(`/collections/${collection.id}`)}
            className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-1 group cursor-pointer"
        >
            <div className="aspect-video bg-slate-100 dark:bg-slate-950 grid grid-cols-2 grid-rows-2 gap-0.5">
                {previewStyles.length > 0 ? (
                    <>
                    {previewStyles.map(style => (
                        <div key={style!.id} className="overflow-hidden">
                            <img src={style!.images[style!.mainImageIndex]} alt={style!.title} className="w-full h-full object-cover" />
                        </div>
                    ))}
                    {Array.from({ length: 4 - previewStyles.length }).map((_, i) => (
                        <div key={`placeholder-${i}`} className="bg-slate-200 dark:bg-slate-900"></div>
                    ))}
                    </>
                ) : (
                    <div className="col-span-2 row-span-2 flex items-center justify-center bg-slate-200 dark:bg-slate-900 text-slate-400 dark:text-slate-600 p-4">
                        <CollectionIcon />
                    </div>
                )}
            </div>
            <div className="p-4">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 truncate">{collection.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 h-10 overflow-hidden [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
                    {collection.description || 'No description.'}
                </p>
                 <div className="mt-2 text-xs text-slate-400 dark:text-slate-500 font-mono">
                    {collection.styleIds.length} {collection.styleIds.length === 1 ? 'style' : 'styles'}
                </div>
            </div>
        </div>
    );
};

export default CollectionCard;
