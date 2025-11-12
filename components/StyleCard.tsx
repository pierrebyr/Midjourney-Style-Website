
import React, { useState, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Style } from '../types';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../context/AuthContext';
import { useStyleContext } from '../context/StyleContext';
import AddToCollectionDropdown from './AddToCollectionDropdown';
import CollectionModal from './CollectionModal';

const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2H6z" /></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>;
const BookmarkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-3.13L5 18V4z" /></svg>;
const HeartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>;


const StyleCard: React.FC<{ style: Style }> = ({ style }) => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { getUserById } = useAuth();
  const [isCollectionDropdownOpen, setCollectionDropdownOpen] = useState(false);
  const [isCollectionModalOpen, setCollectionModalOpen] = useState(false);
  const collectionBtnRef = useRef<HTMLButtonElement>(null);

  const creator = useMemo(() => getUserById(style.creatorId), [style.creatorId, getUserById]);

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation when clicking on interactive elements like links or buttons
    if (e.target instanceof HTMLElement) {
      if (e.target.closest('a, button')) {
        return;
      }
    }
    navigate(`/s/${style.slug}`);
  };

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const srefValue = `--sref ${style.sref}`;
    navigator.clipboard.writeText(srefValue).then(() => {
        addToast('Copied --sref to clipboard!', 'success');
    }).catch(() => {
        addToast('Failed to copy!', 'error');
    });
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCollectionDropdownOpen(prev => !prev);
  }
  
  const imagesForGrid = style.images.slice(0, 4);

  return (
    <>
    <div 
        onClick={handleCardClick}
        className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-1 group cursor-pointer flex flex-col"
    >
      <div className="relative overflow-hidden aspect-square">
        {/* Main Image */}
        <img 
          src={style.images[style.mainImageIndex]} 
          alt={style.title} 
          className="w-full h-full object-cover transition-opacity duration-300"
        />
        
        {/* Gradient overlay for title readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 p-4 pointer-events-none">
             <h3 className="text-white text-lg font-bold drop-shadow-lg">{style.title}</h3>
        </div>

        {/* Action Icons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
            <button 
              onClick={handleCopyClick}
              aria-label="Copy --sref value"
              className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md text-slate-800 dark:text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/70 dark:hover:bg-slate-800/70 hover:scale-110"
            >
              <CopyIcon />
            </button>
             <button
              ref={collectionBtnRef}
              onClick={handleBookmarkClick}
              aria-label="Add to collection"
              className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md text-slate-800 dark:text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/70 dark:hover:bg-slate-800/70 hover:scale-110"
            >
              <BookmarkIcon />
            </button>
        </div>
        
        {isCollectionDropdownOpen && (
            <AddToCollectionDropdown 
                styleId={style.id}
                onClose={() => setCollectionDropdownOpen(false)}
                onOpenCreateModal={() => {
                    setCollectionDropdownOpen(false);
                    setCollectionModalOpen(true);
                }}
                parentRef={collectionBtnRef}
            />
        )}
      </div>
      
      <div className="p-4 bg-white/70 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex-grow flex flex-col justify-between">
          {creator && (
            <Link to={`/profile/${creator.id}`} className="flex items-center gap-2 mb-3 group">
              <img src={creator.avatar} alt={creator.name} className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-700" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">{creator.name}</span>
            </Link>
          )}
          <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
             <div className="flex flex-wrap gap-1">
                {style.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-xs bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">{tag}</span>
                ))}
            </div>
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                    <HeartIcon />
                    <span>{style.likes.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                    <EyeIcon />
                    <span>{style.views.toLocaleString()}</span>
                </div>
            </div>
        </div>
      </div>
    </div>
    <CollectionModal isOpen={isCollectionModalOpen} onClose={() => setCollectionModalOpen(false)} />
    </>
  );
};

export default StyleCard;
