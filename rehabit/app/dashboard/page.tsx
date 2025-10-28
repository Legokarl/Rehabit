'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Target, Flame, Trophy, Users, LogOut, 
  Check, TrendingUp, Award, Calendar, Trash2, X 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  collection, addDoc, query, where, getDocs, 
  updateDoc, doc, orderBy, limit, deleteDoc 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format, isToday, startOfDay } from 'date-fns';
import CommunityGroups from '@/components/CommunityGroups';

interface Habit {
  id: string;
  userId: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  streak: number;
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

export default function DashboardPage() {
  const { user, userData, signOut, refreshUserData } = useAuth();
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', description: '', icon: '🎯', color: 'purple' });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'habits' | 'leaderboard' | 'community'>('habits');
  const [showXpGain, setShowXpGain] = useState(false);
  const [xpGainAmount, setXpGainAmount] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevelReached, setNewLevelReached] = useState(1);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }
    
    fetchHabits();
    fetchLeaderboard();
    
    // Auto-refresh leaderboard every 30 seconds for live updates
    const leaderboardInterval = setInterval(() => {
      fetchLeaderboard();
    }, 30000);
    
    return () => clearInterval(leaderboardInterval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router]);

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
      
      // Sort by createdAt in JavaScript instead of Firestore
      habitsData.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.getTime() - a.createdAt.getTime();
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
      
      // Sort by XP in JavaScript and limit to top 10
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
        streak: 0,
        completedDates: [],
        createdAt: new Date(),
      });
      
      setNewHabit({ name: '', description: '', icon: '🎯', color: 'purple' });
      setShowAddHabit(false);
      fetchHabits();
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  };

  const calculateStreak = (completedDates: Date[]): number => {
    if (completedDates.length === 0) return 0;
    
    // Sort dates in descending order (most recent first)
    const sortedDates = completedDates
      .map(d => startOfDay(d))
      .sort((a, b) => b.getTime() - a.getTime());
    
    const today = startOfDay(new Date());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // If the most recent completion is not today or yesterday, streak is 0
    const mostRecent = sortedDates[0];
    if (mostRecent.getTime() !== today.getTime() && 
        mostRecent.getTime() !== yesterday.getTime()) {
      return 0;
    }
    
    // Count consecutive days
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
        // Remove today's completion
        const updatedDates = habit.completedDates.filter(date => 
          startOfDay(date).getTime() !== today.getTime()
        );
        const newStreak = calculateStreak(updatedDates);
        
        await updateDoc(habitRef, {
          completedDates: updatedDates,
          streak: newStreak,
        });
        
        // Deduct XP when uncompleting
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
        // Add today's completion
        const updatedDates = [...habit.completedDates, new Date()];
        const newStreak = calculateStreak(updatedDates);
        
        await updateDoc(habitRef, {
          completedDates: updatedDates,
          lastCompleted: new Date(),
          streak: newStreak,
        });
        
        // Update user XP and level
        if (userData) {
          const userRef = doc(db, 'users', user!.uid);
          const newXp = (userData.xp || 0) + 10;
          const oldLevel = userData.level || 1;
          const newLevel = calculateLevel(newXp);
          
          await updateDoc(userRef, {
            xp: newXp,
            level: newLevel,
          });
          
          // Refresh user data to show updated XP
          await refreshUserData();
          
          // Show XP gain animation
          setXpGainAmount(10);
          setShowXpGain(true);
          setTimeout(() => setShowXpGain(false), 2000);
          
          // Show level up notification
          if (newLevel > oldLevel) {
            setNewLevelReached(newLevel);
            setShowLevelUp(true);
          }
        }
      }
      
      fetchHabits();
      fetchLeaderboard(); // Refresh leaderboard after completion
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-display text-gradient">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-white/30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-display font-bold text-gradient">ReHabit</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Level and XP Progress */}
              <div className="glass px-4 py-2 rounded-xl min-w-[200px]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">Level {userData?.level || 1}</span>
                  <span className="text-xs text-gray-600">
                    {(userData?.xp || 0) % 100}/{100} XP
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((userData?.xp || 0) % 100)}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  />
                </div>
              </div>
              
              <div className="glass px-4 py-2 rounded-xl flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold">{userData?.xp || 0} XP</span>
              </div>
              
              <button
                onClick={handleSignOut}
                className="glass p-2 rounded-xl hover:bg-red-100 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-4xl font-display font-bold mb-2">
            Welcome back, {userData?.displayName || 'User'}! 👋
          </h2>
          <p className="text-gray-600 text-lg">Let&apos;s build great habits together</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Flame, label: 'Current Streak', value: `${Math.max(...habits.map(h => h.streak), 0)} days`, color: 'from-orange-400 to-red-400' },
            { icon: Target, label: 'Active Habits', value: habits.length, color: 'from-purple-400 to-pink-400' },
            { icon: TrendingUp, label: 'Total XP', value: userData?.xp || 0, color: 'from-blue-400 to-cyan-400' },
            { icon: Trophy, label: 'Badges', value: userData?.badges?.length || 0, color: 'from-yellow-400 to-orange-400' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'habits', label: 'My Habits', icon: Target },
            { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
            { id: 'community', label: 'Community', icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'glass hover:shadow-lg'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Habits Tab */}
        {activeTab === 'habits' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-display font-bold">Your Habits</h3>
              <button
                onClick={() => setShowAddHabit(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Habit
              </button>
            </div>

            {habits.length === 0 ? (
              <div className="card text-center py-12">
                <Target className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">No habits yet</h3>
                <p className="text-gray-600 mb-4">Start building better habits today!</p>
                <button onClick={() => setShowAddHabit(true)} className="btn-primary">
                  Create Your First Habit
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {habits.map((habit, index) => {
                  const isCompletedToday = habit.completedDates.some(date => isToday(date));
                  
                  return (
                    <motion.div
                      key={habit.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="card group relative"
                    >
                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setHabitToDelete(habit);
                        }}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-red-100 text-red-500"
                        title="Delete Habit"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div 
                        className="cursor-pointer"
                        onClick={() => toggleHabitCompletion(habit)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`text-4xl`}>{habit.icon}</div>
                            <div>
                              <h4 className="font-semibold text-lg">{habit.name}</h4>
                              <p className="text-sm text-gray-600">{habit.description}</p>
                            </div>
                          </div>
                          <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
                            isCompletedToday 
                              ? 'bg-gradient-to-br from-purple-500 to-pink-500 border-purple-500' 
                              : 'border-gray-300 group-hover:border-purple-400'
                          }`}>
                            {isCompletedToday && <Check className="w-5 h-5 text-white" />}
                          </div>
                        </div>
                      
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Flame className="w-4 h-4 text-orange-500" />
                            <span className="font-semibold">{habit.streak} day streak</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <span>{habit.completedDates.length} total</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-display font-bold">Top Performers 🏆</h3>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 bg-green-500 rounded-full"
                />
                <span className="text-sm font-semibold">Live</span>
              </div>
            </div>
            <div className="card">
              {leaderboard.map((user, index) => (
                <div
                  key={user.uid}
                  className={`flex items-center justify-between p-4 rounded-xl mb-2 ${
                    index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : 'hover:bg-white/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-400 text-white' :
                      index === 1 ? 'bg-gray-300 text-white' :
                      index === 2 ? 'bg-orange-400 text-white' :
                      'bg-gray-200'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold">{user.displayName}</div>
                      <div className="text-sm text-gray-600">Level {user.level}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{user.xp} XP</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Community Tab */}
        {activeTab === 'community' && (
          <div>
            <CommunityGroups />
          </div>
        )}
      </main>

      {/* Add Habit Modal */}
      {showAddHabit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-8 max-w-md w-full"
          >
            <h3 className="text-2xl font-display font-bold mb-6">Create New Habit</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Habit Name</label>
                <input
                  type="text"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                  className="input-glass"
                  placeholder="e.g., Morning Exercise"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <input
                  type="text"
                  value={newHabit.description}
                  onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                  className="input-glass"
                  placeholder="e.g., 30 minutes of cardio"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Icon</label>
                <div className="grid grid-cols-6 gap-2">
                  {['🎯', '💪', '📚', '🧘', '💧', '🏃', '🎨', '🎵', '✍️', '🌱', '🔥', '⭐'].map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setNewHabit({ ...newHabit, icon })}
                      className={`text-3xl p-2 rounded-xl transition-all ${
                        newHabit.icon === icon ? 'bg-purple-100 scale-110' : 'hover:bg-gray-100'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddHabit(false)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={addHabit} className="btn-primary flex-1">
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
          className="fixed top-24 right-8 z-50 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3"
        >
          <Award className="w-6 h-6" />
          <span className="font-bold text-lg">+{xpGainAmount} XP</span>
        </motion.div>
      )}

      {/* Level Up Modal */}
      {showLevelUp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            className="glass rounded-3xl p-8 max-w-md w-full text-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 360]
              }}
              transition={{ 
                duration: 0.6,
                repeat: 2
              }}
              className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
            >
              <Trophy className="w-12 h-12 text-white" />
            </motion.div>
            
            <h3 className="text-4xl font-display font-bold mb-2 text-gradient">Level Up!</h3>
            <p className="text-6xl font-bold mb-4">Level {newLevelReached}</p>
            <p className="text-lg text-gray-600 mb-6">
              Congratulations! You&apos;re making amazing progress! 🎉
            </p>
            
            <button 
              onClick={() => setShowLevelUp(false)} 
              className="btn-primary w-full"
            >
              Awesome!
            </button>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {habitToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-8 max-w-md w-full"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-2xl font-display font-bold">Delete Habit?</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{habitToDelete.icon}</div>
                <div>
                  <h4 className="font-semibold">{habitToDelete.name}</h4>
                  <p className="text-sm text-gray-600">
                    {habitToDelete.streak} day streak • {habitToDelete.completedDates.length} completions
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this habit? All your progress and streak data will be permanently lost.
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setHabitToDelete(null)} 
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button 
                onClick={() => deleteHabit(habitToDelete)} 
                className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
