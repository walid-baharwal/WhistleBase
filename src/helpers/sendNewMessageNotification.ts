import nodemailer from "nodemailer";

interface EmailResponse {
  success: boolean;
  message: string;
}

export const sendNewMessageNotification = async (
  adminEmail: string,
  adminName: string,
  channelTitle: string,
  caseId: string,
  category: string
): Promise<EmailResponse> => {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error("Gmail credentials not configured in environment variables");
      return {
        success: false,
        message: "Email service not configured. Please contact support.",
      };
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.verify();

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #e5d2bc; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #dee2e6; }
            .info-box { background: #f8f9fa; border-left: 4px solid #8b5a3c; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { background: #e5d2bc; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #8b5a3c; }
            .btn { display: inline-block; padding: 12px 24px; background: #8b5a3c; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .highlight { color: #8b5a3c; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; color: #8b5a3c;">💬 New Message Received</h1>
            </div>
            <div class="content">
              <h2>Hello ${adminName}!</h2>
              <p>A new message has been received from an anonymous user in an ongoing case.</p>
              
              <div class="info-box">
                <p style="margin: 5px 0;"><strong>Channel:</strong> <span class="highlight">${channelTitle}</span></p>
                <p style="margin: 5px 0;"><strong>Category:</strong> ${category}</p>
                <p style="margin: 5px 0;"><strong>Case ID:</strong> ${caseId}</p>
                <p style="margin: 5px 0;"><strong>Received:</strong> ${new Date().toLocaleString()}</p>
              </div>
              
              <p>The anonymous user has sent a new message in this case. Please review the message in your dashboard to continue the conversation.</p>
              
              <p style="margin-top: 20px;">
                <strong>⚠️ Important:</strong> All messages are end-to-end encrypted to protect the whistleblower's identity and ensure confidentiality.
              </p>
              
              <p>Best regards,<br>The Whistle Base Team</p>
            </div>
            <div class="footer">
              <p>This is an automated notification. Please do not reply to this message.</p>
              <p>© ${new Date().getFullYear()} Whistle Base. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: {
        name: "Whistle Base - New Message Alert",
        address: process.env.GMAIL_USER || "",
      },
      to: adminEmail,
      subject: `New Message in Case: ${channelTitle} - ${category}`,
      html: htmlTemplate,
      text: `Hello ${adminName}!\n\nA new message has been received from an anonymous user in an ongoing case.\n\nChannel: ${channelTitle}\nCategory: ${category}\nCase ID: ${caseId}\nReceived: ${new Date().toLocaleString()}\n\nPlease review the message in your dashboard.\n\nBest regards,\nThe Whistle Base Team`,
    };

    await transporter.sendMail(mailOptions);

    return {
      success: true,
      message: "New message notification sent successfully",
    };
  } catch (error: unknown) {
    console.error("Error sending new message notification:", error);

    const errorObj = error as { code?: string; message?: string };

    if (errorObj.code === "EAUTH") {
      return {
        success: false,
        message: "Email authentication failed. Please check email configuration.",
      };
    } else if (errorObj.code === "ECONNECTION") {
      return {
        success: false,
        message: "Unable to connect to email server. Please try again later.",
      };
    }

    return {
      success: false,
      message: "Failed to send new message notification.",
    };
  }
};
