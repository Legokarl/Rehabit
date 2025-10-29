'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Target, Trophy, Star, Check, ArrowRight, 
  UserPlus, Flame, Award, TrendingUp, Clock, X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  collection, query, getDocs, addDoc, updateDoc, doc, arrayUnion, arrayRemove,
  where, orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  goal: number;
  currentProgress: number;
  participants: string[];
  participantNames: { [key: string]: string };
  xpReward: number;
  deadline: Date;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'collective' | 'individual';
  createdAt: Date;
}

export default function CommunityChallengesPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [challenges, setChallenges] = useState<CommunityChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<CommunityChallenge | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }
    
    fetchChallenges();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchChallenges, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchChallenges = async () => {
    try {
      const q = query(
        collection(db, 'communityChallenges'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const challengesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        deadline: doc.data().deadline?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as CommunityChallenge[];
      
      setChallenges(challengesData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching community challenges:', error);
      // Initialize with sample data if none exists
      initializeSampleChallenges();
      setLoading(false);
    }
  };

  const initializeSampleChallenges = async () => {
    const sampleChallenges = [
      {
        title: '🏃 Team Marathon',
        description: 'Complete 1000 habits as a community!',
        goal: 1000,
        currentProgress: 247,
        participants: [],
        participantNames: {},
        xpReward: 200,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        icon: '🏃',
        difficulty: 'hard',
        type: 'collective',
        createdAt: new Date(),
      },
      {
        title: '🔥 Weekly Streak Masters',
        description: 'Maintain a 7-day streak together!',
        goal: 50,
        currentProgress: 12,
        participants: [],
        participantNames: {},
        xpReward: 100,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        icon: '🔥',
        difficulty: 'medium',
        type: 'individual',
        createdAt: new Date(),
      },
      {
        title: '⭐ XP Champions',
        description: 'Earn 10,000 XP as a group!',
        goal: 10000,
        currentProgress: 3450,
        participants: [],
        participantNames: {},
        xpReward: 150,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        icon: '⭐',
        difficulty: 'hard',
        type: 'collective',
        createdAt: new Date(),
      },
      {
        title: '💪 Consistency Challenge',
        description: 'Complete 500 daily habits together!',
        goal: 500,
        currentProgress: 89,
        participants: [],
        participantNames: {},
        xpReward: 175,
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        icon: '💪',
        difficulty: 'medium',
        type: 'collective',
        createdAt: new Date(),
      },
      {
        title: '🎯 Goal Getters',
        description: 'Achieve 30 personal milestones!',
        goal: 30,
        currentProgress: 7,
        participants: [],
        participantNames: {},
        xpReward: 125,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        icon: '🎯',
        difficulty: 'easy',
        type: 'individual',
        createdAt: new Date(),
      },
      {
        title: '🌟 Rising Stars',
        description: 'Reach level 10 as a team!',
        goal: 100,
        currentProgress: 23,
        participants: [],
        participantNames: {},
        xpReward: 250,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        icon: '🌟',
        difficulty: 'hard',
        type: 'collective',
        createdAt: new Date(),
      },
      {
        title: '⚡ Speed Demons',
        description: 'Complete 100 habits in 5 days!',
        goal: 100,
        currentProgress: 34,
        participants: [],
        participantNames: {},
        xpReward: 300,
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        icon: '⚡',
        difficulty: 'hard',
        type: 'collective',
        createdAt: new Date(),
      },
      {
        title: '🏆 Trophy Hunters',
        description: 'Earn 20 achievements together!',
        goal: 20,
        currentProgress: 5,
        participants: [],
        participantNames: {},
        xpReward: 180,
        deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        icon: '🏆',
        difficulty: 'medium',
        type: 'individual',
        createdAt: new Date(),
      },
    ];

    try {
      for (const challenge of sampleChallenges) {
        await addDoc(collection(db, 'communityChallenges'), challenge);
      }
      fetchChallenges();
    } catch (error) {
      console.error('Error creating sample challenges:', error);
      setChallenges(sampleChallenges as any);
    }
  };

  const joinChallenge = async (challenge: CommunityChallenge) => {
    if (!user || !userData) return;
    
    try {
      const challengeRef = doc(db, 'communityChallenges', challenge.id);
      await updateDoc(challengeRef, {
        participants: arrayUnion(user.uid),
        [`participantNames.${user.uid}`]: userData.displayName || 'User',
      });
      
      fetchChallenges();
    } catch (error) {
      console.error('Error joining challenge:', error);
    }
  };

  const leaveChallenge = async (challenge: CommunityChallenge) => {
    if (!user) return;
    
    try {
      const challengeRef = doc(db, 'communityChallenges', challenge.id);
      const updatedParticipantNames = { ...challenge.participantNames };
      delete updatedParticipantNames[user.uid];
      
      await updateDoc(challengeRef, {
        participants: arrayRemove(user.uid),
        participantNames: updatedParticipantNames,
      });
      
      fetchChallenges();
    } catch (error) {
      console.error('Error leaving challenge:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'from-green-500 to-emerald-600';
      case 'medium': return 'from-yellow-500 to-orange-600';
      case 'hard': return 'from-red-500 to-pink-600';
      default: return 'from-primary-500 to-primary-600';
    }
  };

  const getProgressPercentage = (challenge: CommunityChallenge) => {
    return Math.min(100, Math.round((challenge.currentProgress / challenge.goal) * 100));
  };

  const getDaysLeft = (deadline: Date) => {
    const days = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const isParticipating = (challenge: CommunityChallenge) => {
    return user && challenge.participants.includes(user.uid);
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
              <Users className="w-9 h-9 text-black" />
            </div>
            <div>
              <h1 className="text-5xl font-display font-black">
                👥 Community <span className="text-gradient-green">Challenges</span>
              </h1>
              <p className="text-gray-400 text-lg">Team up with others to achieve amazing goals!</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          {[
            { 
              icon: Trophy, 
              label: 'Active Challenges', 
              value: challenges.length,
              color: 'from-yellow-500 to-orange-600'
            },
            { 
              icon: UserPlus, 
              label: 'Your Participations', 
              value: challenges.filter(c => isParticipating(c)).length,
              color: 'from-primary-500 to-primary-600'
            },
            { 
              icon: Star, 
              label: 'Total Participants', 
              value: challenges.reduce((sum, c) => sum + c.participants.length, 0),
              color: 'from-blue-500 to-purple-600'
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="glass-dark rounded-3xl p-6 border border-primary/20"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-4xl font-black text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Challenge Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {challenges.map((challenge, index) => {
              const participating = isParticipating(challenge);
              const progress = getProgressPercentage(challenge);
              const daysLeft = getDaysLeft(challenge.deadline);
              
              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  {/* Glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${getDifficultyColor(challenge.difficulty)} opacity-20 rounded-3xl blur-xl group-hover:opacity-30 transition-opacity`} />
                  
                  <div className="relative glass-dark rounded-3xl p-6 border border-primary/20 hover:border-primary/40 transition-all">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getDifficultyColor(challenge.difficulty)} flex items-center justify-center text-2xl shadow-lg`}>
                          {challenge.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{challenge.title}</h3>
                          <p className="text-sm text-gray-400">{challenge.description}</p>
                        </div>
                      </div>
                      
                      <div className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-br ${getDifficultyColor(challenge.difficulty)} text-white`}>
                        {challenge.difficulty.toUpperCase()}
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">
                          {challenge.type === 'collective' ? 'Group Progress' : 'Participants Progress'}
                        </span>
                        <span className="text-primary font-bold">
                          {challenge.currentProgress} / {challenge.goal}
                        </span>
                      </div>
                      <div className="h-3 bg-dark-800 rounded-full overflow-hidden border border-primary/20">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className={`h-full bg-gradient-to-r ${getDifficultyColor(challenge.difficulty)}`}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{progress}% Complete</div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-white/10">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Star className="w-4 h-4 text-primary" />
                          <span className="text-lg font-bold text-primary">+{challenge.xpReward}</span>
                        </div>
                        <div className="text-xs text-gray-400">XP Reward</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Users className="w-4 h-4 text-primary" />
                          <span className="text-lg font-bold text-white">{challenge.participants.length}</span>
                        </div>
                        <div className="text-xs text-gray-400">Members</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Clock className="w-4 h-4 text-primary" />
                          <span className="text-lg font-bold text-white">{daysLeft}</span>
                        </div>
                        <div className="text-xs text-gray-400">Days Left</div>
                      </div>
                    </div>

                    {/* Participants */}
                    {challenge.participants.length > 0 && (
                      <div className="mb-4">
                        <div className="text-xs text-gray-400 mb-2">Participants:</div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {challenge.participants.slice(0, 5).map((uid) => (
                            <div
                              key={uid}
                              className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-xs font-bold text-white border border-primary/20"
                            >
                              {challenge.participantNames[uid]?.charAt(0) || 'U'}
                            </div>
                          ))}
                          {challenge.participants.length > 5 && (
                            <div className="text-xs text-gray-400">
                              +{challenge.participants.length - 5} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={() => participating ? leaveChallenge(challenge) : joinChallenge(challenge)}
                      className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                        participating
                          ? 'bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30'
                          : 'bg-gradient-green text-black hover:shadow-glow-lg'
                      }`}
                    >
                      {participating ? (
                        <>
                          <X className="w-5 h-5" />
                          Leave Challenge
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-5 h-5" />
                          Join Challenge
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {challenges.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-dark rounded-3xl p-16 text-center border border-primary/20"
          >
            <Users className="w-24 h-24 mx-auto mb-6 text-primary" />
            <h3 className="text-2xl font-bold mb-3 text-white">No Community Challenges Yet</h3>
            <p className="text-gray-400 mb-6">
              Be the first to create a community challenge and invite others to join!
            </p>
          </motion.div>
        )}

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <button
            onClick={() => router.push('/challenges')}
            className="text-gray-400 hover:text-primary transition-colors font-medium flex items-center gap-2 mx-auto group"
          >
            <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
            Back to Challenges
          </button>
        </motion.div>
      </div>
    </div>
  );
}

