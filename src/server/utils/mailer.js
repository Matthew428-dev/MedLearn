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

export function sendInquiryConfirmation(to, firstName) {
  const subject = 'Confirmation: Inquiry Received'
  const text = `Hello ${firstName},

Thank you for your interest in MedLearn. Our team is reviewing the information you submitted and will follow up within 1-2 business days with the next steps. If you have any additional information in the meantime, just let us know.

Sincerely,
The MedLearn Team`
  const html = `<div style="font-family:Arial,sans-serif;line-height:1.5;color:#333;">${text.replace(/\n/g, '<br />')}</div>`
  return sendEmail({ to, subject, html, text })
}

export default sendEmail
