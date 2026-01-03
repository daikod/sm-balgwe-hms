// utils/email.ts
// import nodemailer from 'nodemailer';
import prisma from '@/lib/db';

let transporter: any;

if (typeof window === 'undefined') {
  // Only require nodemailer on server
  const nodemailer = require('nodemailer');

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// ----------------- Interfaces -----------------

export interface VideoCallEmailProps {
  to: string;
  patientName: string;
  doctorName: string;
  roomID: string;
}

export interface MissedCallEmailProps {
  to: string;
  recipientName: string;
  counterpartName: string;
  role: 'PATIENT' | 'DOCTOR';
  appointmentTime: Date;
  rescheduleLink: string;
}

export interface VitalSign {
  body_temperature: number;
  systolic: number;
  diastolic: number;
  heartRate: string;
  respiratory_rate?: number;
  oxygen_saturation?: number;
  weight: number;
  height: number;
}

export interface Diagnosis {
  diagnosis: string;
  notes?: string;
}

export interface MedicationAdministration {
  // minimal properties for email
}

export interface Medication {
  medicationName: string;
  dosage: string;
  frequency: string;
  administrations: MedicationAdministration[];
}

export interface Prescription {
  diagnosis?: string;
  medications: Medication[];
}

export interface DischargeEmailProps {
  to: string;
  patientName: string;
  vitals: VitalSign[];
  diagnoses: Diagnosis[];
  prescriptions: Prescription[];
  dischargeNotes?: string;
}

export interface SendEmailProps {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

// ----------------- Base Email Sender with Logging -----------------

export async function sendEmailWithLog(to: string, subject: string, html?: string, text?: string) {
  if (typeof window !== 'undefined' || !transporter) {
    console.error('Nodemailer not available on client side');
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Connect A Doctor" <${process.env.SMTP_FROM}>`,
      to,
      subject,
      text,
      html,
    });

    // Log success
    if (prisma.emailLog) {
      await prisma.emailLog.create({
        data: {
          to,
          subject,
          status: 'SENT',
        },
      });
    }

    console.log(`Email sent to: ${to}`);
  } catch (error: any) {
    console.error('Error sending email:', error);

    // Log failure
    if (prisma.emailLog) {
      await prisma.emailLog.create({
        data: {
          to,
          subject,
          status: 'FAILED',
          error: error.message,
        },
      });
    }

    throw new Error('Failed to send email');
  }
}

// ----------------- Video Call Email -----------------

export async function sendVideoCallStartedEmail({ to, patientName, doctorName, roomID }: VideoCallEmailProps) {
  const meetingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/meeting/${roomID}`;

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6">
      <p>Hello ${patientName},</p>
      <p>Your video consultation with <strong>Dr. ${doctorName}</strong> has started.</p>
      <p>
        <a href="${meetingUrl}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#ffffff;border-radius:6px;text-decoration:none">
          Join Video Consultation
        </a>
      </p>
      <p>If the button does not work, copy and paste this link:</p>
      <p>${meetingUrl}</p>
      <p>Regards,<br/>Connect A Doctor</p>
    </div>
  `;

  await sendEmailWithLog(to, 'Your Video Consultation Has Started', html);
}

// ----------------- Missed Call Email -----------------

export async function sendMissedCallEmail({ to, recipientName, counterpartName, role, appointmentTime, rescheduleLink }: MissedCallEmailProps) {
  const subject = role === 'PATIENT'
    ? 'You Missed Your Video Consultation'
    : 'Missed Video Consultation';

  const html = role === 'PATIENT'
    ? `<p>Dear ${recipientName},</p>
       <p>You missed your scheduled video consultation with Dr. ${counterpartName}.</p>
       <p>Scheduled time: ${appointmentTime.toLocaleString()}</p>
       <p>Please log in to <a href="${rescheduleLink}">reschedule</a>.</p>`
    : `<p>Dear Dr. ${recipientName},</p>
       <p>You missed your scheduled video consultation with ${counterpartName}.</p>
       <p>Scheduled time: ${appointmentTime.toLocaleString()}</p>
       <p>Please log in to follow up or reschedule.</p>`;

  await sendEmailWithLog(to, subject, html);
}

// ----------------- Discharge Email -----------------

export async function sendDischargeEmail({ to, patientName, vitals, diagnoses, prescriptions, dischargeNotes = '' }: DischargeEmailProps) {
  const vitalsHtml = vitals.length
    ? `<h3>Latest Vital Signs</h3>
       <table border="1" cellpadding="5" style="border-collapse:collapse">
         <thead>
           <tr>
             <th>Temp (°C)</th><th>Systolic</th><th>Diastolic</th>
             <th>Heart Rate</th><th>Respiratory Rate</th>
             <th>O2 Sat</th><th>Weight</th><th>Height</th>
           </tr>
         </thead>
         <tbody>
           ${vitals.map(v => `
             <tr>
               <td>${v.body_temperature}</td>
               <td>${v.systolic}</td>
               <td>${v.diastolic}</td>
               <td>${v.heartRate}</td>
               <td>${v.respiratory_rate ?? ''}</td>
               <td>${v.oxygen_saturation ?? ''}</td>
               <td>${v.weight}</td>
               <td>${v.height}</td>
             </tr>
           `).join('')}
         </tbody>
       </table>`
    : '';

  const diagnosesHtml = diagnoses.length
    ? `<h3>Diagnoses</h3>
       <ul>
         ${diagnoses.map(d => `<li>${d.diagnosis}${d.notes ? ` - ${d.notes}` : ''}</li>`).join('')}
       </ul>`
    : '';

  const prescriptionsHtml = prescriptions.length
    ? `<h3>Medications</h3>
       <ul>
         ${prescriptions.map(p => `
           <li>
             <strong>Diagnosis: ${p.diagnosis ?? 'N/A'}</strong>
             <ul>
               ${p.medications.map(m => `<li>${m.medicationName} - ${m.dosage} (${m.frequency})${m.administrations.length ? ` - Administered: ${m.administrations.length} times` : ''}</li>`).join('')}
             </ul>
           </li>
         `).join('')}
       </ul>`
    : '';

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6">
      <p>Dear ${patientName},</p>
      <p>You have been discharged from the hospital. Please find your discharge summary below.</p>
      ${vitalsHtml}
      ${diagnosesHtml}
      ${prescriptionsHtml}
      ${dischargeNotes ? `<h3>Discharge Notes</h3><p>${dischargeNotes}</p>` : ''}
      <p>Regards,<br/>Connect A Doctor</p>
    </div>
  `;

  await sendEmailWithLog(to, 'Your Discharge Summary', html);
}
