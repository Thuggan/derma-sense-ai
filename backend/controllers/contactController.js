const Contact = require('../models/Contact');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');

exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    const newContact = new Contact({
      name,
      email,
      message
    });

    await newContact.save();

    const admins = await User.find({ isAdmin: true });
    for (const admin of admins) {
      await createNotification(
         admin._id, 
         'system', 
         'New Contact Message', 
         `New message from ${name} (${email})`
      );
    }

    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error saving contact message:', error);
    res.status(500).json({ error: 'Server error, please try again later' });
  }
};

exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: contacts.length, data: contacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ success: false, error: 'Server error fetching contacts' });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, error: 'Contact message not found' });
    }
    res.status(200).json({ success: true, message: 'Contact message deleted' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ success: false, error: 'Server error deleting contact' });
  }
};
