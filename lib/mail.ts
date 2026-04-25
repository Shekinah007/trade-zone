import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail(email: string, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetLink = `${appUrl}/auth/reset-password/${token}`;

  const mailOptions = {
    from: `"FindMaster" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #10b981;">Password Reset</h2>
        <p>You requested a password reset for your FindMaster account.</p>
        <p>Click the button below to set a new password:</p>
        <div style="margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>If you didn't request this, you can safely ignore this email. Your password will remain unchanged.</p>
        <p style="margin-top: 30px; font-size: 14px; color: #666;">
          This link will expire in 1 hour.
          <br>
          <br>
          If the button doesn't work, copy and paste this link into your browser:
          <br>
          <a href="${resetLink}" style="color: #10b981;">${resetLink}</a>
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email: ", error);
    throw new Error("Failed to send reset email.");
  }
}
