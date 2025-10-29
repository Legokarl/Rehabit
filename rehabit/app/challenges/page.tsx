'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Trophy, Star, Lock, Check, RefreshCw, ArrowRight, 
  Target, Flame, Award, TrendingUp, Brain, Code, Puzzle, Users, Clock
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Challenge pool with auto-check conditions
const CHALLENGE_POOL = [
  { 
    id: 1, 
    title: '🧠 Complete 5 habits today', 
    xp: 50, 
    icon: Brain, 
    difficulty: 'easy',
    checkCondition: (userData: UserData, habits: Habit[]) => {
      const today = new Date().toDateString();
      const completedToday = habits.filter(h => 
        h.completedDates?.some((d: Date) => new Date(d).toDateString() === today)
      );
      return completedToday.length >= 5;
    }
  },
  { 
    id: 2, 
    title: '⚡ Maintain a 7-day streak', 
    xp: 100, 
    icon: Zap, 
    difficulty: 'medium',
    checkCondition: (userData: UserData, habits: Habit[]) => {
      return habits.some(h => (h.streak || 0) >= 7);
    }
  },
  { 
    id: 3, 
    title: '💻 Create your first habit', 
    xp: 30, 
    icon: Code, 
    difficulty: 'easy',
    checkCondition: (userData: UserData, habits: Habit[]) => {
      return habits.length >= 1;
    }
  },
  { 
    id: 4, 
    title: '🧩 Reach Level 5', 
    xp: 150, 
    icon: Puzzle, 
    difficulty: 'hard',
    checkCondition: (userData: UserData, habits: Habit[]) => {
      return (userData?.level || 1) >= 5;
    }
  },
  { 
    id: 5, 
    title: '🔥 Build a 3-day streak', 
    xp: 75, 
    icon: Flame, 
    difficulty: 'medium',
    checkCondition: (userData: UserData, habits: Habit[]) => {
      return habits.some(h => (h.streak || 0) >= 3);
    }
  },
  { 
    id: 6, 
    title: '🎯 Create 5 habits', 
    xp: 40, 
    icon: Target, 
    difficulty: 'easy',
    checkCondition: (userData: UserData, habits: Habit[]) => {
      return habits.length >= 5;
    }
  },
  { 
    id: 7, 
    title: '⭐ Earn 500 total XP', 
    xp: 200, 
    icon: Star, 
    difficulty: 'hard',
    checkCondition: (userData: UserData, habits: Habit[]) => {
      return (userData?.xp || 0) >= 500;
    }
  },
  { 
    id: 8, 
    title: '💪 Complete any habit 10 times', 
    xp: 80, 
    icon: TrendingUp, 
    difficulty: 'medium',
    checkCondition: (userData: UserData, habits: Habit[]) => {
      return habits.some(h => (h.completedDates?.length || 0) >= 10);
    }
  },
  { 
    id: 9, 
    title: '🏆 Reach Level 3', 
    xp: 120, 
    icon: Trophy, 
    difficulty: 'medium',
    checkCondition: (userData: UserData, habits: Habit[]) => {
      return (userData?.level || 1) >= 3;
    }
  },
  { 
    id: 10, 
    title: '✨ Complete 3 habits today', 
    xp: 60, 
    icon: Award, 
    difficulty: 'easy',
    checkCondition: (userData: UserData, habits: Habit[]) => {
      const today = new Date().toDateString();
      const completedToday = habits.filter(h => 
        h.completedDates?.some((d: Date) => new Date(d).toDateString() === today)
      );
      return completedToday.length >= 3;
    }
  },
];

interface Challenge {
  id: number;
  title: string;
  xp: number;
  icon: React.ComponentType<{ className?: string }>;
  difficulty: string;
  status: 'locked' | 'in_progress' | 'completed';
  checkCondition?: (userData: UserData, habits: Habit[]) => boolean;
  progress?: number;
}

interface Habit {
  id: string;
  completedDates?: Date[];
  streak?: number;
}

interface UserData {
  xp?: number;
  level?: number;
}

interface UserChallenges {
  activeChallenges: number[];
  completedChallenges: number[];
  challengeXP: number;
  challengeLevel: number;
}

export default function ChallengesPage() {
  const { user, userData, refreshUserData } = useAuth();
  const router = useRouter();
  
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenges>({
    activeChallenges: [],
    completedChallenges: [],
    challengeXP: 0,
    challengeLevel: 1,
  });
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [justCompleted, setJustCompleted] = useState<number[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }
    
    fetchHabits();
    
    // Load user challenges from localStorage
    const savedChallenges = localStorage.getItem(`challenges_${user.uid}`);
    if (savedChallenges) {
      const parsed = JSON.parse(savedChallenges);
      setUserChallenges(parsed);
      loadChallenges(parsed);
    } else {
      // First time - initialize with 3 random challenges
      initializeChallenges();
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Auto-check challenges when habits or userData changes
  useEffect(() => {
    if (habits.length > 0 && challenges.length > 0 && userData) {
      checkAllChallenges();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habits, userData, challenges]);

  const initializeChallenges = () => {
    const randomChallenges = getRandomChallenges(3);
    const initialData: UserChallenges = {
      activeChallenges: randomChallenges.map(c => c.id),
      completedChallenges: [],
      challengeXP: 0,
      challengeLevel: 1,
    };
    setUserChallenges(initialData);
    saveChallenges(initialData);
    loadChallenges(initialData);
  };

  const getRandomChallenges = (count: number, exclude: number[] = []): typeof CHALLENGE_POOL => {
    const available = CHALLENGE_POOL.filter(c => !exclude.includes(c.id));
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  const loadChallenges = (data: UserChallenges) => {
    const loaded: Challenge[] = data.activeChallenges.map(id => {
      const challenge = CHALLENGE_POOL.find(c => c.id === id);
      if (!challenge) return null;
      
      const isCompleted = data.completedChallenges.includes(id);
      let progress = 0;
      
      // Calculate progress if we have data
      if (userData && habits.length > 0) {
        // Try to determine progress (this is a simple estimation)
        if (isCompleted) {
          progress = 100;
        } else {
          // You can add more sophisticated progress tracking here
          progress = 0;
        }
      }
      
      return {
        ...challenge,
        status: isCompleted ? 'completed' : 'in_progress' as const,
        progress,
      };
    }).filter(Boolean) as Challenge[];
    
    setChallenges(loaded);
  };

  const fetchHabits = async () => {
    if (!user) return;
    
    try {
      const q = query(
        collection(db, 'habits'),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const habitsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          lastCompleted: data.lastCompleted?.toDate(),
          completedDates: data.completedDates?.map((d: { toDate: () => Date }) => d.toDate()) || [],
        };
      }) as Habit[];
      
      setHabits(habitsData);
    } catch (error) {
      console.error('Error fetching habits:', error);
    }
  };

  const saveChallenges = (data: UserChallenges) => {
    if (user) {
      localStorage.setItem(`challenges_${user.uid}`, JSON.stringify(data));
    }
  };

  const checkAllChallenges = async () => {
    const newlyCompleted: number[] = [];
    
    for (const challenge of challenges) {
      // Skip if already completed
      if (challenge.status === 'completed') continue;
      
      // Check if challenge condition is met
      if (challenge.checkCondition && challenge.checkCondition(userData, habits)) {
        // Auto-complete the challenge
        if (!userChallenges.completedChallenges.includes(challenge.id)) {
          newlyCompleted.push(challenge.id);
          await autoCompleteChallenge(challenge);
        }
      }
    }
    
    if (newlyCompleted.length > 0) {
      setJustCompleted(newlyCompleted);
      setTimeout(() => setJustCompleted([]), 3000);
    }
  };

  const autoCompleteChallenge = async (challenge: Challenge) => {
    const newXP = userChallenges.challengeXP + challenge.xp;
    const newLevel = Math.floor(newXP / 100) + 1;
    const leveledUp = newLevel > userChallenges.challengeLevel;

    const updatedData: UserChallenges = {
      ...userChallenges,
      completedChallenges: [...userChallenges.completedChallenges, challenge.id],
      challengeXP: newXP,
      challengeLevel: newLevel,
    };

    setUserChallenges(updatedData);
    saveChallenges(updatedData);
    loadChallenges(updatedData);

    // Also update main user XP in Firebase
    if (user && userData) {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        xp: (userData.xp || 0) + challenge.xp,
        level: Math.floor(((userData.xp || 0) + challenge.xp) / 100) + 1,
      });
      await refreshUserData();
    }

    if (leveledUp) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  };

  const generateNewChallenge = () => {
    if (challenges.length === 0) return;

    // Pick a random active challenge to replace
    const indexToReplace = Math.floor(Math.random() * challenges.length);
    const challengeToReplace = challenges[indexToReplace];

    // Get a new random challenge (excluding current active ones)
    const exclude = [...userChallenges.activeChallenges, ...userChallenges.completedChallenges];
    const newChallenges = getRandomChallenges(1, exclude);
    
    if (newChallenges.length === 0) {
      alert('No more challenges available!');
      return;
    }

    const newChallenge = newChallenges[0];
    
    const updatedActiveChallenges = [...userChallenges.activeChallenges];
    updatedActiveChallenges[indexToReplace] = newChallenge.id;

    const updatedData: UserChallenges = {
      ...userChallenges,
      activeChallenges: updatedActiveChallenges,
    };

    setUserChallenges(updatedData);
    saveChallenges(updatedData);
    loadChallenges(updatedData);
  };

  const calculateLevelProgress = () => {
    const currentLevelXP = userChallenges.challengeXP % 100;
    return (currentLevelXP / 100) * 100;
  };

  const getXPToNextLevel = () => {
    return 100 - (userChallenges.challengeXP % 100);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'from-green-500 to-emerald-600';
      case 'medium': return 'from-yellow-500 to-orange-600';
      case 'hard': return 'from-red-500 to-pink-600';
      default: return 'from-primary-500 to-primary-600';
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
              <Zap className="w-9 h-9 text-black" />
            </div>
            <div>
              <h1 className="text-5xl font-display font-black">
                🔥 Coding <span className="text-gradient-green">Challenges</span>
              </h1>
              <p className="text-gray-400 text-lg">Complete challenges to earn bonus XP and level up faster!</p>
            </div>
          </div>
        </motion.div>

        {/* Challenge Level Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-dark rounded-3xl p-8 mb-8 border border-primary/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-green flex items-center justify-center shadow-glow font-black text-3xl text-black">
                {userChallenges.challengeLevel}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Challenge Level {userChallenges.challengeLevel}</h3>
                <p className="text-gray-400">
                  {userChallenges.challengeXP} XP • {getXPToNextLevel()} XP to next level
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-4xl font-black text-gradient-green">{userChallenges.challengeXP} XP</div>
              <div className="text-sm text-gray-400">Total Challenge XP</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-4 bg-dark-800 rounded-full overflow-hidden border border-primary/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${calculateLevelProgress()}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-green shadow-glow"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-white drop-shadow-lg">
                {Math.floor(calculateLevelProgress())}%
              </span>
            </div>
          </div>
        </motion.div>

        {/* Challenge Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <AnimatePresence mode="popLayout">
            {challenges.map((challenge, index) => {
              const Icon = challenge.icon;
              const isCompleted = challenge.status === 'completed';
              const isJustCompleted = justCompleted.includes(challenge.id);
              
              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    scale: isJustCompleted ? [1, 1.05, 1] : 1, 
                    y: 0 
                  }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative group ${isCompleted ? 'opacity-75' : ''}`}
                >
                  {/* Glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${getDifficultyColor(challenge.difficulty)} opacity-20 rounded-3xl blur-xl group-hover:opacity-30 transition-opacity`} />
                  
                  <div className="relative glass-dark rounded-3xl p-6 border border-primary/20 hover:border-primary/40 transition-all h-full flex flex-col">
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      {isCompleted ? (
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-glow">
                          <Check className="w-6 h-6 text-black" />
                        </div>
                      ) : (
                        <div className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-br ${getDifficultyColor(challenge.difficulty)} text-white`}>
                          {challenge.difficulty.toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getDifficultyColor(challenge.difficulty)} flex items-center justify-center mb-4 shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-white mb-3 pr-12">
                      {challenge.title}
                    </h3>

                    {/* XP Reward */}
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="w-5 h-5 text-primary" />
                      <span className="text-2xl font-black text-gradient-green">+{challenge.xp} XP</span>
                    </div>

                    {/* Status */}
                    <div className={`mt-auto w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                      isCompleted
                        ? 'bg-gradient-green text-black shadow-glow'
                        : 'bg-dark-800/50 text-gray-400 border border-primary/20'
                    }`}>
                      {isCompleted ? (
                        <>
                          <Check className="w-5 h-5" />
                          Completed! 🎉
                        </>
                      ) : (
                        <>
                          <Clock className="w-5 h-5" />
                          In Progress...
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Generate New Challenge Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center mb-12"
        >
          <button
            onClick={generateNewChallenge}
            className="group px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-2xl font-bold text-lg hover:shadow-glow-lg hover:scale-105 transition-all flex items-center gap-3"
          >
            <RefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
            Generate New Challenge
          </button>
        </motion.div>

        {/* Additional Features */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-dark rounded-3xl p-8 border border-primary/20 text-center group hover:border-primary/40 transition-all cursor-pointer"
            onClick={() => router.push('/leaderboard')}
          >
            <Trophy className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h3 className="text-2xl font-bold mb-2 text-white">Leaderboard</h3>
            <p className="text-gray-400 mb-4">Compete with other users and climb the ranks!</p>
            <button className="px-6 py-3 bg-gradient-green text-black rounded-xl font-bold hover:shadow-glow-lg transition-all inline-flex items-center gap-2">
              View Rankings
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass-dark rounded-3xl p-8 border border-primary/20 text-center group hover:border-primary/40 transition-all cursor-pointer"
            onClick={() => router.push('/community-challenges')}
          >
            <Users className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h3 className="text-2xl font-bold mb-2 text-white">Community Challenges</h3>
            <p className="text-gray-400 mb-4">Team up with friends for group challenges!</p>
            <button className="px-6 py-3 bg-gradient-green text-black rounded-xl font-bold hover:shadow-glow-lg transition-all inline-flex items-center gap-2">
              Join Challenges
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>

        {/* Back to Dashboard */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-400 hover:text-primary transition-colors font-medium flex items-center gap-2 mx-auto group"
          >
            <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
        </motion.div>
      </div>

      {/* Level Up Celebration */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.5, rotate: 10 }}
              className="glass-dark rounded-3xl p-12 text-center border-2 border-primary/40 max-w-md"
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
                className="w-24 h-24 mx-auto mb-6 bg-gradient-green rounded-full flex items-center justify-center shadow-glow-lg"
              >
                <Trophy className="w-12 h-12 text-black" />
              </motion.div>
              
              <h2 className="text-4xl font-black mb-3 text-gradient-green">Level Up!</h2>
              <p className="text-6xl font-black mb-4 text-white">Level {userChallenges.challengeLevel}</p>
              <p className="text-xl text-gray-400">
                Amazing! You&apos;ve reached a new challenge level! 🎉
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

