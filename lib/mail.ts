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

export async function sendTransferRequestEmail(
  email: string,
  token: string,
  itemName: string,
  senderName: string,
  isNewUser: boolean
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const claimLink = `${appUrl}/registry/transfer/claim?token=${token}`;

  const message = isNewUser
    ? `<p>${senderName} just transferred ownership of an item (${itemName}) to you on FindMaster.</p>
       <p>To claim your item and secure it in the Global Property Registry, please create an account and accept the transfer using the link below:</p>`
    : `<p>${senderName} has initiated a transfer of ownership for an item (${itemName}) to you.</p>
       <p>Please log in to your account and accept the transfer:</p>`;

  const mailOptions = {
    from: `"FindMaster Registry" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Property Ownership Transfer Request",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #ef4444;">Ownership Transfer</h2>
        ${message}
        <div style="margin: 30px 0;">
          <a href="${claimLink}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Review Transfer
          </a>
        </div>
        <p>If you don't recognize this request, you can safely ignore this email.</p>
        <p style="margin-top: 30px; font-size: 14px; color: #666;">
          This link will expire in 7 days.
          <br>
          <br>
          <a href="${claimLink}" style="color: #ef4444;">${claimLink}</a>
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending transfer email: ", error);
    throw new Error("Failed to send transfer email.");
  }
}

export async function sendRegistryUpsellEmail(
  email: string,
  itemName: string,
  listingId: string
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const registerLink = `${appUrl}/registry/register?listingId=${listingId}`;

  const mailOptions = {
    from: `"FindMaster Registry" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Protect Your New Purchase - FindMaster",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #3b82f6;">Congratulations on your purchase!</h2>
        <p>We saw you recently acquired a <strong>${itemName}</strong> on FindMaster.</p>
        <div style="background-color: #f3f4f6; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0;">
          <strong>Did you know?</strong> This item is currently unregistered. That makes it much harder to track if it's ever lost or stolen.
        </div>
        <p>Secure your new asset safely in the Global Registry. Since you bought it on FindMaster, we can auto-fill all your item's details and photos instantly.</p>
        <div style="margin: 30px 0;">
          <a href="${registerLink}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Register Property Now
          </a>
        </div>
        <p>Protecting your property takes less than 2 minutes.</p>
        <p style="margin-top: 30px; font-size: 14px; color: #666;">
          <a href="${registerLink}" style="color: #3b82f6;">${registerLink}</a>
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending upsell email: ", error);
    throw new Error("Failed to send upsell email.");
  }
}
