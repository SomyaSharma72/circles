import bcrypt from 'bcryptjs';

export interface MockUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  bio?: string;
  neighborhood: string;
  profession: string;
  age?: number;
  gender?: string;
  profileCompleted?: boolean;
  blockedUsers?: string[];
  skills: string[];
  trustScore: number;
  completedFavors: number;
  credits: number;
  avatarUrl?: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  createdAt: Date;
}

export interface MockGroup {
  _id: string;
  name: string;
  description: string;
  category: string;
  creator: any;
  members: any[];
  avatarUrl?: string;
  icon?: string;
  privacy: 'Public' | 'Approval Required';
  isPrivate?: boolean;
  neighborhood: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  createdAt: Date;
}

export interface MockGroupMessage {
  _id: string;
  group: string;
  sender: any;
  text: string;
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
      bio: 'Avid gardener and community organizer. Happy to lend tools, share fresh balcony plants, and help neighbors!',
      neighborhood: 'Indiranagar 100ft Road',
      profession: 'Software Engineer & Community Volunteer',
      age: 28,
      gender: 'Female',
      profileCompleted: true,
      blockedUsers: [],
      skills: ['Scooter & Car Jumpstart', 'Garden Care & Tools', 'Pet Care', 'Home Repairs'],
      trustScore: 98,
      completedFavors: 14,
      location: { type: 'Point', coordinates: [77.6408, 12.9784] },
      createdAt: new Date(Date.now() - 30 * 86400000),
    },
    {
      _id: 'user_aarav_2',
      name: 'Aarav Patel',
      email: 'aarav@neighborly.app',
      passwordHash: DEMO_PASSWORD_HASH,
      bio: 'Mechanic enthusiast and DIY woodworker. Have an arsenal of heavy power tools, jumper cables, and angle grinders available to borrow.',
      neighborhood: 'Koramangala 4th Block',
      profession: 'Mechanical Engineer',
      age: 32,
      gender: 'Male',
      profileCompleted: true,
      blockedUsers: [],
      skills: ['Bosch Impact Drill', 'Vehicle Battery Jumpstart', 'Furniture Assembly', 'Plumbing Assistance'],
      trustScore: 95,
      completedFavors: 28,
      location: { type: 'Point', coordinates: [77.6245, 12.9352] },
      createdAt: new Date(Date.now() - 45 * 86400000),
    },
    {
      _id: 'user_rohan_3',
      name: 'Rohan Gupta',
      email: 'rohan@neighborly.app',
      passwordHash: DEMO_PASSWORD_HASH,
      bio: 'Dog foster parent and volunteer. Available for weekend emergency dog walks, pet boarding, and lifting heavy cargo/furniture.',
      neighborhood: 'Indiranagar 12th Main',
      profession: 'Fitness Coach & Pet Sitter',
      age: 26,
      gender: 'Male',
      profileCompleted: true,
      blockedUsers: [],
      skills: ['Dog Walking & Training', 'Heavy Lifting', 'Moving Assistance', 'Bicycle Repair'],
      trustScore: 92,
      completedFavors: 19,
      location: { type: 'Point', coordinates: [77.6380, 12.9720] },
      createdAt: new Date(Date.now() - 20 * 86400000),
    },
    {
      _id: 'user_ananya_4',
      name: 'Ananya Iyer',
      email: 'ananya@neighborly.app',
      passwordHash: DEMO_PASSWORD_HASH,
      bio: 'Tech lead and home baker. Love troubleshooting Wi-Fi routers, smart home devices, and sharing homemade sourdough.',
      neighborhood: 'Indiranagar Defence Colony',
      profession: 'IT Solutions Architect',
      age: 30,
      gender: 'Female',
      profileCompleted: true,
      blockedUsers: [],
      skills: ['Wi-Fi & Mesh Setup', 'Computer Troubleshooting', 'Home Baking', 'Medicine Pickup'],
      trustScore: 99,
      completedFavors: 22,
      location: { type: 'Point', coordinates: [77.6440, 12.9810] },
      createdAt: new Date(Date.now() - 60 * 86400000),
    },
    {
      _id: 'user_vikram_5',
      name: 'Vikram Malhotra',
      email: 'vikram@neighborly.app',
      passwordHash: DEMO_PASSWORD_HASH,
      bio: 'Sports coach and youth mentor. Happy to help neighbors with sports equipment, fitness coaching, and emergency childcare.',
      neighborhood: 'Domlur Layout',
      profession: 'Youth Sports Director',
      age: 35,
      gender: 'Male',
      profileCompleted: true,
      blockedUsers: [],
      skills: ['Childcare & Sports', 'Emergency Rides', 'First Aid'],
      trustScore: 96,
      completedFavors: 16,
      location: { type: 'Point', coordinates: [77.6350, 12.9600] },
      createdAt: new Date(Date.now() - 50 * 86400000),
    },
    {
      _id: 'user_meera_6',
      name: 'Meera Kapoor',
      email: 'meera@neighborly.app',
      passwordHash: DEMO_PASSWORD_HASH,
      bio: 'High school math and physics tutor. Love hosting weekend study circles and lending academic textbooks and science kits.',
      neighborhood: 'Ulsoor Lake Circle',
      profession: 'Educator & Academic Coach',
      age: 29,
      gender: 'Female',
      profileCompleted: true,
      blockedUsers: [],
      skills: ['Math & Physics Tutoring', 'Study Circle Facilitation', 'Book Exchange'],
      trustScore: 97,
      completedFavors: 25,
      location: { type: 'Point', coordinates: [77.6250, 12.9820] },
      createdAt: new Date(Date.now() - 70 * 86400000),
    },
  ];

  public requests: MockFavorRequest[] = [
    {
      _id: 'req_jumpstart_101',
      title: 'Car Battery Jump Start Needed Near 100ft Road',
      description: 'My car battery died near the Metro Station. I have jumper cables in my trunk, just need a neighbor with a vehicle to give a quick 5-minute jump start!',
      category: 'Repairs & Tools',
      urgency: 'High',
      tags: ['Jumpstart', 'Car Battery', 'Urgent'],
      summary: 'Neighbor needs a car jump start near Metro Station. Cables available on site.',
      isFlaggedSpam: false,
      status: 'Open',
      requester: {
        _id: 'user_aarav_2',
        name: 'Aarav Patel',
        email: 'aarav@neighborly.app',
        trustScore: 95,
        neighborhood: 'Koramangala 4th Block',
        skills: ['Electrical Wiring', 'Heavy Drill & Tools'],
      },
      locationName: '100ft Road, Indiranagar',
      location: { type: 'Point', coordinates: [77.6408, 12.9784] },
      createdAt: new Date(Date.now() - 3600000 * 2),
    },
    {
      _id: 'req_ladder_102',
      title: 'Borrow a Heavy Duty Bosch Drill Machine for Wall Mounting',
      description: 'Looking to borrow an impact drill machine for 2 hours today to mount curtain rods and wall shelves in my new flat.',
      category: 'Repairs & Tools',
      urgency: 'Medium',
      tags: ['Drill Machine', 'Tools', 'Home Repair', 'Borrow'],
      summary: 'Seeking impact drill for 2-hour wall shelf mounting today.',
      isFlaggedSpam: false,
      status: 'Open',
      requester: {
        _id: 'user_rohan_3',
        name: 'Rohan Gupta',
        email: 'rohan@neighborly.app',
        trustScore: 92,
        neighborhood: 'Indiranagar 12th Main',
        skills: ['Dog Walking', 'Heavy Lifting'],
      },
      locationName: 'Indiranagar 12th Main',
      location: { type: 'Point', coordinates: [77.6380, 12.9720] },
      createdAt: new Date(Date.now() - 3600000 * 5),
    },
    {
      _id: 'req_dogwalk_103',
      title: 'Indie Dog Feeding & Evening Walk Assistance',
      description: 'Heading out for an outstation wedding this weekend. Looking for a trusted animal-loving neighbor to feed my friendly Indie dog and take him on a 20-min evening walk.',
      category: 'Pet Care',
      urgency: 'Low',
      tags: ['Pet Care', 'Dog Walk', 'Pet Sitting'],
      summary: 'Weekend evening dog feeding and 20-min walk for friendly rescue Indie dog.',
      isFlaggedSpam: false,
      status: 'Open',
      requester: {
        _id: 'user_ananya_4',
        name: 'Ananya Iyer',
        email: 'ananya@neighborly.app',
        trustScore: 99,
        neighborhood: 'Indiranagar Defence Colony',
        skills: ['Wi-Fi Setup', 'Baking'],
      },
      locationName: 'Indiranagar Defence Colony',
      location: { type: 'Point', coordinates: [77.6440, 12.9810] },
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
        trustScore: 95,
        neighborhood: 'Koramangala 4th Block',
      },
      receiver: {
        _id: 'user_priya_1',
        name: 'Priya Sharma',
        trustScore: 98,
        neighborhood: 'Indiranagar 100ft Road',
      },
      text: 'Hey Priya! I have battery jumpstart cables in my car trunk and can drop by in 10 minutes.',
      read: true,
      createdAt: new Date(Date.now() - 3600000 * 2),
    },
    {
      _id: 'msg_seed_2',
      request: 'req_jumpstart_101',
      sender: {
        _id: 'user_priya_1',
        name: 'Priya Sharma',
        trustScore: 98,
        neighborhood: 'Indiranagar 100ft Road',
      },
      receiver: {
        _id: 'user_aarav_2',
        name: 'Aarav Patel',
        trustScore: 95,
        neighborhood: 'Koramangala 4th Block',
      },
      text: 'That would be an absolute lifesaver Aarav! I am parked right near 100ft Road.',
      read: true,
      createdAt: new Date(Date.now() - 3600000 * 1.5),
    },
  ];

  public reviews: MockReview[] = [
    {
      _id: 'rev_seed_1',
      request: 'req_jumpstart_101',
      reviewer: {
        _id: 'user_priya_1',
        name: 'Priya Sharma',
        trustScore: 98,
      },
      reviewee: {
        _id: 'user_aarav_2',
        name: 'Aarav Patel',
        trustScore: 95,
      },
      rating: 5,
      comment: 'Super fast response and brought cables right over. Great neighbor!',
      createdAt: new Date(Date.now() - 86400000),
    },
  ];

  public skills: MockSkill[] = [
    { _id: 'sk_1', name: 'Car Battery Jumpstart', category: 'Automotive', description: 'Help jumpstart vehicles with cables', createdAt: new Date() },
    { _id: 'sk_2', name: 'Ladders & Tools', category: 'Tools', description: 'Power tools, ladders, and lawn equipment', createdAt: new Date() },
    { _id: 'sk_3', name: 'Pet Sitting & Dog Walking', category: 'Pet Care', description: 'Dog walking, cat feeding, pet watching', createdAt: new Date() },
    { _id: 'sk_4', name: 'Home Repairs & Plumbing', category: 'Home', description: 'Fixing leaks, mounting TVs, furniture assembly', createdAt: new Date() },
    { _id: 'sk_5', name: 'Wi-Fi & Tech Support', category: 'Technology', description: 'Router setup, computer repair, TV smart setup', createdAt: new Date() },
  ];

  public groups: MockGroup[] = [
    {
      _id: 'grp_cyclists',
      name: 'Sunday Morning Cyclists',
      description: 'Casual 15km weekend morning rides through leafy neighborhood parks followed by South Indian filter coffee.',
      category: 'Fitness & Cycling',
      icon: 'fitness',
      privacy: 'Public',
      creator: { _id: 'user_vikram_5', name: 'Vikram Malhotra', trustScore: 96 },
      members: [
        { _id: 'user_vikram_5', name: 'Vikram Malhotra', trustScore: 96 },
        { _id: 'user_priya_1', name: 'Priya Sharma', trustScore: 98 },
        { _id: 'user_rohan_3', name: 'Rohan Gupta', trustScore: 92 },
      ],
      neighborhood: 'Indiranagar & Domlur Circle',
      location: { type: 'Point', coordinates: [77.6400, 12.9750] },
      createdAt: new Date(Date.now() - 15 * 86400000),
    },
    {
      _id: 'grp_gardeners',
      name: 'Balcony & Terrace Gardeners',
      description: 'Sharing organic seeds, potting soil mixes, cuttings of monstera/pothos, and balcony gardening hacks.',
      category: 'Gardening & Balcony',
      icon: 'gardening',
      privacy: 'Public',
      creator: { _id: 'user_priya_1', name: 'Priya Sharma', trustScore: 98 },
      members: [
        { _id: 'user_priya_1', name: 'Priya Sharma', trustScore: 98 },
        { _id: 'user_meera_6', name: 'Meera Kapoor', trustScore: 97 },
        { _id: 'user_ananya_4', name: 'Ananya Iyer', trustScore: 99 },
      ],
      neighborhood: 'Indiranagar 100ft Road',
      location: { type: 'Point', coordinates: [77.6420, 12.9790] },
      createdAt: new Date(Date.now() - 25 * 86400000),
    },
    {
      _id: 'grp_tools',
      name: 'Tools & Hardware Library',
      description: 'Neighborhood tool-sharing ring: Bosch drills, step ladders, wrenches, car battery jumpers, and torque sets.',
      category: 'Tools & Hardware Library',
      icon: 'tools',
      privacy: 'Public',
      creator: { _id: 'user_aarav_2', name: 'Aarav Patel', trustScore: 95 },
      members: [
        { _id: 'user_aarav_2', name: 'Aarav Patel', trustScore: 95 },
        { _id: 'user_priya_1', name: 'Priya Sharma', trustScore: 98 },
        { _id: 'user_rohan_3', name: 'Rohan Gupta', trustScore: 92 },
      ],
      neighborhood: 'Koramangala & Indiranagar Central',
      location: { type: 'Point', coordinates: [77.6320, 12.9550] },
      createdAt: new Date(Date.now() - 40 * 86400000),
    },
    {
      _id: 'grp_pets',
      name: 'Pets & Dog Walking Ring',
      description: 'Mutual dog walking schedules, vet recommendations, rescue feeding, and safe puppy playdates.',
      category: 'Pets & Dog Walking',
      icon: 'pets',
      privacy: 'Public',
      creator: { _id: 'user_rohan_3', name: 'Rohan Gupta', trustScore: 92 },
      members: [
        { _id: 'user_rohan_3', name: 'Rohan Gupta', trustScore: 92 },
        { _id: 'user_ananya_4', name: 'Ananya Iyer', trustScore: 99 },
      ],
      neighborhood: 'Indiranagar 12th Main',
      location: { type: 'Point', coordinates: [77.6380, 12.9720] },
      createdAt: new Date(Date.now() - 10 * 86400000),
    },
    {
      _id: 'grp_books',
      name: 'Indiranagar Book Club',
      description: 'Monthly fiction & non-fiction reading circles, physical book lending library, and coffee meetups.',
      category: 'Book Club & Reading',
      icon: 'books',
      privacy: 'Public',
      creator: { _id: 'user_meera_6', name: 'Meera Kapoor', trustScore: 97 },
      members: [
        { _id: 'user_meera_6', name: 'Meera Kapoor', trustScore: 97 },
        { _id: 'user_priya_1', name: 'Priya Sharma', trustScore: 98 },
      ],
      neighborhood: 'Ulsoor & Indiranagar',
      location: { type: 'Point', coordinates: [77.6290, 12.9800] },
      createdAt: new Date(Date.now() - 30 * 86400000),
    },
    {
      _id: 'grp_parenting',
      name: 'Parenting & Weekend Playgroups',
      description: 'Verified neighborhood parents coordinating safe park playdates, school carpools, and toy exchanges.',
      category: 'Parenting & Playgroups',
      icon: 'parenting',
      privacy: 'Approval Required',
      creator: { _id: 'user_ananya_4', name: 'Ananya Iyer', trustScore: 99 },
      members: [
        { _id: 'user_ananya_4', name: 'Ananya Iyer', trustScore: 99 },
        { _id: 'user_vikram_5', name: 'Vikram Malhotra', trustScore: 96 },
      ],
      neighborhood: 'Indiranagar Defence Colony',
      location: { type: 'Point', coordinates: [77.6440, 12.9810] },
      createdAt: new Date(Date.now() - 18 * 86400000),
    },
  ];

  public groupMessages: MockGroupMessage[] = [
    {
      _id: 'gmsg_seed_1',
      group: 'grp_cyclists',
      sender: {
        _id: 'user_vikram_5',
        name: 'Vikram Malhotra',
        trustScore: 96,
      },
      text: 'Good morning everyone! Sunday ride wheels roll at 6:30 AM from the park gate. 15km easy pace!',
      createdAt: new Date(Date.now() - 86400000 * 2),
    },
    {
      _id: 'gmsg_seed_2',
      group: 'grp_cyclists',
      sender: {
        _id: 'user_priya_1',
        name: 'Priya Sharma',
        trustScore: 98,
      },
      text: 'Count me in! I will bring extra puncture repair patches just in case.',
      createdAt: new Date(Date.now() - 86400000 * 1.5),
    },
    {
      _id: 'gmsg_seed_3',
      group: 'grp_gardeners',
      sender: {
        _id: 'user_priya_1',
        name: 'Priya Sharma',
        trustScore: 98,
      },
      text: 'I have 4 healthy monstera cuttings rooted in water ready to give away to anyone setting up a balcony garden!',
      createdAt: new Date(Date.now() - 86400000 * 3),
    },
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
      neighborhood: userData.neighborhood || 'Indiranagar',
      profession: userData.profession || 'Neighbor',
      age: userData.age,
      gender: userData.gender || '',
      profileCompleted: userData.profileCompleted ?? false,
      blockedUsers: userData.blockedUsers || [],
      skills: userData.skills || [],
      trustScore: 100,
      completedFavors: 0,
      location: userData.location || { type: 'Point', coordinates: [77.6408, 12.9784] },
      createdAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  public updateUser(id: string, updates: Partial<MockUser>): MockUser | null {
    const user = this.findUserById(id);
    if (!user) return null;
    Object.assign(user, updates);
    return user;
  }

  public blockUser(userId: string, targetId: string): boolean {
    const user = this.findUserById(userId);
    if (!user) return false;
    if (!user.blockedUsers) user.blockedUsers = [];
    if (!user.blockedUsers.includes(targetId)) {
      user.blockedUsers.push(targetId);
    }
    return true;
  }

  public unblockUser(userId: string, targetId: string): boolean {
    const user = this.findUserById(userId);
    if (!user || !user.blockedUsers) return false;
    user.blockedUsers = user.blockedUsers.filter((id) => id !== targetId);
    return true;
  }

  public getBlockedUsers(userId: string): MockUser[] {
    const user = this.findUserById(userId);
    if (!user || !user.blockedUsers) return [];
    return this.users.filter((u) => user.blockedUsers!.includes(u._id));
  }

  public searchNeighbors(query: string, excludeUserId?: string): MockUser[] {
    const q = query.toLowerCase().trim();
    return this.users.filter((u) => {
      if (excludeUserId && u._id === excludeUserId) return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.neighborhood.toLowerCase().includes(q) ||
        u.profession.toLowerCase().includes(q) ||
        u.skills.some((s) => s.toLowerCase().includes(q))
      );
    });
  }

  // --- REQUEST METHODS ---
  public findRequests(filterOrCategory?: string | { category?: string; urgency?: string; search?: string }, query?: string): MockFavorRequest[] {
    let list = [...this.requests];
    let category: string | undefined;
    let urgency: string | undefined;
    let search: string | undefined = query;

    if (typeof filterOrCategory === 'object' && filterOrCategory !== null) {
      category = filterOrCategory.category;
      urgency = filterOrCategory.urgency;
      search = filterOrCategory.search || query;
    } else if (typeof filterOrCategory === 'string') {
      category = filterOrCategory;
    }

    if (category && category !== 'All') {
      list = list.filter((r) => r.category.toLowerCase().includes(category!.toLowerCase()) || category!.toLowerCase().includes(r.category.toLowerCase()));
    }
    if (urgency && urgency !== 'All') {
      list = list.filter((r) => r.urgency.toLowerCase() === urgency!.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.locationName.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public findNearbyRequests(userLat: number, userLng: number): any[] {
    return this.requests.filter((r) => r.status === 'Open').map((r) => {
      const docLng = r.location.coordinates[0];
      const docLat = r.location.coordinates[1];
      const distanceMiles = Math.sqrt(Math.pow(userLat - docLat, 2) + Math.pow(userLng - docLng, 2)) * 69;
      return {
        ...r,
        distanceMiles: Math.round(distanceMiles * 10) / 10,
        distanceKm: Math.round(distanceMiles * 1.60934 * 10) / 10,
      };
    });
  }

  public findRequestById(id: string): MockFavorRequest | undefined {
    return this.requests.find((r) => r._id === id);
  }

  public createRequest(data: Partial<MockFavorRequest>): MockFavorRequest {
    const requesterUser =
      typeof data.requester === 'string'
        ? this.findUserById(data.requester)
        : data.requester || this.users[0];

    const newReq: MockFavorRequest = {
      _id: 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title: data.title || 'Help Request',
      description: data.description || '',
      category: data.category || 'General Help',
      urgency: data.urgency || 'Medium',
      tags: data.tags || ['NeighborHelp'],
      summary: data.summary || data.description || '',
      isFlaggedSpam: false,
      status: 'Open',
      requester: {
        _id: requesterUser._id,
        name: requesterUser.name,
        trustScore: requesterUser.trustScore || 95,
        neighborhood: requesterUser.neighborhood,
        skills: requesterUser.skills || [],
      },
      locationName: data.locationName || requesterUser.neighborhood || 'Local Circle',
      location: data.location || requesterUser.location || { type: 'Point', coordinates: [77.6408, 12.9784] },
      createdAt: new Date(),
    };
    this.requests.unshift(newReq);
    return newReq;
  }

  public updateRequestStatus(id: string, status: 'Open' | 'In Progress' | 'Completed' | 'Cancelled', helperId?: string): MockFavorRequest | null {
    const req = this.findRequestById(id);
    if (!req) return null;
    req.status = status;
    if (helperId) {
      const helperUser = this.findUserById(helperId);
      if (helperUser) {
        req.helper = {
          _id: helperUser._id,
          name: helperUser.name,
          trustScore: helperUser.trustScore,
        };
      }
    }
    return req;
  }

  // --- GROUP METHODS ---
  public findGroups(category?: string, query?: string): MockGroup[] {
    let list = [...this.groups];
    if (category && category !== 'All') {
      const catLower = category.toLowerCase();
      list = list.filter((g) => g.category.toLowerCase().includes(catLower) || catLower.includes(g.category.toLowerCase()));
    }
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((g) => g.name.toLowerCase().includes(q) || g.description.toLowerCase().includes(q) || g.neighborhood.toLowerCase().includes(q));
    }
    return list;
  }

  public findGroupById(id: string): MockGroup | undefined {
    return this.groups.find((g) => g._id === id);
  }

  public createGroup(data: {
    name: string;
    description?: string;
    category?: string;
    creatorId: string;
    neighborhood?: string;
    icon?: string;
    privacy?: 'Public' | 'Approval Required';
    coordinates?: [number, number];
  }): MockGroup {
    const creatorUser = this.findUserById(data.creatorId) || this.users[0];
    const coords = data.coordinates || creatorUser.location?.coordinates || [77.6408, 12.9784];
    const newGroup: MockGroup = {
      _id: 'grp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: data.name.trim(),
      description: data.description?.trim() || '',
      category: data.category || 'General Help',
      icon: data.icon || 'gardening',
      privacy: data.privacy === 'Approval Required' ? 'Approval Required' : 'Public',
      creator: { _id: creatorUser._id, name: creatorUser.name, trustScore: creatorUser.trustScore },
      members: [
        { _id: creatorUser._id, name: creatorUser.name, trustScore: creatorUser.trustScore }
      ],
      neighborhood: data.neighborhood || creatorUser.neighborhood || 'Local Circle',
      location: { type: 'Point', coordinates: coords },
      createdAt: new Date(),
    };
    this.groups.unshift(newGroup);
    return newGroup;
  }

  public joinGroup(groupId: string, userId: string): MockGroup | null {
    const group = this.findGroupById(groupId);
    if (!group) return null;
    const user = this.findUserById(userId);
    if (!user) return null;

    const alreadyMember = group.members.some((m) => (typeof m === 'object' ? m._id === userId : m === userId));
    if (!alreadyMember) {
      group.members.push({ _id: user._id, name: user.name, trustScore: user.trustScore });
    }
    return group;
  }

  public leaveGroup(groupId: string, userId: string): MockGroup | null {
    const group = this.findGroupById(groupId);
    if (!group) return null;
    group.members = group.members.filter((m) => (typeof m === 'object' ? m._id !== userId : m !== userId));
    return group;
  }

  public deleteGroup(groupId: string, userId: string): boolean {
    const idx = this.groups.findIndex((g) => g._id === groupId);
    if (idx === -1) return false;
    const group = this.groups[idx];
    const creatorId = typeof group.creator === 'object' ? group.creator._id : group.creator;
    if (creatorId !== userId) return false;
    this.groups.splice(idx, 1);
    this.groupMessages = this.groupMessages.filter((m) => m.group !== groupId);
    return true;
  }

  public findGroupMessages(groupId: string): MockGroupMessage[] {
    return this.groupMessages.filter((m) => m.group === groupId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  public createGroupMessage(groupId: string, senderId: string, text: string): MockGroupMessage {
    const user = this.findUserById(senderId);
    const newMsg: MockGroupMessage = {
      _id: 'gmsg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      group: groupId,
      sender: {
        _id: user?._id || senderId,
        name: user?.name || 'Neighbor',
        trustScore: user?.trustScore || 95,
      },
      text: text.trim(),
      createdAt: new Date(),
    };
    this.groupMessages.push(newMsg);
    return newMsg;
  }

  // --- REVIEW METHODS ---
  public findReviewsByRequest(requestId: string): MockReview[] {
    return this.reviews.filter((r) => r.request === requestId);
  }

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

    const reqId = revData.request || '';
    const reviewerId = typeof revData.reviewer === 'object' ? revData.reviewer?._id : revData.reviewer;

    // Check duplicate
    const existing = this.reviews.find((r) => {
      const rRevId = typeof r.reviewer === 'object' ? r.reviewer._id : r.reviewer;
      return r.request === reqId && rRevId === reviewerId;
    });
    if (existing) {
      throw new Error('You have already submitted a review for this request');
    }

    const newRev: MockReview = {
      _id: 'rev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      request: reqId,
      reviewer: reviewerObj,
      reviewee: revieweeObj,
      rating: revData.rating || 5,
      comment: revData.comment || '',
      createdAt: new Date(),
    };
    this.reviews.push(newRev);

    // Update user trust score & favor count
    if (revieweeObj && revieweeObj._id) {
      const targetUser = this.findUserById(revieweeObj._id);
      if (targetUser) {
        targetUser.completedFavors = (targetUser.completedFavors || 0) + 1;
      }
    }

    return newRev;
  }

  // --- DIRECT MESSAGE METHODS ---
  public findMessagesBetween(reqId: string, user1Id: string, user2Id: string): MockMessage[] {
    return this.messages.filter((m) => {
      const sId = typeof m.sender === 'object' ? m.sender._id : m.sender;
      const rId = typeof m.receiver === 'object' ? m.receiver._id : m.receiver;
      const matchReq = !reqId || m.request === reqId;
      return matchReq && ((sId === user1Id && rId === user2Id) || (sId === user2Id && rId === user1Id));
    }).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  public createDirectMessage(data: { request: string; senderId: string; receiverId: string; text: string }): MockMessage {
    const senderObj = this.findUserById(data.senderId);
    const receiverObj = this.findUserById(data.receiverId);

    // Check blocked status
    if (receiverObj?.blockedUsers?.includes(data.senderId)) {
      throw new Error('Cannot send message to this user.');
    }

    const newMsg: MockMessage = {
      _id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      request: data.request,
      sender: {
        _id: senderObj?._id || data.senderId,
        name: senderObj?.name || 'Neighbor',
        trustScore: senderObj?.trustScore || 95,
        neighborhood: senderObj?.neighborhood,
      },
      receiver: {
        _id: receiverObj?._id || data.receiverId,
        name: receiverObj?.name || 'Neighbor',
        trustScore: receiverObj?.trustScore || 95,
        neighborhood: receiverObj?.neighborhood,
      },
      text: data.text.trim(),
      read: false,
      createdAt: new Date(),
    };
    this.messages.push(newMsg);
    return newMsg;
  }

  public findMessagesByRequest(requestId: string): MockMessage[] {
    return this.messages.filter((m) => m.request === requestId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  public getUserConversations(userId: string) {
    const conversationsMap = new Map<string, any>();
    const userMsgs = this.messages.filter((m) => {
      const sId = typeof m.sender === 'object' ? m.sender._id : m.sender;
      const rId = typeof m.receiver === 'object' ? m.receiver._id : m.receiver;
      return sId === userId || rId === userId;
    });

    for (const msg of userMsgs) {
      const reqId = msg.request;
      if (!reqId || conversationsMap.has(reqId)) continue;
      const req = this.findRequestById(reqId);
      const sId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
      const otherUser = sId === userId ? msg.receiver : msg.sender;

      conversationsMap.set(reqId, {
        requestId: reqId,
        requestTitle: req?.title || 'Favor Request',
        requestCategory: req?.category || 'General Help',
        requestStatus: req?.status || 'Open',
        otherUser,
        lastMessage: {
          _id: msg._id,
          text: msg.text,
          sender: msg.sender,
          createdAt: msg.createdAt,
          read: msg.read,
        },
        unreadCount: 0,
      });
    }
    return Array.from(conversationsMap.values());
  }

  public isUserBlocked(userA: string, userB: string): boolean {
    const uA = this.findUserById(userA);
    const uB = this.findUserById(userB);
    return Boolean(uA?.blockedUsers?.includes(userB) || uB?.blockedUsers?.includes(userA));
  }

  public createMessage(data: { request: string; sender: any; receiver: any; text: string }): MockMessage {
    const sId = typeof data.sender === 'object' ? data.sender._id : data.sender;
    const rId = typeof data.receiver === 'object' ? data.receiver._id : data.receiver;
    const senderObj = typeof data.sender === 'object' ? data.sender : this.findUserById(sId);
    const receiverObj = typeof data.receiver === 'object' ? data.receiver : this.findUserById(rId);

    const newMsg: MockMessage = {
      _id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      request: data.request,
      sender: senderObj || { _id: sId, name: 'Neighbor', trustScore: 95 },
      receiver: receiverObj || { _id: rId, name: 'Neighbor', trustScore: 95 },
      text: data.text.trim(),
      read: false,
      createdAt: new Date(),
    };
    this.messages.push(newMsg);
    return newMsg;
  }

  // --- LEADERBOARD METHOD ---
  public getLeaderboardData() {
    const topNeighbors = [...this.users]
      .sort((a, b) => (b.trustScore || 0) - (a.trustScore || 0) || (b.completedFavors || 0) - (a.completedFavors || 0))
      .slice(0, 10);
    const totalNeighbors = this.users.length;
    const totalRequests = this.requests.length;
    const completedFavorsCount = this.requests.filter((r) => r.status === 'Completed').length;
    const allSkills = new Set<string>();
    this.users.forEach((u) => u.skills?.forEach((s) => allSkills.add(s)));
    const avgRating = 4.9;
    return {
      leaderboard: topNeighbors,
      metrics: {
        totalNeighbors,
        totalRequests,
        completedFavors: completedFavorsCount,
        uniqueSkillsShared: allSkills.size,
        averageCommunityRating: avgRating,
      },
    };
  }

  // --- SKILL METHODS ---
  public getSkills(): MockSkill[] {
    return this.skills;
  }

  public createSkill(name: string, category?: string, description?: string, createdBy?: string): MockSkill {
    const newSkill: MockSkill = {
      _id: 'sk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: name.trim(),
      category: category || 'General Help',
      description: description?.trim() || '',
      createdBy,
      createdAt: new Date(),
    };
    this.skills.push(newSkill);
    return newSkill;
  }
}

export const mockStore = new MockStore();
