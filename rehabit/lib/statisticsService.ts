import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  increment,
  collection,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { startOfDay, subDays } from 'date-fns';

export interface UserStatistics {
  userId: string;
  
  // All-time stats
  totalHabitsCompleted: number;
  totalHabitsCreated: number;
  bestStreak: number;
  currentStreak: number;
  perfectDaysCount: number;
  totalXPEarned: number;
  
  // Current period stats
  weeklyCompletions: number;
  monthlyCompletions: number;
  
  // Engagement metrics
  daysActive: number;
  lastActiveDate: Date;
  accountCreatedDate: Date;
  
  // Achievement tracking
  longestSessionDays: number;
  consecutivePerfectDays: number;
  
  // Updated timestamp
  lastUpdated: Date;
}

export interface DailyStats {
  userId: string;
  date: string; // YYYY-MM-DD format
  habitsCompleted: number;
  totalHabits: number;
  isPerfectDay: boolean;
  xpEarned: number;
  timestamp: Date;
}

/**
 * Initialize user statistics when they sign up
 */
export async function initializeUserStats(userId: string): Promise<void> {
  const statsRef = doc(db, 'statistics', userId);
  const statsDoc = await getDoc(statsRef);
  
  if (!statsDoc.exists()) {
    const initialStats: UserStatistics = {
      userId,
      totalHabitsCompleted: 0,
      totalHabitsCreated: 0,
      bestStreak: 0,
      currentStreak: 0,
      perfectDaysCount: 0,
      totalXPEarned: 0,
      weeklyCompletions: 0,
      monthlyCompletions: 0,
      daysActive: 0,
      lastActiveDate: new Date(),
      accountCreatedDate: new Date(),
      longestSessionDays: 0,
      consecutivePerfectDays: 0,
      lastUpdated: new Date(),
    };
    
    await setDoc(statsRef, initialStats);
  }
}

/**
 * Get user statistics
 */
export async function getUserStats(userId: string): Promise<UserStatistics | null> {
  const statsRef = doc(db, 'statistics', userId);
  const statsDoc = await getDoc(statsRef);
  
  if (statsDoc.exists()) {
    const data = statsDoc.data();
    return {
      ...data,
      lastActiveDate: data.lastActiveDate?.toDate(),
      accountCreatedDate: data.accountCreatedDate?.toDate(),
      lastUpdated: data.lastUpdated?.toDate(),
    } as UserStatistics;
  }
  
  return null;
}

/**
 * Update statistics when a habit is completed
 */
export async function onHabitCompleted(
  userId: string, 
  habitId: string,
  xpGained: number = 10
): Promise<void> {
  const statsRef = doc(db, 'statistics', userId);
  const today = new Date().toISOString().split('T')[0];
  
  try {
    // Update main statistics
    await updateDoc(statsRef, {
      totalHabitsCompleted: increment(1),
      weeklyCompletions: increment(1),
      monthlyCompletions: increment(1),
      totalXPEarned: increment(xpGained),
      lastActiveDate: new Date(),
      lastUpdated: new Date(),
    });
    
    // Update or create daily stats
    const dailyStatsRef = doc(db, 'dailyStats', `${userId}_${today}`);
    const dailyStatsDoc = await getDoc(dailyStatsRef);
    
    if (dailyStatsDoc.exists()) {
      await updateDoc(dailyStatsRef, {
        habitsCompleted: increment(1),
        xpEarned: increment(xpGained),
        timestamp: new Date(),
      });
    } else {
      // Get total habits for the user to check if it's a perfect day
      const habitsQuery = query(
        collection(db, 'habits'),
        where('userId', '==', userId)
      );
      const habitsSnapshot = await getDocs(habitsQuery);
      const totalHabits = habitsSnapshot.size;
      
      const dailyStats: DailyStats = {
        userId,
        date: today,
        habitsCompleted: 1,
        totalHabits,
        isPerfectDay: false,
        xpEarned: xpGained,
        timestamp: new Date(),
      };
      
      await setDoc(dailyStatsRef, dailyStats);
    }
    
    // Check and update streaks
    await updateStreaks(userId);
    
    // Check for perfect day
    await checkPerfectDay(userId, today);
    
  } catch (error) {
    console.error('Error updating statistics:', error);
  }
}

/**
 * Update statistics when a habit is uncompleted
 */
export async function onHabitUncompleted(
  userId: string,
  habitId: string,
  xpLost: number = 10
): Promise<void> {
  const statsRef = doc(db, 'statistics', userId);
  const today = new Date().toISOString().split('T')[0];
  
  try {
    // Update main statistics
    await updateDoc(statsRef, {
      totalHabitsCompleted: increment(-1),
      weeklyCompletions: increment(-1),
      monthlyCompletions: increment(-1),
      totalXPEarned: increment(-xpLost),
      lastUpdated: new Date(),
    });
    
    // Update daily stats
    const dailyStatsRef = doc(db, 'dailyStats', `${userId}_${today}`);
    const dailyStatsDoc = await getDoc(dailyStatsRef);
    
    if (dailyStatsDoc.exists()) {
      await updateDoc(dailyStatsRef, {
        habitsCompleted: increment(-1),
        xpEarned: increment(-xpLost),
        isPerfectDay: false, // No longer a perfect day
        timestamp: new Date(),
      });
    }
    
    // Recalculate streaks
    await updateStreaks(userId);
    
  } catch (error) {
    console.error('Error updating statistics on uncomplet:', error);
  }
}

/**
 * Update when a new habit is created
 */
export async function onHabitCreated(userId: string): Promise<void> {
  const statsRef = doc(db, 'statistics', userId);
  
  try {
    await updateDoc(statsRef, {
      totalHabitsCreated: increment(1),
      lastUpdated: new Date(),
    });
  } catch (error) {
    console.error('Error updating habit creation stats:', error);
  }
}

/**
 * Update streaks based on habit completion history
 */
async function updateStreaks(userId: string): Promise<void> {
  try {
    // Get all habits for the user
    const habitsQuery = query(
      collection(db, 'habits'),
      where('userId', '==', userId)
    );
    const habitsSnapshot = await getDocs(habitsQuery);
    const habits = habitsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      completedDates: doc.data().completedDates?.map((d: any) => d.toDate()) || [],
    }));
    
    if (habits.length === 0) return;
    
    // Calculate current streak (any habit)
    const currentStreak = calculateCurrentStreak(habits);
    
    // Get best streak from all habits
    const bestStreak = Math.max(...habits.map((h: any) => h.streak || 0), 0);
    
    const statsRef = doc(db, 'statistics', userId);
    const statsDoc = await getDoc(statsRef);
    const currentBestStreak = statsDoc.exists() ? statsDoc.data().bestStreak : 0;
    
    await updateDoc(statsRef, {
      currentStreak,
      bestStreak: Math.max(bestStreak, currentBestStreak),
      lastUpdated: new Date(),
    });
    
  } catch (error) {
    console.error('Error updating streaks:', error);
  }
}

/**
 * Calculate current streak from habits
 */
function calculateCurrentStreak(habits: any[]): number {
  const today = startOfDay(new Date());
  const yesterday = startOfDay(subDays(new Date(), 1));
  
  // Check if any habit was completed today or yesterday
  const hasRecentActivity = habits.some(habit => {
    return habit.completedDates.some((date: Date) => {
      const completedDate = startOfDay(date);
      return completedDate.getTime() === today.getTime() || 
             completedDate.getTime() === yesterday.getTime();
    });
  });
  
  if (!hasRecentActivity) return 0;
  
  // Calculate streak
  let streak = 0;
  let currentDate = today;
  
  while (true) {
    const hasCompletionOnDate = habits.some(habit => {
      return habit.completedDates.some((date: Date) => {
        return startOfDay(date).getTime() === currentDate.getTime();
      });
    });
    
    if (!hasCompletionOnDate) break;
    
    streak++;
    currentDate = startOfDay(subDays(currentDate, 1));
    
    // Safety limit
    if (streak > 365) break;
  }
  
  return streak;
}

/**
 * Check if today is a perfect day (all habits completed)
 */
async function checkPerfectDay(userId: string, date: string): Promise<void> {
  try {
    const dailyStatsRef = doc(db, 'dailyStats', `${userId}_${date}`);
    const dailyStatsDoc = await getDoc(dailyStatsRef);
    
    if (!dailyStatsDoc.exists()) return;
    
    const dailyData = dailyStatsDoc.data();
    const isPerfect = dailyData.habitsCompleted >= dailyData.totalHabits && dailyData.totalHabits > 0;
    
    if (isPerfect && !dailyData.isPerfectDay) {
      // Mark day as perfect
      await updateDoc(dailyStatsRef, {
        isPerfectDay: true,
      });
      
      // Increment perfect days count
      const statsRef = doc(db, 'statistics', userId);
      await updateDoc(statsRef, {
        perfectDaysCount: increment(1),
        lastUpdated: new Date(),
      });
      
      // Check for consecutive perfect days
      await updateConsecutivePerfectDays(userId);
    }
  } catch (error) {
    console.error('Error checking perfect day:', error);
  }
}

/**
 * Update consecutive perfect days streak
 */
async function updateConsecutivePerfectDays(userId: string): Promise<void> {
  try {
    // Get last 30 days of stats
    const thirtyDaysAgo = subDays(new Date(), 30).toISOString().split('T')[0];
    const dailyStatsQuery = query(
      collection(db, 'dailyStats'),
      where('userId', '==', userId),
      where('date', '>=', thirtyDaysAgo)
    );
    
    const snapshot = await getDocs(dailyStatsQuery);
    const dailyStats = snapshot.docs
      .map(doc => doc.data())
      .sort((a, b) => b.date.localeCompare(a.date)); // Sort descending
    
    let consecutiveDays = 0;
    for (const day of dailyStats) {
      if (day.isPerfectDay) {
        consecutiveDays++;
      } else {
        break;
      }
    }
    
    const statsRef = doc(db, 'statistics', userId);
    const statsDoc = await getDoc(statsRef);
    const currentLongest = statsDoc.exists() ? statsDoc.data().longestSessionDays : 0;
    
    await updateDoc(statsRef, {
      consecutivePerfectDays: consecutiveDays,
      longestSessionDays: Math.max(consecutiveDays, currentLongest),
      lastUpdated: new Date(),
    });
    
  } catch (error) {
    console.error('Error updating consecutive perfect days:', error);
  }
}

/**
 * Reset weekly statistics (call this weekly via a scheduled function)
 */
export async function resetWeeklyStats(userId: string): Promise<void> {
  const statsRef = doc(db, 'statistics', userId);
  
  try {
    await updateDoc(statsRef, {
      weeklyCompletions: 0,
      lastUpdated: new Date(),
    });
  } catch (error) {
    console.error('Error resetting weekly stats:', error);
  }
}

/**
 * Reset monthly statistics (call this monthly via a scheduled function)
 */
export async function resetMonthlyStats(userId: string): Promise<void> {
  const statsRef = doc(db, 'statistics', userId);
  
  try {
    await updateDoc(statsRef, {
      monthlyCompletions: 0,
      lastUpdated: new Date(),
    });
  } catch (error) {
    console.error('Error resetting monthly stats:', error);
  }
}

/**
 * Get daily stats for a date range
 */
export async function getDailyStatsRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<DailyStats[]> {
  try {
    const dailyStatsQuery = query(
      collection(db, 'dailyStats'),
      where('userId', '==', userId),
      where('date', '>=', startDate),
      where('date', '<=', endDate)
    );
    
    const snapshot = await getDocs(dailyStatsQuery);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        timestamp: data.timestamp?.toDate(),
      } as DailyStats;
    });
  } catch (error) {
    console.error('Error getting daily stats:', error);
    return [];
  }
}

