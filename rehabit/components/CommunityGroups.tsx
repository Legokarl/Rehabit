'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Users, MessageCircle, LogIn, LogOut as LeaveIcon, 
  Hash, Search, Send, Sparkles, TrendingUp, Heart, 
  Book, Dumbbell, Brain, Coffee, X, Trash2, AlertTriangle,
  MoreVertical, Link2, Copy, Check, UserPlus, Share2, MessageSquare
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  collection, addDoc, query, where, getDocs, 
  updateDoc, doc, arrayUnion, arrayRemove, orderBy,
  onSnapshot, Timestamp, serverTimestamp, deleteDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';

interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  createdBy: string;
  createdByName: string;
  members: string[];
  createdAt: Date;
  memberCount: number;
}

interface Message {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  userPhoto: string | null;
  message: string;
  createdAt: Date;
  type?: 'user' | 'system'; // system messages for join/leave events
}

const categories = [
  { id: 'all', name: 'All Groups', icon: Sparkles, color: 'purple' },
  { id: 'fitness', name: 'Fitness', icon: Dumbbell, color: 'red' },
  { id: 'productivity', name: 'Productivity', icon: TrendingUp, color: 'blue' },
  { id: 'mindfulness', name: 'Mindfulness', icon: Brain, color: 'green' },
  { id: 'learning', name: 'Learning', icon: Book, color: 'yellow' },
  { id: 'health', name: 'Health', icon: Heart, color: 'pink' },
  { id: 'lifestyle', name: 'Lifestyle', icon: Coffee, color: 'orange' },
];

const groupIcons = ['🎯', '💪', '📚', '🧘', '💧', '🏃', '🎨', '🎵', '✍️', '🌱', '🔥', '⭐', '🚀', '💡', '🎓', '🏆'];

export default function CommunityGroups() {
  const { user, userData, refreshUserData } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showDeleteForMeConfirm, setShowDeleteForMeConfirm] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null); // Store group for modal
  const [groupToLeave, setGroupToLeave] = useState<Group | null>(null); // Store group for modal
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const [showInviteLink, setShowInviteLink] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    category: 'productivity',
    icon: '🎯'
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  // Refetch groups when userData changes (especially deletedGroups)
  useEffect(() => {
    if (userData) {
      fetchGroups();
    }
  }, [userData?.deletedGroups]);

  useEffect(() => {
    if (selectedGroup) {
      // Real-time listener for messages with server-side ordering
      const messagesQuery = query(
        collection(db, 'groupMessages'),
        where('groupId', '==', selectedGroup.id),
        orderBy('createdAt', 'asc')
      );

      const unsubscribe = onSnapshot(
        messagesQuery, 
        (snapshot) => {
        const messagesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Message[];
          
        setMessages(messagesData);
        },
        (error) => {
          console.error('Error in message listener:', error);
          alert(`Error loading messages: ${error.message}`);
        }
      );

      return () => unsubscribe();
    } else {
      // Clear messages when no group is selected
      setMessages([]);
    }
  }, [selectedGroup]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchGroups = async () => {
    try {
      const q = query(collection(db, 'groups'));
      const querySnapshot = await getDocs(q);
      let groupsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        memberCount: doc.data().members?.length || 0,
      })) as Group[];
      
      // Filter out groups that user has "deleted for me"
      if (user && userData?.deletedGroups && userData.deletedGroups.length > 0) {
        groupsData = groupsData.filter(group => !userData.deletedGroups!.includes(group.id));
      }
      
      setGroups(groupsData);
    } catch (error) {
      console.error('❌ Error fetching groups:', error);
    }
  };

  const createGroup = async () => {
    if (!user || !userData || !newGroup.name) return;

    try {
      const groupDoc = await addDoc(collection(db, 'groups'), {
        name: newGroup.name,
        description: newGroup.description,
        category: newGroup.category,
        icon: newGroup.icon,
        createdBy: user.uid,
        createdByName: userData.displayName,
        members: [user.uid],
        createdAt: new Date(),
      });

      // Send system message that group was created
      await addDoc(collection(db, 'groupMessages'), {
        groupId: groupDoc.id,
        userId: user.uid,
        userName: userData.displayName || 'Anonymous',
        userPhoto: userData.photoURL || null,
        message: `${userData.displayName || 'Anonymous'} created this group`,
        createdAt: serverTimestamp(),
        type: 'system',
      });

      setNewGroup({ name: '', description: '', category: 'productivity', icon: '🎯' });
      setShowCreateGroup(false);
      fetchGroups();
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const joinGroup = async (group: Group) => {
    if (!user || !userData) return;

    try {
      const groupRef = doc(db, 'groups', group.id);
      await updateDoc(groupRef, {
        members: arrayUnion(user.uid)
      });
      
      // Send system message that user joined
      await addDoc(collection(db, 'groupMessages'), {
        groupId: group.id,
        userId: user.uid,
        userName: userData.displayName || 'Anonymous',
        userPhoto: userData.photoURL || null,
        message: `${userData.displayName || 'Anonymous'} joined the group`,
        createdAt: serverTimestamp(),
        type: 'system',
      });
      
      await fetchGroups(); // Wait for refresh
    } catch (error) {
      console.error('Error joining group:', error);
      alert('Error joining group. Please try again.');
    }
  };

  const leaveGroup = async (group: Group) => {
    if (!user || !userData) {
      console.error('No user or userData');
      return;
    }

    try {
      // Send system message that user left BEFORE removing from members
      await addDoc(collection(db, 'groupMessages'), {
        groupId: group.id,
        userId: user.uid,
        userName: userData.displayName || 'Anonymous',
        userPhoto: userData.photoURL || null,
        message: `${userData.displayName || 'Anonymous'} left the group`,
        createdAt: serverTimestamp(),
        type: 'system',
      });
      
      const groupRef = doc(db, 'groups', group.id);
      await updateDoc(groupRef, {
        members: arrayRemove(user.uid)
      });
      
      // Close modals and reset state
      setShowLeaveConfirm(false);
        setSelectedGroup(null);
      setShowGroupMenu(false);
      
      // Refresh groups list
      await fetchGroups();
      
      alert(`You have left "${group.name}"`);
    } catch (error: any) {
      console.error('Error leaving group:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      alert(`Error leaving group: ${error.message}. Please try again.`);
    }
  };

  const deleteGroup = async (group: Group) => {
    if (!user || !userData) {
      console.error('No user or userData');
      return;
    }
    
    // Only creator can delete
    if (group.createdBy !== user.uid) {
      alert('Only the group creator can delete this group.');
      return;
    }

    try {
      // Delete all messages in the group first
      const messagesQuery = query(
        collection(db, 'groupMessages'),
        where('groupId', '==', group.id)
      );
      
      const messagesSnapshot = await getDocs(messagesQuery);
      
      if (messagesSnapshot.docs.length > 0) {
        const deletePromises = messagesSnapshot.docs.map(messageDoc => {
          return deleteDoc(doc(db, 'groupMessages', messageDoc.id));
        });
        await Promise.all(deletePromises);
      }

      // Delete the group itself
      const groupRef = doc(db, 'groups', group.id);
      await deleteDoc(groupRef);
      
      // Close modal and reset state
      setShowDeleteConfirm(false);
      setSelectedGroup(null);
      setShowGroupMenu(false);
      
      // Refresh groups list
      await fetchGroups();
      
      alert(`Group "${group.name}" has been deleted successfully for all members.`);
    } catch (error: any) {
      console.error('Error deleting group:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      if (error.code === 'permission-denied') {
        alert('Permission denied. Only the group creator can delete the group.');
      } else {
        alert(`Error deleting group: ${error.message}. Please try again.`);
      }
    }
  };

  const deleteForMe = async (group: Group) => {
    if (!user) {
      console.error('❌ No user found');
      alert('You must be logged in to delete a group.');
      return;
    }

    if (!userData) {
      console.error('❌ No userData found');
      alert('User data not loaded. Please refresh and try again.');
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      
      await updateDoc(userRef, {
        deletedGroups: arrayUnion(group.id)
      });
      
      // Refresh user data to update deletedGroups in context
      await refreshUserData();
      
      // Close modals and reset state
      setShowDeleteForMeConfirm(false);
      setSelectedGroup(null);
      setShowGroupMenu(false);
      
      // Refresh groups list
      await fetchGroups();
      
      alert(`"${group.name}" has been removed from your list. You can rejoin via invite link.`);
    } catch (error: any) {
      console.error('❌ ERROR in deleteForMe:');
      console.error('Error object:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Stack:', error.stack);
      alert(`Error removing group: ${error.message}. Please check console for details.`);
    }
  };

  const generateInviteLink = (group: Group) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/join-group/${group.id}`;
    setInviteLink(link);
    setShowInviteLink(true);
    setShowGroupMenu(false);
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    alert('Invite link copied to clipboard!');
  };

  const shareToWhatsApp = (group: Group) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/join-group/${group.id}`;
    const message = `Hey! Join our group "${group.name}" on Rehabit!\n\n${group.description}\n\n${link}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setShowGroupMenu(false);
  };

  const shareToTelegram = (group: Group) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/join-group/${group.id}`;
    const message = `Hey! Join our group "${group.name}" on Rehabit!\n\n${group.description}\n\n${link}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(`Join "${group.name}" on Rehabit!\n\n${group.description}`)}`;
    window.open(telegramUrl, '_blank');
    setShowGroupMenu(false);
  };

  const shareViaGeneric = (group: Group) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/join-group/${group.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Join ${group.name}`,
        text: `Hey! Join our group "${group.name}" on Rehabit!\n\n${group.description}`,
        url: link
      }).catch(err => console.error('Error sharing:', err));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(link);
      alert('Link copied to clipboard!');
    }
    setShowGroupMenu(false);
  };

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user || !userData || !selectedGroup || !newMessage.trim()) return;

    try {
      await addDoc(collection(db, 'groupMessages'), {
        groupId: selectedGroup.id,
        userId: user.uid,
        userName: userData.displayName || 'Anonymous',
        userPhoto: userData.photoURL || null,
        message: newMessage.trim(),
        createdAt: serverTimestamp(),
        type: 'user',
      });

      setNewMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert(`Failed to send message: ${error.message || 'Please try again.'}`);
    }
  };

  const filteredGroups = groups.filter(group => {
    const matchesCategory = selectedCategory === 'all' || group.category === selectedCategory;
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const isUserMember = (group: Group) => {
    return user && group.members.includes(user.uid);
  };

  const isGroupCreator = (group: Group) => {
    return user && group.createdBy === user.uid;
  };

  if (selectedGroup) {
    return (
      <>
      <div className="flex flex-col h-[600px] relative">
        {/* Group Header */}
        <div className="glass-dark rounded-2xl p-4 mb-4 border border-primary/20 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    // Don't close if a modal is open
                    if (!showDeleteForMeConfirm && !showLeaveConfirm && !showDeleteConfirm) {
                      setSelectedGroup(null);
                      setShowGroupMenu(false);
                      fetchGroups(); // Refresh groups when exiting chat
                    }
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="text-3xl">{selectedGroup.icon}</div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedGroup.name}</h3>
                  <p className="text-sm text-gray-400">{selectedGroup.memberCount} members</p>
                </div>
              </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => generateInviteLink(selectedGroup)}
                className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 rounded-xl font-semibold transition-colors"
              >
                <Link2 className="w-4 h-4" />
                Invite
              </button>
            <button
                ref={menuButtonRef}
                onClick={() => setShowGroupMenu(!showGroupMenu)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-300"
            >
                <MoreVertical className="w-5 h-5" />
            </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="glass-dark rounded-2xl flex-1 overflow-hidden flex flex-col border border-primary/20">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">No messages yet</p>
                <p className="text-sm">Start the conversation! 👋</p>
              </div>
            ) : (
              messages.map((message) => {
                // System messages (join/leave) - centered with different style
                if (message.type === 'system') {
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex justify-center my-2"
                    >
                      <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
                        <p className="text-xs text-gray-400 flex items-center gap-2">
                          <Users className="w-3 h-3" />
                          {message.message}
                          <span className="text-gray-600">•</span>
                          <span>{format(message.createdAt, 'h:mm a')}</span>
                        </p>
                      </div>
                    </motion.div>
                  );
                }
                
                // Regular user messages
                return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${message.userId === user?.uid ? 'flex-row-reverse' : ''}`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-green flex items-center justify-center text-dark-900 font-semibold flex-shrink-0">
                  {message.userName.charAt(0).toUpperCase()}
                </div>
                <div className={`flex-1 ${message.userId === user?.uid ? 'text-right' : ''}`}>
                      <div className={`flex items-center gap-2 mb-1 ${message.userId === user?.uid ? 'justify-end' : ''}`}>
                    <span className="text-sm font-semibold text-gray-300">{message.userName}</span>
                    <span className="text-xs text-gray-500">
                      {format(message.createdAt, 'h:mm a')}
                    </span>
                  </div>
                  <div className={`inline-block px-4 py-2 rounded-2xl ${
                    message.userId === user?.uid
                      ? 'bg-gradient-green text-dark-900'
                      : 'bg-dark-700 text-white'
                  }`}>
                        <p className="text-sm break-words">{message.message}</p>
                  </div>
                </div>
              </motion.div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={sendMessage} className="border-t border-dark-600 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 rounded-xl border border-dark-600 bg-dark-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Dropdown Menu - Rendered outside to avoid z-index issues */}
      {showGroupMenu && menuButtonRef.current && selectedGroup && (
        <>
          {/* Backdrop to close menu when clicking outside */}
          <div 
            className="fixed inset-0 z-[100]" 
            onClick={() => setShowGroupMenu(false)}
          />
          
          <div 
            className="fixed glass-dark rounded-xl border border-primary/20 shadow-2xl overflow-hidden z-[101] min-w-[220px]"
            style={{
              top: `${menuButtonRef.current.getBoundingClientRect().bottom + 8}px`,
              right: `${window.innerWidth - menuButtonRef.current.getBoundingClientRect().right}px`,
            }}
          >
            {/* Sharing Section */}
            <div className="border-b border-white/10">
              <button
                onClick={() => {
                  if (selectedGroup) generateInviteLink(selectedGroup);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left text-primary"
              >
                <Link2 className="w-4 h-4" />
                <span>Copy Invite Link</span>
              </button>
              
              <button
                onClick={() => {
                  if (selectedGroup) shareToWhatsApp(selectedGroup);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left text-green-400"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Share via WhatsApp</span>
              </button>
              
              <button
                onClick={() => {
                  if (selectedGroup) shareToTelegram(selectedGroup);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left text-blue-400"
              >
                <Send className="w-4 h-4" />
                <span>Share via Telegram</span>
              </button>
              
              <button
                onClick={() => {
                  if (selectedGroup) shareViaGeneric(selectedGroup);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left text-gray-300"
              >
                <Share2 className="w-4 h-4" />
                <span>Share...</span>
              </button>
            </div>
            
            {/* Member Actions Section - Show if NOT creator */}
            {selectedGroup.createdBy !== user?.uid && (
              <div className="border-b border-white/10">
                <button
                  onClick={() => {
                    if (selectedGroup) {
                      setGroupToLeave(selectedGroup); // Store group
                      setShowGroupMenu(false);
                      setTimeout(() => setShowLeaveConfirm(true), 100);
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left text-yellow-400"
                >
                  <LeaveIcon className="w-4 h-4" />
                  <span>Leave Group</span>
                </button>
                <button
                  onClick={() => {
                    if (selectedGroup) {
                      setGroupToDelete(selectedGroup); // Store group
                      setShowGroupMenu(false);
                      setTimeout(() => setShowDeleteForMeConfirm(true), 100);
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left text-orange-400"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete for Me</span>
                </button>
              </div>
            )}
            
            {/* Admin Actions Section - Show if IS creator */}
            {selectedGroup.createdBy === user?.uid && (
              <div className="border-t border-white/10">
                <button
                  onClick={() => {
                    setShowGroupMenu(false);
                    setTimeout(() => setShowDeleteConfirm(true), 100);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Group</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}
      </>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-display font-bold text-white">Community Groups</h3>
          <p className="text-gray-400">Connect with like-minded individuals</p>
        </div>
        <button
          onClick={() => setShowCreateGroup(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Group
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-dark rounded-2xl p-4 mb-6 border border-primary/20">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search groups..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-dark-600 bg-dark-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                selectedCategory === category.id
                  ? 'bg-gradient-green text-dark-900 shadow-glow'
                  : 'glass-dark text-gray-300 hover:shadow-lg hover:border-primary/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              {category.name}
            </button>
          );
        })}
      </div>

      {/* Groups Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGroups.map((group, index) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="card hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="text-4xl">{group.icon}</div>
                <div>
                  <h4 className="font-bold text-lg text-white">{group.name}</h4>
                  <p className="text-xs text-gray-400 capitalize">{group.category}</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-400 mb-4 line-clamp-2">{group.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Users className="w-4 h-4" />
                <span>{group.memberCount} members</span>
              </div>

              {isUserMember(group) ? (
                <button
                  onClick={() => setSelectedGroup(group)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-green text-dark-900 rounded-xl font-semibold hover:shadow-glow transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </button>
              ) : (
                <button
                  onClick={() => joinGroup(group)}
                  className="flex items-center gap-2 px-4 py-2 glass-dark hover:shadow-lg hover:border-primary rounded-xl font-semibold transition-all text-gray-300"
                >
                  <LogIn className="w-4 h-4" />
                  Join
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <div className="card text-center py-12">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h3 className="text-xl font-semibold mb-2 text-white">No groups found</h3>
          <p className="text-gray-400 mb-4">Be the first to create one!</p>
          <button onClick={() => setShowCreateGroup(true)} className="btn-primary">
            Create Group
          </button>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-dark rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto border border-primary/20"
          >
            <h3 className="text-2xl font-display font-bold mb-6 text-white">Create New Group</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Group Name</label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  className="input-glass"
                  placeholder="e.g., Morning Runners Club"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Description</label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  className="input-glass min-h-[100px]"
                  placeholder="Tell others what this group is about..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Category</label>
                <select
                  value={newGroup.category}
                  onChange={(e) => setNewGroup({ ...newGroup, category: e.target.value })}
                  className="input-glass"
                >
                  {categories.slice(1).map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-dark-800 text-white">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Icon</label>
                <div className="grid grid-cols-8 gap-2">
                  {groupIcons.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setNewGroup({ ...newGroup, icon })}
                      className={`text-3xl p-2 rounded-xl transition-all ${
                        newGroup.icon === icon ? 'bg-primary/20 scale-110 border-2 border-primary' : 'hover:bg-white/10 border-2 border-transparent'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreateGroup(false)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={createGroup} className="btn-primary flex-1">
                Create Group
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Group Confirmation Modal */}
      {showDeleteConfirm && selectedGroup &&  (() => {
        const group: Group = selectedGroup as Group;
        return (<div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[150] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-dark rounded-3xl p-10 max-w-md w-full border-2 border-red-500/30"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center border-2 border-red-500">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <div>
                <h3 className="text-2xl font-display font-bold text-white">Delete Group?</h3>
                <p className="text-sm text-gray-400">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="bg-dark-800/50 border border-dark-600 rounded-2xl p-5 mb-8">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{group.icon}</div>
                <div>
                  <h4 className="font-bold text-lg text-white">{group.name}</h4>
                  <p className="text-sm text-gray-400">
                    {group.memberCount} members • {messages.length} messages
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-gray-400 mb-8">
              Are you sure you want to delete this group? All messages and data will be permanently deleted. 
              All members will lose access to this group.
            </p>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setShowDeleteConfirm(false)} 
                className="flex-1 px-6 py-4 bg-white/5 text-white rounded-xl font-bold border border-primary/20 hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => deleteGroup(group)} 
                className="flex-1 px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors shadow-lg"
              >
                Delete Group
              </button>
            </div>
          </motion.div>
        </div>);
      })()}

      {/* Leave Group Confirmation Modal */}
      {showLeaveConfirm && groupToLeave && (() => {
        const group: Group = groupToLeave as Group;
        return (<div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[150] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-dark rounded-3xl p-10 max-w-md w-full border-2 border-orange-500/30"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/20 flex items-center justify-center border-2 border-orange-500">
                <LeaveIcon className="w-7 h-7 text-orange-500" />
              </div>
              <div>
                <h3 className="text-2xl font-display font-bold text-white">Leave Group?</h3>
                <p className="text-sm text-gray-400">You can rejoin anytime</p>
              </div>
            </div>
            
            <div className="bg-dark-800/50 border border-dark-600 rounded-2xl p-5 mb-8">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{group.icon}</div>
                <div>
                  <h4 className="font-bold text-lg text-white">{group.name}</h4>
                  <p className="text-sm text-gray-400">
                    {group.memberCount} members
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-gray-400 mb-8">
              Are you sure you want to leave "{group.name}"? You'll need to join again to see messages and participate.
            </p>
            
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  setShowLeaveConfirm(false);
                  setGroupToLeave(null);
                }} 
                className="flex-1 px-6 py-4 bg-white/5 text-white rounded-xl font-bold border border-primary/20 hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  leaveGroup(group);
                  setGroupToLeave(null);
                }} 
                className="flex-1 px-6 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-colors shadow-lg"
              >
                Leave Group
              </button>
            </div>
          </motion.div>
        </div>);
      })()}

      {/* Delete For Me Confirmation Modal */}
      {(() => {
        if (showDeleteForMeConfirm && groupToDelete) {
          const group: Group = groupToDelete as Group;
          return (<div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[150] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-dark rounded-3xl p-10 max-w-md w-full border-2 border-orange-500/30"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/20 flex items-center justify-center border-2 border-orange-500">
                <Trash2 className="w-7 h-7 text-orange-500" />
              </div>
              <div>
                <h3 className="text-2xl font-display font-bold text-white">Delete for Me?</h3>
                <p className="text-sm text-gray-400">Group stays for others</p>
              </div>
            </div>
            
            <div className="bg-dark-800/50 border border-dark-600 rounded-2xl p-5 mb-8">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{group.icon}</div>
                <div>
                  <h4 className="font-bold text-lg text-white">{group.name}</h4>
                  <p className="text-sm text-gray-400">
                    {group.memberCount} members
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-gray-400 mb-8">
              This will remove "{group.name}" from your group list. The group will still exist for other members. 
              You can rejoin using an invite link.
            </p>
            
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  setShowDeleteForMeConfirm(false);
                  setGroupToDelete(null);
                }} 
                className="flex-1 px-6 py-4 bg-white/5 text-white rounded-xl font-bold border border-primary/20 hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  deleteForMe(group);
                  setGroupToDelete(null);
                }} 
                className="flex-1 px-6 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-colors shadow-lg"
              >
                Delete for Me
              </button>
            </div>
          </motion.div>
        </div>);
        }
        return null;
      })()}

      {/* Invite Link Modal */}
      {showInviteLink && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[150] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-dark rounded-3xl p-10 max-w-md w-full border-2 border-primary/30"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center border-2 border-primary">
                  <Link2 className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-white">Invite Link</h3>
                  <p className="text-sm text-gray-400">Share this link with others</p>
                </div>
              </div>
              <button
                onClick={() => setShowInviteLink(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <div className="bg-dark-800/50 border border-primary/20 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between gap-3">
                <code className="text-sm text-primary flex-1 truncate">{inviteLink}</code>
                <button
                  onClick={copyInviteLink}
                  className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary hover:bg-primary/30 rounded-lg font-semibold transition-colors flex-shrink-0"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              </div>
            </div>
            
            <p className="text-gray-400 text-sm mb-6">
              Anyone with this link can join the group. Share it via messaging apps, email, or social media.
            </p>
            
            <button 
              onClick={() => setShowInviteLink(false)} 
              className="w-full px-6 py-4 bg-gradient-green text-black rounded-xl font-bold shadow-glow hover:shadow-glow-lg transition-all"
            >
              Done
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

