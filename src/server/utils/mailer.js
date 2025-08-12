import dotenv from 'dotenv'
import formData from 'form-data'
import Mailgun from 'mailgun.js'

dotenv.config()

const mg = new Mailgun(formData).client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY,
  ...(process.env.MAILGUN_API_BASE_URL && { url: process.env.MAILGUN_API_BASE_URL })
})

async function sendEmail({ to, subject, html, text }) {
  return mg.messages.create(process.env.MAILGUN_DOMAIN, {
    from: process.env.EMAIL_FROM || `MedLearn <no-reply@${process.env.MAILGUN_DOMAIN}>`,
    to,
    subject,
    html,
    text
  })
}

export function sendInquiryConfirmationEmail(to, firstName) {
  const subject = 'Confirmation: Inquiry Received'
  const text = `Hello ${firstName},

Thank you for your interest in MedLearn. Our team is reviewing the information you submitted and will follow up within 1-2 business days with the next steps. If you have any additional information in the meantime, just let us know.

Sincerely,
The MedLearn Team`
  const html = `
    <div style="font-family:Arial,sans-serif;background:linear-gradient(135deg,#062b81 0%,#050508 100%);padding:40px 20px;">
      <div style="max-width:600px;margin:0 auto;background:#1a202c;border:1px solid #2d3748;border-radius:8px;padding:24px;color:#fff;">
        <h1 style="margin-top:0;margin-bottom:16px;color:#ffd75f;font-size:20px;">Confirmation: Inquiry Received</h1>
        <p>Hello ${firstName},</p>
        <p>Thank you for your interest in MedLearn. Our team is reviewing the information you submitted and will follow up within 1-2 business days with the next steps. If you have any additional information in the meantime, just let us know.</p>
        <p>Sincerely,</p>
        <p>The MedLearn Team</p>
      </div>
    </div>
  `
  return sendEmail({ to, subject, html, text })
}

export function sendInquiryApprovedEmail(to,firstName,lastName,createdAt,companyName,helpUrl) {
  const subject = 'Your MedLearn Inquiry Has Been Approved'
  const text = `Hi ${firstName} ${lastName},

We’re pleased to let you know that your inquiry submitted on ${createdAt} has been approved. You now have full access to MedLearn’s course materials for ${companyName}.

To get started:

Click this one-time link to create your password and set up your profile (the link will expire in 72 hours): ${helpUrl}

After setting up your account, you will have 7-day access to all courses

If you need any assistance, reply to this email or reach out to us by phone at (409)-599-7103. We're available Monday-Friday 8:00am to 6:00am MT

Welcome aboard and thank you for choosing MedLearn.

Best regards
The MedLearn Team`

  const html = `
    <div style="font-family:Arial,sans-serif;background:linear-gradient(90deg,#062b81,#050508);padding:20px;color:#ffffff;">
      <div style="max-width:600px;margin:0 auto;background-color:#1a202c;border:1px solid #2d3748;padding:20px;border-radius:8px;">
        <h1 style="color:#ffd75f;margin-top:0;">MedLearn</h1>
        <p>Hi ${firstName} ${lastName},</p>
        <p>We’re pleased to let you know that your inquiry submitted on ${createdAt} has been approved. You now have full access to MedLearn’s course materials for ${companyName}.</p>
        <h2 style="color:#ffd75f;">To get started:</h2>
        <ol style="padding-left:20px;">
          <li style="margin-bottom:8px;"><a href="${helpUrl}" style="color:#ffd75f;text-decoration:underline;">Click this one-time link to create your password and set up your profile</a> (the link will expire in 72 hours)</li>
          <li>After setting up your account, you will have 7-day access to all courses</li>
        </ol>
        <p>If you need any assistance, reply to this email or reach out to us by phone at (409)-599-7103. We're available Monday-Friday 8:00am to 6:00am MT</p>
        <p>Welcome aboard and thank you for choosing MedLearn.</p>
        <p>Best regards<br/>The MedLearn Team</p>
      </div>
    </div>
  `

  return sendEmail({ to, subject, html, text })
}
export default sendEmail
