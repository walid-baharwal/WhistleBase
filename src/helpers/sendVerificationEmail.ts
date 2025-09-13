import nodemailer from "nodemailer";

interface EmailResponse {
  success: boolean;
  message: string;
}

export const sendVerificationEmail = async (
  email: string,
  name: string,
  verificationCode: string
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
    console.log("SMTP server connection verified");

  
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
            .code-box { background: #f8f9fa; border: 2px dashed #6c757d; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
            .verification-code { font-size: 32px; font-weight: bold; color: #8b5a3c; letter-spacing: 4px; }
            .footer { background: #e5d2bc; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #8b5a3c; }
            .btn { display: inline-block; padding: 12px 24px; background: #e5d2bc; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; color: #8b5a3c;">Email Verification</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>Thank you for signing up! To complete your registration, please verify your email address using the verification code below:</p>
              
              <div class="code-box">
                <div class="verification-code">${verificationCode}</div>
              </div>
              
              <p><strong>Important:</strong></p>
              <ul>
                <li>This code will expire in 1 hour</li>
                <li>Enter this code exactly as shown</li>
                <li>If you didn't request this verification, please ignore this email</li>
              </ul>
              
              <p>If you're having trouble with the verification process, please contact our support team.</p>
              
              <p>Best regards,<br>The Whistle Base Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>© ${new Date().getFullYear()} Whistle Base. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

  
    const mailOptions = {
      from: {
        name: "Whistle - Email Verification",
        address: process.env.GMAIL_USER || "",
      },
      to: email,
      subject: `Verify Your Email - Code: ${verificationCode}`,
      html: htmlTemplate,
      text: `Hello ${name}!\n\nThank you for signing up! Please verify your email address using this verification code: ${verificationCode}\n\nThis code will expire in 1 hour.\n\nIf you didn't request this verification, please ignore this email.\n\nBest regards,\nThe Whistle Team`,
    };


    await transporter.sendMail(mailOptions);

    console.log(`Verification code sent to ${email}: ${verificationCode}`);

    return {
      success: true,
      message: "Verification email sent successfully",
    };
  } catch (error: unknown) {
    console.error("Error sending verification email:", error);


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
    } else if (errorObj.code === "EMESSAGE") {
      return {
        success: false,
        message: "Invalid email format or content. Please try again.",
      };
    }

    return {
      success: false,
      message: "Failed to send verification email. Please try again.",
    };
  }
};
