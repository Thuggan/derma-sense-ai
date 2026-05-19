const Clinic = require('../models/Clinic');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const mongoose = require('mongoose');
const sendEmail = require('../services/emailService');
const { createNotification } = require('../services/notificationService');
const { parseAppointmentDate, formatAppointmentDate } = require('../utils/appointmentDate');
// Kerala clinics data
const seedClinics = async () => {
  const count = await Clinic.countDocuments();
  if (count === 0) {
    await Clinic.insertMany([
      {
        name: "Kerala Skin Clinic",
        address: "123 Galle Road, Kerala 03",
        location: "Kerala",
        phone: "+94 11 2345678",
        email: "info@keralaskin.com",
        website: "www.keralaskin.com",
        services: ["General Dermatology", "Skin Cancer Screening", "Cosmetic Procedures"],
        openingHours: "Weekdays: 8:00 AM - 6:00 PM, Saturday: 8:00 AM - 1:00 PM",
        description: "Premier dermatology center with state-of-the-art facilities",
        images: ["clinic1.jpg", "clinic1-2.jpg"],
        doctors: [
          {
            name: "Dr. Saman Perera",
            specialization: "Cosmetic Dermatology",
            qualifications: "MBBS, MD (Dermatology)",
            experience: "15 years",
            availability: [
              { day: "Monday", slots: ["09:00-11:00", "14:00-16:00"] },
              { day: "Wednesday", slots: ["10:00-12:00"] }
            ]
          },
          {
            name: "Dr. Priyanka Silva",
            specialization: "Pediatric Dermatology",
            qualifications: "MBBS, MD (Pediatrics), Diploma in Dermatology",
            experience: "10 years",
            availability: [
              { day: "Tuesday", slots: ["08:00-12:00"] },
              { day: "Friday", slots: ["13:00-17:00"] }
            ]
          }
        ]
      },
      {
        name: "Dermatology Specialists Center",
        address: "45 Union Place, Kerala 02",
        location: "Kerala",
        phone: "+94 11 3456789",
        email: "contact@dermspecialists.lk",
        website: "www.dermspecialists.lk",
        services: ["Pediatric Dermatology", "Laser Therapy", "Skin Allergy Treatment"],
        openingHours: "Weekdays: 7:30 AM - 7:30 PM, Sunday: 9:00 AM - 1:00 PM",
        description: "Specialized dermatology care with advanced laser treatments",
        images: ["clinic2.jpg", "clinic2-2.jpg"],
        doctors: [
          {
            name: "Dr. Nimali Fernando",
            specialization: "Pediatric Dermatology",
            qualifications: "MBBS, MD (Dermatology)",
            experience: "12 years",
            availability: [
              { day: "Tuesday", slots: ["08:00-12:00"] },
              { day: "Thursday", slots: ["13:00-17:00"] }
            ]
          },
          {
            name: "Dr. Rajiv Sharma",
            specialization: "Laser Dermatology",
            qualifications: "MBBS, MD (Dermatology), Fellowship in Laser Surgery",
            experience: "8 years",
            availability: [
              { day: "Monday", slots: ["10:00-13:00"] },
              { day: "Wednesday", slots: ["14:00-18:00"] }
            ]
          }
        ]
      },
      {
        name: "Skin Health Kerala",
        address: "78 Horton Place, Kerala 07",
        location: "Kerala",
        phone: "+94 11 4567890",
        email: "info@skinhealth.lk",
        website: "www.skinhealth.lk",
        services: ["Acne Treatment", "Psoriasis Care", "Hair Disorders"],
        openingHours: "Daily: 8:00 AM - 8:00 PM",
        description: "Comprehensive skin care with a focus on chronic conditions",
        images: ["clinic3.jpg", "clinic3-2.jpg"],
        doctors: [
          {
            name: "Dr. Anjali Ratnayake",
            specialization: "Acne Specialist",
            qualifications: "MBBS, MD (Dermatology)",
            experience: "9 years",
            availability: [
              { day: "Monday", slots: ["09:00-12:00"] },
              { day: "Thursday", slots: ["14:00-17:00"] }
            ]
          }
        ]
      },
      {
        name: "The Skin Clinic",
        address: "32 Ward Place, Kerala 07",
        location: "Kerala",
        phone: "+94 11 5678901",
        email: "appointments@theskinclinic.lk",
        website: "www.theskinclinic.lk",
        services: ["Skin Cancer Screening", "Mohs Surgery", "Dermatopathology"],
        openingHours: "Weekdays: 8:30 AM - 5:30 PM",
        description: "Specialized in skin cancer diagnosis and treatment",
        images: ["clinic4.jpg", "clinic4-2.jpg"],
        doctors: [
          {
            name: "Dr. Sunil De Silva",
            specialization: "Dermatologic Surgery",
            qualifications: "MBBS, MD (Dermatology), Fellowship in Mohs Surgery",
            experience: "18 years",
            availability: [
              { day: "Tuesday", slots: ["08:30-12:30"] },
              { day: "Friday", slots: ["13:30-17:30"] }
            ]
          }
        ]
      },
      {
        name: "Kerala Dermatology Center",
        address: "120 Havelock Road, Kerala 05",
        location: "Kerala",
        phone: "+94 11 6789012",
        email: "cdc@keraladerm.com",
        website: "www.keraladerm.com",
        services: ["Cosmetic Dermatology", "Anti-Aging Treatments", "Botox"],
        openingHours: "Weekdays: 9:00 AM - 6:00 PM, Saturday: 9:00 AM - 2:00 PM",
        description: "Advanced cosmetic dermatology and aesthetic treatments",
        images: ["clinic5.jpg", "clinic5-2.jpg"],
        doctors: [
          {
            name: "Dr. Maya Perera",
            specialization: "Aesthetic Dermatology",
            qualifications: "MBBS, MD (Dermatology), Diploma in Aesthetic Medicine",
            experience: "11 years",
            availability: [
              { day: "Wednesday", slots: ["09:00-13:00"] },
              { day: "Saturday", slots: ["09:00-14:00"] }
            ]
          }
        ]
      },
      {
        name: "National Skin Hospital",
        address: "234 Baseline Road, Kerala 09",
        location: "Kerala",
        phone: "+94 11 7890123",
        email: "info@nationalskinhospital.lk",
        website: "www.nationalskinhospital.lk",
        services: ["General Dermatology", "Skin Surgery", "Phototherapy"],
        openingHours: "24/7 Emergency Services",
        description: "Largest dermatology hospital in Sri Lanka with full facilities",
        images: ["clinic6.jpg", "clinic6-2.jpg"],
        doctors: [
          {
            name: "Dr. Asanka Bandara",
            specialization: "Dermatologic Surgery",
            qualifications: "MBBS, MS (Dermatology)",
            experience: "14 years",
            availability: [
              { day: "Monday", slots: ["08:00-16:00"] },
              { day: "Thursday", slots: ["08:00-16:00"] }
            ]
          }
        ]
      },
      {
        name: "Skin & Laser Center",
        address: "56 Duplication Road, Kerala 04",
        location: "Kerala",
        phone: "+94 11 8901234",
        email: "laser@skinlaser.lk",
        website: "www.skinlaser.lk",
        services: ["Laser Hair Removal", "Tattoo Removal", "Skin Resurfacing"],
        openingHours: "Weekdays: 10:00 AM - 7:00 PM",
        description: "Specialized laser treatments with the latest technology",
        images: ["clinic7.jpg", "clinic7-2.jpg"],
        doctors: [
          {
            name: "Dr. Dilani Jayasuriya",
            specialization: "Laser Dermatology",
            qualifications: "MBBS, MD (Dermatology), Laser Certification",
            experience: "7 years",
            availability: [
              { day: "Tuesday", slots: ["10:00-13:00"] },
              { day: "Friday", slots: ["14:00-19:00"] }
            ]
          }
        ]
      },
      {
        name: "Children's Skin Care",
        address: "89 Gregory's Road, Kerala 07",
        location: "Kerala",
        phone: "+94 11 9012345",
        email: "children@childskin.lk",
        website: "www.childskin.lk",
        services: ["Pediatric Dermatology", "Birthmark Treatment", "Eczema Care"],
        openingHours: "Weekdays: 8:00 AM - 4:00 PM",
        description: "Specialized dermatology care for children and infants",
        images: ["clinic8.jpg", "clinic8-2.jpg"],
        doctors: [
          {
            name: "Dr. Shyama Fernando",
            specialization: "Pediatric Dermatology",
            qualifications: "MBBS, MD (Pediatrics), Diploma in Dermatology",
            experience: "13 years",
            availability: [
              { day: "Monday", slots: ["08:00-12:00"] },
              { day: "Wednesday", slots: ["08:00-12:00"] }
            ]
          }
        ]
      },
      {
        name: "Ayurvedic Skin Solutions",
        address: "102 Ayurveda Road, Kerala 10",
        location: "Kerala",
        phone: "+94 11 0123456",
        email: "ayurveda@skinsolutions.lk",
        website: "www.ayurvedicskinsolutions.lk",
        services: ["Ayurvedic Treatments", "Herbal Therapies", "Psoriasis Care"],
        openingHours: "Daily: 7:00 AM - 7:00 PM",
        description: "Traditional Ayurvedic treatments for skin conditions",
        images: ["clinic9.jpg", "clinic9-2.jpg"],
        doctors: [
          {
            name: "Dr. Sanjeewa Weerasinghe",
            specialization: "Ayurvedic Dermatology",
            qualifications: "BAMS, MD (Ayurveda)",
            experience: "20 years",
            availability: [
              { day: "Tuesday", slots: ["07:00-12:00"] },
              { day: "Thursday", slots: ["07:00-12:00"] }
            ]
          }
        ]
      },
      {
        name: "Modern Dermatology",
        address: "11 Independence Avenue, Kerala 07",
        location: "Kerala",
        phone: "+94 11 1234567",
        email: "modern@modernderm.lk",
        website: "www.modernderm.lk",
        services: ["General Dermatology", "Skin Cancer", "Hair Loss"],
        openingHours: "Weekdays: 8:00 AM - 5:00 PM",
        description: "Comprehensive dermatological services with modern techniques",
        images: ["clinic10.jpg", "clinic10-2.jpg"],
        doctors: [
          {
            name: "Dr. Ranil Premaratne",
            specialization: "Hair Disorders",
            qualifications: "MBBS, MD (Dermatology), Trichology Certification",
            experience: "16 years",
            availability: [
              { day: "Wednesday", slots: ["08:00-12:00"] },
              { day: "Friday", slots: ["13:00-17:00"] }
            ]
          }
        ]
      }
    ]);
    console.log("Clinic database seeded with 10 Kerala dermatology centers");
  }
};

// Get clinics, optionally filtered by location or name
const getClinics = async (req, res) => {
  try {
    const { location, radius } = req.query;

    const trimmedLocation = typeof location === 'string' ? location.trim() : '';
    const query = trimmedLocation
      ? {
          $or: [
            { location: new RegExp(trimmedLocation, 'i') },
            { name: new RegExp(trimmedLocation, 'i') }
          ]
        }
      : {};

    const clinics = await Clinic.find(query).sort({ name: 1 });

    if (clinics.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: trimmedLocation
          ? "No clinics found for the specified location."
          : "No clinics found."
      });
    }

    res.status(200).json({
      success: true,
      data: clinics
    });
  } catch (error) {
    console.error("Error fetching clinics:", error);
    res.status(500).json({ 
      success: false,
      error: "Server error while fetching clinics.",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get single clinic details
const getClinicDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid clinic ID format" 
      });
    }

    const clinic = await Clinic.findById(id).lean();
    
    if (!clinic) {
      return res.status(404).json({ 
        success: false,
        error: "Clinic not found" 
      });
    }

    res.status(200).json({
      success: true,
      data: clinic
    });
  } catch (error) {
    console.error("Error fetching clinic details:", error);
    res.status(500).json({ 
      success: false,
      error: "Internal server error while fetching clinic details",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Book appointment
const bookAppointment = async (req, res) => {
  try {
    const { clinicId, doctorName, date, time, notes } = req.body;
    const patientId = req.user.id; // Get from authenticated user

    // Validate all required fields
    if (!clinicId || !doctorName || !date || !time) {
      return res.status(400).json({ 
        success: false,
        error: "All booking fields are required",
        missingFields: {
          clinicId: !clinicId,
          doctorName: !doctorName,
          date: !date,
          time: !time
        }
      });
    }

    // Validate clinic exists
    const clinic = await Clinic.findById(clinicId);
    if (!clinic) {
      return res.status(404).json({ 
        success: false,
        error: "Clinic not found"
      });
    }

    // Validate doctor exists in clinic (Check real users, not dummy arrays!)
    const realDoctorExists = await User.exists({ name: doctorName, isDoctor: true, clinicId: clinicId });
    if (!realDoctorExists) {
      return res.status(400).json({ 
        success: false,
        error: "Doctor not found or not assigned to this clinic. Please consult Admin."
      });
    }

    const appointmentDate = parseAppointmentDate(date);
    if (!appointmentDate) {
      return res.status(400).json({
        success: false,
        error: "Invalid appointment date"
      });
    }

    const formattedAppointmentDate = formatAppointmentDate(appointmentDate);

    // Keep one active appointment per patient per clinic day without blocking other patients.
    const existingUserAppointment = await Appointment.findOne({
      clinicId,
      date: appointmentDate,
      patientId,
      status: { $in: ['confirmed', 'pending'] }
    });

    if (existingUserAppointment) {
      return res.status(409).json({
        success: false,
        error: "You already have an appointment at this clinic on this date",
        existingAppointment: existingUserAppointment,
        conflictType: 'user'
      });
    }

    // Create appointment
    const appointment = new Appointment({
      clinicId,
      doctorName,
      date: appointmentDate,
      time,
      patientId,
      notes: notes || "Skin condition consultation",
      status: "pending",
      reference: `APP-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    });

    await appointment.save();

    // Fetch user to get their email address
    const user = await User.findById(patientId);

    // Send a real automated confirmation email
    if (user && user.email) {
      const emailContent = `
Dear ${user.name},

Your appointment request has been safely received by DermaSense AI!
It is currently pending approval from the clinic.

Appointment Details:
--------------------------
Doctor: ${doctorName}
Clinic: ${clinic.name} (${clinic.address})
Date: ${formattedAppointmentDate}
Time: ${time}
Reference Code: ${appointment.reference}
Status: PENDING APPROVAL

You can check your Appointment History page on our platform to see when the doctor approves it and marks it as Confirmed!

Thank you,
The DermaSense AI Team
      `;

      await sendEmail({
        email: user.email,
        subject: `Appointment Request Pending: Dr. ${doctorName}`,
        message: emailContent.trim()
      });

      // Send patient notification
      await createNotification(
        patientId,
        'appointment',
        'Booking Request Sent',
        `Your request for Dr. ${doctorName} on ${formattedAppointmentDate} is pending clinic approval.`
      );

      // Notify doctors assigned to this clinic
      const clinicDoctors = await User.find({ isDoctor: true, clinicId });
      for (const doc of clinicDoctors) {
        await createNotification(
          doc._id,
          'appointment',
          'New Booking Request',
          `New appointment request for Dr. ${doctorName} from ${user.name} on ${formattedAppointmentDate}`
        );
      }
    }

    res.status(201).json({
      success: true,
      booking: {
        ...appointment.toObject(),
        clinicName: clinic.name
      }
    });

  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ 
      success: false,
      error: "Internal server error during booking",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// --- ADMIN CRUD OPERATIONS ---
// Create a new clinic
const createClinic = async (req, res) => {
  try {
    const { name, address, location, phone, email, website, services, openingHours, description, doctors, images } = req.body;
    
    // Basic validation
    if (!name || !address || !location || !phone) {
      return res.status(400).json({ success: false, error: 'Name, address, location, and phone are required' });
    }

    const newClinic = new Clinic({
      name, address, location, phone, email, website, services, openingHours, description,
      doctors: doctors || [],
      images: images || []
    });

    await newClinic.save();
    res.status(201).json({ success: true, data: newClinic });
  } catch (error) {
    console.error("Create Clinic Error:", error);
    res.status(500).json({ success: false, error: 'Failed to create clinic' });
  }
};

// Update an existing clinic
const updateClinic = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid clinic ID' });
    }

    const clinic = await Clinic.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    
    if (!clinic) {
      return res.status(404).json({ success: false, error: 'Clinic not found' });
    }

    res.status(200).json({ success: true, data: clinic });
  } catch (error) {
    console.error("Update Clinic Error:", error);
    res.status(500).json({ success: false, error: 'Failed to update clinic' });
  }
};

const uploadClinicImages = async (req, res) => {
  try {
    const files = req.files || [];
    res.status(200).json({
      success: true,
      images: files.map(file => file.filename)
    });
  } catch (error) {
    console.error("Upload Clinic Images Error:", error);
    res.status(500).json({ success: false, error: 'Failed to upload clinic images' });
  }
};

// Delete a clinic
const deleteClinic = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid clinic ID' });
    }

    const clinic = await Clinic.findByIdAndDelete(id);
    
    if (!clinic) {
      return res.status(404).json({ success: false, error: 'Clinic not found' });
    }

    res.status(200).json({ success: true, message: 'Clinic successfully deleted' });
  } catch (error) {
    console.error("Delete Clinic Error:", error);
    res.status(500).json({ success: false, error: 'Failed to delete clinic' });
  }
};

// Seed database on startup
seedClinics();

// Update doctor's availability
const updateDoctorAvailability = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || (!user.isDoctor && !user.isAdmin)) {
      return res.status(403).json({ success: false, error: "Access denied. Only doctors or admins can update availability." });
    }
    
    // Admins need to send clinicId in body, Doctors use their own clinicId
    const clinicId = user.isAdmin ? req.body.clinicId : user.clinicId;
    if (!clinicId) {
      return res.status(400).json({ success: false, error: "No clinic associated with this action." });
    }

    const { doctorName, availability } = req.body;
    if (!doctorName || !availability) {
      return res.status(400).json({ success: false, error: "Doctor name and availability are required." });
    }

    const clinic = await Clinic.findById(clinicId);
    if (!clinic) {
      return res.status(404).json({ success: false, error: "Clinic not found." });
    }

    const doctorIndex = clinic.doctors.findIndex(d => d.name === doctorName);
    if (doctorIndex === -1) {
      return res.status(404).json({ success: false, error: "Doctor not found in this clinic." });
    }

    clinic.doctors[doctorIndex].availability = availability;
    await clinic.save();

    res.status(200).json({ success: true, data: clinic });
  } catch (error) {
    console.error("Error updating availability:", error);
    res.status(500).json({ success: false, error: "Server error while updating availability." });
  }
};

module.exports = {
  getClinics,
  getClinicDetails,
  bookAppointment,
  createClinic,
  updateClinic,
  uploadClinicImages,
  deleteClinic,
  updateDoctorAvailability
};

