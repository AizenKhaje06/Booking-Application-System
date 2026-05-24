export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "RestaurantHub";

export const BRANCHES = {
  MAIN: {
    slug: "main" as const,
    label: "Main Branch",
    tagline: "Flagship dining & 2nd-floor event venue",
  },
  NORTH: {
    slug: "north" as const,
    label: "North Branch",
    tagline: "Harbor views & weekend brunch",
  },
  SOUTH: {
    slug: "south" as const,
    label: "South Branch",
    tagline: "Garden lane bistro experience",
  },
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/branches", label: "Branches" },
  { href: "/reservations", label: "Reservations" },
  { href: "/events", label: "Event Venue" },
] as const;

export const ADMIN_NAV_LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/reservations", label: "Reservations" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/branches", label: "Branches" },
  { href: "/admin/tables", label: "Tables" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/notifications", label: "Notifications" },
] as const;
