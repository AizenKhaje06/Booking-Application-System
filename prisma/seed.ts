import {
  BookingType,
  EventBookingStatus,
  EventType,
  PaymentMethod,
  PaymentStatus,
  PrismaClient,
  ReservationStatus,
  TableStatus,
  UserRole,
} from "@prisma/client";
import { hash } from "bcryptjs";

import { DEFAULT_OPENING_HOURS } from "../types/database";

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = "Password123!";

async function main() {
  console.log("🌱 Seeding RestaurantHub database...\n");

  const passwordHash = await hash(DEFAULT_PASSWORD, 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@restauranthub.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "superadmin@restauranthub.com",
      password: passwordHash,
      role: UserRole.SUPER_ADMIN,
      phone: "+63 900 000 0001",
    },
  });

  const mainBranch = await prisma.branch.upsert({
    where: { slug: "main" },
    update: {},
    create: {
      slug: "main",
      name: "RestaurantHub — Main Branch",
      address: "123 Culinary Avenue, Metro City",
      phone: "+63 2 8123 4567",
      email: "main@restauranthub.com",
      openingHours: DEFAULT_OPENING_HOURS,
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200",
      isMainBranch: true,
    },
  });

  const branchAdmin = await prisma.user.upsert({
    where: { email: "admin.main@restauranthub.com" },
    update: { branchId: mainBranch.id },
    create: {
      name: "Main Branch Admin",
      email: "admin.main@restauranthub.com",
      password: passwordHash,
      role: UserRole.BRANCH_ADMIN,
      branchId: mainBranch.id,
      phone: "+63 900 000 0002",
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: "staff@restauranthub.com" },
    update: { branchId: mainBranch.id },
    create: {
      name: "Front Desk Staff",
      email: "staff@restauranthub.com",
      password: passwordHash,
      role: UserRole.STAFF,
      branchId: mainBranch.id,
      phone: "+63 900 000 0003",
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      name: "Juan Dela Cruz",
      email: "customer@example.com",
      password: passwordHash,
      role: UserRole.CUSTOMER,
      phone: "+63 917 123 4567",
    },
  });

  const northBranch = await prisma.branch.upsert({
    where: { slug: "north" },
    update: {},
    create: {
      slug: "north",
      name: "RestaurantHub — North Branch",
      address: "45 Harbor View Road, North District",
      phone: "+63 2 8234 5678",
      email: "north@restauranthub.com",
      openingHours: DEFAULT_OPENING_HOURS,
      image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200",
      isMainBranch: false,
    },
  });

  const southBranch = await prisma.branch.upsert({
    where: { slug: "south" },
    update: {},
    create: {
      slug: "south",
      name: "RestaurantHub — South Branch",
      address: "88 Garden Lane, South Bay",
      phone: "+63 2 8345 6789",
      email: "south@restauranthub.com",
      openingHours: DEFAULT_OPENING_HOURS,
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200",
      isMainBranch: false,
    },
  });

  const skylineVenue = await prisma.eventVenue.upsert({
    where: { id: "seed-venue-skyline" },
    update: {
      slug: "skyline-event-hall",
      tagline: "Where celebrations meet the skyline",
      floor: 2,
      gallery: [
        "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1400",
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b8?w=1400",
        "https://images.unsplash.com/photo-1478146896981-b9736d110bc9?w=1400",
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1400",
        "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1400",
      ],
      amenities: [
        "Panoramic city views",
        "Dedicated event coordinator",
        "Premium sound & lighting",
        "Bridal suite",
        "In-house catering kitchen",
        "Valet parking",
        "360° photo-ready décor",
      ],
    },
    create: {
      id: "seed-venue-skyline",
      branchId: mainBranch.id,
      slug: "skyline-event-hall",
      name: "Skyline Event Hall",
      tagline: "Where celebrations meet the skyline",
      capacity: 150,
      floor: 2,
      description:
        "Our flagship 2nd-floor venue at Main Branch — an elegant canvas for weddings, galas, and milestone celebrations. Floor-to-ceiling windows, crystal chandeliers, and a dedicated events team ensure every detail shines.",
      image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1400",
      gallery: [
        "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1400",
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b8?w=1400",
        "https://images.unsplash.com/photo-1478146896981-b9736d110bc9?w=1400",
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1400",
        "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1400",
      ],
      amenities: [
        "Panoramic city views",
        "Dedicated event coordinator",
        "Premium sound & lighting",
        "Bridal suite",
        "In-house catering kitchen",
        "Valet parking",
        "360° photo-ready décor",
      ],
      price: 85000,
    },
  });

  const packages = [
    {
      id: "seed-pkg-silver",
      slug: "silver-celebration",
      name: "Silver Celebration",
      description: "Intimate gatherings with essential amenities and elegant table settings.",
      price: 85000,
      features: [
        "4-hour venue use",
        "Basic lighting",
        "Standard catering menu",
        "Event coordinator",
      ],
      maxGuests: 80,
      isFeatured: false,
      sortOrder: 1,
    },
    {
      id: "seed-pkg-gold",
      slug: "gold-wedding",
      name: "Gold Wedding Package",
      description: "Our most popular wedding package with premium décor and full-service catering.",
      price: 185000,
      features: [
        "8-hour venue use",
        "Premium floral & décor",
        "Full catering & bar service",
        "Bridal suite access",
        "Dedicated planner",
        "Photography-ready lighting",
      ],
      maxGuests: 150,
      isFeatured: true,
      sortOrder: 2,
    },
    {
      id: "seed-pkg-platinum",
      slug: "platinum-gala",
      name: "Platinum Gala",
      description: "Ultimate luxury experience for corporate galas and grand celebrations.",
      price: 320000,
      features: [
        "12-hour venue use",
        "Custom stage & AV production",
        "Gourmet multi-course menu",
        "VIP lounge",
        "Valet & security",
        "Premium open bar",
      ],
      maxGuests: 150,
      isFeatured: false,
      sortOrder: 3,
    },
  ];

  for (const pkg of packages) {
    await prisma.eventPackage.upsert({
      where: { id: pkg.id },
      update: {},
      create: { ...pkg, venueId: skylineVenue.id },
    });
  }

  const branches = [
    { branch: mainBranch, tableCount: 12 },
    { branch: northBranch, tableCount: 8 },
    { branch: southBranch, tableCount: 8 },
  ];

  for (const { branch, tableCount } of branches) {
    for (let i = 1; i <= tableCount; i++) {
      const tableNumber = i.toString().padStart(2, "0");
      const floor = branch.isMainBranch && i > 8 ? 2 : 1;
      await prisma.table.upsert({
        where: {
          branchId_tableNumber: {
            branchId: branch.id,
            tableNumber,
          },
        },
        update: {},
        create: {
          branchId: branch.id,
          tableNumber,
          capacity: i % 3 === 0 ? 6 : i % 2 === 0 ? 4 : 2,
          status: TableStatus.AVAILABLE,
          floor,
        },
      });
    }
  }

  const mainTable = await prisma.table.findFirst({
    where: { branchId: mainBranch.id, tableNumber: "01" },
  });

  const sampleReservation = await prisma.reservation.upsert({
    where: { id: "seed-reservation-001" },
    update: {},
    create: {
      id: "seed-reservation-001",
      customerId: customer.id,
      branchId: mainBranch.id,
      tableId: mainTable?.id,
      guestCount: 4,
      reservationDate: new Date("2026-06-01"),
      reservationTime: "19:00",
      status: ReservationStatus.CONFIRMED,
      notes: "Window seat preferred",
      depositAmount: 500,
    },
  });

  await prisma.payment.upsert({
    where: { id: "seed-payment-reservation-001" },
    update: {},
    create: {
      id: "seed-payment-reservation-001",
      bookingType: BookingType.RESERVATION,
      bookingId: sampleReservation.id,
      reservationId: sampleReservation.id,
      amount: 500,
      paymentMethod: PaymentMethod.PAYMONGO,
      paymentStatus: PaymentStatus.PAID,
      transactionId: "paymongo_seed_res_001",
    },
  });

  const sampleEventBooking = await prisma.eventBooking.upsert({
    where: { id: "seed-event-booking-001" },
    update: {},
    create: {
      id: "seed-event-booking-001",
      customerId: customer.id,
      venueId: skylineVenue.id,
      eventType: EventType.WEDDING,
      guestCount: 120,
      eventDate: new Date("2026-08-15"),
      startTime: "16:00",
      endTime: "23:00",
      status: EventBookingStatus.PENDING,
      packageId: "seed-pkg-gold",
      packageName: "Gold Wedding Package",
      totalPrice: 185000,
      depositAmount: 50000,
    },
  });

  await prisma.payment.upsert({
    where: { id: "seed-payment-event-001" },
    update: {},
    create: {
      id: "seed-payment-event-001",
      bookingType: BookingType.EVENT_BOOKING,
      bookingId: sampleEventBooking.id,
      eventBookingId: sampleEventBooking.id,
      amount: 50000,
      paymentMethod: PaymentMethod.PAYMONGO,
      paymentStatus: PaymentStatus.PENDING,
      transactionId: "paymongo_seed_evt_001",
    },
  });

  const notificationSeeds = [
    {
      id: "seed-notif-customer-001",
      userId: customer.id,
      title: "Reservation Confirmed",
      message: "Your table reservation on June 1, 2026 at 7:00 PM is confirmed.",
      isRead: false,
    },
    {
      id: "seed-notif-admin-001",
      userId: branchAdmin.id,
      title: "New Event Inquiry",
      message: `Wedding reception inquiry for Skyline Event Hall — ${sampleEventBooking.id}`,
      isRead: false,
    },
    {
      id: "seed-notif-super-001",
      userId: superAdmin.id,
      title: "System Ready",
      message: "RestaurantHub database seed completed successfully.",
      isRead: true,
    },
  ];

  for (const n of notificationSeeds) {
    await prisma.notification.upsert({
      where: { id: n.id },
      update: {},
      create: n,
    });
  }

  console.log("✅ Seed complete\n");
  console.log("Users (password: Password123!):");
  console.log(`  • ${superAdmin.email} (${superAdmin.role})`);
  console.log(`  • ${branchAdmin.email} (${branchAdmin.role})`);
  console.log(`  • ${staff.email} (${staff.role})`);
  console.log(`  • ${customer.email} (${customer.role})`);
  console.log("\nBranches:");
  console.log(`  • ${mainBranch.name} [main] — event venue: ${skylineVenue.name}`);
  console.log(`  • ${northBranch.name} [north]`);
  console.log(`  • ${southBranch.name} [south]`);
  console.log("\nSample records: 1 reservation, 1 event booking, 2 payments, 3 notifications");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
