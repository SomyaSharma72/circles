import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, HelpRequest, SkillOffer, ChatMessage, Review } from '../types';
import { requestApi, skillApi } from '../services/api';

import initialUsersData from '../data/users.json';
import initialReviewsData from '../data/reviews.json';
import initialRequestsData from '../data/requests.json';
import initialSkillsData from '../data/skills.json';

interface AppContextType {
  currentUser: User | null;
  allUsers: User[];
  requests: HelpRequest[];
  skills: SkillOffer[];
  reviews: Review[];
  messages: Record<string, ChatMessage[]>;
  isDarkMode: boolean;
  isRequestsLoading: boolean;
  requestsError: string | null;
  fetchRequests: () => Promise<void>;
  isSkillsLoading: boolean;
  skillsError: string | null;
  fetchSkills: () => Promise<void>;
  
  // Quick auth
  loginAsUser: (userId: string) => void;
  registerUser: (name: string, email: string) => User;
  logout: () => void;
  updateProfile: (updated: Partial<User>) => void;
  
  // Help Requests
  addRequest: (newReq: Omit<HelpRequest, 'id' | 'createdAt' | 'status' | 'commentsCount' | 'requesterId' | 'requesterName' | 'requesterAvatar' | 'requesterTrustScore'>) => void;
  acceptRequest: (requestId: string) => void;
  completeRequest: (requestId: string) => void;
  cancelRequest: (requestId: string) => void;
  updateRequest: (requestId: string, updatedData: Partial<HelpRequest>) => void;

  // Skills
  addSkillOffer: (newOffer: Omit<SkillOffer, 'id' | 'createdAt' | 'rating' | 'reviewCount' | 'userId' | 'userName' | 'userAvatar' | 'userTrustScore'>) => void;
  updateSkillOffer: (offerId: string, updatedData: Partial<SkillOffer>) => void;
  deleteSkillOffer: (offerId: string) => void;

  // Messaging
  sendMessage: (requestId: string, text: string) => void;
  getChatMessages: (requestId: string) => ChatMessage[];

  // Reviews
  addReview: (review: Omit<Review, 'id' | 'date' | 'authorId' | 'authorName' | 'authorAvatar'>) => void;

  // Theme
  toggleDarkMode: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<User[]>(initialUsersData as User[]);
  const [currentUser, setCurrentUser] = useState<User | null>((initialUsersData[0] as User) || null);
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [isRequestsLoading, setIsRequestsLoading] = useState<boolean>(true);
  const [requestsError, setRequestsError] = useState<string | null>(null);

  const [skills, setSkills] = useState<SkillOffer[]>([]);
  const [isSkillsLoading, setIsSkillsLoading] = useState<boolean>(true);
  const [skillsError, setSkillsError] = useState<string | null>(null);

  const [reviews, setReviews] = useState<Review[]>(initialReviewsData as Review[]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Fetch Requests from backend
  const fetchRequests = async () => {
    setIsRequestsLoading(true);
    setRequestsError(null);
    try {
      const data = await requestApi.getAllRequests();
      if (Array.isArray(data) && data.length > 0) {
        setRequests(data);
      } else {
        setRequests(initialRequestsData as HelpRequest[]);
      }
    } catch (err: any) {
      console.warn('Backend requests endpoint unavailable, using local initial data:', err?.message || err);
      setRequests(initialRequestsData as HelpRequest[]);
    } finally {
      setIsRequestsLoading(false);
    }
  };

  // Fetch Skills from backend
  const fetchSkills = async () => {
    setIsSkillsLoading(true);
    setSkillsError(null);
    try {
      const data = await skillApi.getAllSkills();
      if (Array.isArray(data) && data.length > 0) {
        setSkills(data);
      } else {
        setSkills(initialSkillsData as SkillOffer[]);
      }
    } catch (err: any) {
      console.warn('Backend skills endpoint unavailable, using local initial data:', err?.message || err);
      setSkills(initialSkillsData as SkillOffer[]);
    } finally {
      setIsSkillsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchSkills();
  }, []);

  // Default initial mock messages for active requests
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({
    'req-102': [
      {
        id: 'msg-1',
        requestId: 'req-102',
        senderId: 'u2',
        senderName: 'Marcus Chen',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        text: 'Hi Elena! Thanks so much for accepting to water my plants. The front door keypad code is 4829.',
        timestamp: 'Yesterday 4:15 PM'
      },
      {
        id: 'msg-2',
        requestId: 'req-102',
        senderId: 'u3',
        senderName: 'Elena Rostova',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        text: 'Got it, Marcus! I will swing by Saturday around 10 AM. Have a safe trip!',
        timestamp: 'Yesterday 4:20 PM'
      }
    ]
  });

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const loginAsUser = (userId: string) => {
    const found = allUsers.find((u) => u.id === userId);
    if (found) setCurrentUser(found);
  };

  const registerUser = (name: string, email: string) => {
    const newUser: User = {
      id: `u-${Date.now()}`,
      name,
      email,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      neighborhood: 'Maplewood Terrace',
      address: 'Local Neighborhood',
      bio: '',
      trustScore: 98,
      verifiedNeighbor: true,
      joinedDate: 'Just now',
      skills: [],
      completedFavors: 0,
      reviewsCount: 0,
      phone: '',
      preferredContact: 'chat'
    };
    setAllUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    return newUser;
  };

  const logout = () => setCurrentUser(null);

  const updateProfile = (updated: Partial<User>) => {
    if (!currentUser) return;
    const newProfile = { ...currentUser, ...updated };
    setCurrentUser(newProfile);
    setAllUsers((prev) => prev.map((u) => (u.id === currentUser.id ? newProfile : u)));
  };

  const addRequest = async (
    newReqData: Omit<
      HelpRequest,
      'id' | 'createdAt' | 'status' | 'commentsCount' | 'requesterId' | 'requesterName' | 'requesterAvatar' | 'requesterTrustScore'
    >
  ) => {
    if (!currentUser) return;
    try {
      const created = await requestApi.createRequest({
        ...newReqData,
        requesterId: currentUser.id,
      });
      setRequests((prev) => [created, ...prev]);
    } catch (err) {
      console.error('Failed to create request on backend:', err);
      const newReq: HelpRequest = {
        ...newReqData,
        id: `req-${Date.now()}`,
        createdAt: 'Just now',
        status: 'pending',
        commentsCount: 0,
        requesterId: currentUser.id,
        requesterName: currentUser.name,
        requesterAvatar: currentUser.avatar,
        requesterTrustScore: currentUser.trustScore,
        savedByUsers: []
      };
      setRequests((prev) => [newReq, ...prev]);
    }
  };

  const acceptRequest = async (requestId: string) => {
    if (!currentUser) return;
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          return {
            ...r,
            status: 'accepted',
            helperId: currentUser.id,
            helperName: currentUser.name,
            helperAvatar: currentUser.avatar
          };
        }
        return r;
      })
    );

    try {
      await requestApi.updateRequest(requestId, {
        status: 'accepted',
        acceptedBy: currentUser.id,
      });
    } catch (err) {
      console.error('Failed to update accept status on backend:', err);
    }

    // Add initial system message in chat
    const sysMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      requestId,
      senderId: 'system',
      senderName: 'Neighborly Notice',
      senderAvatar: '',
      text: `${currentUser.name} accepted this request! You can now chat and coordinate details.`,
      timestamp: 'Just now',
      isSystemNotice: true
    };

    setMessages((prev) => ({
      ...prev,
      [requestId]: [...(prev[requestId] || []), sysMsg]
    }));
  };

  const completeRequest = async (requestId: string) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          return { ...r, status: 'completed' };
        }
        return r;
      })
    );

    try {
      await requestApi.updateRequest(requestId, { status: 'completed' });
    } catch (err) {
      console.error('Failed to complete request on backend:', err);
    }

    if (currentUser) {
      updateProfile({ completedFavors: (currentUser.completedFavors || 0) + 1 });
    }
  };

  const cancelRequest = async (requestId: string) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          return { ...r, status: 'cancelled' };
        }
        return r;
      })
    );

    try {
      await requestApi.deleteRequest(requestId);
    } catch (err) {
      console.error('Failed to delete/cancel request on backend:', err);
    }
  };

  const updateRequest = async (requestId: string, updatedData: Partial<HelpRequest>) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, ...updatedData } : r))
    );

    try {
      await requestApi.updateRequest(requestId, updatedData);
    } catch (err) {
      console.error('Failed to update request on backend:', err);
    }
  };

  const addSkillOffer = async (
    newOfferData: Omit<
      SkillOffer,
      'id' | 'createdAt' | 'rating' | 'reviewCount' | 'userId' | 'userName' | 'userAvatar' | 'userTrustScore'
    >
  ) => {
    if (!currentUser) return;
    try {
      const created = await skillApi.createSkill({
        ...newOfferData,
        userId: currentUser.id,
      });
      setSkills((prev) => [created, ...prev]);
    } catch (err) {
      console.error('Failed to create skill on backend:', err);
      const newOffer: SkillOffer = {
        ...newOfferData,
        id: `sk-${Date.now()}`,
        createdAt: 'Just now',
        rating: 5.0,
        reviewCount: 0,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        userTrustScore: currentUser.trustScore
      };
      setSkills((prev) => [newOffer, ...prev]);
    }
  };

  const updateSkillOffer = async (offerId: string, updatedData: Partial<SkillOffer>) => {
    setSkills((prev) =>
      prev.map((s) => (s.id === offerId ? { ...s, ...updatedData } : s))
    );

    try {
      await skillApi.updateSkill(offerId, updatedData);
    } catch (err) {
      console.error('Failed to update skill on backend:', err);
    }
  };

  const deleteSkillOffer = async (offerId: string) => {
    setSkills((prev) => prev.filter((s) => s.id !== offerId));

    try {
      await skillApi.deleteSkill(offerId);
    } catch (err) {
      console.error('Failed to delete skill on backend:', err);
    }
  };

  const sendMessage = (requestId: string, text: string) => {
    if (!currentUser || !text.trim()) return;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      requestId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => ({
      ...prev,
      [requestId]: [...(prev[requestId] || []), newMsg]
    }));
  };

  const getChatMessages = (requestId: string) => messages[requestId] || [];

  const addReview = (reviewData: Omit<Review, 'id' | 'date' | 'authorId' | 'authorName' | 'authorAvatar'>) => {
    if (!currentUser) return;
    const newRev: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    setReviews((prev) => [newRev, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        requests,
        isRequestsLoading,
        requestsError,
        fetchRequests,
        skills,
        isSkillsLoading,
        skillsError,
        fetchSkills,
        reviews,
        messages,
        isDarkMode,
        loginAsUser,
        registerUser,
        logout,
        updateProfile,
        addRequest,
        acceptRequest,
        completeRequest,
        cancelRequest,
        updateRequest,
        addSkillOffer,
        updateSkillOffer,
        deleteSkillOffer,
        sendMessage,
        getChatMessages,
        addReview,
        toggleDarkMode
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
