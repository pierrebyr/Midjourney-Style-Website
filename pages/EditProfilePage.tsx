
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';

const EditProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser, updateUser } = useAuth();
    const { addToast } = useToast();

    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [avatar, setAvatar] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
        } else {
            setName(currentUser.name);
            setBio(currentUser.bio);
            setAvatar(currentUser.avatar);
        }
    }, [currentUser, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await updateUser({ name, bio, avatar });
            addToast('Profile updated successfully!', 'success');
            navigate(`/profile/${currentUser?.id}`);
        } catch (err) {
            addToast(err instanceof Error ? err.message : 'Failed to update profile.', 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const formInputClasses = "mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100 transition-colors";

    if (!currentUser) {
        return null; // Or a loading spinner, as the useEffect will redirect
    }

    return (
        <div className="max-w-2xl mx-auto animate-fade-in-down">
             <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-lg">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Edit Your Profile</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Update your public information.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center gap-6">
                        <img src={avatar} alt="Avatar preview" className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 shadow-md"/>
                        <div className="flex-grow">
                             <label htmlFor="avatar" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Avatar URL
                            </label>
                            <input
                                type="url"
                                id="avatar"
                                value={avatar}
                                onChange={(e) => setAvatar(e.target.value)}
                                required
                                className={formInputClasses}
                                placeholder="https://i.pravatar.cc/150"
                            />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Your Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className={formInputClasses}
                        />
                    </div>
                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Bio
                        </label>
                        <textarea
                            id="bio"
                            rows={4}
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className={formInputClasses}
                            placeholder="Tell the community a little about yourself."
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate(`/profile/${currentUser.id}`)}
                            className="px-6 py-2.5 text-sm font-semibold rounded-md bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                             className="px-6 py-2.5 text-sm font-semibold rounded-md text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-all disabled:from-slate-400"
                        >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfilePage;