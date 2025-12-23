// 'use client';

import React from "react";
import { BookAppointmentButton as BaseButton } from "./book-appointment-button"; // Renamed base button to `BaseButton`
import { Patient, Doctor } from "@prisma/client";

interface Props {
  patientData: Patient; // Expecting a Patient type as passed prop
  doctors: Doctor[]; // List of doctors, might be used in button or for future features
}

interface BookAppointmentButtonProps {
  patientData: {
    id: string;
    address: string;
    img: string | null;
    first_name: string;
    last_name: string;
    date_of_birth: Date;
    gender: string;
    phone: string;
    email: string;
    marital_status: string;
    emergency_contact_name: string;
    emergency_contact_number: string;
    relation: string;
    blood_group: string | null;
    allergies: string | null;
    medical_conditions: string | null;
    medical_history: string | null;
    insurance_provider: string | null;
    insurance_number: string | null;
    privacy_consent: boolean;
    service_consent: boolean;
    medical_consent: boolean;
    colorCode: string | null;
    created_at: Date;
    updated_at: Date;
  };
}

const BookAppointmentButton: React.FC<BookAppointmentButtonProps> = ({ patientData }) => {
  // Function to handle button click
  const handleBookAppointment = () => {
    // Example of handling the button click
    alert(`Booking appointment for ${patientData.first_name} ${patientData.last_name}`);
    // You can trigger an API request to book the appointment here
  };

  return (
    <div className="book-appointment-container">
      {/* Displaying patient information */}
      <h2>Book Appointment for {patientData.first_name} {patientData.last_name}</h2>

      {/* Render other patient details */}
      <div className="patient-details">
        <p>Email: {patientData.email}</p>
        <p>Phone: {patientData.phone}</p>
        <p>Gender: {patientData.gender}</p>
        <p>Address: {patientData.address}</p>
        {/* Add more details if needed */}
      </div>

      {/* Button to book appointment */}
      <button onClick={handleBookAppointment} className="book-btn">
        Book Appointment
      </button>
    </div>
  );
};

// BookAppointmentButtonWrapper handles passing the props down to the BaseButton component
export const BookAppointmentButtonWrapper: React.FC<Props> = ({ patientData, doctors }) => {
  return (
    <div>
      {/* Passing the patientData to BaseButton and doctors if you plan to use it */}
      <BookAppointmentButton patientData={patientData} />
      {/* You can add additional logic here if doctors are needed for future functionality */}
    </div>
  );
};
