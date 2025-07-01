export type UserType = "tourist" | "local";
export type TicketType = "senior" | "adult" | "student" | "child";
export type SeatZone = "vip" | "regular";

// Define seat status as a const object
export const SeatStatus = {
  AVAILABLE: "available",
  SELECTED: "selected",
  UNAVAILABLE: "unavailable",
} as const;

// Derive the type from the const object
export type SeatStatus = (typeof SeatStatus)[keyof typeof SeatStatus];

export interface Seat {
  id: string;
  row: string;
  number: number;
  zone: SeatZone;
  status: SeatStatus;
}

export interface SelectedSeat extends Seat {
  ticketType: TicketType;
  price: number;
  guestInfo?: {
    name: string;
    email: string;
    age: number;
    visitorType: "local" | "foreign";
    translationNeeded: boolean;
    translationLanguage?: string;
    dateOfBirth?: string;
    gender?: "male" | "female";
    nationality?: string;
  };
}

export interface PricingTier {
  adult: number;
  child: number;
}

export interface ZonePricing {
  vip: PricingTier;
  regular: PricingTier;
}

export interface ShowTime {
  id: string;
  time: string;
  language: string;
}

// API-compatible occurrence type
export interface Occurrence {
  id: string;
  startAt: string;
  language: string;
  seatMapName: string;
  availableSeats: {
    vip: number;
    regular: number;
  };
  totalSeats: {
    vip: number;
    regular: number;
  };
}

export const PRICING = {
  tourist: {
    regular: {
      senior: 50,
      adult: 45,
      student: 40,
      child: 30,
    },
    vip: {
      senior: 80,
      adult: 75,
      student: 70,
      child: 60,
    },
  },
  local: {
    regular: {
      senior: 400,
      adult: 350,
      student: 300,
      child: 200,
    },
    vip: {
      senior: 700,
      adult: 650,
      student: 600,
      child: 500,
    },
  },
} as const;

// Quote Management Types
export interface QuoteData {
  quoteId: string;
  occurrenceId: string;
  expiresAt: string;
  lines: Array<{
    label: string;
    currency: string;
    amount: number;
  }>;
  total: {
    currency: string;
    amount: number;
  };
}

// NEW: Credit Quote Types
export interface CreditQuoteData {
  quoteId: string;
  occurrenceId: string;
  expiresAt: string;
  lines: Array<{
    label: string;
    credits: number;
  }>;
  visitor: "local" | "foreign";
  total: {
    credits: number;
  };
  paymentMethod: "credits";
}

export interface QuoteState {
  quote: QuoteData | null;
  isLoading: boolean;
  error: string | null;
  timeRemaining: number; // seconds
}

// NEW: Credit Quote State
export interface CreditQuoteState {
  quote: CreditQuoteData | null;
  isLoading: boolean;
  error: string | null;
  timeRemaining: number; // seconds
}

export interface SeatSelection {
  seat: Seat;
  ticketType: TicketType;
  price: number;
}

// Sprint 3 - Add-on Types
export interface AddonOption {
  code: string;
  label: string;
  extraCost?: number; // Make optional for backward compatibility
  prices?: {
    EGP: number;
    USD: number;
  };
}

export interface Addon {
  _id: string;
  name: string;
  type: string;
  quota?: number;
  options: AddonOption[];
}

export interface AddonSelection {
  seat: string;
  addonId: string;
  optionCode: string;
}

// Sprint 3 - Checkout Types
export interface CheckoutState {
  isLoading: boolean;
  error: string | null;
  paymobIframeUrl: string | null;
  pendingPaymentId: string | null;
}

export interface TicketDetails {
  id: string;
  seatNumber: string;
  seatClass: "vip" | "regular";
  ticketType: TicketType;
  qrCode: string;
  addons?: {
    name: string;
    option: string;
  }[];
}
