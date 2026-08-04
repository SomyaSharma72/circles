import mongoose from 'mongoose';


const seedInitialData = async () => {
  try {
    const Request = mongoose.models.Request;
    const Skill = mongoose.models.Skill;
    const User = mongoose.models.User;

    if (Request && (await Request.countDocuments()) === 0) {
      console.log('Seeding initial requests...');
      // Create a default user reference if needed
      let defaultUser = await User.findOne();
      if (!defaultUser) {
        defaultUser = await User.create({
          fullName: 'Sarah Jenkins',
          email: 'sarah@neighborly.com',
          password: 'hashedpassword123',
          profession: 'Graphic Designer',
          neighborhood: 'Maplewood Terrace',
          bio: 'Passionate about helping neighbors!',
          trustScore: 98,
          completedFavors: 12,
        });
      }

      await Request.create([
        {
          title: 'Help moving couch upstairs',
          description: 'Need two strong hands for 20 mins to help carry a sectional sofa to 2nd floor.',
          category: 'Moving & Yardwork',
          status: 'Pending',
          requestedBy: defaultUser._id,
          requiredDate: 'Today by 5 PM',
          location: 'Maplewood Terrace',
        },
        {
          title: 'Pet sitting for weekend',
          description: 'Looking for a dog lover to feed and walk Barnaby twice a day over the weekend.',
          category: 'Pet Care',
          status: 'Pending',
          requestedBy: defaultUser._id,
          requiredDate: 'Sat-Sun',
          location: 'Oakridge',
        },
        {
          title: 'Lawn mower borrowing or assistance',
          description: 'Lawn is getting overgrown. Would love to borrow an electric mower or get a quick trim.',
          category: 'Tools & Home Repair',
          status: 'Pending',
          requestedBy: defaultUser._id,
          requiredDate: 'This Weekend',
          location: 'Maplewood Terrace',
        },
        {
          title: 'Sourdough starter & baking tips',
          description: 'Interested in learning home bread baking. Anyone willing to share starter and guidance?',
          category: 'Cooking & Food',
          status: 'Pending',
          requestedBy: defaultUser._id,
          requiredDate: 'Flexible',
          location: 'Pine Crest',
        },
      ]);
      console.log('Initial requests seeded successfully.');
    }

    if (Skill && (await Skill.countDocuments()) === 0) {
      console.log('Seeding initial skills...');
      let defaultUser = await User.findOne();
      if (!defaultUser) {
        defaultUser = await User.create({
          fullName: 'Marcus Vance',
          email: 'marcus@neighborly.com',
          password: 'hashedpassword123',
          profession: 'Master Carpenter',
          neighborhood: 'Maplewood Terrace',
          trustScore: 99,
        });
      }

      await Skill.create([
        {
          user: defaultUser._id,
          title: 'Basic Woodworking & Cabinet Repair',
          category: 'Home Improvement',
          description: 'Over 10 years experience crafting custom furniture and fixing squeaky doors.',
          availability: 'Weekends & Evenings',
          isActive: true,
        },
        {
          user: defaultUser._id,
          title: 'Bilingual Spanish Tutoring',
          category: 'Education & Tutoring',
          description: 'Native Spanish speaker available for conversational practice or student tutoring.',
          availability: 'Flexible Weekdays',
          isActive: true,
        },
      ]);
      console.log('Initial skills seeded successfully.');
    }
  } catch (err) {
    console.error('Error seeding initial DB data:', err.message);
  }
};

const connectDB = async () => {
  try {
    // Disable operation buffering so queries fail immediately if DB is unreachable
    mongoose.set('bufferCommands', false);

    if (!process.env.MONGODB_URI) {
      console.warn("⚠️ MONGODB_URI is not defined in environment. Backend will operate in local fallback mode.");
      return;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    await seedInitialData();
  } catch (error) {
    console.warn(`⚠️ MongoDB Connection Error: ${error.message}`);
    console.warn("⚠️ Continuing server startup. Frontend/Backend will rely on local fallback mode.");
  }
};

export default connectDB;



