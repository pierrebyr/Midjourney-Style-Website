
import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStyleContext } from '../context/StyleContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { Style, MidjourneyParams } from '../types';
import { parseMidjourneyParams } from '../services/geminiService';
import { validateImageSize, validateTotalImagesSize } from '../utils/validation';
import { getUserFriendlyMessage } from '../utils/errorHandling';

const LoadingSpinner = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0V6h-1a1 1 0 110-2h1V3a1 1 0 011-1zm7 6a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1V9a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
);

const UploadIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
);

const XCircleIcon = ({className = "h-4 w-4"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
);

const ParamItem: React.FC<{ label: string; value?: string | number | boolean }> = ({ label, value }) => {
    if (value === undefined || value === null || value === false && typeof value === 'boolean') return null;
    const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;
    return (
        <div className="flex justify-between items-center py-2 text-sm border-b border-slate-200 dark:border-slate-800 last:border-b-0">
            <span className="text-slate-500 dark:text-slate-400">{label}</span>
            <span className="font-mono text-indigo-500 dark:text-indigo-400 font-semibold">{String(displayValue)}</span>
        </div>
    );
};

const CreatePage: React.FC = () => {
    const navigate = useNavigate();
    const { addStyle } = useStyleContext();
    const { currentUser } = useAuth();
    const { addToast } = useToast();
    
    const [title, setTitle] = useState('');
    const [sref, setSref] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [mainImageIndex] = useState(0);
    const [rawParams, setRawParams] = useState('');
    const [parsedParams, setParsedParams] = useState<Partial<MidjourneyParams>>({});
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    
    const formInputClasses = "mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100 transition-colors";
    
    const isSubmitDisabled = useMemo(() => {
        return !title || !sref || images.length === 0;
    }, [title, sref, images]);

    const handleParseParams = useCallback(async () => {
        if (!rawParams) {
            addToast('Please paste the raw Midjourney parameters first.', 'warning');
            return;
        }
        setIsParsing(true);
        setParsedParams({});
        try {
            const params = await parseMidjourneyParams(rawParams);
            setParsedParams(params);
            if (params.sref && !sref) setSref(params.sref);
            addToast('Parameters parsed successfully!', 'success');
        } catch (error) {
            console.error(error);
            addToast(error instanceof Error ? error.message : 'Failed to parse parameters.', 'error');
            setParsedParams({ raw: rawParams });
        } finally {
            setIsParsing(false);
        }
    }, [rawParams, addToast, sref]);

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = tagInput.trim().replace(/,/g, '');
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setTagInput('');
        }
    };
    
    const removeTag = (indexToRemove: number) => {
        setTags(tags.filter((_, index) => index !== indexToRemove));
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Validate file type
            if (!file.type.startsWith('image/')) {
                addToast('Please select an image file.', 'error');
                return;
            }

            // Check file size before conversion (max 5MB)
            const fileSizeMB = file.size / (1024 * 1024);
            if (fileSizeMB > 5) {
                addToast(`Image file size (${fileSizeMB.toFixed(2)}MB) exceeds 5MB limit. Please compress the image.`, 'error');
                return;
            }

            try {
                const base64 = await fileToBase64(file);

                // Validate base64 size
                const sizeValidation = validateImageSize(base64, 5);
                if (!sizeValidation.valid) {
                    addToast(sizeValidation.error || 'Image too large', 'error');
                    return;
                }

                const newImages = [...images, base64];

                // Validate total images size (max 15MB total)
                const totalValidation = validateTotalImagesSize(newImages, 15);
                if (!totalValidation.valid) {
                    addToast(totalValidation.error || 'Total images size too large', 'warning');
                    return;
                }

                setImages(newImages);
                addToast(`Image added (${sizeValidation.sizeMB.toFixed(2)}MB). Total: ${totalValidation.totalSizeMB.toFixed(2)}MB / 15MB`, 'success');
            } catch (error) {
                console.error('Image upload error:', error);
                addToast('Failed to read image file.', 'error');
            }
        }
    };

    const removeImage = (indexToRemove: number) => {
        setImages(prevImages => prevImages.filter((_, index) => index !== indexToRemove));
        // FIXED: If removing the first image, mainImageIndex should remain 0 (next image becomes main)
        // This is already handled correctly since we always use index 0 as main
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (!currentUser) {
                addToast('You must be logged in to create a style.', 'error');
                navigate('/login');
                return;
            }

            if (!title || !sref || images.length === 0) {
                addToast('Please fill in Title, --sref, and upload at least one Image.', 'error');
                return;
            }

            // Final validation of total images size
            const totalValidation = validateTotalImagesSize(images, 15);
            if (!totalValidation.valid) {
                addToast(totalValidation.error || 'Total images size too large', 'error');
                return;
            }

            const newStyle: Omit<Style, 'id' | 'slug' | 'views' | 'likes' | 'likedBy' | 'creatorId' | 'createdAt' | 'updatedAt'> = {
                title,
                sref,
                images: images,
                mainImageIndex,
                params: { ...parsedParams, sref, raw: rawParams },
                description,
                tags,
            };

            addStyle(newStyle);
            addToast('New style created successfully!', 'success');
            navigate('/');
        } catch (error) {
            const errorMessage = getUserFriendlyMessage(error as Error);
            addToast(errorMessage, 'error');
        }
    };

    const Section: React.FC<{title: string, subtitle: string, children: React.ReactNode, step: number}> = ({title, subtitle, children, step}) => (
        <section className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-lg">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-lg">{step}</div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{title}</h2>
                    <p className="mt-1 text-slate-500 dark:text-slate-400">{subtitle}</p>
                </div>
            </div>
            <div className="mt-6 pl-14">
                {children}
            </div>
        </section>
    );

    return (
        <div className="max-w-4xl mx-auto animate-fade-in-down">
            <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Add a New Style</h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Contribute to the library by sharing your favorite Midjourney styles.</p>
            </div>
            
            {!currentUser ? (
                <div className="text-center py-16 bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                    <h2 className="text-2xl font-bold text-slate-600 dark:text-slate-300">Please Log In</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 mb-6">You need to be logged in to contribute a new style.</p>
                    <Link to="/login" className="inline-flex justify-center py-3 px-8 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all">
                        Log In
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    <Section step={1} title="Start with the Prompt" subtitle="Paste your full Midjourney prompt. We'll use Gemini to extract the parameters for you.">
                        <textarea id="rawParams" rows={4} value={rawParams} onChange={e => setRawParams(e.target.value)} placeholder="e.g., a vibrant anime scene --ar 4:3 --sref 1932367332 --stylize 250 --v 6.0" className={formInputClasses}></textarea>
                        <button type="button" onClick={handleParseParams} disabled={isParsing || !rawParams} className="mt-3 flex items-center justify-center gap-2 w-full md:w-auto px-5 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-secondary hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-brand-secondary disabled:bg-slate-500 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition-all">
                            {isParsing ? <LoadingSpinner/> : <><SparklesIcon /> Parse with Gemini AI</>}
                        </button>
                        {Object.keys(parsedParams).filter(k => k !== 'raw').length > 0 && (
                            <div className="mt-6 bg-slate-100 dark:bg-slate-950/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800 animate-fade-in">
                                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Parsed Parameters:</h3>
                                <div className="space-y-1">
                                    {Object.entries(parsedParams).map(([key, value]) => {
                                        if(key === 'raw') return null;
                                        const label = `--${key}`;
                                        return <ParamItem key={key} label={label} value={value as string | number | boolean | undefined} />
                                    })}
                                </div>
                            </div>
                        )}
                    </Section>

                    <Section step={2} title="Add the Details" subtitle="Provide the essential information that describes this style.">
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Title*</label>
                                    <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className={formInputClasses} placeholder="e.g., Vibrant Anime Vignette" />
                                </div>
                                <div>
                                    <label htmlFor="sref" className="block text-sm font-medium text-slate-700 dark:text-slate-300">--sref Value*</label>
                                    <input type="text" id="sref" value={sref} onChange={e => setSref(e.target.value)} required className={formInputClasses} placeholder="e.g., 1932367332"/>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description / Notes</label>
                                <textarea id="description" rows={3} value={description} onChange={e => setDescription(e.target.value)} className={formInputClasses} placeholder="What makes this style unique? What is it good for?"></textarea>
                            </div>
                            <div>
                                <label htmlFor="tags" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tags</label>
                                <div className="flex flex-wrap items-center gap-2 mt-1 p-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                                    {tags.map((tag, index) => (
                                        <span key={index} className="flex items-center gap-1.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-sm font-medium px-2 py-1 rounded-md animate-fade-in">
                                            {tag}
                                            <button type="button" onClick={() => removeTag(index)} className="text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-200" aria-label={`Remove tag ${tag}`}>
                                                <XCircleIcon />
                                            </button>
                                        </span>
                                    ))}
                                    <input
                                        type="text"
                                        id="tags"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={handleTagKeyDown}
                                        placeholder={tags.length === 0 ? "Add tags (e.g., anime, retro)..." : "Add another..."}
                                        className="flex-grow bg-transparent border-none focus:ring-0 p-1 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Press Enter or comma to add a tag.</p>
                            </div>
                        </div>
                    </Section>

                    <Section step={3} title="Showcase the Visuals" subtitle="Upload up to 4 images. The first image will be the main cover for the style card.">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {images.map((img, index) => (
                                <div key={index} className="relative aspect-square rounded-lg group overflow-hidden border-2 border-slate-300 dark:border-slate-700">
                                    <img 
                                        src={img} 
                                        alt={`Preview ${index + 1}`} 
                                        className="w-full h-full object-cover"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => removeImage(index)} 
                                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                                        aria-label={`Remove image ${index + 1}`}
                                    >
                                        <XCircleIcon className="h-6 w-6"/>
                                    </button>
                                    {index === 0 && <div className="absolute top-2 left-2 text-xs font-bold bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">Main</div>}
                                </div>
                            ))}

                            {images.length < 4 && (
                                <div className="relative aspect-square bg-slate-100 dark:bg-slate-950/50 rounded-lg group border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                                    <label htmlFor="image-upload" className="w-full h-full flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800/50 transition-colors p-2">
                                        <UploadIcon />
                                        <span className="mt-2 text-xs text-slate-500 dark:text-slate-400">Upload Image</span>
                                        <input
                                            id="image-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                            key={images.length}
                                        />
                                    </label>
                                </div>
                            )}
                        </div>
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">*At least one image is required.</p>
                    </Section>

                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={isSubmitDisabled} className="inline-flex justify-center py-3 px-8 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-all disabled:from-slate-400 disabled:to-slate-400 dark:disabled:from-slate-600 dark:disabled:to-slate-600 disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100">
                            Publish Style
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default CreatePage;