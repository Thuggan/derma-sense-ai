const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const uri = 'mongodb://localhost:27017/skin_disease_db';

async function seedUser() {
    try {
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to DB');

        const email = 'mrthuggan@gmail.com';
        const rawPassword = 'kannan';

        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(rawPassword, salt);

        const filter = { email };
        const update = {
            name: 'Dr. Thuggan',
            email: email,
            password: password,
            isAdmin: false,
            isDoctor: true,
            isVerified: true
        };
        const options = { upsert: true, new: true, setDefaultsOnInsert: true };

        const user = await User.findOneAndUpdate(filter, update, options);
        console.log(`User ${email} created/updated successfully!`);
        console.log(user);
        
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

seedUser();
