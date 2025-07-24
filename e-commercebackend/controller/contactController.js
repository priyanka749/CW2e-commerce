const Contact = require('../models/contact');

// User submits contact form
exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    // Use req.user?.id if authenticated, otherwise undefined
    const userId = req.user ? req.user.id : undefined;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Only include user if present
    const contactData = { name, email, message };
    if (userId) contactData.user = userId;

    const contact = new Contact(contactData);
    await contact.save();

    res.status(201).json({ success: true, message: 'Message submitted successfully.' });
  } catch (err) {
    console.error('Contact form error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin fetches all messages
exports.getAllMessages = async (req, res) => {
  try {
    const messages = await Contact.find().populate('user', 'fullName email');
    res.status(200).json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching messages' });
  }
};

// User fetches own messages
exports.getUserMessages = async (req, res) => {
  try {
    const userId = req.userId;
    const messages = await Contact.find({ user: userId }).sort({ submittedAt: -1 });
    res.status(200).json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching user messages' });
  }
};