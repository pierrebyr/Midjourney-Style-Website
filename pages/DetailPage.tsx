
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStyleContext } from '../context/StyleContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import AddToCollectionDropdown from '../components/AddToCollectionDropdown';
import CollectionModal from '../components/CollectionModal';
import CommentSection from '../components/CommentSection';

const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2H6z" /></svg>;
const BookmarkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-3.13L5 18V4z" /></svg>;
const HeartIcon = ({ filled }: { filled: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" className={filled ? "text-red-500" : "text-slate-500"} clipRule="evenodd" />
    </svg>
);

const BentoBox: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-lg ${className}`}>
        {children}
    </div>
);

const ParamItem: React.FC<{ label: string; value?: string | number | boolean }> = ({ label, value }) => {
    if (value === undefined || value === null || value === false && typeof value === 'boolean') return null;
    const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;
    return (
        <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-800 last:border-b-0">
            <span className="text-slate-500 dark:text-slate-400">{label}</span>
            <span className="font-mono text-indigo-500 dark:text-indigo-400 font-semibold">{displayValue}</span>
        </div>
    );
};

const DetailPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { styles, incrementViewCount, toggleLike } = useStyleContext();
    const { addToast } = useToast();
    const { currentUser, getUserById } = useAuth();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isCollectionDropdownOpen, setCollectionDropdownOpen] = useState(false);
    const [isCollectionModalOpen, setCollectionModalOpen] = useState(false);
    const collectionBtnRef = useRef<HTMLButtonElement>(null);

    const style = useMemo(() => {
        if (!slug) return undefined;
        return styles.find(s => s.slug === slug);
    }, [slug, styles]);
    
    const creator = useMemo(() => {
        if (!style) return undefined;
        return getUserById(style.creatorId);
    }, [style, getUserById]);

    useEffect(() => {
        if (slug) {
            incrementViewCount(slug);
        }
    }, [slug, incrementViewCount]);

    if (!style) {
        return (
            <div className="text-center py-20">
                <h2 className="text-3xl font-bold">Style Not Found</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-4">The style you're looking for doesn't exist.</p>
                <Link to="/" className="mt-6 inline-block bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-secondary transition-colors">
                    Back to Home
                </Link>
            </div>
        );
    }
    
    const copyToClipboard = (text: string, message: string) => {
        navigator.clipboard.writeText(text).then(() => {
            addToast(message, 'success');
        }).catch(() => {
            addToast('Failed to copy!', 'error');
        });
    };

    const handleLikeClick = () => {
        if (!currentUser) {
            addToast('Please log in to like styles.', 'warning');
            return;
        }
        toggleLike(style.id);
    };

    const isLiked = currentUser ? style.likedBy.includes(currentUser.id) : false;
    const srefValue = `--sref ${style.sref}`;
    const rawParams = style.params.raw || srefValue;

    return (
        <>
        <div className="max-w-7xl mx-auto">
            <Link to="/" className="inline-flex items-center gap-2 text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 mb-8 transition-colors">
                <ChevronLeftIcon /> Back to all styles
            </Link>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <BentoBox>
                        <div className="flex justify-between items-start">
                           <div>
                                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 mb-2">{style.title}</h1>
                                {creator && (
                                     <Link to={`/profile/${creator.id}`} className="flex items-center gap-2 group mb-4">
                                        <img src={creator.avatar} alt={creator.name} className="w-8 h-8 rounded-full border-2 border-slate-300 dark:border-slate-700" />
                                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 group-hover:text-indigo-500 dark:group-hover:text-indigo-400">By {creator.name}</span>
                                    </Link>
                                )}
                           </div>
                           <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                               <button onClick={handleLikeClick} className="flex items-center gap-1.5 p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                                  <HeartIcon filled={isLiked} />
                                  <span className="font-semibold">{style.likes.toLocaleString()}</span>
                               </button>
                           </div>
                        </div>
                        
                        {style.description && <p className="text-slate-600 dark:text-slate-400">{style.description}</p>}
                        <div className="flex flex-wrap gap-2 mt-4">
                            {style.tags.map(tag => (
                                <span key={tag} className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold px-2.5 py-1 rounded-full">{tag}</span>
                            ))}
                        </div>
                    </BentoBox>
                     <BentoBox>
                         <div className="grid grid-cols-2 gap-4">
                             {style.images.map((img, index) => (
                                <div key={index} className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden group">
                                    <img
                                        src={img}
                                        alt={`Style ${style.title} image ${index + 1}`}
                                        className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-110"
                                        onClick={() => setSelectedImage(img)}
                                        aria-label={`View image ${index + 1} in full screen`}
                                    />
                                </div>
                            ))}
                        </div>
                    </BentoBox>
                </div>
                <div className="lg:col-span-1 space-y-8">
                    <BentoBox>
                        <h2 className="text-2xl font-bold mb-4">Parameters</h2>
                        <div className="space-y-1">
                            <ParamItem label="--sref" value={style.params.sref} />
                            <ParamItem label="Model" value={style.params.model} />
                            <ParamItem label="Version" value={style.params.version} />
                            <ParamItem label="Aspect Ratio" value={style.params.ar} />
                            <ParamItem label="Stylize" value={style.params.stylize} />
                            <ParamItem label="Chaos" value={style.params.chaos} />
                            <ParamItem label="Weird" value={style.params.weird} />
                            <ParamItem label="Seed" value={style.params.seed} />
                            <ParamItem label="Tile" value={style.params.tile} />
                        </div>
                    </BentoBox>

                    <BentoBox>
                        <h3 className="text-lg font-bold mb-2">Raw Parameters</h3>
                        <pre className="bg-slate-100 dark:bg-slate-950 p-3 rounded-md text-sm whitespace-pre-wrap font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800">{rawParams}</pre>
                    </BentoBox>

                    <div className="space-y-4">
                        <div className="flex gap-4">
                             <button 
                                onClick={() => copyToClipboard(srefValue, 'Copied --sref value!')}
                                className="flex-grow flex items-center justify-center gap-2 w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-3 px-4 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all transform hover:scale-105 shadow-lg"
                            >
                                <CopyIcon /> Copy --sref
                            </button>
                             <div className="relative">
                                <button
                                    ref={collectionBtnRef}
                                    onClick={() => setCollectionDropdownOpen(prev => !prev)}
                                    className="flex items-center justify-center p-3 h-full bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-all transform hover:scale-105"
                                >
                                    <BookmarkIcon />
                                </button>
                                {isCollectionDropdownOpen && (
                                    <AddToCollectionDropdown
                                        styleId={style.id}
                                        onClose={() => setCollectionDropdownOpen(false)}
                                        onOpenCreateModal={() => {
                                            setCollectionDropdownOpen(false);
                                            setCollectionModalOpen(true);
                                        }}
                                        parentRef={collectionBtnRef}
                                        align="right"
                                    />
                                )}
                            </div>
                        </div>
                         <button 
                            onClick={() => copyToClipboard(rawParams, 'Copied full prompt block!')}
                            className="flex items-center justify-center gap-2 w-full bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-all transform hover:scale-105"
                        >
                            <CopyIcon /> Copy Full Block
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-12">
                <CommentSection styleId={style.id} />
            </div>

            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/80 dark:bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm"
                    onClick={() => setSelectedImage(null)}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Image lightbox"
                >
                    <button
                        className="absolute top-4 right-4 text-white text-5xl leading-none font-thin hover:text-gray-300 z-10"
                        onClick={() => setSelectedImage(null)}
                        aria-label="Close lightbox"
                    >
                        &times;
                    </button>
                    <img
                        src={selectedImage}
                        alt="Enlarged style image"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
        <CollectionModal 
            isOpen={isCollectionModalOpen}
            onClose={() => setCollectionModalOpen(false)}
        />
        </>
    );
};

export default DetailPage;
