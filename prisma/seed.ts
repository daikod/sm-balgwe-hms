import {
  PrismaClient,
  Role,
  Status,
  JOBTYPE,
  Gender,
  AppointmentStatus,
  AppointmentType,
  PaymentMethod,
  PaymentStatus,
} from "@prisma/client";

import { faker } from "@faker-js/faker/locale/en_NG";

const prisma = new PrismaClient();

async function seed() {
  console.log("🇳🇬 Seeding Nigerian healthcare data...");

  // ================= STAFF =================
  const staffRoles: Role[] = [Role.NURSE, Role.CASHIER, Role.LAB_TECHNICIAN];

  for (const role of staffRoles) {
    await prisma.staff.create({
      data: {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        phone: faker.phone.number("+23480########" as any),
        address: `${faker.location.streetAddress()}, ${faker.location.city()}, Nigeria`,
        department: faker.company.name(),
        role,
        status: Status.ACTIVE,
      },
    });
  }

  // ================= DOCTORS =================
  const doctors = [];
  for (let i = 0; i < 10; i++) {
    const doctor = await prisma.doctor.create({
      data: {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        specialization: faker.person.jobTitle(),
        license_number: faker.string.uuid(),
        phone: faker.phone.number("+23480########" as any),
        address: `${faker.location.streetAddress()}, ${faker.location.city()}, Nigeria`,
        department: faker.company.name(),
        availability_status: "ACTIVE",
        type: i % 2 === 0 ? JOBTYPE.FULL : JOBTYPE.PART,
        working_days: {
          create: [
            { day: "Monday", start_time: "08:00", close_time: "17:00" },
            { day: "Wednesday", start_time: "08:00", close_time: "17:00" },
          ],
        },
      },
    });
    doctors.push(doctor);
  }

  // ================= PATIENTS =================
  const patients = [];
  for (let i = 0; i < 20; i++) {
    const patient = await prisma.patient.create({
      data: {
        id: faker.string.uuid(),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        date_of_birth: faker.date.birthdate({ min: 18, max: 75, mode: "age" }),
        gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
        phone: faker.phone.number("+23480########" as any),
        email: faker.internet.email(),
        marital_status: i % 3 === 0 ? "Married" : "Single",
        address: `${faker.location.streetAddress()}, ${faker.location.city()}, Nigeria`,
        emergency_contact_name: faker.person.fullName(),
        emergency_contact_number: faker.phone.number("+23480########" as any),
        relation: "Sibling",
        blood_group: i % 4 === 0 ? "O+" : "A+",
        allergies: faker.lorem.words(2),
        medical_conditions: faker.lorem.words(3),
        privacy_consent: true,
        service_consent: true,
        medical_consent: true,
      },
    });
    patients.push(patient);
  }

  // ================= SERVICES =================
  const serviceNames = [
    "Blood Test",
    "X-Ray",
    "MRI Scan",
    "Ultrasound",
    "Consultation",
    "Surgery",
    "Drug Prescription",
    "Physiotherapy",
    "CT Scan",
    "Vaccination",
  ];

  const services = [];
  for (const name of serviceNames) {
    const service = await prisma.services.create({
      data: {
        service_name: name,
        description: faker.lorem.sentence(),
        price: faker.number.float({ min: 5000, max: 50000, multipleOf: 100 }),
      },
    });
    services.push(service);
  }

  // ================= APPOINTMENTS + PAYMENTS =================
  for (let i = 0; i < 20; i++) {
    const doctor = faker.helpers.arrayElement(doctors);
    const patient = faker.helpers.arrayElement(patients);
    const appointmentDate = faker.date.soon({ days: 30 });

    const appointment = await prisma.appointment.create({
      data: {
        patient_id: patient.id,
        doctor_id: doctor.id,
        appointment_date: appointmentDate,
        time: "10:00",
        status:
          i % 4 === 0
            ? AppointmentStatus.PENDING
            : AppointmentStatus.SCHEDULED,
        type: i % 2 === 0 ? AppointmentType.VIDEO : AppointmentType.PHYSICAL,
        reason: faker.lorem.sentence(),
        note: faker.lorem.sentence(),
      },
    });

    const total = faker.number.float({ min: 15000, max: 100000, multipleOf: 100 });
    const discount = faker.number.float({ min: 0, max: 0.15, fractionDigits: 2 });
    const amountPaid = total * (1 - discount);

    const payment = await prisma.payment.create({
      data: {
        patient_id: patient.id,
        appointment_id: appointment.id,
        receipt_number: Number(
          `${Date.now()}${Math.floor(Math.random() * 100)}`
        ),
        bill_date: appointmentDate,
        payment_date: faker.date.soon({ days: 5, refDate: appointmentDate }),
        discount: discount * 100,
        total_amount: total,
        amount_paid: amountPaid,
        payment_method:
          Math.random() > 0.5 ? PaymentMethod.CASH : PaymentMethod.CARD,
        status:
          amountPaid < total
            ? PaymentStatus.PART
            : PaymentStatus.PAID,
      },
    });

    // ================= PATIENT BILLS =================
    const numBills = faker.number.int({ min: 2, max: 4 });

    for (let b = 0; b < numBills; b++) {
      const service = faker.helpers.arrayElement(services);
      const qty = faker.number.int({ min: 1, max: 3 });

      await prisma.patientBills.create({
        data: {
          bill_id: payment.id,
          service_id: service.id,
          service_date: appointmentDate,
          quantity: qty,
          unit_cost: service.price,
          total_cost: service.price * qty,
        },
      });
    }
  }

  console.log("✅ Seeding completed successfully.");
  await prisma.$disconnect();
}

seed().catch(async (e) => {
  console.error("❌ Seeding failed:", e);
  await prisma.$disconnect();
  process.exit(1);
});
