'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Target, Flame, Trophy, Users, LogOut, 
  Check, TrendingUp, Award, Calendar, Trash2, X, 
  Home, Zap, BarChart3, Compass, BookmarkIcon, FileText,
  ChevronLeft, ChevronRight, Sparkles, Clock, Droplet, ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  collection, addDoc, query, where, getDocs, 
  updateDoc, doc, orderBy, limit, deleteDoc 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format, isToday, startOfDay, subDays, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import CommunityGroups from '@/components/CommunityGroups';
import { 
  initializeUserStats, 
  getUserStats, 
  onHabitCompleted, 
  onHabitUncompleted,
  onHabitCreated,
  UserStatistics 
} from '@/lib/statisticsService';

interface Habit {
  id: string;
  userId: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  streak: number;
  duration?: string;
  target?: string;
  lastCompleted?: Date;
  completedDates: Date[];
  createdAt: Date;
}

interface LeaderboardUser {
  uid: string;
  displayName: string;
  photoURL: string | null;
  xp: number;
  level: number;
}

const habitColors = [
  'from-purple-500/20 to-purple-600/10',
  'from-pink-500/20 to-pink-600/10',
  'from-yellow-500/20 to-yellow-600/10',
  'from-blue-500/20 to-blue-600/10',
  'from-green-500/20 to-green-600/10',
  'from-orange-500/20 to-orange-600/10',
];

export default function DashboardPage() {
  const { user, userData, signOut, refreshUserData } = useAuth();
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', description: '', icon: '🎯', color: 'purple', duration: '', target: '' });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'challenge' | 'statistics' | 'explore' | 'community'>('home');
  const [viewPeriod, setViewPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showXpGain, setShowXpGain] = useState(false);
  const [xpGainAmount, setXpGainAmount] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevelReached, setNewLevelReached] = useState(1);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [userStats, setUserStats] = useState<UserStatistics | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }
    
    initializeStats();
    fetchHabits();
    fetchLeaderboard();
    fetchUserStats();
    
    const leaderboardInterval = setInterval(() => {
      fetchLeaderboard();
    }, 30000);
    
    return () => clearInterval(leaderboardInterval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router]);

  const initializeStats = async () => {
    if (!user) return;
    try {
      await initializeUserStats(user.uid);
    } catch (error) {
      console.error('Error initializing stats:', error);
    }
  };

  const fetchUserStats = async () => {
    if (!user) return;
    try {
      const stats = await getUserStats(user.uid);
      setUserStats(stats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchHabits = async () => {
    if (!user) return;
    
    try {
      const q = query(
        collection(db, 'habits'),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const habitsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        lastCompleted: doc.data().lastCompleted?.toDate(),
        completedDates: doc.data().completedDates?.map((d: any) => d.toDate()) || [],
      })) as Habit[];
      
      habitsData.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return a.createdAt.getTime() - b.createdAt.getTime();
      });
      
      setHabits(habitsData);
    } catch (error) {
      console.error('Error fetching habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const q = query(collection(db, 'users'));
      const querySnapshot = await getDocs(q);
      const leaderboardData = querySnapshot.docs.map(doc => doc.data()) as LeaderboardUser[];
      
      leaderboardData.sort((a, b) => (b.xp || 0) - (a.xp || 0));
      const top10 = leaderboardData.slice(0, 10);
      
      setLeaderboard(top10);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const addHabit = async () => {
    if (!user || !newHabit.name) return;

    try {
      await addDoc(collection(db, 'habits'), {
        userId: user.uid,
        name: newHabit.name,
        description: newHabit.description,
        icon: newHabit.icon,
        color: newHabit.color,
        duration: newHabit.duration,
        target: newHabit.target,
        streak: 0,
        completedDates: [],
        createdAt: new Date(),
      });
      
      // Update statistics
      await onHabitCreated(user.uid);
      
      setNewHabit({ name: '', description: '', icon: '🎯', color: 'purple', duration: '', target: '' });
      setShowAddHabit(false);
      fetchHabits();
      fetchUserStats();
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  };

  const calculateStreak = (completedDates: Date[]): number => {
    if (completedDates.length === 0) return 0;
    
    const sortedDates = completedDates
      .map(d => startOfDay(d))
      .sort((a, b) => b.getTime() - a.getTime());
    
    const today = startOfDay(new Date());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const mostRecent = sortedDates[0];
    if (mostRecent.getTime() !== today.getTime() && 
        mostRecent.getTime() !== yesterday.getTime()) {
      return 0;
    }
    
    let streak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const current = sortedDates[i];
      const previous = sortedDates[i - 1];
      const dayDiff = Math.floor((previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const calculateLevel = (xp: number): number => {
    return Math.floor(xp / 100) + 1;
  };

  const toggleHabitCompletion = async (habit: Habit) => {
    const today = startOfDay(new Date());
    const isCompletedToday = habit.completedDates.some(date => 
      startOfDay(date).getTime() === today.getTime()
    );

    try {
      const habitRef = doc(db, 'habits', habit.id);
      
      if (isCompletedToday) {
        const updatedDates = habit.completedDates.filter(date => 
          startOfDay(date).getTime() !== today.getTime()
        );
        const newStreak = calculateStreak(updatedDates);
        
        await updateDoc(habitRef, {
          completedDates: updatedDates,
          streak: newStreak,
        });
        
        // Update statistics
        if (user) {
          await onHabitUncompleted(user.uid, habit.id, 10);
        }
        
        if (userData) {
          const userRef = doc(db, 'users', user!.uid);
          const newXp = Math.max(0, (userData.xp || 0) - 10);
          const newLevel = calculateLevel(newXp);
          
          await updateDoc(userRef, {
            xp: newXp,
            level: newLevel,
          });
          await refreshUserData();
        }
      } else {
        const updatedDates = [...habit.completedDates, new Date()];
        const newStreak = calculateStreak(updatedDates);
        
        await updateDoc(habitRef, {
          completedDates: updatedDates,
          lastCompleted: new Date(),
          streak: newStreak,
        });
        
        // Update statistics
        if (user) {
          await onHabitCompleted(user.uid, habit.id, 10);
        }
        
        if (userData) {
          const userRef = doc(db, 'users', user!.uid);
          const newXp = (userData.xp || 0) + 10;
          const oldLevel = userData.level || 1;
          const newLevel = calculateLevel(newXp);
          
          await updateDoc(userRef, {
            xp: newXp,
            level: newLevel,
          });
          
          await refreshUserData();
          
          setXpGainAmount(10);
          setShowXpGain(true);
          setTimeout(() => setShowXpGain(false), 2000);
          
          if (newLevel > oldLevel) {
            setNewLevelReached(newLevel);
            setShowLevelUp(true);
          }
        }
      }
      
      fetchHabits();
      fetchLeaderboard();
      fetchUserStats();
    } catch (error) {
      console.error('Error toggling habit:', error);
    }
  };

  const deleteHabit = async (habit: Habit) => {
    try {
      const habitRef = doc(db, 'habits', habit.id);
      await deleteDoc(habitRef);
      setHabitToDelete(null);
      fetchHabits();
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // Calculate statistics (with backend data)
  const getBestStreak = () => {
    // Use backend stats if available, fallback to calculated
    if (userStats && userStats.bestStreak > 0) {
      return userStats.bestStreak;
    }
    return Math.max(...habits.map(h => h.streak), 0);
  };
  
  const getPerfectDays = () => {
    // Use backend stats if available, fallback to calculated
    if (userStats && userStats.perfectDaysCount >= 0) {
      return userStats.perfectDaysCount;
    }
    const allDates = habits.flatMap(h => h.completedDates.map(d => startOfDay(d).getTime()));
    const uniqueDates = new Set(allDates);
    return Array.from(uniqueDates).filter(dateTime => {
      const count = allDates.filter(d => d === dateTime).length;
      return count === habits.length && habits.length > 0;
    }).length;
  };
  
  const getTotalHabitsDone = () => {
    // Use backend stats if available, fallback to calculated
    if (userStats && userStats.totalHabitsCompleted > 0) {
      return userStats.totalHabitsCompleted;
    }
    return habits.reduce((sum, h) => sum + h.completedDates.length, 0);
  };
  
  const getOverallProgress = () => {
    if (habits.length === 0) return 0;
    const last7Days = Array.from({ length: 7 }, (_, i) => startOfDay(subDays(new Date(), i)).getTime());
    const totalPossible = habits.length * 7;
    const totalCompleted = habits.reduce((sum, habit) => {
      const completedIn7Days = habit.completedDates.filter(date => 
        last7Days.includes(startOfDay(date).getTime())
      ).length;
      return sum + completedIn7Days;
    }, 0);
    return Math.round((totalCompleted / totalPossible) * 100);
  };
  
  const getCurrentStreak = () => {
    if (userStats && userStats.currentStreak >= 0) {
      return userStats.currentStreak;
    }
    return 0;
  };

  // Get dates for calendar
  const getCalendarDates = () => {
    const dates = [];
    for (let i = 2; i >= 0; i--) {
      dates.push(subDays(selectedDate, i));
    }
    return dates;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-20 h-20 rounded-full bg-gradient-green shadow-glow-lg"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent flex">

      {/* Left Sidebar */}
      <div className="w-64 bg-dark-900/40 backdrop-blur-xl border-r border-primary/10 p-6 flex flex-col relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-green rounded-xl flex items-center justify-center shadow-glow">
            <Target className="w-6 h-6 text-black" />
          </div>
          <h1 className="text-2xl font-display font-black text-white">Hbitz</h1>
        </div>

        {/* Profile */}
        <div className="mb-8 p-4 glass-dark rounded-2xl border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-green flex items-center justify-center font-bold text-black shadow-glow">
              {userData?.displayName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-white truncate">{userData?.displayName || 'User'}</div>
              <div className="text-xs text-primary">Level {userData?.level || 1}</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 mb-8">
          {[
            { id: 'home', icon: Home, label: 'Home' },
            { id: 'challenge', icon: Zap, label: 'Challenge' },
            { id: 'statistics', icon: BarChart3, label: 'Statistics' },
            { id: 'explore', icon: Compass, label: 'Explore' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id
                  ? 'bg-dark-800 text-white border border-primary/20'
                  : 'text-gray-400 hover:text-white hover:bg-dark-800/50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Insight Section */}
        <div className="mt-auto">
          <div className="text-xs font-bold text-gray-500 mb-3">Insight</div>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-dark-800/50 rounded-xl transition-all">
              <FileText className="w-5 h-5" />
              <span className="font-medium">Article</span>
              <span className="ml-auto px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full font-bold">New</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-dark-800/50 rounded-xl transition-all">
              <BookmarkIcon className="w-5 h-5" />
              <span className="font-medium">Bookmark</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto relative z-10">
        {activeTab === 'home' && (
          <div className="p-8">
            {/* Top Section - Hero Card & Statistics */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              {/* Hero Motivation Card */}
              <div className="lg:col-span-2 relative rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #E879F9 0%, #F0ABFC 100%)' }}>
                <div className="p-8 relative z-10">
                  <h2 className="text-4xl font-black text-gray-900 mb-3">
                    How to Build<br />a New Habit
                  </h2>
                  <p className="text-gray-800 mb-6 max-w-md">
                    This is essential for making progress in your health, happiness, and your life.
                  </p>
                  <button className="px-6 py-3 bg-white text-gray-900 rounded-xl font-bold hover:shadow-lg transition-all">
                    Learn more
                  </button>
                </div>
                <div className="absolute bottom-0 right-8 w-48 h-48">
                  <div className="w-full h-full bg-gradient-to-br from-primary/30 to-blue-500/30 rounded-full blur-2xl" />
                </div>
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-900"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                </div>
              </div>

              {/* Statistics Card */}
              <div className="glass-dark rounded-3xl p-6 border border-primary/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-white">Statistics</h3>
                  <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                    <BarChart3 className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Circular Progress */}
                <div className="relative w-40 h-40 mx-auto mb-6">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="#1a1a1a"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="url(#gradient)"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 70}`}
                      strokeDashoffset={`${2 * Math.PI * 70 * (1 - getOverallProgress() / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00ff88" />
                        <stop offset="100%" stopColor="#00cc6d" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-black text-white">{getOverallProgress()}%</div>
                      <div className="text-xs text-gray-400">Overall Progress</div>
                    </div>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="text-2xl font-black text-white">{getBestStreak()}</span>
                    </div>
                    <div className="text-xs text-gray-400">Best Streaks</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span className="text-2xl font-black text-white">{getPerfectDays()}</span>
                    </div>
                    <div className="text-xs text-gray-400">Perfect Days</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-2xl font-black text-white">{getTotalHabitsDone()}</span>
                    </div>
                    <div className="text-xs text-gray-400">Habits Done</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Period Tabs */}
            <div className="flex items-center justify-center gap-4 mb-8">
              {['daily', 'weekly', 'monthly'].map((period) => (
                <button
                  key={period}
                  onClick={() => setViewPeriod(period as any)}
                  className={`px-6 py-2 rounded-xl font-semibold capitalize transition-all ${
                    viewPeriod === period
                      ? 'text-white border-b-2 border-primary'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>

            {/* Calendar Date Selector */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <button
                onClick={() => setSelectedDate(subDays(selectedDate, 1))}
                className="p-2 glass-dark rounded-xl hover:bg-white/10 transition-colors border border-primary/20"
              >
                <ChevronLeft className="w-5 h-5 text-gray-400" />
              </button>

              <div className="flex items-center gap-3">
                {getCalendarDates().map((date, index) => {
                  const isSelected = index === 2;
                  return (
                    <motion.div
                      key={date.getTime()}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`${
                        isSelected
                          ? 'w-20 h-24 bg-dark-900 border-2 border-primary shadow-glow'
                          : 'w-16 h-20 glass-dark border border-primary/20'
                      } rounded-2xl flex flex-col items-center justify-center transition-all`}
                    >
                      <div className={`text-sm ${isSelected ? 'text-primary' : 'text-gray-500'} font-medium`}>
                        {format(date, 'd')}
                      </div>
                      {isSelected && (
                        <div className="text-xs text-primary font-bold">
                          {format(date, 'EEE')}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              <button
                onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                className="p-2 glass-dark rounded-xl hover:bg-white/10 transition-colors border border-primary/20"
              >
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Habit Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {habits.map((habit, index) => {
                const isCompletedToday = habit.completedDates.some(date => isToday(date));
                const colorClass = habitColors[index % habitColors.length];
                
                return (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => toggleHabitCompletion(habit)}
                    className={`relative group cursor-pointer rounded-3xl p-6 bg-gradient-to-br ${colorClass} backdrop-blur-xl border border-white/10 hover:border-primary/40 transition-all hover:scale-105`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setHabitToDelete(habit);
                      }}
                      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-red-500/20 text-red-500 border border-red-500/30 z-10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center text-4xl mb-4 border border-white/20">
                      {habit.icon}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">{habit.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      {habit.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {habit.duration}
                        </div>
                      )}
                      {habit.target && (
                        <div className="flex items-center gap-1">
                          <Droplet className="w-4 h-4" />
                          {habit.target}
                        </div>
                      )}
                    </div>

                    {isCompletedToday && (
                      <div className="absolute top-4 left-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-glow">
                        <Check className="w-5 h-5 text-black" />
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {/* Add Habit Card */}
              <motion.button
                onClick={() => setShowAddHabit(true)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: habits.length * 0.05 }}
                className="rounded-3xl p-6 bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-xl border-2 border-dashed border-primary/30 hover:border-primary/60 transition-all hover:scale-105 flex flex-col items-center justify-center min-h-[200px] group"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-all">
                  <Plus className="w-8 h-8 text-primary" />
                </div>
                <span className="text-white font-bold">Add New Habit</span>
              </motion.button>
            </div>
          </div>
        )}

        {activeTab === 'challenge' && (
          <div className="p-8">
            <h2 className="text-3xl font-black text-white mb-6">Challenge</h2>
            <div className="glass-dark rounded-3xl p-8 border border-primary/20 text-center">
              <Zap className="w-16 h-16 mx-auto mb-4 text-primary" />
              <p className="text-gray-400 mb-6">Complete special challenges to earn bonus XP and level up faster!</p>
              <button
                onClick={() => router.push('/challenges')}
                className="px-8 py-4 bg-gradient-green text-black rounded-xl font-bold hover:shadow-glow-lg transition-all inline-flex items-center gap-2"
              >
                View Challenges
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'statistics' && (
          <div className="p-8">
            <h2 className="text-3xl font-black text-white mb-6">Statistics</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="glass-dark rounded-3xl p-8 border border-primary/20">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Progress Overview
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Overall Progress</span>
                      <span className="text-primary font-bold">{getOverallProgress()}%</span>
                    </div>
                    <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-green transition-all duration-1000" style={{ width: `${getOverallProgress()}%` }} />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="glass-dark rounded-3xl p-8 border border-primary/20">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Achievements
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl mb-2">🔥</div>
                    <div className="text-2xl font-bold text-white">{getBestStreak()}</div>
                    <div className="text-xs text-gray-400">Best Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">⭐</div>
                    <div className="text-2xl font-bold text-white">{getPerfectDays()}</div>
                    <div className="text-xs text-gray-400">Perfect Days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">✅</div>
                    <div className="text-2xl font-bold text-white">{getTotalHabitsDone()}</div>
                    <div className="text-xs text-gray-400">Completed</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-dark rounded-3xl p-8 border border-primary/20 text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-3 text-white">View Leaderboard</h3>
              <p className="text-gray-400 mb-6">
                See where you rank among other users and compete for the top spot!
              </p>
              <button
                onClick={() => router.push('/leaderboard')}
                className="px-8 py-4 bg-gradient-green text-black rounded-xl font-bold hover:shadow-glow-lg transition-all inline-flex items-center gap-2"
              >
                View Rankings
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'explore' && (
          <div className="p-8">
            <h2 className="text-3xl font-black text-white mb-6">Explore Community</h2>
            <CommunityGroups />
          </div>
        )}
      </div>

      {/* Add Habit Modal */}
      {showAddHabit && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-dark rounded-3xl p-10 max-w-md w-full border-2 border-primary/30"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-display font-bold text-white">Create New Habit</h3>
              <button
                onClick={() => setShowAddHabit(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-3 text-gray-300">Habit Name</label>
                <input
                  type="text"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                  className="w-full px-5 py-4 bg-dark-800/50 border border-primary/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                  placeholder="e.g., Workout"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-3 text-gray-300">Duration/Target</label>
                <input
                  type="text"
                  value={newHabit.duration}
                  onChange={(e) => setNewHabit({ ...newHabit, duration: e.target.value })}
                  className="w-full px-5 py-4 bg-dark-800/50 border border-primary/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                  placeholder="e.g., 1 hour or 2 Liters"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-3 text-gray-300">Choose Icon</label>
                <div className="grid grid-cols-6 gap-3">
                  {['🏋️', '🏃', '📚', '🧘', '💧', '🥗', '💪', '😴', '🎯', '⭐', '🔥', '💡'].map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setNewHabit({ ...newHabit, icon })}
                      className={`text-4xl p-3 rounded-xl transition-all ${
                        newHabit.icon === icon 
                          ? 'bg-gradient-green scale-110 shadow-glow' 
                          : 'bg-white/5 hover:bg-white/10 border border-primary/20 hover:border-primary/40'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => setShowAddHabit(false)} 
                className="flex-1 px-6 py-4 bg-white/5 text-white rounded-xl font-bold border border-primary/20 hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={addHabit} 
                className="flex-1 px-6 py-4 bg-gradient-green text-black rounded-xl font-bold shadow-glow hover:shadow-glow-lg transition-all"
              >
                Create Habit
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* XP Gain Notification */}
      {showXpGain && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-28 right-8 z-50 bg-gradient-green text-black px-8 py-5 rounded-2xl shadow-glow-lg flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-black/20 flex items-center justify-center">
            <Zap className="w-7 h-7" />
          </div>
          <div>
            <div className="text-sm font-medium opacity-80">XP Gained!</div>
            <div className="font-black text-2xl">+{xpGainAmount} XP</div>
          </div>
        </motion.div>
      )}

      {/* Level Up Modal */}
      {showLevelUp && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            className="glass-dark rounded-3xl p-12 max-w-md w-full text-center border-2 border-primary/40"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 360]
              }}
              transition={{ 
                duration: 0.6,
                repeat: 3
              }}
              className="w-28 h-28 mx-auto mb-8 bg-gradient-green rounded-full flex items-center justify-center shadow-glow-lg"
            >
              <Trophy className="w-14 h-14 text-black" />
            </motion.div>
            
            <h3 className="text-5xl font-display font-black mb-3 text-gradient-green">Level Up!</h3>
            <div className="text-7xl font-black mb-6 text-white">Level {newLevelReached}</div>
            <p className="text-xl text-gray-400 mb-8">
              Congratulations! You're making amazing progress! 🎉
            </p>
            
            <button 
              onClick={() => setShowLevelUp(false)} 
              className="w-full px-8 py-5 bg-gradient-green text-black rounded-2xl font-bold text-lg shadow-glow-lg hover:scale-105 transition-all"
            >
              Awesome!
            </button>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {habitToDelete && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-dark rounded-3xl p-10 max-w-md w-full border-2 border-red-500/30"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center border-2 border-red-500">
                <Trash2 className="w-7 h-7 text-red-500" />
              </div>
              <div>
                <h3 className="text-2xl font-display font-bold text-white">Delete Habit?</h3>
                <p className="text-sm text-gray-400">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="bg-dark-800/50 border border-dark-600 rounded-2xl p-5 mb-8">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{habitToDelete.icon}</div>
                <div>
                  <h4 className="font-bold text-lg text-white">{habitToDelete.name}</h4>
                  <p className="text-sm text-gray-400">
                    {habitToDelete.streak} day streak • {habitToDelete.completedDates.length} completions
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-gray-400 mb-8">
              Are you sure you want to delete this habit? All your progress and streak data will be permanently lost.
            </p>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setHabitToDelete(null)} 
                className="flex-1 px-6 py-4 bg-white/5 text-white rounded-xl font-bold border border-primary/20 hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => deleteHabit(habitToDelete)} 
                className="flex-1 px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors shadow-lg"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Sign Out Button (Mobile) */}
      <button
        onClick={handleSignOut}
        className="fixed bottom-8 right-8 z-40 w-14 h-14 bg-red-500/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-red-500/30 hover:bg-red-500/30 transition-all shadow-lg"
        title="Sign Out"
      >
        <LogOut className="w-6 h-6 text-red-500" />
      </button>
    </div>
  );
}
