require('dotenv').config();
const mongoose = require('mongoose');
const Clinic = require('./models/Clinic');

const clearDummyDoctors = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/derma-sense');
        console.log("Connected to MongoDB");

        // Clear the nested doctors array from all clinics in the database
        const result = await Clinic.updateMany({}, { $set: { doctors: [] } });
        
        console.log(`Updated ${result.modifiedCount} clinics. Dummy doctors have been completely erased.`);
        process.exit(0);
    } catch (err) {
        console.error("Error connecting or updating DB:", err);
        process.exit(1);
    }
}

clearDummyDoctors();
