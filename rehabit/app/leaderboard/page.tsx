'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, Medal, Star, Crown, TrendingUp, ArrowRight, 
  Award, Zap, Target, Flame, ChevronUp, ChevronDown
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface LeaderboardUser {
  uid: string;
  displayName: string;
  photoURL: string | null;
  xp: number;
  level: number;
  email?: string;
}

type TimeFrame = 'all-time' | 'weekly' | 'monthly';

export default function LeaderboardPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('all-time');
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }
    
    fetchLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, timeFrame]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'users'),
        orderBy('xp', 'desc'),
        limit(50)
      );
      
      const querySnapshot = await getDocs(q);
      const users = querySnapshot.docs.map(doc => doc.data()) as LeaderboardUser[];
      
      setLeaderboard(users);
      
      // Find current user's rank
      const currentUserRank = users.findIndex(u => u.uid === user?.uid);
      setUserRank(currentUserRank >= 0 ? currentUserRank + 1 : null);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-orange-500" />;
      default:
        return <span className="text-gray-500 font-bold">#{rank}</span>;
    }
  };

  const getRankBadgeClass = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-black shadow-glow';
      case 2:
        return 'bg-gradient-to-br from-gray-300 to-gray-400 text-black';
      case 3:
        return 'bg-gradient-to-br from-orange-400 to-orange-500 text-black';
      default:
        return 'bg-dark-800 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-20 h-20 rounded-full border-4 border-primary border-t-transparent"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white">

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-green flex items-center justify-center shadow-glow-lg">
              <Trophy className="w-9 h-9 text-black" />
            </div>
            <div>
              <h1 className="text-5xl font-display font-black">
                🏆 <span className="text-gradient-green">Leaderboard</span>
              </h1>
              <p className="text-gray-400 text-lg">Compete with others and climb the ranks!</p>
            </div>
          </div>
        </motion.div>

        {/* Time Frame Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center gap-4 mb-8"
        >
          {[
            { id: 'all-time', label: 'All Time', icon: Trophy },
            { id: 'weekly', label: 'This Week', icon: Zap },
            { id: 'monthly', label: 'This Month', icon: Star },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTimeFrame(tab.id as TimeFrame)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                timeFrame === tab.id
                  ? 'bg-gradient-green text-black shadow-glow'
                  : 'glass-dark text-gray-300 hover:bg-white/10 border border-primary/20'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Current User Card */}
        {userRank && userData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-dark rounded-3xl p-6 mb-8 border-2 border-primary/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black ${getRankBadgeClass(userRank)}`}>
                  {userRank <= 3 ? getRankIcon(userRank) : `#${userRank}`}
                </div>
                <div>
                  <div className="text-sm text-primary font-bold mb-1">YOUR RANK</div>
                  <div className="text-2xl font-black text-white">{userData.displayName}</div>
                  <div className="text-sm text-gray-400">Level {userData.level} • {userData.xp} XP</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-4xl font-black text-gradient-green">#{userRank}</div>
                <div className="text-sm text-gray-400">of {leaderboard.length}</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Top 3 Podium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          {leaderboard.slice(0, 3).map((user, index) => {
            const actualRank = index + 1;
            const heights = ['h-80', 'h-72', 'h-64'];
            const positions = [1, 0, 2]; // 2nd, 1st, 3rd
            const displayIndex = positions.indexOf(index);
            
            return (
              <motion.div
                key={user.uid}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + displayIndex * 0.1 }}
                className={`relative ${displayIndex === 1 ? 'order-1' : displayIndex === 0 ? 'order-0' : 'order-2'}`}
              >
                <div className={`glass-dark rounded-3xl p-6 border-2 ${
                  actualRank === 1 ? 'border-yellow-500/50 shadow-glow' :
                  actualRank === 2 ? 'border-gray-400/50' :
                  'border-orange-500/50'
                } ${heights[index]} flex flex-col items-center justify-end`}>
                  
                  {/* Rank Badge */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getRankBadgeClass(actualRank)} shadow-lg`}>
                      {getRankIcon(actualRank)}
                    </div>
                  </div>

                  {/* Avatar */}
                  <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${
                    actualRank === 1 ? 'from-yellow-400 to-yellow-500' :
                    actualRank === 2 ? 'from-gray-300 to-gray-400' :
                    'from-orange-400 to-orange-500'
                  } flex items-center justify-center font-black text-4xl text-black mb-4 shadow-lg`}>
                    {user.displayName?.charAt(0) || 'U'}
                  </div>

                  {/* Name */}
                  <h3 className="text-xl font-bold text-white mb-2 text-center">{user.displayName}</h3>
                  
                  {/* Level */}
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 text-primary" />
                    <span className="text-gray-400">Level {user.level}</span>
                  </div>

                  {/* XP */}
                  <div className="text-3xl font-black text-gradient-green mb-2">{user.xp}</div>
                  <div className="text-sm text-gray-400">XP</div>

                  {/* Stats */}
                  <div className="mt-4 pt-4 border-t border-white/10 w-full">
                    <div className="grid grid-cols-2 gap-3 text-center text-sm">
                      <div>
                        <div className="text-primary font-bold">#{actualRank}</div>
                        <div className="text-gray-500 text-xs">Rank</div>
                      </div>
                      <div>
                        <div className="text-primary font-bold">{user.xp}</div>
                        <div className="text-gray-500 text-xs">Total XP</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Rest of Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-dark rounded-3xl p-6 border border-primary/20"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            Top 50 Users
          </h2>

          <div className="space-y-2">
            {leaderboard.slice(3).map((user, index) => {
              const rank = index + 4;
              const isCurrentUser = user.uid === userData?.uid;
              
              return (
                <motion.div
                  key={user.uid}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.02 }}
                  className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                    isCurrentUser
                      ? 'bg-gradient-to-r from-primary/20 to-primary/10 border-2 border-primary/40'
                      : 'hover:bg-white/5 border border-transparent hover:border-primary/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="w-12 h-12 rounded-xl bg-dark-800 flex items-center justify-center font-bold text-gray-400">
                      #{rank}
                    </div>

                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center font-bold text-white">
                      {user.displayName?.charAt(0) || 'U'}
                    </div>

                    {/* Info */}
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        {user.displayName}
                        {isCurrentUser && (
                          <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full font-bold">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">Level {user.level}</div>
                    </div>
                  </div>

                  {/* XP */}
                  <div className="text-right">
                    <div className="text-2xl font-black text-gradient-green">{user.xp}</div>
                    <div className="text-xs text-gray-400">XP</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Motivational Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="glass-dark rounded-3xl p-8 border border-primary/20">
            <Flame className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h3 className="text-2xl font-bold mb-3 text-white">Keep Building Habits!</h3>
            <p className="text-gray-400 mb-6">
              Complete habits daily to earn XP and climb the leaderboard. The top performers get special rewards!
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-8 py-4 bg-gradient-green text-black rounded-xl font-bold hover:shadow-glow-lg transition-all inline-flex items-center gap-2"
            >
              Back to Dashboard
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

