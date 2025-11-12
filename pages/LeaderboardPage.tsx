import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStyleContext } from '../context/StyleContext';
import { useAuth } from '../context/AuthContext';
import { Style, User } from '../types';

const TrophyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 10-2 0v1.586l-3.293-3.293a1 1 0 00-1.414 1.414L6 4.414V6a1 1 0 102 0V4.414l1.293 1.293a1 1 0 001.414 0L12 4.414V6a1 1 0 102 0V4.414l1.707-1.707a1 1 0 00-1.414-1.414L13 3.586V3z" /><path d="M3.293 9.293a1 1 0 011.414 0L6 10.586V12a1 1 0 102 0v-1.414l-1.293-1.293a1 1 0 00-1.414 0l-1.707 1.707zM11 10.586L9.707 9.293a1 1 0 00-1.414 1.414L10 12.414V14a1 1 0 102 0v-1.586l1.293-1.293a1 1 0 00-1.414-1.414L11 10.586zM12 16a1 1 0 102 0v-1.414l1.707-1.707a1 1 0 00-1.414-1.414L13 12.586V12a1 1 0 10-2 0v.586l-1.293-1.293a1 1 0 00-1.414 1.414L10 14.414V16a1 1 0 102 0v-.586l.293-.293a1 1 0 001.414 0L14 14.414V16zM4 14a1 1 0 112 0v-1.586l-1.293-1.293a1 1 0 00-1.414 1.414L4 13.586V14z" /><path fillRule="evenodd" d="M3 18a2 2 0 012-2h10a2 2 0 012 2v2H3v-2z" clipRule="evenodd" /></svg>;

interface LeaderboardItemProps<T> {
  item: T;
  index: number;
  render: (item: T) => { link: string; image: string; title: string; subtitle: string; value: number | string };
}

// FIX: Changed component to a function declaration to avoid potential parsing issues with generic arrow functions.
function LeaderboardItem<T>({ item, index, render }: LeaderboardItemProps<T>): React.ReactElement {
  const { link, image, title, subtitle, value } = render(item);
  const rankColors = [
    "text-yellow-400", // 1st
    "text-slate-400",  // 2nd
    "text-yellow-600"  // 3rd
  ];

  return (
    <Link to={link} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
      <div className={`w-8 text-center text-lg font-bold ${rankColors[index] || 'text-slate-500 dark:text-slate-400'}`}>{index + 1}</div>
      <img src={image} alt={title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
      <div className="flex-grow overflow-hidden">
        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{title}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{subtitle}</p>
      </div>
      <div className="font-bold text-indigo-500 dark:text-indigo-400 text-lg flex-shrink-0">{value}</div>
    </Link>
  );
};

// FIX: Changed component to a function declaration to avoid potential parser issues.
function LeaderboardSection({ title, children }: { title: string; children: React.ReactNode }): React.ReactElement {
  return (
    <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg p-6">
      <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">
        <TrophyIcon /> {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
};


const LeaderboardPage: React.FC = () => {
  const { styles } = useStyleContext();
  const { users } = useAuth();

  const topContributors = useMemo(() => {
    const contributions = users.map(user => ({
      user,
      styleCount: styles.filter(style => style.creatorId === user.id).length
    }));
    return contributions.filter(c => c.styleCount > 0).sort((a, b) => b.styleCount - a.styleCount).slice(0, 5);
  }, [styles, users]);

  const mostViewedStyles = useMemo(() => {
    return [...styles].sort((a, b) => b.views - a.views).slice(0, 5);
  }, [styles]);

  const mostLikedStyles = useMemo(() => {
    return [...styles].sort((a, b) => b.likes - a.likes).slice(0, 5);
  }, [styles]);
  
  const userRenderer = (item: { user: User; styleCount: number; }) => ({
      link: `/profile/${item.user.id}`,
      image: item.user.avatar,
      title: item.user.name,
      subtitle: `${item.styleCount} ${item.styleCount === 1 ? 'style' : 'styles'} created`,
      value: item.styleCount.toLocaleString(),
  });

  const styleRenderer = (valueKey: 'views' | 'likes') => (item: Style) => ({
      link: `/s/${item.slug}`,
      image: item.images[item.mainImageIndex],
      title: item.title,
      subtitle: `by ${users.find(u => u.id === item.creatorId)?.name || 'Unknown'}`,
      value: item[valueKey].toLocaleString(),
  });

  return (
    <div className="space-y-12">
      <div className="text-center pt-8 pb-4">
        <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
          Community Leaderboard
        </h1>
        <p className="mt-4 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          See the top styles and most active creators in our community.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <LeaderboardSection title="Top Contributors">
          {topContributors.map((item, index) => (
            <LeaderboardItem key={item.user.id} item={item} index={index} render={userRenderer} />
          ))}
        </LeaderboardSection>

        <LeaderboardSection title="Most Liked Styles">
          {mostLikedStyles.map((item, index) => (
            <LeaderboardItem key={item.id} item={item} index={index} render={styleRenderer('likes')} />
          ))}
        </LeaderboardSection>

        <LeaderboardSection title="Most Viewed Styles">
          {mostViewedStyles.map((item, index) => (
            <LeaderboardItem key={item.id} item={item} index={index} render={styleRenderer('views')} />
          ))}
        </LeaderboardSection>
      </div>
    </div>
  );
};

export default LeaderboardPage;
