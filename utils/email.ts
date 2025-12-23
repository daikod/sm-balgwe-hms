import { any } from "zod";

// Create a reusable email transporter using SMTP configuration
let nodemailer;

if (typeof window === 'undefined') {
  // Import nodemailer only when running server-side
  nodemailer = require('nodemailer');
}

let transporter: any;

// Initialize the transporter only on the server-side
if (nodemailer) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, // true only for port 465, change to true if you're using secure SMTP
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

interface VideoCallEmailProps {
  to: string;
  patientName: string;
  doctorName: string;
  roomID: string;
}

interface MissedCallEmailProps {
  to: string;
  recipientName: string;
  counterpartName: string;
  role: "PATIENT" | "DOCTOR";
  appointmentTime: Date;
  rescheduleLink: string;
}

// Function to send the video call started email
export async function sendVideoCallStartedEmail({
  to,
  patientName,
  doctorName,
  roomID,
}: VideoCallEmailProps) {
  const meetingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/meeting/${roomID}`;

  if (typeof window === 'undefined' && transporter) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM, // From email address
        to, // Recipient email (doctor or patient)
        subject: "Your Video Consultation Has Started", // Subject of the email
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6">
            <p>Hello ${patientName},</p>

            <p>Your video consultation with <strong>Dr. ${doctorName}</strong> has started.</p>

            <p>
              <a href="${meetingUrl}"
                 style="display:inline-block;padding:10px 16px;
                 background:#2563eb;color:#ffffff;
                 border-radius:6px;text-decoration:none">
                Join Video Consultation
              </a>
            </p>

            <p>If the button does not work, copy and paste this link:</p>
            <p>${meetingUrl}</p>

            <p>Regards,<br/>Connect A Doctor</p>
          </div>
        `,
      });
      console.log(`Email sent to: ${to}`); // You can remove this after testing
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error("Failed to send video call started email");
    }
  } else {
    console.error("Nodemailer is not available on the client-side.");
  }
}

export async function sendMissedCallEmail({
  to,
  recipientName,
  counterpartName,
  role,
  appointmentTime,
}: MissedCallEmailProps) {
  const subject =
    role === "PATIENT"
      ? "You Missed Your Video Consultation"
      : "Missed Video Consultation";

  const body =
    role === "PATIENT"
      ? `
        <p>Dear ${recipientName},</p>
        <p>You missed your scheduled video consultation with Dr. ${counterpartName}.</p>
        <p>Scheduled time: ${appointmentTime.toLocaleString()}</p>
        <p>Please log in to reschedule.</p>
      `
      : `
        <p>Dear Dr. ${recipientName},</p>
        <p>You missed your scheduled video consultation with ${counterpartName}.</p>
        <p>Scheduled time: ${appointmentTime.toLocaleString()}</p>
        <p>Please log in to follow up or reschedule.</p>
      `;

  await transporter.sendMail({
    from: `"Connect A Doctor" <${process.env.SMTP_FROM}>`,
    to,
    subject,
    html: body,
  });
}
