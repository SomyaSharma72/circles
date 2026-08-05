import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, HelpRequest, SkillOffer, ChatMessage, Review } from '../types';
import { requestApi, skillApi, userApi, messageApi, reviewApi } from '../services/api';

import initialUsersData from '../data/users.json';
import initialReviewsData from '../data/reviews.json';

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
  
  // Auth methods
  loginAsUser: (userId: string) => void;
  loginWithCredentials: (email: string, password?: string) => Promise<User>;
  registerUser: (name: string, email: string) => User;
  registerWithCredentials: (fullName: string, email: string, password?: string) => Promise<User>;
  logout: () => void;
  updateProfile: (updated: Partial<User>) => Promise<void>;
  
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
  sendMessage: (requestId: string, text: string) => Promise<void>;
  getChatMessages: (requestId: string) => ChatMessage[];
  fetchMessagesForRequest: (requestId: string) => Promise<ChatMessage[]>;

  // Reviews
  addReview: (review: Omit<Review, 'id' | 'date' | 'authorId' | 'authorName' | 'authorAvatar'>) => void;

  // Theme
  toggleDarkMode: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<User[]>(initialUsersData as User[]);
  
  // Read current logged-in user from localStorage or start as null
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('neighborly_user');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.error('Error parsing stored neighborly_user:', err);
    }
    return null;
  });

  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [isRequestsLoading, setIsRequestsLoading] = useState<boolean>(true);
  const [requestsError, setRequestsError] = useState<string | null>(null);

  const [skills, setSkills] = useState<SkillOffer[]>([]);
  const [isSkillsLoading, setIsSkillsLoading] = useState<boolean>(true);
  const [skillsError, setSkillsError] = useState<string | null>(null);

  const [reviews, setReviews] = useState<Review[]>(initialReviewsData as Review[]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Sync currentUser with localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('neighborly_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('neighborly_user');
    }
  }, [currentUser]);

  // Fetch Users from MongoDB backend
  const fetchUsers = async () => {
    try {
      const users = await userApi.getAllUsers();
      if (users && users.length > 0) {
        setAllUsers(users);
        if (currentUser) {
          const matched = users.find(
            (u) => u.id === currentUser.id || u.email.toLowerCase() === currentUser.email.toLowerCase()
          );
          if (matched) {
            setCurrentUser(matched);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch users from MongoDB backend:', err);
    }
  };

  // Fetch Requests from backend
  const fetchRequests = async () => {
    setIsRequestsLoading(true);
    setRequestsError(null);
    try {
      const data = await requestApi.getAllRequests();
      setRequests(data);
    } catch (err: any) {
      console.error('Failed to fetch requests from backend:', err);
      setRequestsError(err?.message || 'Failed to connect to backend server');
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
      setSkills(data);
    } catch (err: any) {
      console.error('Failed to fetch skills from backend:', err);
      setSkillsError(err?.message || 'Failed to connect to backend server');
    } finally {
      setIsSkillsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRequests();
    fetchSkills();
  }, []);

  // Initial messages state
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});

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
    if (found) {
      const userObj = { ...found, profileCompleted: found.profileCompleted ?? true };
      setCurrentUser(userObj);
    }
  };

  const loginWithCredentials = async (email: string, password?: string): Promise<User> => {
    try {
      const user = await userApi.login(email, password);
      setCurrentUser(user);
      setAllUsers((prev) => {
        const exists = prev.some((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
        if (!exists) return [user, ...prev];
        return prev.map((u) => (u.id === user.id ? user : u));
      });
      return user;
    } catch (err) {
      console.error('Login via API failed, using fallback:', err);
      let found = allUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!found) {
        found = {
          id: `u-${Date.now()}`,
          name: email.split('@')[0],
          email: email.trim(),
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          neighborhood: 'Maplewood Terrace',
          address: 'Local Neighborhood',
          bio: '',
          trustScore: 90,
          verifiedNeighbor: true,
          joinedDate: 'Just now',
          skills: [],
          completedFavors: 0,
          reviewsCount: 0,
          profileCompleted: false,
        };
        setAllUsers((prev) => [found!, ...prev]);
      }
      setCurrentUser(found);
      return found;
    }
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
      preferredContact: 'chat',
      profileCompleted: false,
    };
    setAllUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    return newUser;
  };

  const registerWithCredentials = async (fullName: string, email: string, password?: string): Promise<User> => {
    try {
      const user = await userApi.signup(fullName, email, password);
      setCurrentUser(user);
      setAllUsers((prev) => [user, ...prev]);
      return user;
    } catch (err) {
      console.error('Signup via API failed, using local registration:', err);
      return registerUser(fullName, email);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('neighborly_user');
  };

  const updateProfile = async (updated: Partial<User>) => {
    if (!currentUser) return;
    const updatedProfile: User = {
      ...currentUser,
      ...updated,
      name: updated.name || currentUser.name,
      bio: updated.bio !== undefined ? updated.bio : currentUser.bio,
      profession: updated.profession !== undefined ? updated.profession : currentUser.profession,
      neighborhood: updated.neighborhood || currentUser.neighborhood,
      skills: updated.skills || currentUser.skills,
    };

    setCurrentUser(updatedProfile);
    setAllUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedProfile : u)));

    // Save to MongoDB
    try {
      const savedUser = await userApi.updateProfile(currentUser.id, updatedProfile);
      if (savedUser) {
        setCurrentUser(savedUser);
        setAllUsers((prev) => prev.map((u) => (u.id === savedUser.id ? savedUser : u)));
      }
    } catch (err) {
      console.error('Failed to persist user profile to MongoDB:', err);
    }
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

  const fetchMessagesForRequest = async (requestId: string): Promise<ChatMessage[]> => {
    if (!requestId || !currentUser) return [];
    try {
      const msgs = await messageApi.getMessagesByRequestId(requestId, currentUser.id);
      if (Array.isArray(msgs)) {
        setMessages((prev) => ({
          ...prev,
          [requestId]: msgs,
        }));
        return msgs;
      }
      return messages[requestId] || [];
    } catch (err: any) {
      console.error('Failed to fetch messages for request:', err);
      return messages[requestId] || [];
    }
  };

  const sendMessage = async (requestId: string, text: string) => {
    if (!currentUser || !text.trim()) return;

    // Find request in state to determine receiver
    const req = requests.find((r) => r.id === requestId);
    let receiverId = 'u2';
    if (req) {
      if (req.requesterId === currentUser.id) {
        receiverId = req.helperId || 'u2';
      } else {
        receiverId = req.requesterId || 'u1';
      }
    }

    const tempId = `msg-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: tempId,
      requestId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Optimistic UI update
    setMessages((prev) => ({
      ...prev,
      [requestId]: [...(prev[requestId] || []), newMsg],
    }));

    try {
      const serverMsg = await messageApi.sendMessage({
        requestId,
        senderId: currentUser.id,
        receiverId,
        message: text.trim(),
      });

      // Update optimistic message with real message from server
      setMessages((prev) => ({
        ...prev,
        [requestId]: (prev[requestId] || []).map((m) => (m.id === tempId ? serverMsg : m)),
      }));
    } catch (err) {
      console.error('Failed to save message to backend:', err);
    }
  };

  const getChatMessages = (requestId: string) => messages[requestId] || [];

  const addReview = async (reviewData: Omit<Review, 'id' | 'date' | 'authorId' | 'authorName' | 'authorAvatar'>) => {
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

    // Calculate rating impact on trust score:
    // 5 stars: +3, 4 stars: +2, 3 stars: 0, 2 stars: -2, 1 star: -5
    const rating = reviewData.rating;
    let trustDelta = 0;
    if (rating === 5) trustDelta = 3;
    else if (rating === 4) trustDelta = 2;
    else if (rating === 3) trustDelta = 0;
    else if (rating === 2) trustDelta = -2;
    else if (rating === 1) trustDelta = -5;

    // Update target user in local state (users array)
    setUsers((prevUsers) =>
      prevUsers.map((u) => {
        if (u.id === reviewData.targetUserId) {
          const newTrustScore = Math.min(100, Math.max(0, u.trustScore + trustDelta));
          const newCompletedFavors = (u.completedFavors || 0) + 1;
          const prevCount = u.reviewsCount || 0;
          const newCount = prevCount + 1;
          const prevAvg = u.averageRating !== undefined ? u.averageRating : 5.0;
          const newAvg = Number((((prevAvg * prevCount) + rating) / newCount).toFixed(1));

          return {
            ...u,
            trustScore: newTrustScore,
            completedFavors: newCompletedFavors,
            reviewsCount: newCount,
            averageRating: newAvg,
          };
        }
        return u;
      })
    );

    // If target user is currentUser, update currentUser state
    if (currentUser.id === reviewData.targetUserId) {
      setCurrentUser((prev) => {
        if (!prev) return prev;
        const newTrustScore = Math.min(100, Math.max(0, prev.trustScore + trustDelta));
        const newCompletedFavors = (prev.completedFavors || 0) + 1;
        const prevCount = prev.reviewsCount || 0;
        const newCount = prevCount + 1;
        const prevAvg = prev.averageRating !== undefined ? prev.averageRating : 5.0;
        const newAvg = Number((((prevAvg * prevCount) + rating) / newCount).toFixed(1));

        return {
          ...prev,
          trustScore: newTrustScore,
          completedFavors: newCompletedFavors,
          reviewsCount: newCount,
          averageRating: newAvg,
        };
      });
    }

    // Submit review to backend database asynchronously
    try {
      const res = await reviewApi.submitReview({
        reviewerId: currentUser.id,
        receiverId: reviewData.targetUserId,
        requestId: reviewData.requestId,
        rating: reviewData.rating,
        comment: reviewData.comment,
      });

      if (res.updatedUser) {
        setUsers((prev) =>
          prev.map((u) => (u.id === res.updatedUser!.id || u.id === reviewData.targetUserId ? { ...u, ...res.updatedUser } : u))
        );
        if (currentUser.id === res.updatedUser.id) {
          setCurrentUser((prev) => (prev ? { ...prev, ...res.updatedUser } : prev));
        }
      }
    } catch (err) {
      console.error('Failed to submit review to backend:', err);
    }
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
        loginWithCredentials,
        registerUser,
        registerWithCredentials,
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
        fetchMessagesForRequest,
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
