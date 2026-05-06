const mongoose = require('mongoose');
const Clinic = require('./models/Clinic');
const User = require('./models/User');

const uri = 'mongodb://localhost:27017/skin_disease_db';

async function listClinicsAndUpdateDoctor() {
    try {
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to DB');

        const clinics = await Clinic.find({});
        console.log(`Found ${clinics.length} clinics`);
        
        let targetClinicId = null;
        if (clinics.length > 0) {
            targetClinicId = clinics[0]._id;
            console.log(`Will use clinic ${clinics[0].name} - ${targetClinicId}`);
        } else {
            console.log('No clinics found, creating a default one');
            const newClinic = new Clinic({
                name: 'Default City Clinic',
                address: '123 Medical Drive',
                contactEmail: 'contact@cityclinic.com',
                doctors: [{ name: 'Dr. Thuggan' }]
            });
            await newClinic.save();
            targetClinicId = newClinic._id;
            console.log(`Created new clinic ${newClinic.name} - ${targetClinicId}`);
        }

        const user = await User.findOneAndUpdate(
            { email: 'mrthuggan@gmail.com' },
            { clinicId: targetClinicId },
            { new: true }
        );
        
        if (user) {
            console.log(`User mrthuggan@gmail.com marked as doctor in clinic ${targetClinicId}`);
        } else {
            console.log('User mrthuggan@gmail.com not found');
        }
        
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

listClinicsAndUpdateDoctor();
