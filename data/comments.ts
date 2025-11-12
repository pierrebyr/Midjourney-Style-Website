
import { Comment } from '../types';

export const MOCK_COMMENTS: Comment[] = [
    {
        id: 'comment-1',
        styleId: '1',
        authorId: 'user-2',
        text: 'This style is incredible for character splash art. The colors just pop!',
        createdAt: '2023-10-26T11:00:00Z',
    },
    {
        id: 'comment-2',
        styleId: '1',
        authorId: 'user-3',
        text: 'Wow, I love the energy. Tried it on a landscape and got some really interesting, dynamic results.',
        createdAt: '2023-10-26T12:30:00Z',
    },
    {
        id: 'comment-3',
        styleId: '2',
        authorId: 'user-1',
        text: 'Perfect for setting a moody scene. The contrast is just right.',
        createdAt: '2023-10-25T15:00:00Z',
    },
    {
        id: 'comment-4',
        styleId: '3',
        authorId: 'user-2',
        text: 'This sref is a blast from the past! Absolutely nailed the 80s vibe. The chrome it generates is top-notch.',
        createdAt: '2023-10-24T10:00:00Z',
    }
];
