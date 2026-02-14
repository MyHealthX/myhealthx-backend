const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendVerificationEmail = async (email, token) => {
  try {
    // Always use backend URL for verification
    const verifyURL = `${process.env.BACKEND_URL}/api/auth/verify?token=${token}`;

    const msg = {
      to: email,
      from: process.env.EMAIL_FROM, // must be verified sender
      subject: "Verify Your MyHealth X Account",
      html: `
        <h2>Welcome to MyHealth X</h2>
        <p>Please verify your email by clicking the button below:</p>
        <a href="${verifyURL}" 
           style="padding:10px 20px;background:#2E86C1;color:white;text-decoration:none;border-radius:5px;">
           Verify Email
        </a>
        <p>If you did not create this account, please ignore this email.</p>
      `,
    };

    await sgMail.send(msg);
  } catch (error) {
    console.error("SendGrid Error:", error.response?.body || error.message);
    throw new Error("Email sending failed");
  }
};