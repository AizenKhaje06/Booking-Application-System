/** Opening hours JSON shape stored on `Branch.openingHours` */
export type DayHours = {
  open: string;
  close: string;
  closed?: boolean;
};

export type OpeningHours = {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
};

export const DEFAULT_OPENING_HOURS: OpeningHours = {
  monday: { open: "10:00", close: "22:00" },
  tuesday: { open: "10:00", close: "22:00" },
  wednesday: { open: "10:00", close: "22:00" },
  thursday: { open: "10:00", close: "22:00" },
  friday: { open: "10:00", close: "23:00" },
  saturday: { open: "09:00", close: "23:00" },
  sunday: { open: "09:00", close: "21:00" },
};
