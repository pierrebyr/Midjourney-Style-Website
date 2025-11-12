
import { User } from '../types';

export const MOCK_USERS: User[] = [
    {
        id: 'user-1',
        name: 'Alex "Anime" Anderson',
        email: 'alex@example.com',
        password: 'password123',
        avatar: 'https://i.pravatar.cc/150?u=user1',
        bio: 'Lover of all things vibrant and animated. Specializing in Niji styles and expressive character art. Always pushing the boundaries of color.',
        followers: ['user-2', 'user-3'],
        following: ['user-2', 'user-3'],
    },
    {
        id: 'user-2',
        name: 'Ben "Blueprint" Carter',
        email: 'ben@example.com',
        password: 'password123',
        avatar: 'https://i.pravatar.cc/150?u=user2',
        bio: 'Architect by day, AI artist by night. My passion is creating detailed schematics and clean, technical visuals. I find beauty in the lines.',
        followers: ['user-1'],
        following: ['user-1', 'user-3'],
    },
    {
        id: 'user-3',
        name: 'Casey "Cinematic" Davis',
        email: 'casey@example.com',
        password: 'password123',
        avatar: 'https://i.pravatar.cc/150?u=user3',
        bio: 'Chasing the perfect frame. My work is inspired by film noir, synthwave aesthetics, and gritty urban landscapes. It\'s all about the mood.',
        followers: ['user-1', 'user-2'],
        following: ['user-1'],
    },
];