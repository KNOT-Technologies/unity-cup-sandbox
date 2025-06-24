export type UserType = 'tourist' | 'local';
export type TicketType = 'adult' | 'child';
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

export const PRICING: Record<UserType, ZonePricing> = {
  tourist: {
    vip: {
      adult: 50,
      child: 30
    },
    regular: {
      adult: 30,
      child: 20
    }
  },
  local: {
    vip: {
      adult: 500,
      child: 300
    },
    regular: {
      adult: 300,
      child: 200
    }
  }
}; 