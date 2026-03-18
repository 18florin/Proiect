const nodemailer = require("nodemailer");
const crypto = require("crypto");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send a confirmation email upon user registration.
 * @param {string} toEmail - Recipient email address
 * @param {string} userName - User's display name
 */
async function sendConfirmationEmail(toEmail, userName) {
  const mailOptions = {
    from: `"Car Rental 🚗" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Welcome to Car Rental!",
    html: `
      <div style=\"font-family:Arial,sans-serif;color:#333;line-height:1.4\">  
        <h2>Hello ${userName},</h2>
        <p>Thank you for registering at <strong>Car Rental</strong>! 🚗</p>
        <p>Your account is now active—start reserving vehicles today.</p>
        <p>Happy renting!<br/>— The Car Rental Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

/**
 * Send an alert email when suspicious login activity is detected.
 * @param {string} toEmail - Recipient email address
 * @param {string} userName - User's display name
 */
async function sendSuspiciousLoginAlert(toEmail, userName) {
  const mailOptions = {
    from: `"Car Rental Security" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "⚠️ Suspicious Login Activity Detected",
    html: `
      <div style=\"font-family:Arial,sans-serif;color:#333;line-height:1.4\">  
        <h2>Hello ${userName},</h2>
        <p>We noticed multiple unsuccessful attempts to log into your Car Rental account.</p>
        <p>If this wasn't you, please consider <a href=\"https://your-domain.com/auth/forgot-password\">resetting your password</a> immediately.</p>
        <p>If you do not recognize these attempts, you can safely ignore this message.</p>
        <br/>
        <p>Stay safe,<br/>Car Rental Security Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

async function sendPasswordResetEmail(toEmail, userName, resetToken) {
  const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password/${resetToken}`;
  const mailOptions = {
    from: `"Car Rental 🚗" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Password Reset Request",
    html: `
      <div style="font-family:Arial,sans-serif;color:#333;line-height:1.4">
        <h2>Hello ${userName},</h2>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <p><a href="${resetUrl}">Reset my password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this, please ignore this email.</p>
        <br/>
        <p>— Car Rental Team</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
}

module.exports = {
  sendConfirmationEmail,
  sendSuspiciousLoginAlert,
  sendPasswordResetEmail,
};
