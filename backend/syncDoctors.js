require('dotenv').config();
const mongoose = require('mongoose');
const Clinic = require('./models/Clinic');
const User = require('./models/User');

const syncDoctors = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/derma-sense');
        
        const realDoctors = await User.find({ isDoctor: true, clinicId: { $exists: true, $ne: null } });
        for (const doc of realDoctors) {
            await Clinic.updateOne(
                { _id: doc.clinicId, 'doctors.name': { $ne: doc.name } },
                { $push: { 
                    doctors: { 
                        name: doc.name, 
                        specialization: "Clinical Consultant",
                        qualifications: "Registered User",
                        experience: "Verified",
                        availability: [
                            { day: "Monday", slots: ["09:00-11:00", "14:00-16:00"] },
                            { day: "Wednesday", slots: ["10:00-12:00"] }
                        ]
                    } 
                }}
            );
            console.log(`Synced ${doc.name} to clinic ${doc.clinicId}`);
        }
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
syncDoctors();
