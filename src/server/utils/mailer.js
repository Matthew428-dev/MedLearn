//PSURF 2025/Medlearn LMS / src / server / utils
import nodemailer from 'nodemailer';
const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: +process.env.SMTP_PORT,
  secure: true,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

export async function sendInquiryConfirmation(email, firstName) {
  const info = await transport.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Confirmation: Inquiry Received",
    text: `Hello ${firstName},

Thank you for your interest in MedLearn. Our team is reviewing the details you submitted about ${companyName} and will follow up within one business day with next steps. If you have any additional information in the meantime, just let us know.

Sincerely,
The MedLearn Team`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#333;">
        <h2 style="color:#007ACC;margin-bottom:0.5em;">Thank you for your interest in MedLearn</h2>
        <p>Hi ${firstName},</p>
        <p>Our team is reviewing the details you submitted about <strong>${companyName}</strong> and will follow up within one business day with next steps. If you have any additional information in the meantime, feel free to reply to this email.</p>
        <p style="margin-top:1.5em;">Sincerely,<br>The MedLearn Team</p>
      </div>
    `
  });
  return info.messageId;
}
