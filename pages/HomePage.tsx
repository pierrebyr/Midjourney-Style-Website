
import React, { useState, useMemo } from 'react';
import { useStyleContext } from '../context/StyleContext';
import StyleCard from '../components/StyleCard';
import { Style } from '../types';
import { useDebounce } from '../hooks/useDebounce';

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
);

const FilterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
    </svg>
);


const HomePage: React.FC = () => {
  const { styles } = useStyleContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'views' | 'likes' | 'az'>('newest');

  // FIXED: Debounce search term to avoid re-rendering on every keystroke
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const [showFilters, setShowFilters] = useState(false);
  const [filterAr, setFilterAr] = useState('');
  const [filterModel, setFilterModel] = useState('');
  const [filterStylize, setFilterStylize] = useState(0);
  const [filterChaos, setFilterChaos] = useState(0);

  const availableArs = useMemo(() => {
    const ars = new Set(styles.map(s => s.params.ar).filter((ar): ar is string => typeof ar === 'string'));
    return Array.from(ars).sort();
  }, [styles]);

  const availableModels = useMemo(() => {
    const models = new Set(styles.map(s => s.params.model).filter((model): model is string => typeof model === 'string'));
    return Array.from(models).sort();
  }, [styles]);
  
  const handleResetFilters = () => {
    setFilterAr('');
    setFilterModel('');
    setFilterStylize(0);
    setFilterChaos(0);
    setSearchTerm('');
  };

  const filteredAndSortedStyles = useMemo(() => {
    let processedStyles = [...styles];

    // Text Search Filter (using debounced value)
    if (debouncedSearchTerm) {
      const lowerCaseSearch = debouncedSearchTerm.toLowerCase();
      processedStyles = processedStyles.filter(style =>
        style.title.toLowerCase().includes(lowerCaseSearch) ||
        style.sref.includes(lowerCaseSearch) ||
        style.tags.some(tag => tag.toLowerCase().includes(lowerCaseSearch))
      );
    }
    
    // Advanced Filters
    if (filterAr) {
        processedStyles = processedStyles.filter(style => style.params.ar === filterAr);
    }
    if (filterModel) {
        processedStyles = processedStyles.filter(style => style.params.model === filterModel);
    }
    if (filterStylize > 0) {
        processedStyles = processedStyles.filter(style => (style.params.stylize || 0) >= filterStylize);
    }
    if (filterChaos > 0) {
        processedStyles = processedStyles.filter(style => (style.params.chaos || 0) >= filterChaos);
    }

    // Sort
    processedStyles.sort((a, b) => {
      switch (sortBy) {
        case 'views':
          return b.views - a.views;
        case 'likes':
          return b.likes - a.likes;
        case 'az':
          return a.title.localeCompare(b.title);
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return processedStyles;
  }, [styles, debouncedSearchTerm, sortBy, filterAr, filterModel, filterStylize, filterChaos]);

  const activeFilterCount = [filterAr, filterModel, filterStylize > 0, filterChaos > 0].filter(Boolean).length;

  return (
    <div className="space-y-12">
      <div className="text-center pt-8 pb-4">
        <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
          Midjourney Style Library
        </h1>
        <p className="mt-4 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Discover, search, and copy unique Midjourney style references to fuel your creativity.
        </p>
      </div>

      <div className="sticky top-4 z-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-4 transition-colors">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search by title, --sref, or tags..."
              className="w-full pl-10 pr-4 py-2.5 border rounded-lg bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <SearchIcon />
            </div>
          </div>
          <div className="flex gap-4">
            <select
                className="w-full md:w-auto px-4 py-2.5 border rounded-lg bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'views' | 'likes' | 'az')}
            >
                <option value="newest">Sort by Newest</option>
                <option value="views">Sort by Most Viewed</option>
                <option value="likes">Sort by Most Liked</option>
                <option value="az">Sort by A-Z</option>
            </select>
            <button
                onClick={() => setShowFilters(!showFilters)}
                className={`relative w-full md:w-auto px-4 py-2.5 border rounded-lg flex items-center justify-center gap-2 transition-colors ${showFilters ? 'bg-indigo-100 dark:bg-indigo-900/50 border-indigo-300 dark:border-indigo-700' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700'} text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none`}
            >
                <FilterIcon />
                <span>Filters</span>
                {activeFilterCount > 0 && <span className="absolute -top-2 -right-2 bg-indigo-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{activeFilterCount}</span>}
            </button>
          </div>
        </div>
        {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 animate-fade-in-down">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Aspect Ratio Filter */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Aspect Ratio</label>
                        <select value={filterAr} onChange={e => setFilterAr(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-1 focus:ring-brand-primary focus:border-transparent outline-none">
                            <option value="">All</option>
                            {availableArs.map(ar => <option key={ar} value={ar}>{ar}</option>)}
                        </select>
                    </div>
                    {/* Model Filter */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Model</label>
                        <select value={filterModel} onChange={e => setFilterModel(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-1 focus:ring-brand-primary focus:border-transparent outline-none">
                            <option value="">All</option>
                            {availableModels.map(model => <option key={model} value={model}>{model}</option>)}
                        </select>
                    </div>
                    {/* Stylize Filter */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Min Stylize: <span className="font-bold text-indigo-500 dark:text-indigo-400">{filterStylize}</span></label>
                        <input type="range" min="0" max="1000" step="50" value={filterStylize} onChange={e => setFilterStylize(Number(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                    </div>
                     {/* Chaos Filter */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Min Chaos: <span className="font-bold text-indigo-500 dark:text-indigo-400">{filterChaos}</span></label>
                        <input type="range" min="0" max="100" step="5" value={filterChaos} onChange={e => setFilterChaos(Number(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <button onClick={handleResetFilters} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                        Reset Filters
                    </button>
                </div>
            </div>
        )}
      </div>
      
      {filteredAndSortedStyles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredAndSortedStyles.map((style: Style) => (
            <StyleCard key={style.id} style={style} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-slate-600 dark:text-slate-300">No Styles Found</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
};

export default HomePage;