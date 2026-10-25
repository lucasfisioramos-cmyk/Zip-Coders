import nodemailer from 'nodemailer'

// Sem SMTP_HOST (dev) o e-mail só vai para o console.
const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    })
  : null

export async function enviarEmail({ to, subject, text }) {
  if (!to.length) return
  if (!transporter) return console.log(`[email simulado] para: ${to.join(', ')}\n${subject}\n${text}`)
  await transporter.sendMail({ from: process.env.MAIL_FROM || process.env.SMTP_USER, bcc: to, subject, text })
}
