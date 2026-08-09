import bcrypt from 'bcryptjs';

export interface MockUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  bio?: string;
  neighborhood: string;
  profession: string;
  skills: string[];
  trustScore: number;
  completedFavors: number;
  avatarUrl?: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  createdAt: Date;
}

export interface MockFavorRequest {
  _id: string;
  title: string;
  description: string;
  category: string;
  urgency: string;
  tags: string[];
  summary: string;
  isFlaggedSpam: boolean;
  fraudReason?: string;
  status: 'Open' | 'In Progress' | 'Completed' | 'Cancelled';
  requester: any; // Populated or ID
  helper?: any; // Populated or ID
  locationName: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  createdAt: Date;
}

export interface MockMessage {
  _id: string;
  request: string;
  sender: any;
  receiver: any;
  text: string;
  read: boolean;
  createdAt: Date;
}

export interface MockReview {
  _id: string;
  request: string;
  reviewer: any;
  reviewee: any;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface MockSkill {
  _id: string;
  name: string;
  category: string;
  description: string;
  createdBy?: string;
  createdAt: Date;
}

// Generate default hashed password for demo accounts ("password123")
const DEMO_PASSWORD_HASH = bcrypt.hashSync('password123', 10);

class MockStore {
  public users: MockUser[] = [
    {
      _id: 'user_priya_1',
      name: 'Priya Sharma',
      email: 'priya@neighborly.app',
      passwordHash: DEMO_PASSWORD_HASH,
      bio: 'Avid gardener and community organizer in Indiranagar. Happy to lend tools, share fresh balcony plants, and help neighbors!',
      neighborhood: 'Indiranagar 100ft Road, Bengaluru',
      profession: 'Software Engineer & Community Volunteer',
      skills: ['Scooter & Car Jumpstart', 'Garden Care & Tools', 'Pet Care', 'Home Repairs'],
      trustScore: 98,
      completedFavors: 14,
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
      location: { type: 'Point', coordinates: [77.6408, 12.9784] },
      createdAt: new Date(Date.now() - 30 * 86400000),
    },
    {
      _id: 'user_aarav_2',
      name: 'Aarav Patel',
      email: 'aarav@neighborly.app',
      passwordHash: DEMO_PASSWORD_HASH,
      bio: 'Electrical hardware enthusiast with a complete Bosch power tool set. Always ready to help neighbors with fixtures and fixes.',
      neighborhood: 'Koramangala 4th Block, Bengaluru',
      profession: 'Electrical Engineer & DIY Specialist',
      skills: ['Electrical Wiring', 'Heavy Drill & Tools', 'Plumbing Assistance', 'Furniture Assembly'],
      trustScore: 95,
      completedFavors: 19,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
      location: { type: 'Point', coordinates: [77.6245, 12.9352] },
      createdAt: new Date(Date.now() - 45 * 86400000),
    },
    {
      _id: 'user_rohan_3',
      name: 'Rohan Gupta',
      email: 'rohan@neighborly.app',
      passwordHash: DEMO_PASSWORD_HASH,
      bio: 'Fitness coach and dog lover living near Powai Lake. Available for pet walking, elderly grocery runs, and heavy lifting.',
      neighborhood: 'Hiranandani Gardens, Powai, Mumbai',
      profession: 'Fitness Coach & Pet Caretaker',
      skills: ['Dog Walking', 'Pet Sitting', 'Heavy Lifting', 'Elderly Grocery Run'],
      trustScore: 92,
      completedFavors: 8,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
      location: { type: 'Point', coordinates: [72.9060, 19.1176] },
      createdAt: new Date(Date.now() - 20 * 86400000),
    },
    {
      _id: 'user_ananya_4',
      name: 'Ananya Iyer',
      email: 'ananya@neighborly.app',
      passwordHash: DEMO_PASSWORD_HASH,
      bio: 'Tech lead and home baker. Love troubleshooting Wi-Fi routers, smart home devices, and sharing homemade sweets.',
      neighborhood: 'Bandra West, Mumbai',
      profession: 'IT Solutions Architect',
      skills: ['Wi-Fi & Mesh Setup', 'Computer Troubleshooting', 'Home Baking', 'Medicine Pickup'],
      trustScore: 99,
      completedFavors: 22,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      location: { type: 'Point', coordinates: [72.8295, 19.0596] },
      createdAt: new Date(Date.now() - 60 * 86400000),
    },
  ];

  public requests: MockFavorRequest[] = [
    {
      _id: 'req_jumpstart_101',
      title: 'Car Battery Jump Start Needed Near 100ft Road, Indiranagar',
      description: 'My car battery died near Indiranagar Metro Station. I have jumper cables in my trunk, just need a neighbor with a car to give a quick 5-minute jump start!',
      category: 'Vehicle Assistance',
      urgency: 'High',
      tags: ['Jumpstart', 'Car Battery', 'Indiranagar', 'Urgent'],
      summary: 'Neighbor needs a car jump start near Indiranagar Metro Station. Cables available on site.',
      isFlaggedSpam: false,
      status: 'Open',
      requester: {
        _id: 'user_aarav_2',
        name: 'Aarav Patel',
        email: 'aarav@neighborly.app',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
        trustScore: 95,
        neighborhood: 'Koramangala 4th Block',
        skills: ['Electrical Wiring', 'Heavy Drill & Tools'],
      },
      locationName: '100ft Road, Indiranagar, Bengaluru',
      location: { type: 'Point', coordinates: [77.6408, 12.9784] },
      createdAt: new Date(Date.now() - 3600000 * 2),
    },
    {
      _id: 'req_ladder_102',
      title: 'Borrow a Heavy Duty Bosch Drill Machine for Wall Mounting',
      description: 'Looking to borrow a impact drill machine for 2 hours today to mount curtain rods and wall shelves in my new flat.',
      category: 'Tool & Equipment Loan',
      urgency: 'Medium',
      tags: ['Drill Machine', 'Tools', 'Home Repair', 'Borrow'],
      summary: 'Seeking impact drill for 2-hour wall shelf mounting today in Koramangala.',
      isFlaggedSpam: false,
      status: 'Open',
      requester: {
        _id: 'user_rohan_3',
        name: 'Rohan Gupta',
        email: 'rohan@neighborly.app',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
        trustScore: 92,
        neighborhood: 'Powai, Mumbai',
        skills: ['Dog Walking', 'Heavy Lifting'],
      },
      locationName: 'Koramangala 4th Block, Bengaluru',
      location: { type: 'Point', coordinates: [77.6245, 12.9352] },
      createdAt: new Date(Date.now() - 3600000 * 5),
    },
    {
      _id: 'req_dogwalk_103',
      title: 'Indie Dog Feeding & Evening Walk Assistance in Powai',
      description: 'Heading out for an outstation wedding this weekend. Looking for a trusted animal-loving neighbor to feed my friendly Indie dog and take him on a 20-min evening walk.',
      category: 'Pet Sitting & Walking',
      urgency: 'Low',
      tags: ['Pet Care', 'Dog Walk', 'Powai', 'Pet Sitting'],
      summary: 'Weekend evening dog feeding and 20-min walk for friendly rescue Indie dog in Powai.',
      isFlaggedSpam: false,
      status: 'Open',
      requester: {
        _id: 'user_ananya_4',
        name: 'Ananya Iyer',
        email: 'ananya@neighborly.app',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        trustScore: 99,
        neighborhood: 'Bandra West, Mumbai',
        skills: ['Wi-Fi Setup', 'Baking'],
      },
      locationName: 'Hiranandani Gardens, Powai, Mumbai',
      location: { type: 'Point', coordinates: [72.9060, 19.1176] },
      createdAt: new Date(Date.now() - 3600000 * 12),
    },
  ];

  public messages: MockMessage[] = [
    {
      _id: 'msg_seed_1',
      request: 'req_jumpstart_101',
      sender: {
        _id: 'user_aarav_2',
        name: 'Aarav Patel',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
        trustScore: 95,
        neighborhood: 'Koramangala 4th Block',
      },
      receiver: {
        _id: 'user_priya_1',
        name: 'Priya Sharma',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
        trustScore: 98,
        neighborhood: 'Sector 62, Noida',
      },
      text: 'Hey Priya! I have battery jumpstart cables in my car trunk and can drop by Indiranagar in 10 minutes.',
      read: true,
      createdAt: new Date(Date.now() - 3600000 * 2),
    },
    {
      _id: 'msg_seed_2',
      request: 'req_jumpstart_101',
      sender: {
        _id: 'user_priya_1',
        name: 'Priya Sharma',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
        trustScore: 98,
        neighborhood: 'Sector 62, Noida',
      },
      receiver: {
        _id: 'user_aarav_2',
        name: 'Aarav Patel',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
        trustScore: 95,
        neighborhood: 'Koramangala 4th Block',
      },
      text: 'That would be a absolute lifesaver Aarav! I am parked right near 100ft Road.',
      read: true,
      createdAt: new Date(Date.now() - 3600000 * 1.5),
    },
    {
      _id: 'msg_seed_3',
      request: 'req_ladder_102',
      sender: {
        _id: 'user_rohan_3',
        name: 'Rohan Gupta',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
        trustScore: 92,
        neighborhood: 'Powai, Mumbai',
      },
      receiver: {
        _id: 'user_aarav_2',
        name: 'Aarav Patel',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
        trustScore: 95,
        neighborhood: 'Koramangala 4th Block',
      },
      text: 'Hi Aarav, I have a 12ft folding aluminum ladder in my garage. Do you still need it?',
      read: true,
      createdAt: new Date(Date.now() - 3600000 * 4),
    },
    {
      _id: 'msg_seed_4',
      request: 'req_dogwalk_103',
      sender: {
        _id: 'user_rohan_3',
        name: 'Rohan Gupta',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
        trustScore: 92,
        neighborhood: 'Powai, Mumbai',
      },
      receiver: {
        _id: 'user_ananya_4',
        name: 'Ananya Iyer',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        trustScore: 99,
        neighborhood: 'Bandra West, Mumbai',
      },
      text: 'Hey Ananya, I love dogs! I can walk your rescue Indie dog on Saturday evening.',
      read: true,
      createdAt: new Date(Date.now() - 3600000 * 8),
    },
  ];
  public reviews: MockReview[] = [];

  public skills: MockSkill[] = [
    { _id: 'sk_1', name: 'Car Battery Jumpstart', category: 'Automotive', description: 'Help jumpstart vehicles with cables', createdAt: new Date() },
    { _id: 'sk_2', name: 'Ladders & Tools', category: 'Tools', description: 'Power tools, ladders, and lawn equipment', createdAt: new Date() },
    { _id: 'sk_3', name: 'Pet Sitting & Dog Walking', category: 'Pet Care', description: 'Dog walking, cat feeding, pet watching', createdAt: new Date() },
    { _id: 'sk_4', name: 'Home Repairs & Plumbing', category: 'Home', description: 'Fixing leaks, mounting TVs, furniture assembly', createdAt: new Date() },
    { _id: 'sk_5', name: 'Wi-Fi & Tech Support', category: 'Technology', description: 'Router setup, computer repair, TV smart setup', createdAt: new Date() },
  ];

  // --- USER METHODS ---
  public findUserByEmail(email: string): MockUser | undefined {
    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === 'sarah@neighborly.app') return this.users.find((u) => u.email === 'priya@neighborly.app');
    if (cleanEmail === 'alex@neighborly.app') return this.users.find((u) => u.email === 'aarav@neighborly.app');
    if (cleanEmail === 'marcus@neighborly.app') return this.users.find((u) => u.email === 'rohan@neighborly.app');
    if (cleanEmail === 'elena@neighborly.app') return this.users.find((u) => u.email === 'ananya@neighborly.app');
    return this.users.find((u) => u.email.toLowerCase() === cleanEmail);
  }

  public findUserById(id: string): MockUser | undefined {
    return this.users.find((u) => u._id === id);
  }

  public createUser(userData: Partial<MockUser>): MockUser {
    const newUser: MockUser = {
      _id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: userData.name || 'Neighbor',
      email: userData.email || '',
      passwordHash: userData.passwordHash || '',
      bio: userData.bio || '',
      neighborhood: userData.neighborhood || 'Downtown Block',
      profession: userData.profession || 'Neighbor',
      skills: userData.skills || [],
      trustScore: 100,
      completedFavors: 0,
      avatarUrl: userData.avatarUrl || '',
      location: userData.location || { type: 'Point', coordinates: [-122.4194, 37.7749] },
      createdAt: new Date(),
    };
    this.users.unshift(newUser);
    return newUser;
  }

  public updateUser(id: string, updates: Partial<MockUser>): MockUser | undefined {
    const user = this.findUserById(id);
    if (!user) return undefined;
    Object.assign(user, updates);
    return user;
  }

  // --- REQUEST METHODS ---
  public createRequest(reqData: Partial<MockFavorRequest>): MockFavorRequest {
    const newReq: MockFavorRequest = {
      _id: 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title: reqData.title || 'Community Favor Request',
      description: reqData.description || '',
      category: reqData.category || 'General Help',
      urgency: reqData.urgency || 'Medium',
      tags: reqData.tags || [],
      summary: reqData.summary || reqData.description?.substring(0, 100) || '',
      isFlaggedSpam: Boolean(reqData.isFlaggedSpam),
      fraudReason: reqData.fraudReason,
      status: 'Open',
      requester: reqData.requester,
      helper: undefined,
      locationName: reqData.locationName || 'Local Block',
      location: reqData.location || { type: 'Point', coordinates: [-122.4194, 37.7749] },
      createdAt: new Date(),
    };
    this.requests.unshift(newReq);
    return newReq;
  }

  public findRequests(filter?: { category?: string; urgency?: string; search?: string }): MockFavorRequest[] {
    let result = [...this.requests];

    if (filter?.category && filter.category !== 'All') {
      result = result.filter((r) => r.category.toLowerCase() === filter.category!.toLowerCase());
    }
    if (filter?.urgency && filter.urgency !== 'All') {
      result = result.filter((r) => r.urgency.toLowerCase() === filter.urgency!.toLowerCase());
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.summary.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }

  public findRequestById(id: string): MockFavorRequest | undefined {
    return this.requests.find((r) => r._id === id);
  }

  public findNearbyRequests(lat: number, lng: number): MockFavorRequest[] {
    return this.requests.map((r) => {
      const docLng = r.location.coordinates[0];
      const docLat = r.location.coordinates[1];
      const dLat = ((docLat - lat) * Math.PI) / 180;
      const dLon = ((docLng - lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat * Math.PI) / 180) *
          Math.cos((docLat * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const distMiles = Math.round(3958.8 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;

      return {
        ...r,
        distanceMiles: distMiles,
        distanceKm: Math.round(distMiles * 1.60934 * 10) / 10,
      };
    });
  }

  // --- MESSAGE METHODS ---
  public findMessagesByRequest(requestId: string): MockMessage[] {
    return this.messages.filter((m) => m.request === requestId);
  }

  public getUserConversations(userId: string) {
    const userMsgMap = new Map<string, MockMessage[]>();

    this.messages.forEach((m) => {
      const senderId = typeof m.sender === 'object' ? m.sender?._id || m.sender?.id : m.sender;
      const receiverId = typeof m.receiver === 'object' ? m.receiver?._id || m.receiver?.id : m.receiver;
      if (senderId === userId || receiverId === userId) {
        if (!userMsgMap.has(m.request)) {
          userMsgMap.set(m.request, []);
        }
        userMsgMap.get(m.request)!.push(m);
      }
    });

    this.requests.forEach((r) => {
      const reqUserId = typeof r.requester === 'object' ? r.requester?._id || r.requester?.id : r.requester;
      const helperUserId = typeof r.helper === 'object' ? r.helper?._id || r.helper?.id : r.helper;
      if ((reqUserId === userId || helperUserId === userId) && !userMsgMap.has(r._id)) {
        userMsgMap.set(r._id, []);
      }
    });

    const conversations = Array.from(userMsgMap.entries()).map(([reqId, msgs]) => {
      const requestDoc: MockFavorRequest | undefined = this.findRequestById(reqId);

      const sortedMsgs = [...msgs].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      const lastMsg = sortedMsgs[sortedMsgs.length - 1];

      let otherUser: any = null;

      // 1. Determine otherUser from last message if available
      if (lastMsg) {
        const sId = typeof lastMsg.sender === 'object' ? lastMsg.sender?._id || lastMsg.sender?.id : lastMsg.sender;
        const rId = typeof lastMsg.receiver === 'object' ? lastMsg.receiver?._id || lastMsg.receiver?.id : lastMsg.receiver;
        if (sId === userId) {
          otherUser = typeof lastMsg.receiver === 'object' ? lastMsg.receiver : this.findUserById(rId);
        } else {
          otherUser = typeof lastMsg.sender === 'object' ? lastMsg.sender : this.findUserById(sId);
        }
      }

      // 2. Fallback to request document requester or helper if otherUser not resolved or equals current user
      if (!otherUser || (otherUser._id || otherUser.id) === userId) {
        if (requestDoc) {
          const reqUserId = typeof requestDoc.requester === 'object' ? requestDoc.requester?._id || requestDoc.requester?.id : requestDoc.requester;
          if (reqUserId === userId) {
            otherUser = requestDoc.helper || this.users.find(u => u._id !== userId) || { _id: 'user_aarav_2', name: 'Aarav Patel', trustScore: 95 };
          } else {
            otherUser = requestDoc.requester;
          }
        }
      }

      // 3. Fallback for direct user chats (e.g. req_direct_user_aarav_2)
      if ((!otherUser || (otherUser._id || otherUser.id) === userId) && reqId.startsWith('req_direct_')) {
        const targetUserId = reqId.replace('req_direct_', '');
        otherUser = this.findUserById(targetUserId) || { _id: targetUserId, name: 'Neighbor', trustScore: 98 };
      }

      // 4. Ultimate fallback
      if (!otherUser || (otherUser._id || otherUser.id) === userId) {
        otherUser = this.users.find(u => u._id !== userId) || { _id: 'user_aarav_2', name: 'Aarav Patel', trustScore: 95 };
      }

      const reqTitle = requestDoc?.title || (reqId.startsWith('req_direct_') ? 'Direct Neighbor Chat' : 'Neighborhood Request');
      const reqCat = requestDoc?.category || (reqId.startsWith('req_direct_') ? 'Direct Chat' : 'General');
      const reqStatus = requestDoc?.status || 'Open';

      return {
        requestId: reqId,
        requestTitle: reqTitle,
        requestCategory: reqCat,
        requestStatus: reqStatus,
        otherUser: typeof otherUser === 'object' ? otherUser : this.findUserById(otherUser) || { _id: otherUser, name: 'Neighbor', trustScore: 95 },
        lastMessage: lastMsg
          ? {
              _id: lastMsg._id,
              text: lastMsg.text,
              sender: lastMsg.sender,
              createdAt: lastMsg.createdAt,
              read: lastMsg.read,
            }
          : {
              _id: 'init_' + reqId,
              text: 'Conversation started on request.',
              sender: otherUser,
              createdAt: requestDoc?.createdAt || new Date(),
              read: true,
            },
        unreadCount: msgs.filter((m) => {
          const rId = typeof m.receiver === 'object' ? m.receiver?._id || m.receiver?.id : m.receiver;
          return rId === userId && !m.read;
        }).length,
      };
    });

    return conversations.sort(
      (a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    );
  }

  public createMessage(msgData: Partial<MockMessage>): MockMessage {
    let senderObj =
      typeof msgData.sender === 'string'
        ? this.users.find((u) => u._id === msgData.sender || (u as any).id === msgData.sender)
        : msgData.sender;
    let receiverObj =
      typeof msgData.receiver === 'string'
        ? this.users.find((u) => u._id === msgData.receiver || (u as any).id === msgData.receiver)
        : msgData.receiver;

    if (!senderObj && typeof msgData.sender === 'object') {
      senderObj = msgData.sender;
    }
    if (!receiverObj && typeof msgData.receiver === 'object') {
      receiverObj = msgData.receiver;
    }

    const newMsg: MockMessage = {
      _id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      request: msgData.request || '',
      sender: senderObj || { _id: typeof msgData.sender === 'string' ? msgData.sender : 'user', name: 'Neighbor', trustScore: 95 },
      receiver: receiverObj || { _id: typeof msgData.receiver === 'string' ? msgData.receiver : 'user', name: 'Neighbor', trustScore: 95 },
      text: msgData.text || '',
      read: false,
      createdAt: new Date(),
    };

    this.messages.push(newMsg);
    return newMsg;
  }

  // --- REVIEW METHODS ---
  public findReviewsByUser(userId: string): MockReview[] {
    return this.reviews.filter((r) => {
      const rId = typeof r.reviewee === 'object' ? r.reviewee._id : r.reviewee;
      return rId === userId;
    });
  }

  public createReview(revData: Partial<MockReview>): MockReview {
    const reviewerObj =
      typeof revData.reviewer === 'string' ? this.findUserById(revData.reviewer) : revData.reviewer;
    const revieweeObj =
      typeof revData.reviewee === 'string' ? this.findUserById(revData.reviewee) : revData.reviewee;

    const newRev: MockReview = {
      _id: 'rev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      request: revData.request || '',
      reviewer: reviewerObj || { _id: revData.reviewer, name: 'Neighbor' },
      reviewee: revieweeObj || { _id: revData.reviewee, name: 'Neighbor' },
      rating: revData.rating || 5,
      comment: revData.comment || '',
      createdAt: new Date(),
    };

    this.reviews.unshift(newRev);

    // Update reviewee trust score
    const targetUserId = typeof revData.reviewee === 'object' ? revData.reviewee._id : revData.reviewee;
    if (targetUserId) {
      const user = this.findUserById(targetUserId);
      if (user) {
        user.trustScore = Math.min(100, user.trustScore + 2);
      }
    }

    return newRev;
  }

  // --- SKILL METHODS ---
  public getSkills(): MockSkill[] {
    return [...this.skills];
  }

  public createSkill(name: string, category: string, description: string, createdBy?: string): MockSkill {
    const existing = this.skills.find((s) => s.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing;

    const newSkill: MockSkill = {
      _id: 'sk_' + Date.now(),
      name,
      category: category || 'General',
      description: description || '',
      createdBy,
      createdAt: new Date(),
    };
    this.skills.push(newSkill);
    return newSkill;
  }

  // --- LEADERBOARD ---
  public getLeaderboardData() {
    const sortedUsers = [...this.users].sort(
      (a, b) => b.trustScore - a.trustScore || b.completedFavors - a.completedFavors
    );

    const allSkills = new Set<string>();
    this.users.forEach((u) => u.skills?.forEach((s) => allSkills.add(s)));

    return {
      leaderboard: sortedUsers,
      metrics: {
        totalNeighbors: this.users.length,
        totalRequests: this.requests.length,
        completedFavors: this.requests.filter((r) => r.status === 'Completed').length,
        uniqueSkillsShared: allSkills.size,
        averageCommunityRating: 4.9,
      },
    };
  }
}

export const mockStore = new MockStore();
