export type UserType = 'tourist' | 'local';
export type TicketType = 'senior' | 'student' | 'child';
export type SeatZone = 'vip' | 'regular';

// Define seat status as a const object
export const SeatStatus = {
  AVAILABLE: 'available',
  SELECTED: 'selected',
  UNAVAILABLE: 'unavailable'
} as const;

// Derive the type from the const object
export type SeatStatus = typeof SeatStatus[keyof typeof SeatStatus];

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

export const PRICING = {
  tourist: {
    regular: {
      senior: 50,
      student: 40,
      child: 30
    },
    vip: {
      senior: 80,
      student: 70,
      child: 60
    }
  },
  local: {
    regular: {
      senior: 400,
      student: 300,
      child: 200
    },
    vip: {
      senior: 700,
      student: 600,
      child: 500
    }
  }
} as const; 