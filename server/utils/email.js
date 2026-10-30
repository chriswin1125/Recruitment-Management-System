const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER) {
    console.log(`[Email skipped] To: ${to} | Subject: ${subject}`);
    return;
  }
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Recruitment System" <${process.env.EMAIL_USER}>`,
      to, subject, html
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Email error:', error.message);
  }
};

const emailTemplates = {
  applicationReceived: (candidateName, jobTitle, company) => ({
    subject: `Application Received – ${jobTitle} at ${company}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#4F46E5">Application Received</h2>
      <p>Hi ${candidateName},</p>
      <p>We've received your application for <strong>${jobTitle}</strong> at <strong>${company}</strong>.</p>
      <p>We'll review your profile and get back to you soon.</p>
      <p style="color:#6B7280;font-size:14px">Recruitment Management System</p>
    </div>`
  }),

  statusUpdate: (candidateName, jobTitle, status) => ({
    subject: `Application Update – ${jobTitle}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#4F46E5">Application Status Update</h2>
      <p>Hi ${candidateName},</p>
      <p>Your application for <strong>${jobTitle}</strong> has been updated to: <strong>${status.toUpperCase()}</strong></p>
      <p>Login to your account to view more details.</p>
      <p style="color:#6B7280;font-size:14px">Recruitment Management System</p>
    </div>`
  })
};

module.exports = { sendEmail, emailTemplates };
