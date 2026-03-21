const Appointment = require('../models/Appointment');
const Clinic = require('../models/Clinic');
const User = require('../models/User');
const mongoose = require('mongoose');
const { createNotification } = require('../services/notificationService');
const sendEmail = require('../services/emailService');

// Get user appointments
const getUserAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user.id })
      .populate('clinicId', 'name address')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ 
      success: false,
      error: "Server error while fetching appointments" 
    });
  }
};

// Cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid appointment ID" 
      });
    }

    const appointment = await Appointment.findOneAndUpdate(
      { _id: id, patientId: req.user.id },
      { status: 'cancelled' },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        error: "Appointment not found" 
      });
    }

    res.status(200).json({
      success: true,
      appointment
    });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({ 
      success: false,
      error: "Server error during cancellation" 
    });
  }
};

// Book appointment with enhanced conflict handling
const bookAppointment = async (req, res) => {
  try {
    const { clinicId, doctorName, date, time, notes } = req.body;
    const patientId = req.user.id;

    // Validate all required fields
    if (!clinicId || !doctorName || !date || !time) {
      return res.status(400).json({ 
        success: false,
        error: "All booking fields are required"
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

    // Check if time slot is already booked by this user
    const existingUserAppointment = await Appointment.findOne({
      clinicId,
      doctorName,
      date: new Date(date),
      time,
      patientId,
      status: { $ne: 'cancelled' }
    });

    if (existingUserAppointment) {
      return res.status(409).json({
        success: false,
        error: "You already have an appointment for this time slot",
        existingAppointment: existingUserAppointment,
        conflictType: 'user'
      });
    }

    // Check if time slot is booked by any user
    const existingAppointment = await Appointment.findOne({
      clinicId,
      doctorName,
      date: new Date(date),
      time,
      status: { $ne: 'cancelled' }
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        error: "Time slot already booked by another user",
        existingAppointment,
        conflictType: 'general'
      });
    }

    // Create appointment
    const appointment = new Appointment({
      clinicId,
      doctorName,
      date: new Date(date),
      time,
      patientId,
      notes: notes || "Skin condition consultation",
      status: "pending", // Default to pending until doctor verification
      reference: `APP-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    });

    await appointment.save();

    // Fetch user to get their email address
    const user = await User.findById(patientId);

    // Send a real automated confirmation email
    if (user && user.email) {
      const emailContent = `
Dear ${user.name},

Your appointment has been successfully booked with DermaSense AI!

Appointment Details:
--------------------------
Doctor: ${doctorName}
Clinic: ${clinic.name} (${clinic.address})
Date: ${new Date(date).toDateString()}
Time: ${time}
Reference Code: ${appointment.reference}

Please arrive 15 minutes before your scheduled timeframe.
If you have any questions, you can reply directly to this email.

Thank you,
The DermaSense AI Team
      `;

      await sendEmail({
        email: user.email,
        subject: `Appointment Confirmed: ${doctorName} on ${new Date(date).toDateString()}`,
        message: emailContent.trim()
      });
    }

    res.status(201).json({
      success: true,
      appointment
    });

  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message || "Internal server error during booking"
    });
  }
};

// Get all appointments (Admin)
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('clinicId', 'name address')
      .populate('patientId', 'name email')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    console.error("Error fetching all appointments:", error);
    res.status(500).json({ 
      success: false,
      error: "Server error while fetching all appointments" 
    });
  }
};

// Get clinic specific appointments for Doctor role
const getClinicAppointments = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user || !user.isDoctor || !user.clinicId) {
      return res.status(403).json({ success: false, error: "Access denied. You must be an assigned doctor." });
    }
    
    const appointments = await Appointment.find({ clinicId: user.clinicId })
      .populate('patientId', 'name email')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    console.error("Error fetching clinic appointments:", error);
    res.status(500).json({ success: false, error: "Server error while fetching clinic appointments" });
  }
};

// Update an appointment status as Doctor
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user || (!user.isAdmin && !user.isDoctor)) {
       return res.status(403).json({ success: false, error: "Access denied." });
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId')
      .populate('clinicId');
    
    if (!appointment) {
      return res.status(404).json({ success: false, error: "Appointment not found" });
    }

    if (!user.isAdmin && user.clinicId.toString() !== appointment.clinicId._id.toString()) {
       return res.status(403).json({ success: false, error: "Access denied to data from another clinic" });
    }

    const oldStatus = appointment.status;
    appointment.status = status;
    await appointment.save();

    // Trigger emails and notifications when status changes
    if (oldStatus !== status && appointment.patientId) {
       const patient = appointment.patientId;
       
       if (status === 'confirmed') {
          // Send notification to patient
          await createNotification(patient._id, 'appointment', 'Appointment Approved', `Your appointment with Dr. ${appointment.doctorName} for ${new Date(appointment.date).toDateString()} has been APPROVED!`);
          
          // Send email to patient
          await sendEmail({
             email: patient.email,
             subject: `Appointment Approved: Dr. ${appointment.doctorName}`,
             message: `Dear ${patient.name},\n\nGreat news! Your clinic has approved your appointment request for Dr. ${appointment.doctorName} on ${new Date(appointment.date).toDateString()} at ${appointment.time}.\n\nPlease arrive 15 minutes early.\n\nThank you,\nThe DermaSense AI Team`
          });

          // Send notification to doctor
          await createNotification(user._id, 'appointment', 'Appointment Approved', `You successfully approved the appointment for ${patient.name}.`);
       }

       if (status === 'cancelled') {
          await createNotification(patient._id, 'appointment', 'Appointment Cancelled', `Your appointment request with Dr. ${appointment.doctorName} for ${new Date(appointment.date).toDateString()} has been cancelled or denied by the clinic.`);
          await sendEmail({
            email: patient.email,
            subject: `Appointment Update: Dr. ${appointment.doctorName}`,
            message: `Dear ${patient.name},\n\nUnfortunately, your appointment request for Dr. ${appointment.doctorName} on ${new Date(appointment.date).toDateString()} has been cancelled by the clinic.\n\nPlease log in to book another timeslot.\n\nThank you,\nThe DermaSense AI Team`
         });
       }
    }

    res.status(200).json({ success: true, appointment });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({ success: false, error: "Server error updating appointment status" });
  }
};

module.exports = {
  getUserAppointments,
  cancelAppointment,
  bookAppointment,
  getAllAppointments,
  getClinicAppointments,
  updateAppointmentStatus
};