import User from '../models/User.js';

// POST /api/users/login
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ status: 'error', message: 'Email is required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // If user doesn't exist yet, create a default demo user for this email so login succeeds seamlessly
      const defaultName = cleanEmail.split('@')[0];
      const capitalizedName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
      user = await User.create({
        fullName: capitalizedName,
        email: cleanEmail,
        password: password || 'password123',
        profileCompleted: false,
        trustScore: 90,
      });
    }

    return res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/users/signup
export const signupUser = async (req, res, next) => {
  try {
    const { email, password, fullName, name } = req.body;
    const userFullName = fullName || name || 'New Neighbor';

    if (!email) {
      return res.status(400).json({ status: 'error', message: 'Email is required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    let user = await User.findOne({ email: cleanEmail });

    if (user) {
      // If user exists, update password / name if needed & return
      return res.status(200).json({
        status: 'success',
        data: user,
      });
    }

    user = await User.create({
      fullName: userFullName,
      email: cleanEmail,
      password: password || 'password123',
      profileCompleted: false,
      trustScore: 95,
      completedFavors: 0,
    });

    return res.status(201).json({
      status: 'success',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/:id
export const updateUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fullName, name, profession, neighborhood, bio, skills, profileCompleted, avatar, phone, preferredContact } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    if (fullName !== undefined || name !== undefined) {
      user.fullName = fullName || name;
    }
    if (profession !== undefined) user.profession = profession;
    if (neighborhood !== undefined) user.neighborhood = neighborhood;
    if (bio !== undefined) user.bio = bio;
    if (skills !== undefined) user.skills = Array.isArray(skills) ? skills : [skills];
    if (profileCompleted !== undefined) user.profileCompleted = Boolean(profileCompleted);
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    return res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    return res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/leaderboard
export const getLeaderboard = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const users = await User.find()
      .sort({ trustScore: -1, completedFavors: -1, createdAt: 1 })
      .limit(limit);

    return res.status(200).json({
      status: 'success',
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/users
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.status(200).json({
      status: 'success',
      data: users,
    });
  } catch (err) {
    next(err);
  }
};
