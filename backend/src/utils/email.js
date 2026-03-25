import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', // Use App Password for Gmail
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send an email notification to a user.
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML body content
 */
export const sendEmail = async (to, subject, html) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ Nodemailer: EMAIL_USER or EMAIL_PASS not set. Mocking email delivery.');
    console.log(`[MOCK EMAIL to ${to}] ${subject}`);
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"KisaanKaJadoo" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log(`✅ Email sent: ${info.messageId}`);
  } catch (error) {
    console.error('❌ Failed to send email:', error);
  }
};

// Common Templates
export const alertWeather = (to, crop) => {
  return sendEmail(
    to, 
    '⚠️ Weather Alert: Heavy Rain Expected', 
    `<div style="font-family: sans-serif; color: #333;">
      <h2 style="color: #16a34a;">Harvesting Paused</h2>
      <p>Dear Farmer, heavy rain is expected tomorrow in your district.</p>
      <p>Please pause the harvesting of your <strong>${crop}</strong> crop to prevent water logging damages.</p>
      <p>Labour appointments for tomorrow will be automatically notified.</p>
    </div>`
  );
};