'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, updateDoc, arrayUnion, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { Users, Check, AlertCircle, Loader } from 'lucide-react';

export default function JoinGroupPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const params = useParams();
  const groupId = params?.groupId as string;
  
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<any>(null);
  const [status, setStatus] = useState<'checking' | 'joining' | 'success' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!user) {
      // Redirect to auth with return URL
      router.push(`/auth?returnTo=/join-group/${groupId}`);
      return;
    }

    joinGroup();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, groupId]);

  const joinGroup = async () => {
    if (!user || !userData || !groupId) return;

    try {
      // Get group details
      const groupRef = doc(db, 'groups', groupId);
      const groupSnap = await getDoc(groupRef);

      if (!groupSnap.exists()) {
        setStatus('error');
        setErrorMessage('Group not found or link is invalid.');
        setLoading(false);
        return;
      }

      const groupData = groupSnap.data();
      setGroup({ id: groupSnap.id, ...groupData });

      // Check if user is already a member
      if (groupData.members?.includes(user.uid)) {
        setStatus('success');
        setErrorMessage('You are already a member of this group!');
        setLoading(false);
        setTimeout(() => router.push('/dashboard'), 2000);
        return;
      }

      // Check if user has deleted this group "for me"
      const userRef = doc(db, 'users', user.uid);
      if (userData.deletedGroups?.includes(groupId)) {
        // Remove from deletedGroups array
        await updateDoc(userRef, {
          deletedGroups: userData.deletedGroups.filter((id: string) => id !== groupId)
        });
      }

      // Join the group
      setStatus('joining');
      await updateDoc(groupRef, {
        members: arrayUnion(user.uid)
      });

      // Send system message
      await addDoc(collection(db, 'groupMessages'), {
        groupId: groupId,
        userId: user.uid,
        userName: userData.displayName || 'Anonymous',
        userPhoto: userData.photoURL || null,
        message: `${userData.displayName || 'Anonymous'} joined the group`,
        createdAt: serverTimestamp(),
        type: 'system',
      });

      setStatus('success');
      setLoading(false);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (error: any) {
      console.error('Error joining group:', error);
      setStatus('error');
      setErrorMessage(error.message || 'Failed to join group. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-dark rounded-3xl p-10 max-w-md w-full border-2 border-primary/30 text-center"
      >
        {status === 'checking' && (
          <>
            <Loader className="w-16 h-16 mx-auto mb-6 text-primary animate-spin" />
            <h2 className="text-2xl font-bold text-white mb-2">Checking Group...</h2>
            <p className="text-gray-400">Please wait</p>
          </>
        )}

        {status === 'joining' && (
          <>
            <Loader className="w-16 h-16 mx-auto mb-6 text-primary animate-spin" />
            <h2 className="text-2xl font-bold text-white mb-2">Joining Group...</h2>
            <p className="text-gray-400">Adding you to {group?.name}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Success!</h2>
            {group && (
              <div className="bg-dark-800/50 border border-dark-600 rounded-2xl p-5 my-6">
                <div className="flex items-center justify-center gap-4">
                  <div className="text-4xl">{group.icon || '👥'}</div>
                  <div>
                    <h3 className="font-bold text-lg text-white">{group.name}</h3>
                    <p className="text-sm text-gray-400">
                      {group.members?.length || 0} members
                    </p>
                  </div>
                </div>
              </div>
            )}
            <p className="text-gray-400 mb-4">{errorMessage || 'You have joined the group!'}</p>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Oops!</h2>
            <p className="text-gray-400 mb-6">{errorMessage}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full px-6 py-4 bg-gradient-green text-black rounded-xl font-bold shadow-glow hover:shadow-glow-lg transition-all"
            >
              Go to Dashboard
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}

