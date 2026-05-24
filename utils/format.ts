import { format, parseISO } from "date-fns";

export function formatDate(date: Date | string, pattern = "PPP") {
  const value = typeof date === "string" ? parseISO(date) : date;
  return format(value, pattern);
}

export function formatCurrency(amount: number, currency = "PHP") {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatPhone(phone: string) {
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
}
