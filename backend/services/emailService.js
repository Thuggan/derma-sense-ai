const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Create a transporter
  // We use process.env values so they can configure this with standard Gmail/SMTP credentials
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail', // defaults to Gmail
    auth: {
      user: process.env.EMAIL_USER,    // your email address
      pass: process.env.EMAIL_PASS,    // your app password
    },
  });

  // 2. Define email options
  const mailOptions = {
    from: 'DermaSense AI <noreply@dermasense.ai>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  // 3. Actually send the email
  // We wrap in try-catch so that if EMAIL_USER/PASS aren't set up yet, 
  // the app doesn't crash completely, it just logs the failure.
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log(`[Email Service Mock] Would have sent email to ${options.email} with subject: ${options.subject}`);
      return;
    }
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.response}`);
  } catch (error) {
    console.error(`Failed to send email to ${options.email}:`, error);
  }
};

module.exports = sendEmail;
