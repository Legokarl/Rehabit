'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Users, MessageCircle, LogIn, LogOut as LeaveIcon, 
  Hash, Search, Send, Sparkles, TrendingUp, Heart, 
  Book, Dumbbell, Brain, Coffee, X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  collection, addDoc, query, where, getDocs, 
  updateDoc, doc, arrayUnion, arrayRemove, orderBy,
  onSnapshot, Timestamp
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
  const { user, userData } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    category: 'productivity',
    icon: '🎯'
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      // Real-time listener for messages
      const messagesQuery = query(
        collection(db, 'groupMessages'),
        where('groupId', '==', selectedGroup.id),
        orderBy('createdAt', 'asc')
      );

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const messagesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Message[];
        setMessages(messagesData);
      });

      return () => unsubscribe();
    }
  }, [selectedGroup]);

  const fetchGroups = async () => {
    try {
      const q = query(collection(db, 'groups'));
      const querySnapshot = await getDocs(q);
      const groupsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        memberCount: doc.data().members?.length || 0,
      })) as Group[];
      setGroups(groupsData);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const createGroup = async () => {
    if (!user || !userData || !newGroup.name) return;

    try {
      await addDoc(collection(db, 'groups'), {
        name: newGroup.name,
        description: newGroup.description,
        category: newGroup.category,
        icon: newGroup.icon,
        createdBy: user.uid,
        createdByName: userData.displayName,
        members: [user.uid],
        createdAt: new Date(),
      });

      setNewGroup({ name: '', description: '', category: 'productivity', icon: '🎯' });
      setShowCreateGroup(false);
      fetchGroups();
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const joinGroup = async (group: Group) => {
    if (!user) return;

    try {
      const groupRef = doc(db, 'groups', group.id);
      await updateDoc(groupRef, {
        members: arrayUnion(user.uid)
      });
      fetchGroups();
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  const leaveGroup = async (group: Group) => {
    if (!user) return;

    try {
      const groupRef = doc(db, 'groups', group.id);
      await updateDoc(groupRef, {
        members: arrayRemove(user.uid)
      });
      
      if (selectedGroup?.id === group.id) {
        setSelectedGroup(null);
      }
      
      fetchGroups();
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  };

  const sendMessage = async () => {
    if (!user || !userData || !selectedGroup || !newMessage.trim()) return;

    try {
      await addDoc(collection(db, 'groupMessages'), {
        groupId: selectedGroup.id,
        userId: user.uid,
        userName: userData.displayName,
        userPhoto: userData.photoURL,
        message: newMessage.trim(),
        createdAt: new Date(),
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
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

  if (selectedGroup) {
    return (
      <div className="flex flex-col h-[600px]">
        {/* Group Header */}
        <div className="glass rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedGroup(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="text-3xl">{selectedGroup.icon}</div>
              <div>
                <h3 className="text-xl font-bold">{selectedGroup.name}</h3>
                <p className="text-sm text-gray-600">{selectedGroup.memberCount} members</p>
              </div>
            </div>
            <button
              onClick={() => leaveGroup(selectedGroup)}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-xl font-semibold transition-colors"
            >
              <LeaveIcon className="w-4 h-4" />
              Leave
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="glass rounded-2xl flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${message.userId === user?.uid ? 'flex-row-reverse' : ''}`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {message.userName.charAt(0).toUpperCase()}
                </div>
                <div className={`flex-1 ${message.userId === user?.uid ? 'text-right' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold">{message.userName}</span>
                    <span className="text-xs text-gray-500">
                      {format(message.createdAt, 'h:mm a')}
                    </span>
                  </div>
                  <div className={`inline-block px-4 py-2 rounded-2xl ${
                    message.userId === user?.uid
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-gray-100'
                  }`}>
                    <p className="text-sm">{message.message}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="btn-primary px-4"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-display font-bold">Community Groups</h3>
          <p className="text-gray-600">Connect with like-minded individuals</p>
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
      <div className="glass rounded-2xl p-4 mb-6">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search groups..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'glass hover:shadow-lg'
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
                  <h4 className="font-bold text-lg">{group.name}</h4>
                  <p className="text-xs text-gray-500 capitalize">{group.category}</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{group.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{group.memberCount} members</span>
              </div>

              {isUserMember(group) ? (
                <button
                  onClick={() => setSelectedGroup(group)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </button>
              ) : (
                <button
                  onClick={() => joinGroup(group)}
                  className="flex items-center gap-2 px-4 py-2 glass hover:shadow-lg rounded-xl font-semibold transition-all"
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
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">No groups found</h3>
          <p className="text-gray-600 mb-4">Be the first to create one!</p>
          <button onClick={() => setShowCreateGroup(true)} className="btn-primary">
            Create Group
          </button>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-2xl font-display font-bold mb-6">Create New Group</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Group Name</label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  className="input-glass"
                  placeholder="e.g., Morning Runners Club"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  className="input-glass min-h-[100px]"
                  placeholder="Tell others what this group is about..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={newGroup.category}
                  onChange={(e) => setNewGroup({ ...newGroup, category: e.target.value })}
                  className="input-glass"
                >
                  {categories.slice(1).map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Icon</label>
                <div className="grid grid-cols-8 gap-2">
                  {groupIcons.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setNewGroup({ ...newGroup, icon })}
                      className={`text-3xl p-2 rounded-xl transition-all ${
                        newGroup.icon === icon ? 'bg-purple-100 scale-110' : 'hover:bg-gray-100'
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
    </div>
  );
}

