const nodemailer = require('nodemailer');
const crypto = require('crypto');
const logger = require('../config/logger');

// Email configuration
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production email configuration (e.g., SendGrid, AWS SES, etc.)
    return nodemailer.createTransporter({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  } else {
    // Development configuration (using Ethereal for testing)
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.ETHEREAL_USER || 'ethereal.user@ethereal.email',
        pass: process.env.ETHEREAL_PASS || 'ethereal.pass'
      }
    });
  }
};

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Generate verification link
const generateVerificationLink = (token, baseUrl) => {
  return `${baseUrl}/verify-email?token=${token}`;
};

// Email templates
const emailTemplates = {
  verification: (name, verificationLink) => ({
    subject: 'Verify Your Campus Connect Account',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Account</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: white;
              padding: 30px;
              border: 1px solid #e1e1e1;
              border-radius: 0 0 10px 10px;
            }
            .btn {
              display: inline-block;
              background: #667eea;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
              font-weight: 600;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #666;
              font-size: 14px;
            }
            .verification-code {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 6px;
              text-align: center;
              font-family: monospace;
              font-size: 18px;
              letter-spacing: 2px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Welcome to Campus Connect!</h1>
            <p>Your ALU textbook sharing community</p>
          </div>
          <div class="content">
            <h2>Hi ${name}!</h2>
            <p>Thanks for joining Campus Connect! To get started, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center;">
              <a href="${verificationLink}" class="btn">Verify Email Address</a>
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${verificationLink}</p>
            
            <p><strong>What's next?</strong></p>
            <ul>
              <li>Complete your profile with your academic interests</li>
              <li>Browse textbooks shared by fellow ALU students</li>
              <li>List your own textbooks to help others</li>
              <li>Join study groups and classroom discussions</li>
            </ul>
            
            <p>This verification link will expire in 24 hours for security reasons.</p>
            
            <p>If you didn't create this account, please ignore this email.</p>
            
            <p>Best regards,<br>The Campus Connect Team</p>
          </div>
          <div class="footer">
            <p>Campus Connect - African Leadership University<br>
            Connecting students through shared learning resources</p>
          </div>
        </body>
      </html>
    `,
    text: `
      Welcome to Campus Connect!
      
      Hi ${name},
      
      Thanks for joining Campus Connect! To get started, please verify your email address by visiting this link:
      
      ${verificationLink}
      
      This verification link will expire in 24 hours for security reasons.
      
      If you didn't create this account, please ignore this email.
      
      Best regards,
      The Campus Connect Team
    `
  }),

  passwordReset: (name, resetLink) => ({
    subject: 'Reset Your Campus Connect Password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: white;
              padding: 30px;
              border: 1px solid #e1e1e1;
              border-radius: 0 0 10px 10px;
            }
            .btn {
              display: inline-block;
              background: #dc3545;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
              font-weight: 600;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>You requested to reset your Campus Connect password. Click the button below to create a new password:</p>
            
            <div style="text-align: center;">
              <a href="${resetLink}" class="btn">Reset Password</a>
            </div>
            
            <p>If the button doesn't work, copy and paste this link:</p>
            <p style="word-break: break-all; color: #667eea;">${resetLink}</p>
            
            <p><strong>Important:</strong> This link will expire in 1 hour for security reasons.</p>
            
            <p>If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
            
            <p>Best regards,<br>The Campus Connect Team</p>
          </div>
          <div class="footer">
            <p>Campus Connect - African Leadership University</p>
          </div>
        </body>
      </html>
    `,
    text: `
      Password Reset Request
      
      Hi ${name},
      
      You requested to reset your Campus Connect password. Visit this link to create a new password:
      
      ${resetLink}
      
      This link will expire in 1 hour for security reasons.
      
      If you didn't request this password reset, please ignore this email.
      
      Best regards,
      The Campus Connect Team
    `
  }),

  welcome: (name) => ({
    subject: 'Welcome to Campus Connect!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Campus Connect</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: white;
              padding: 30px;
              border: 1px solid #e1e1e1;
              border-radius: 0 0 10px 10px;
            }
            .feature {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 6px;
              margin: 15px 0;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎓 Welcome to Campus Connect!</h1>
            <p>Your journey starts here</p>
          </div>
          <div class="content">
            <h2>Hi ${name}!</h2>
            <p>Your email has been verified successfully! Welcome to the Campus Connect community.</p>
            
            <p><strong>Here's what you can do now:</strong></p>
            
            <div class="feature">
              <h3>📚 Share & Borrow Textbooks</h3>
              <p>List your textbooks for lending or rent them to fellow students. Save money and help others succeed!</p>
            </div>
            
            <div class="feature">
              <h3>👥 Join Study Groups</h3>
              <p>Connect with classmates in subject-specific discussion rooms and collaborative study sessions.</p>
            </div>
            
            <div class="feature">
              <h3>💬 Real-time Messaging</h3>
              <p>Chat with other students, coordinate meetups, and build your campus network.</p>
            </div>
            
            <div class="feature">
              <h3>🔒 Safe & Secure</h3>
              <p>All transactions are secure, and we verify all ALU student accounts for your safety.</p>
            </div>
            
            <p>Ready to get started? Log in to your account and complete your profile to unlock all features!</p>
            
            <p>Need help? Reply to this email or contact our support team.</p>
            
            <p>Happy learning!<br>The Campus Connect Team</p>
          </div>
          <div class="footer">
            <p>Campus Connect - African Leadership University<br>
            Building connections, sharing knowledge</p>
          </div>
        </body>
      </html>
    `
  })
};

// Send verification email
const sendVerificationEmail = async (user, verificationToken) => {
  try {
    const transporter = createTransporter();
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verificationLink = generateVerificationLink(verificationToken, baseUrl);
    
    const template = emailTemplates.verification(user.first_name, verificationLink);
    
    const mailOptions = {
      from: `"Campus Connect" <${process.env.EMAIL_FROM || 'noreply@campusconnect.com'}>`,
      to: user.email,
      subject: template.subject,
      html: template.html,
      text: template.text
    };

    const result = await transporter.sendMail(mailOptions);
    
    logger.info(`Verification email sent to ${user.email}`);
    return result;
  } catch (error) {
    logger.error('Send verification email error:', error);
    throw error;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetToken) => {
  try {
    const transporter = createTransporter();
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;
    
    const template = emailTemplates.passwordReset(user.first_name, resetLink);
    
    const mailOptions = {
      from: `"Campus Connect" <${process.env.EMAIL_FROM || 'noreply@campusconnect.com'}>`,
      to: user.email,
      subject: template.subject,
      html: template.html,
      text: template.text
    };

    const result = await transporter.sendMail(mailOptions);
    
    logger.info(`Password reset email sent to ${user.email}`);
    return result;
  } catch (error) {
    logger.error('Send password reset email error:', error);
    throw error;
  }
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  try {
    const transporter = createTransporter();
    const template = emailTemplates.welcome(user.first_name);
    
    const mailOptions = {
      from: `"Campus Connect" <${process.env.EMAIL_FROM || 'noreply@campusconnect.com'}>`,
      to: user.email,
      subject: template.subject,
      html: template.html
    };

    const result = await transporter.sendMail(mailOptions);
    
    logger.info(`Welcome email sent to ${user.email}`);
    return result;
  } catch (error) {
    logger.error('Send welcome email error:', error);
    throw error;
  }
};

module.exports = {
  generateVerificationToken,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  emailTemplates
};
