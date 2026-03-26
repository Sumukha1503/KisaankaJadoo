import nodemailer from 'nodemailer';

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;
  
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  return transporter;
};

/**
 * Send a transactional email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Plain text content
 * @param {string} html - HTML content (optional)
 */
export const sendEmail = async (to, subject, text, html = '') => {
  try {
    if (!to) {
      console.warn('Email skipped: No recipient address provided.');
      return;
    }

    const mailOptions = {
      from: `"KisaanKaJadoo" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html: html || text
    };

    console.log(`[EMAIL] Attempting to send email to: ${to} | Subject: ${subject}`);
    const info = await getTransporter().sendMail(mailOptions);
    console.log('[EMAIL] SUCCESS:', info.messageId);
    return info;
  } catch (error) {
    console.error('[EMAIL] FATAL ERROR:', error.message);
    if (error.code === 'EAUTH') {
      console.error('[EMAIL] Authentication failed - check SMTP_USER/SMTP_PASS');
    }
    // Don't throw for MVP, just log
  }
};

export const sendBookingEmail = async (userEmail, bookingDetails) => {
  const subject = `Booking Confirmed - ${bookingDetails.type}`;
  const text = `Hello ${bookingDetails.userName},\n\nYour booking for ${bookingDetails.type} is confirmed!\n\nDetails:\n- Date: ${bookingDetails.date}\n- Amount: ₹${bookingDetails.amount}\n\nThank you for using KisaanKaJadoo!`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #2e7d32;">Booking Confirmed!</h2>
      <p>Hello <strong>${bookingDetails.userName}</strong>,</p>
      <p>Your booking for <strong>${bookingDetails.type}</strong> has been successfully processed.</p>
      <div style="background: #f1f8e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Tracking ID:</strong> ${bookingDetails.id}</p>
        <p><strong>Item:</strong> ${bookingDetails.type}</p>
        <p><strong>Date/Time:</strong> ${bookingDetails.date}</p>
        <p><strong>Status:</strong> <span style="color: #2e7d32; font-weight: bold;">Confirmed</span></p>
        <p><strong>Total Paid:</strong> ₹${bookingDetails.amount}</p>
      </div>
      <p>We are processing your request and the provider will contact you shortly.</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
      <p style="font-size: 12px; color: #777;">KisaanKaJadoo - Empowing Farmers through AI</p>
    </div>
  `;

  return sendEmail(userEmail, subject, text, html);
};

export const sendTaskCreatedEmail = async (userEmail, taskDetails) => {
  const subject = `Task Posted Successfully - ${taskDetails.taskType}`;
  const text = `Hello,\n\nYour task "${taskDetails.taskType}" has been posted to our Marketplace.\n\nBudget: ₹${taskDetails.budget}\nWorkers Needed: ${taskDetails.workersNeeded}\n\nWe will notify you when workers express interest!`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #1976d2;">Task Posted!</h2>
      <p>Your agricultural task is now live on the KisaanKaJadoo marketplace.</p>
      <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Task:</strong> ${taskDetails.taskType}</p>
        <p><strong>Budget:</strong> ₹${taskDetails.budget}</p>
        <p><strong>District:</strong> ${taskDetails.district}</p>
        <p><strong>Status:</strong> Open for Bids</p>
      </div>
      <p>Our matching algorithm is finding the best workers near you.</p>
    </div>
  `;

  return sendEmail(userEmail, subject, text, html);
};

export const sendOrderStatusEmail = async (userEmail, orderDetails) => {
  const subject = `Order Update - ${orderDetails.trackingId}`;
  const statusColors = { 'Shipped': '#1976d2', 'Delivered': '#2e7d32', 'Processing': '#f57c00' };
  
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: ${statusColors[orderDetails.status] || '#333'};">Order ${orderDetails.status}!</h2>
      <p>Hello <strong>${orderDetails.userName}</strong>, your order status has changed.</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Tracking ID:</strong> ${orderDetails.trackingId}</p>
        <p><strong>New Status:</strong> <span style="font-weight: bold; color: ${statusColors[orderDetails.status] || '#333'};">${orderDetails.status}</span></p>
      </div>
      <p>You can track your package in the "My Orders" section of the app.</p>
    </div>
  `;
  return sendEmail(userEmail, subject, `Your order ${orderDetails.trackingId} is now ${orderDetails.status}.`, html);
};

export const sendNewOrderEmail = async (ownerEmail, orderDetails) => {
  const subject = `New Order Received - KisaanKaJadoo`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #2e7d32;">New Order! 📦</h2>
      <p>You have received a new order for your store.</p>
      <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Customer:</strong> ${orderDetails.customerName}</p>
        <p><strong>Amount:</strong> ₹${orderDetails.amount}</p>
        <p><strong>Address:</strong> ${orderDetails.address}</p>
      </div>
      <p>Please log in to your dashboard to process and ship the order.</p>
    </div>
  `;
  return sendEmail(ownerEmail, subject, `New order received from ${orderDetails.customerName}. Amount: ₹${orderDetails.amount}`, html);
};

export const sendVendorOfferEmail = async (farmerEmail, offerDetails) => {
  const subject = `New Buy Offer for your Crop - KisaanKaJadoo`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #673ab7;">New Offer Received! 🌾</h2>
      <p>A vendor has expressed interest in buying your ${offerDetails.crop}.</p>
      <div style="background: #ede7f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Crop:</strong> ${offerDetails.crop}</p>
        <p><strong>Offered Price:</strong> ₹${offerDetails.price}/quintal</p>
        <p><strong>Vendor:</strong> ${offerDetails.vendorName}</p>
      </div>
      <p>Visit the Vendor Marketplace to accept or negotiate this offer.</p>
    </div>
  `;
  return sendEmail(farmerEmail, subject, `New offer for your ${offerDetails.crop} from ${offerDetails.vendorName}. Price: ₹${offerDetails.price}`, html);
};

export const sendWelcomeEmail = async (userEmail, userName) => {
  const subject = `Welcome to KisaanKaJadoo, ${userName}! 🌾`;
  const text = `Hello ${userName},\n\nWelcome to KisaanKaJadoo - your digital partner for smarter farming. We're excited to have you on board! Use our AI-powered tools to scan crops, hire labourers, and access the marketplace.`;
  
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #333; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 25px;">
        <h1 style="color: #2e7d32; margin: 0;">KisaanKaJadoo</h1>
        <p style="color: #666; font-style: italic;">Empowering Farmers through AI</p>
      </div>
      
      <h2 style="color: #1b5e20;">Welcome to the Family, ${userName}! 🌿</h2>
      <p>We're thrilled to have you join India's fastest-growing agricultural super-app. Whether you're a farmer, vendor, or service provider, we have tools built specifically for you.</p>
      
      <div style="background: #f1f8e9; padding: 20px; border-radius: 10px; margin: 25px 0;">
        <h3 style="color: #2e7d32; margin-top: 0;">What can you do next?</h3>
        <ul style="padding-left: 20px;">
          <li><strong>AI Farm Wizard:</strong> Get expert advice on your crops.</li>
          <li><strong>Smart Scanner:</strong> Identify pests and diseases instantly.</li>
          <li><strong>Marketplace:</strong> Buy equipment or sell your harvest at fair prices.</li>
          <li><strong>Labour Hub:</strong> Find and hire verified workers near you.</li>
        </ul>
      </div>
      
      <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0;">
      <p style="font-size: 11px; color: #999; text-align: center;">&copy; 2026 KisaanKaJadoo. All rights reserved.</p>
    </div>
  `;
  
  return sendEmail(userEmail, subject, text, html);
};

export const sendOrderConfirmationEmail = async (userEmail, orderDetails) => {
  const subject = `Order Confirmed: #${orderDetails.trackingId} 📦`;
  const text = `Hello ${orderDetails.userName}, your order #${orderDetails.trackingId} has been successfully placed. Amount: ₹${orderDetails.amount}`;
  
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 25px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 12px;">
      <h2 style="color: #2e7d32; border-bottom: 2px solid #81c784; padding-bottom: 10px;">Order Confirmed!</h2>
      <p>Hello <strong>${orderDetails.userName}</strong>,</p>
      <p>Thank you for shopping with KisaanKaJadoo. Your order is being processed.</p>
      
      <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2e7d32;">
        <p style="margin: 5px 0;"><strong>Tracking ID:</strong> ${orderDetails.trackingId}</p>
        <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₹${orderDetails.amount}</p>
        <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #2e7d32; font-weight: bold;">Confirmed</span></p>
      </div>
      
      <p>Our store owner will notify you once the items are shipped. You can track your order in the app dashboard.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0;">
      <p style="font-size: 12px; color: #888; text-align: center;">KisaanKaJadoo - India's Agricultural Super-App</p>
    </div>
  `;
  return sendEmail(userEmail, subject, text, html);
};

export const sendFarmAnalysisEmail = async (userEmail, farmDetails) => {
  const subject = `Your AI Farm Analysis is Ready! 🧪`;
  const recommendationsHtml = farmDetails.recommendations.map(r => `<li>${r}</li>`).join('');
  
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 25px; color: #333; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 15px;">
      <div style="background: #1b5e20; color: white; padding: 15px; border-radius: 10px 10px 0 0; text-align: center;">
        <h2 style="margin: 0;">AI Farm Wizard Report</h2>
      </div>
      
      <div style="padding: 20px;">
        <p>Hello Farmer, our AI has completed the analysis of your <strong>${farmDetails.crop}</strong> crop in <strong>${farmDetails.city}</strong>.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background: #f1f8e9;">
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Estimated Yield</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${farmDetails.estimatedYield} kg</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Market Value</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">₹${farmDetails.marketValue}</td>
          </tr>
          <tr style="background: #f1f8e9;">
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Weather Context</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${farmDetails.weather.temp}°C, ${farmDetails.weather.condition}</td>
          </tr>
        </table>
        
        <h3 style="color: #2e7d32;">Expert Recommendations:</h3>
        <ul style="background: #fffde7; padding: 15px 15px 15px 35px; border-radius: 8px; border: 1px solid #fff59d;">
          ${recommendationsHtml}
        </ul>
        
        <p style="margin-top: 20px;">Open the KKJ app to see the full detailed report and interactive growth charts.</p>
      </div>
      
      <p style="font-size: 11px; color: #999; text-align: center; margin-top: 30px;">This report was generated using Gemini Pro AI for KisaanKaJadoo.</p>
    </div>
  `;
  return sendEmail(userEmail, subject, `Your farm analysis for ${farmDetails.crop} is ready.`, html);
};

export const sendPaymentSuccessEmail = async (userEmail, paymentDetails) => {
  const subject = `Payment Successful: ₹${paymentDetails.amount} ✅`;
  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; padding: 30px; border-radius: 16px; background: #fff; border: 1px solid #eee; max-width: 500px; margin: auto; text-align: center;">
      <div style="color: #2e7d32; font-size: 50px; margin-bottom: 10px;">✔</div>
      <h2 style="margin: 0; color: #2e7d32;">Payment Received</h2>
      <p style="color: #666;">Transaction Successful</p>
      
      <div style="margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 12px;">
        <p style="margin: 5px 0; font-size: 24px; font-weight: bold; color: #333;">₹${paymentDetails.amount}</p>
        <p style="margin: 5px 0; color: #888;">Ref: ${paymentDetails.paymentId || 'TXN-'+Date.now()}</p>
      </div>
      
      <p style="font-size: 14px; color: #555;">The amount has been securely processed via Razorpay. Your ${paymentDetails.purpose || 'booking'} is now confirmed.</p>
      
      <div style="margin-top: 30px; font-size: 12px; color: #aaa;">
        <p>KisaanKaJadoo - Digital Agriculture Platform</p>
      </div>
    </div>
  `;
  return sendEmail(userEmail, subject, `Payment of ₹${paymentDetails.amount} successful.`, html);
};

export const sendInviteStatusEmail = async (to, details) => {
  const isAccepted = details.status === 'accepted';
  const subject = isAccepted ? `Application Accepted! - ${details.taskType} 🎉` : `Update on your Application - ${details.taskType}`;
  
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 25px; border: 1px solid #f0f0f0; border-radius: 12px; max-width: 600px; margin: auto;">
      <h2 style="color: ${isAccepted ? '#2e7d32' : '#757575'};">${isAccepted ? 'Congratulations! 🎉' : 'Application Update'}</h2>
      <p>Your interest in the task <strong>${details.taskType}</strong> has been <strong>${details.status}</strong> by ${details.farmerName}.</p>
      
      ${isAccepted ? `
      <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Next Steps:</strong> Please contact the farmer to finalize the timing and location.</p>
        <p style="margin: 10px 0 0 0; font-size: 18px;">📞 <strong>${details.farmerPhone}</strong></p>
      </div>
      ` : `
      <p>Don't worry! There are many other tasks waiting for you in the marketplace. Keep exploring!</p>
      `}
      
      <p style="font-size: 13px; color: #777;">Thank you for using KisaanKaJadoo.</p>
    </div>
  `;
  return sendEmail(to, subject, `Your application for ${details.taskType} was ${details.status}.`, html);
};

export const sendOTP = async (to, otp) => {
  const subject = `Your Verification Code: ${otp} 🔑`;
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; border-radius: 16px; background: #fff; border: 1px solid #eee; max-width: 450px; margin: auto; text-align: center;">
      <h2 style="color: #2e7d32;">Signup Verification</h2>
      <p style="color: #666;">Please use the following code to complete your registration on KisaanKaJadoo.</p>
      <div style="margin: 25px 0; padding: 15px; background: #f1f8e9; border-radius: 12px; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1b5e20;">
        ${otp}
      </div>
      <p style="font-size: 12px; color: #888;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
    </div>
  `;
  return sendEmail(to, subject, `Your verification code is ${otp}`, html);
};

export const sendPasswordReset = async (to, resetLink) => {
  const subject = `Reset Your Password - KisaanKaJadoo 🔒`;
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; border-radius: 16px; border: 1px solid #eee; max-width: 500px; margin: auto;">
      <h2 style="color: #2e7d32;">Password Reset Request</h2>
      <p>We received a request to reset your password. Click the button below to proceed:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background: #2e7d32; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
      </div>
      <p style="font-size: 12px; color: #888;">If you didn't request this, you can safely ignore this email. Your password will remain unchanged.</p>
    </div>
  `;
  return sendEmail(to, subject, `Click here to reset your password: ${resetLink}`, html);
};

export const sendSecurityAlert = async (to, details) => {
  const subject = `Security Alert: New Login Detected ⚠️`;
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; border-radius: 16px; border: 1px solid #ffebee; max-width: 500px; margin: auto;">
      <h2 style="color: #c62828;">New Login Detected</h2>
      <p>Your KisaanKaJadoo account was accessed from a new device or location.</p>
      <div style="background: #fafafa; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #eee;">
        <p style="margin: 5px 0;"><strong>Device:</strong> ${details.device || 'Unknown Device'}</p>
        <p style="margin: 5px 0;"><strong>Location:</strong> ${details.location || 'Unknown Location'}</p>
        <p style="margin: 5px 0;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      </div>
      <p style="font-size: 13px; color: #666;">If this was you, you can ignore this alert. If not, please change your password immediately.</p>
    </div>
  `;
  return sendEmail(to, subject, `New login detected for your account.`, html);
};

export const sendDetailedOrderInvoice = async (userEmail, orderDetails) => {
  const subject = `Order Invoice: #${orderDetails.trackingId} 📄`;
  const itemsHtml = orderDetails.items.map(i => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${i.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${i.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${i.price}</td>
    </tr>
  `).join('');
  
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #333; max-width: 650px; margin: auto; border: 1px solid #ddd; border-radius: 8px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
        <h1 style="color: #2e7d32; margin: 0;">INVOICE</h1>
        <div style="text-align: right; color: #666;">
          <p style="margin: 0;">Order: #${orderDetails.trackingId}</p>
          <p style="margin: 0;">Date: ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
      
      <div style="margin-bottom: 30px;">
        <p style="margin: 0; color: #666;">Billed To:</p>
        <p style="margin: 0; font-weight: bold;">${orderDetails.userName}</p>
        <p style="margin: 0;">${orderDetails.address}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f8f9fa;">
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #2e7d32;">Item</th>
            <th style="padding: 10px; text-align: center; border-bottom: 2px solid #2e7d32;">Qty</th>
            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #2e7d32;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="text-align: right; margin-top: 20px;">
        <p style="font-size: 18px;"><strong>Total Amount:</strong> <span style="color: #2e7d32;">₹${orderDetails.amount}</span></p>
        <p style="color: #666;">Payment Method: ${orderDetails.paymentMethod}</p>
      </div>

      <div style="margin-top: 40px; padding: 15px; background: #e8f5e9; border-radius: 8px;">
        <p style="margin: 0; font-weight: bold; color: #1b5e20;">Estimated Delivery: ${orderDetails.eta || '3-5 Business Days'}</p>
      </div>
    </div>
  `;
  return sendEmail(userEmail, subject, `Invoice for your order #${orderDetails.trackingId}`, html);
};

export const sendCODReminder = async (to, details) => {
  const subject = `COD Reminder: Your Order is Arriving Today! 🚚`;
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 25px; border-left: 5px solid #ffa000; background: #fffcf5; border-radius: 8px; max-width: 500px; margin: auto; border-top: 1px solid #eee; border-right: 1px solid #eee; border-bottom: 1px solid #eee;">
      <h3 style="color: #ffa000; margin-top: 0;">Delivery Out for Delivery!</h3>
      <p>Your order <strong>#${details.trackingId}</strong> is with our delivery partner and will reach you today.</p>
      <div style="background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #ffe082; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #666;">Amount to pay on arrival:</p>
        <p style="margin: 5px 0; font-size: 24px; font-weight: bold; color: #333;">₹${details.amount}</p>
      </div>
      <p style="font-size: 13px; color: #555;">Please keep the exact change ready for a faster delivery experience.</p>
    </div>
  `;
  return sendEmail(to, subject, `Reminder: Pay ₹${details.amount} for your COD order today.`, html);
};

export const sendDiseaseDetectionEmail = async (to, details) => {
  const subject = `Crop Health Alert: ${details.disease} Detected 🛡️`;
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; border-radius: 16px; border: 1px solid #ffccbc; max-width: 600px; margin: auto;">
      <div style="text-align: center; color: #d84315;">
        <h2 style="margin: 0;">Disease Detection Result</h2>
        <p style="font-weight: bold; font-size: 18px; margin: 10px 0;">Condition: ${details.disease}</p>
      </div>
      
      <div style="background: #fbe9e7; padding: 20px; border-radius: 12px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Confidence Score:</strong> ${details.confidence}%</p>
        <p style="margin: 10px 0 0 0;"><strong>Recommended Treatment:</strong></p>
        <p style="color: #4e342e;">${details.treatment}</p>
      </div>
      
      <h3 style="color: #d84315;">Critical Precautions:</h3>
      <ul style="color: #5d4037; padding-left: 20px;">
        ${details.precautions.map(p => `<li>${p}</li>`).join('')}
      </ul>
      
      <div style="margin-top: 30px; padding: 15px; background: #fff3e0; border-radius: 8px; font-size: 13px;">
        <strong>💡 Reminder:</strong> We will check back with you in 3 days to see if the symptoms persist.
      </div>
    </div>
  `;
  return sendEmail(to, subject, `Disease ${details.disease} detected. Treatment: ${details.treatment}`, html);
};

export const sendNewJobAlert = async (to, details) => {
  const subject = `New Job Opportunity in ${details.location}! 🚜`;
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 25px; border-radius: 12px; border: 1px solid #e3f2fd; max-width: 500px; margin: auto; background: #fff;">
      <div style="background: #1976d2; color: #fff; padding: 15px; border-radius: 8px 8px 0 0; text-align: center;">
        <h3 style="margin: 0;">New Agricultural Job</h3>
      </div>
      <div style="padding: 20px; border: 1px solid #e3f2fd; border-top: none; border-radius: 0 0 8px 8px;">
        <h4 style="margin: 0 0 10px 0; color: #1976d2;">${details.taskType}</h4>
        <p style="margin: 5px 0;">📍 <strong>Location:</strong> ${details.location}</p>
        <p style="margin: 5px 0;">📅 <strong>Date:</strong> ${details.date}</p>
        <p style="margin: 5px 0;">💰 <strong>Wage:</strong> ₹${details.wage}/day</p>
        
        <div style="text-align: center; margin-top: 25px;">
          <a href="${process.env.CLIENT_URL}/market/labour" style="background: #1976d2; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">Express Interest</a>
        </div>
      </div>
    </div>
  `;
  return sendEmail(to, subject, `New job for ${details.taskType} in ${details.location}. Wage: ₹${details.wage}/day`, html);
};

export const sendWeeklySummary = async (to, stats) => {
  const subject = `Your Weekly Farm Review - KisaanKaJadoo 📊`;
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #333; max-width: 600px; margin: auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #2e7d32; margin: 0;">Weekly Impact Report</h2>
        <p style="color: #888;">${new Date().toLocaleDateString()} - ${new Date(Date.now() - 7*24*60*60*1000).toLocaleDateString()}</p>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
        <div style="padding: 20px; background: #f1f8e9; border-radius: 12px; text-align: center;">
          <p style="margin: 0; font-size: 13px; color: #666;">Revenue Generated</p>
          <p style="margin: 5px 0; font-size: 20px; font-weight: bold; color: #2e7d32;">₹${stats.revenue}</p>
        </div>
        <div style="padding: 20px; background: #e3f2fd; border-radius: 12px; text-align: center;">
          <p style="margin: 0; font-size: 13px; color: #666;">Jobs Completed</p>
          <p style="margin: 5px 0; font-size: 20px; font-weight: bold; color: #1976d2;">${stats.jobs}</p>
        </div>
      </div>
      
      <div style="padding: 20px; border: 1px solid #eee; border-radius: 15px;">
        <h3 style="margin-top: 0; color: #1b5e20;">Highlights:</h3>
        <ul style="padding-left: 20px; color: #555;">
          <li>Detected and addressed <strong>${stats.diseases || 0}</strong> crop health issues.</li>
          <li>Saved <strong>₹${stats.savings || 0}</strong> through direct labour hiring.</li>
          <li>Your crop health score is currently at <strong>${stats.healthScore || 92}%</strong>.</li>
        </ul>
      </div>
      
      <p style="text-align: center; margin-top: 30px; font-weight: bold; color: #2e7d32;">See you in the fields next week!</p>
    </div>
  `;
  return sendEmail(to, subject, `Weekly summary for your farm. Revenue: ₹${stats.revenue}`, html);
};
