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
  senderName: string,
  propertyName: string,
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const dashboardLink = `${appUrl}/dashboard?tab=transfers`;

  const mailOptions = {
    from: `"FindMaster" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "New Property Transfer Request",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #ef4444;">Transfer Request</h2>
        <p><strong>${senderName}</strong> wants to transfer ownership of <strong>${propertyName}</strong> to you.</p>
        <p>Click the button below to review and accept the transfer in your dashboard:</p>
        <div style="margin: 30px 0;">
          <a href="${dashboardLink}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            View Transfer Request
          </a>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending transfer request email: ", error);
  }
}

export async function sendTransferClaimEmail(
  email: string,
  senderName: string,
  propertyName: string,
  token: string,
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const claimLink = `${appUrl}/claim/${token}`;

  const mailOptions = {
    from: `"FindMaster" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "You've Received a Property on FindMaster",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #ef4444;">Claim Your New Property</h2>
        <p><strong>${senderName}</strong> has sent you <strong>${propertyName}</strong> via the FindMaster Global Registry.</p>
        <p>To accept this transfer and secure your legal ownership, you need to create a FindMaster account.</p>
        <div style="margin: 30px 0;">
          <a href="${claimLink}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Create Account & Claim Property
          </a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #666;">
          If the button doesn't work, copy and paste this link into your browser:
          <br>
          <a href="${claimLink}" style="color: #ef4444;">${claimLink}</a>
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending transfer claim email: ", error);
  }
}

export async function sendAccountActivatedEmail(
  email: string,
  userName: string,
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const loginLink = `${appUrl}/auth/signin`;
  const marketplaceLink = `${appUrl}/market`;

  const mailOptions = {
    from: `"FindMaster" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "🎉 Your Account Has Been Activated!",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #16a34a; font-size: 28px; margin-bottom: 10px;">Welcome to FindMaster! 🚀</h1>
          <p style="font-size: 16px; color: #666;">Your account has been successfully activated</p>
        </div>

        <!-- Main Content -->
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h2 style="color: #16a34a; margin-top: 0;">Hi ${userName},</h2>
          <p style="font-size: 15px;">Great news! Your FindMaster account has been activated and you're now ready to start posting ads and managing your properties.</p>
        </div>

        <!-- What's Next Section -->
        <div style="margin-bottom: 30px;">
          <h3 style="color: #333; font-size: 18px;">What's Next?</h3>
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px; margin-top: 12px;">
            <p style="margin: 8px 0;"><strong>⚠️ Important:</strong> You'll need to <strong>sign in again</strong> for the changes to take full effect.</p>
            <p style="margin: 8px 0;">✅ Create and post property ads</p>
            <p style="margin: 8px 0;">✅ Browse listings on the marketplace</p>
            <p style="margin: 8px 0;">✅ Register items in your personal registry</p>
            <p style="margin: 8px 0;">✅ Manage transfers and ownership records</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginLink}" style="background-color: #16a34a; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; margin-bottom: 12px; box-shadow: 0 2px 4px rgba(22, 163, 74, 0.3);">
            Sign In to Your Account
          </a>
          <br />
          <a href="${marketplaceLink}" style="background-color: #ffffff; color: #16a34a; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block; border: 2px solid #16a34a;">
            Browse Marketplace
          </a>
        </div>

        <!-- Tips Section -->
        <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <h4 style="color: #92400e; margin-top: 0;">💡 Pro Tips:</h4>
          <ul style="margin: 8px 0; padding-left: 20px; color: #92400e;">
            <li style="margin: 4px 0;">Complete your profile to build trust with other users</li>
            <li style="margin: 4px 0;">Add clear photos to your listings for better visibility</li>
            <li style="margin: 4px 0;">Use the registry to keep track of all your valuable items</li>
          </ul>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 13px;">
          <p style="margin: 4px 0;">Need help? Contact our support team</p>
          <p style="margin: 4px 0;">© ${new Date().getFullYear()} FindMaster. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Account activation email sent to ${email}`);
  } catch (error) {
    console.error("Error sending account activation email: ", error);
  }
}

export async function sendAccountRejectedEmail(
  email: string,
  userName: string,
  reason?: string,
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const contactLink = `${appUrl}/contact`;
  const faqLink = `${appUrl}/faq`;

  const rejectionReason =
    reason ||
    "Your application did not meet our current verification requirements.";

  const commonReasons = [
    "Incomplete or inaccurate profile information",
    "Invalid or unverifiable identification documents",
    "Business documentation that doesn't meet requirements",
    "Duplicate account detected",
    "Violation of our terms of service",
  ];

  const mailOptions = {
    from: `"FindMaster Verification" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Update on Your FindMaster Account Application",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #dc2626; font-size: 28px; margin-bottom: 10px;">Account Application Update</h1>
          <p style="font-size: 16px; color: #666;">We were unable to activate your account</p>
        </div>

        <!-- Main Message -->
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h2 style="color: #dc2626; margin-top: 0;">Hi ${userName},</h2>
          <p style="font-size: 15px;">Thank you for your interest in FindMaster. After carefully reviewing your application, we regret to inform you that we are unable to activate your account at this time.</p>
        </div>

        <!-- Reason Section -->
        <div style="margin-bottom: 30px;">
          <h3 style="color: #333; font-size: 18px;">Reason for Rejection</h3>
          <div style="background-color: #f9fafb; border-left: 4px solid #dc2626; border-radius: 4px; padding: 16px; margin-top: 12px;">
            <p style="margin: 0; font-style: italic;">"${rejectionReason}"</p>
          </div>
        </div>

        <!-- Common Reasons -->
        <div style="margin-bottom: 30px;">
          <h3 style="color: #333; font-size: 18px;">Common Reasons for Rejection</h3>
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px; margin-top: 12px;">
            <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
              ${commonReasons.map((reason) => `<li style="margin: 6px 0;">${reason}</li>`).join("")}
            </ul>
          </div>
        </div>

        <!-- Next Steps -->
        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <h4 style="color: #1e40af; margin-top: 0;">📝 What You Can Do</h4>
          <ul style="margin: 8px 0; padding-left: 20px; color: #1e40af;">
            <li style="margin: 4px 0;">Review your application and ensure all information is accurate</li>
            <li style="margin: 4px 0;">Verify that your identification documents are clear and valid</li>
            <li style="margin: 4px 0;">Contact our support team if you believe this was a mistake</li>
            <li style="margin: 4px 0;">You may reapply after correcting the issues mentioned above</li>
          </ul>
        </div>

        <!-- Action Buttons -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${contactLink}" style="background-color: #dc2626; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; margin-right: 12px; box-shadow: 0 2px 4px rgba(220, 38, 38, 0.3);">
            Contact Support
          </a>
          <a href="${faqLink}" style="background-color: #ffffff; color: #dc2626; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; border: 2px solid #dc2626;">
            View FAQ
          </a>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 13px;">
          <p style="margin: 4px 0;">If you have questions, please don't hesitate to reach out</p>
          <p style="margin: 4px 0;">You can reapply once you have addressed the issues mentioned above</p>
          <p style="margin: 4px 0;">© ${new Date().getFullYear()} FindMaster. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Account rejection email sent to ${email}`);
  } catch (error) {
    console.error("Error sending account rejection email: ", error);
  }
}
