import { Collection } from '../types';

export const MOCK_COLLECTIONS: Collection[] = [
  {
    id: 'coll-1',
    name: 'Anime & Illustration',
    description: 'A collection of vibrant and expressive anime-style references.',
    styleIds: ['1', '4'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'coll-2',
    name: 'Cinematic Shots',
    description: 'Styles for creating moody, film-like, and dramatic scenes.',
    styleIds: ['2', '6'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'coll-3',
    name: 'Futuristic & Sci-Fi',
    description: 'Blueprints, synthwave, and graffiti for all things futuristic.',
    styleIds: ['3', '5', '6'],
    createdAt: new Date().toISOString(),
  },
];
