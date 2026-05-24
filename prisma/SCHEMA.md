# RestaurantHub — Database Schema (Step 2)

## Entity Relationship Overview

```
User ──┬──< Reservation >── Branch
       │         │
       │         └── Table
       ├──< EventBooking >── EventVenue ── Branch
       └──< Notification

Reservation ──< Payment
EventBooking  ──< Payment
```

## Tables

| #   | Model          | Table            | Key fields                                      |
| --- | -------------- | ---------------- | ----------------------------------------------- |
| 1   | `User`         | `users`          | email, password, role                           |
| 2   | `Branch`       | `branches`       | slug, openingHours (JSON), isMainBranch         |
| 3   | `Table`        | `tables`         | tableNumber, capacity, status, floor            |
| 4   | `Reservation`  | `reservations`   | customerId, reservationDate/Time, depositAmount |
| 5   | `EventVenue`   | `event_venues`   | branchId, capacity, price                       |
| 6   | `EventBooking` | `event_bookings` | eventType, packageName, totalPrice              |
| 7   | `Payment`      | `payments`       | bookingType + bookingId (polymorphic)           |
| 8   | `Notification` | `notifications`  | userId, isRead                                  |

## Enums

- **UserRole**: `SUPER_ADMIN`, `BRANCH_ADMIN`, `STAFF`, `CUSTOMER`
- **TableStatus**: `AVAILABLE`, `OCCUPIED`, `RESERVED`, `MAINTENANCE`
- **ReservationStatus**: `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`, `NO_SHOW`
- **EventBookingStatus**: `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`
- **BookingType**: `RESERVATION`, `EVENT_BOOKING`
- **PaymentMethod**: `CARD`, `GCASH`, `PAYMAYA`, `CASH`, `BANK_TRANSFER`, `PAYMONGO`
- **PaymentStatus**: `PENDING`, `PAID`, `FAILED`, `REFUNDED`, `CANCELLED`

## Cascade rules

| Parent deleted             | Children                                                        |
| -------------------------- | --------------------------------------------------------------- |
| User                       | reservations, event bookings, notifications, accounts, sessions |
| Branch                     | tables, reservations, event venues                              |
| EventVenue                 | event bookings                                                  |
| Reservation / EventBooking | linked payments                                                 |

`Reservation.tableId` → **SetNull** when a table is removed.

## Apply schema

```bash
npm run db:push      # dev / prototype
npm run db:migrate   # production migrations
npm run db:seed
```
