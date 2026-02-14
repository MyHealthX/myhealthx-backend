const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;

  const msg = {
    to: email,
    from: process.env.EMAIL_FROM,
    subject: "Verify Your MyHealth X Account",
    html: `
      <h2>Welcome to MyHealth X</h2>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}" 
         style="padding:10px 15px;background:#2563eb;color:#fff;text-decoration:none;border-radius:5px;">
         Verify Email
      </a>
      <p>This link will expire in 30 minutes.</p>
    `,
  };

  await sgMail.send(msg);
};

module.exports = { sendVerificationEmail };