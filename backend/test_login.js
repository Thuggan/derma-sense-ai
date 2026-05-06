const mongoose = require('mongoose');
const User = require('./models/User');

const uri = 'mongodb://localhost:27017/skin_disease_db';

async function listUsers() {
    try {
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to DB');

        const users = await User.find({});
        console.log(`Found ${users.length} users:`);
        users.forEach(u => {
            console.log(`- Email: ${u.email}, isDoctor: ${u.isDoctor}, isAdmin: ${u.isAdmin}, isVerified: ${u.isVerified}`);
        });
        
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

listUsers();
