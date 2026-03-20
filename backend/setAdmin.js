const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/skin_disease_db';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to DB');
    const bcrypt = require('bcryptjs');
    const targetEmail = 'vivekkv1762004@gmail.com';
    let user = await User.findOne({ email: targetEmail });
    
    if (!user) {
      console.log(`User ${targetEmail} not found. Creating a new admin account...`);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      user = new User({
        name: 'Admin User',
        email: targetEmail,
        password: hashedPassword,
        isAdmin: true
      });
      await user.save();
      console.log(`Created new administrator account. Email: ${targetEmail}, Password: admin123`);
    } else {
      user.isAdmin = true;
      await user.save();
      console.log(`Successfully upgraded existing ${targetEmail} to Administrator.`);
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error connecting to DB:', err);
    process.exit(1);
  });
