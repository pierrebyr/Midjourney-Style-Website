
import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStyleContext } from '../context/StyleContext';
import StyleCard from '../components/StyleCard';

const ProfilePage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const { getUserById, currentUser, toggleFollow } = useAuth();
    const { styles } = useStyleContext();

    const user = useMemo(() => {
        if (!userId) return undefined;
        return getUserById(userId);
    }, [userId, getUserById]);

    const userStyles = useMemo(() => {
        if (!user) return [];
        return styles.filter(style => style.creatorId === user.id)
            .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [user, styles]);

    if (!user) {
        return (
            <div className="text-center py-20">
                <h2 className="text-3xl font-bold">User Not Found</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-4">The profile you're looking for doesn't exist.</p>
                <Link to="/" className="mt-6 inline-block bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-secondary transition-colors">
                    Back to Home
                </Link>
            </div>
        );
    }
    
    const isFollowing = currentUser ? currentUser.following.includes(user.id) : false;
    const isOwnProfile = currentUser ? currentUser.id === user.id : false;

    const handleFollowClick = () => {
        if (!currentUser) {
            // In a real app, you might want a toast here or redirect to login
            return;
        }
        toggleFollow(user.id);
    };

    return (
        <div className="space-y-12">
            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-lg">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <img src={user.avatar} alt={user.name} className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-lg"/>
                    <div className="flex-grow text-center md:text-left">
                        <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-200">{user.name}</h1>
                        <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-xl">{user.bio}</p>
                        <div className="mt-4 flex justify-center md:justify-start gap-6 text-sm">
                            <div className="text-center">
                                <span className="font-bold text-lg text-indigo-500 dark:text-indigo-400">{userStyles.length}</span>
                                <span className="text-slate-500 dark:text-slate-400 ml-1">Styles</span>
                            </div>
                             <div className="text-center">
                                <span className="font-bold text-lg text-indigo-500 dark:text-indigo-400">{user.followers.length}</span>
                                <span className="text-slate-500 dark:text-slate-400 ml-1">Followers</span>
                            </div>
                             <div className="text-center">
                                <span className="font-bold text-lg text-indigo-500 dark:text-indigo-400">{user.following.length}</span>
                                <span className="text-slate-500 dark:text-slate-400 ml-1">Following</span>
                            </div>
                        </div>
                    </div>
                    {isOwnProfile ? (
                         <Link to="/profile/edit" className="px-6 py-2.5 font-semibold rounded-lg transition-colors w-full md:w-auto bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600">
                           Edit Profile
                        </Link>
                    ) : (
                        <button 
                            onClick={handleFollowClick}
                            className={`px-6 py-2.5 font-semibold rounded-lg transition-colors w-full md:w-auto ${isFollowing ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600' : 'bg-indigo-500 text-white hover:bg-indigo-600'}`}
                        >
                            {isFollowing ? 'Unfollow' : 'Follow'}
                        </button>
                    )}
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-200">{isOwnProfile ? "Your Styles" : `Styles by ${user.name}`}</h2>
                {userStyles.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {userStyles.map(style => (
                            <StyleCard key={style.id} style={style} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                        <h2 className="text-2xl font-bold text-slate-600 dark:text-slate-300">No Styles Yet</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">This user hasn't contributed any styles.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;