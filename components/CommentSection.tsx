
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStyleContext } from '../context/StyleContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';

const CommentSection: React.FC<{ styleId: string }> = ({ styleId }) => {
    const { getCommentsForStyle, addComment } = useStyleContext();
    const { currentUser, users } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const comments = useMemo(() => getCommentsForStyle(styleId), [styleId, getCommentsForStyle]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        if (!currentUser) {
            navigate('/login');
            return;
        }

        setIsSubmitting(true);
        try {
            addComment(styleId, newComment);
            setNewComment('');
            addToast('Comment posted!', 'success');
        } catch (error) {
            addToast('Failed to post comment.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">Comments ({comments.length})</h2>
            
            <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
                {comments.length > 0 ? comments.map(comment => {
                    const author = users.find(u => u.id === comment.authorId);
                    if (!author) return null;
                    return (
                        <div key={comment.id} className="flex gap-4">
                            <Link to={`/profile/${author.id}`}>
                                <img src={author.avatar} alt={author.name} className="w-10 h-10 rounded-full flex-shrink-0" />
                            </Link>
                            <div>
                                <div className="flex items-center gap-2">
                                    <Link to={`/profile/${author.id}`} className="font-semibold text-slate-700 dark:text-slate-200 hover:underline">{author.name}</Link>
                                    <span className="text-xs text-slate-400 dark:text-slate-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 mt-1">{comment.text}</p>
                            </div>
                        </div>
                    );
                }) : (
                    <p className="text-slate-500 dark:text-slate-400 text-center py-4">Be the first to comment!</p>
                )}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                {currentUser ? (
                    <form onSubmit={handleSubmit} className="flex gap-4 items-start">
                        <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full flex-shrink-0" />
                        <div className="flex-grow">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                rows={2}
                                className="block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 transition-colors"
                            />
                            <div className="flex justify-end mt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !newComment.trim()}
                                    className="px-4 py-2 text-sm font-semibold rounded-md text-white bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-400 dark:disabled:bg-slate-600 transition-colors"
                                >
                                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                                </button>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="text-center">
                        <p className="text-slate-500 dark:text-slate-400">
                            <Link to="/login" className="font-semibold text-indigo-500 hover:underline">Log in</Link> to post a comment.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentSection;