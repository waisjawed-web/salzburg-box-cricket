export type Court = {
  id: string;
  name: string;
  description: string;
  hourlyRate: number;
  features: string[];
};

export type Slot = {
  time: string;
  label: string;
  available: boolean;
  price: number;
  courtId: string;
};

export type Booking = {
  id: string;
  courtName: string;
  customerName: string;
  customerEmail: string;
  date: string;
  time: string;
  status: "Pending" | "Paid" | "Approved" | "Cancelled";
  amount: number;
};

export const courts: Court[] = [
  {
    id: "court-1",
    name: "Net 1 - Powerplay",
    description: "Fast indoor lane with bowling machine space and video review angle.",
    hourlyRate: 35,
    features: ["20m full run-up", "Bowling machine ready", "LED floodlights"]
  },
  {
    id: "court-2",
    name: "Net 2 - Yorker",
    description: "Compact training lane for private coaching and small-group practice.",
    hourlyRate: 30,
    features: ["Coaching zone", "Soft turf", "Beginner friendly"]
  },
  {
    id: "court-3",
    name: "Court 3 - Match Box",
    description: "Full box cricket court for 6v6 games, leagues, and corporate events.",
    hourlyRate: 55,
    features: ["6v6 court", "Digital scoreboard", "Tournament setup"]
  }
];

export const slots: Slot[] = [
  { time: "09:00", label: "09:00 - 10:00", available: true, price: 35, courtId: "court-1" },
  { time: "10:00", label: "10:00 - 11:00", available: false, price: 35, courtId: "court-1" },
  { time: "11:00", label: "11:00 - 12:00", available: true, price: 35, courtId: "court-1" },
  { time: "12:00", label: "12:00 - 13:00", available: true, price: 30, courtId: "court-2" },
  { time: "13:00", label: "13:00 - 14:00", available: false, price: 30, courtId: "court-2" },
  { time: "14:00", label: "14:00 - 15:00", available: true, price: 30, courtId: "court-2" },
  { time: "17:00", label: "17:00 - 18:00", available: true, price: 55, courtId: "court-3" },
  { time: "18:00", label: "18:00 - 19:00", available: false, price: 55, courtId: "court-3" },
  { time: "19:00", label: "19:00 - 20:00", available: true, price: 55, courtId: "court-3" },
  { time: "20:00", label: "20:00 - 21:00", available: true, price: 55, courtId: "court-3" }
];

export const bookings: Booking[] = [
  {
    id: "BKG-1024",
    courtName: "Court 3 - Match Box",
    customerName: "Ayaan Khan",
    customerEmail: "ayaan@example.com",
    date: "2026-07-03",
    time: "18:00 - 19:00",
    status: "Paid",
    amount: 55
  },
  {
    id: "BKG-1025",
    courtName: "Net 1 - Powerplay",
    customerName: "Mira Singh",
    customerEmail: "mira@example.com",
    date: "2026-07-04",
    time: "10:00 - 11:00",
    status: "Approved",
    amount: 35
  },
  {
    id: "BKG-1026",
    courtName: "Net 2 - Yorker",
    customerName: "Omar Latif",
    customerEmail: "omar@example.com",
    date: "2026-07-04",
    time: "13:00 - 14:00",
    status: "Pending",
    amount: 30
  }
];

export const tournaments = [
  {
    id: "summer-sixers",
    name: "Summer Sixers Cup",
    date: "2026-07-18",
    status: "Open",
    entryFee: 120,
    teams: 8,
    maxTeams: 12
  },
  {
    id: "corporate-night",
    name: "Corporate Night League",
    date: "2026-08-07",
    status: "Open",
    entryFee: 180,
    teams: 5,
    maxTeams: 8
  }
];

export const matches = [
  { court: "Court 3", time: "18:00", teams: "Salz Sixers vs Alpine Kings", status: "Upcoming" },
  { court: "Court 3", time: "19:15", teams: "Mozart Strikers vs River Bulls", status: "Upcoming" },
  { court: "Net 1", time: "20:30", teams: "Final practice slot", status: "Training" }
];

export const pricingPlans = [
  { name: "Net Practice", price: "from EUR 30/hr", detail: "One indoor net, ideal for batting or bowling sessions." },
  { name: "Match Court", price: "from EUR 55/hr", detail: "Full box court with scoreboard and match setup." },
  { name: "Team Night", price: "EUR 180", detail: "Three-hour group block for clubs and corporate teams." }
];

export const membershipPlans = [
  { name: "Starter", price: "EUR 39/mo", perks: ["2 priority bookings", "Member slot alerts", "10% net discount"] },
  { name: "Club", price: "EUR 89/mo", perks: ["6 monthly bookings", "Free tournament listing", "15% court discount"] },
  { name: "Elite", price: "EUR 149/mo", perks: ["Unlimited off-peak nets", "Coaching credits", "Private events access"] }
];
