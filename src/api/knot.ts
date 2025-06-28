const API_BASE_URL = import.meta.env.VITE_KNOT_API_BASE || 'http://localhost:5000';

// API Response Types based on the actual backend response
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

export interface OccurrencesResponse {
  success: boolean;
  message: string;
  occurrences: Occurrence[];
}

export interface SeatMapData {
  grid: Array<{
    row: string;
    col: number;
    class: 'vip' | 'regular';
    _id: string;
  }>;
  takenSeats: string[];
  vipAvailable: number;
  regularAvailable: number;
}

export interface SeatMapResponse {
  success: boolean;
  message: string;
  seatMap: SeatMapData;
}

export interface PriceItem {
  visitor: 'foreign' | 'local';
  category: 'senior' | 'adult' | 'student' | 'child';
  seatClass: 'vip' | 'regular';
  amount: number;
  _id: string;
}

export interface PriceMatrix {
  _id: string;
  currency: string;
  prices: PriceItem[];
}

export interface PricesResponse {
  success: boolean;
  message: string;
  priceMatrix?: PriceMatrix;
  foreignPriceMatrix?: PriceMatrix;
}

// Quote Management Types
export interface QuoteRequest {
  seats: Array<{ row: string; col: number }>;
  visitor: 'foreign' | 'local';
  category: 'senior' | 'adult' | 'student' | 'child';
}

export interface QuoteLine {
  label: string;
  currency: string;
  amount: number;
}

export interface QuoteTotal {
  currency: string;
  amount: number;
}

export interface Quote {
  quoteId: string;
  occurrenceId: string;
  expiresAt: string;
  lines: QuoteLine[];
  total: QuoteTotal;
}

export interface QuoteResponse {
  success: boolean;
  quote?: Quote;
  error?: string;
  seat?: string; // For seat conflict errors
}

export interface RefreshResponse {
  success: boolean;
  expiresAt?: string;
  error?: string;
}

// Add-on Types (New for Sprint 3)
export interface AddonOption {
  code: string;
  label: string;
  extraCost: number;
}

export interface Addon {
  _id: string;
  name: string;
  type: string;
  quota?: number;
  options: AddonOption[];
}

export interface AddonsResponse {
  success: boolean;
  message: string;
  addons: Addon[];
}

export interface AddonSelection {
  seat: string;
  addonId: string;
  optionCode: string;
}

// Checkout Types (New for Sprint 3)
export interface CheckoutRequest {
  quoteId: string;
  paymentMethod: 'card';
  email: string;
  userName: string;
  dateOfBirth: string;
  nationality: string;
  redirectionUrl?: string;
  addons?: AddonSelection[];
}

export interface CheckoutResponse {
  success: boolean;
  message: string;
  clientSecret: string;
  publicKey: string;
}

// Tickets API Types
export interface TicketInfo {
  id: string;
  seatNumber: string;
  seatClass: 'vip' | 'regular';
  ticketType: 'senior' | 'adult' | 'student' | 'child';
  qrCode: string;
  addons?: Array<{
    name: string;
    option: string;
  }>;
}

export interface TicketsResponse {
  success: boolean;
  message: string;
  tickets: TicketInfo[];
  email: string;
  totalAmount: number;
  currency: string;
}

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

async function apiRequest<T>(endpoint: string): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new APIError(response.status, `API request failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(0, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function apiRequestWithBody<T>(endpoint: string, options: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(response.status, errorData.error || `API request failed: ${response.statusText}`);
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(0, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function listOccurrences(eventId: string): Promise<Occurrence[]> {
  const response = await apiRequest<OccurrencesResponse>(`/api/v3/events/${eventId}/occurrences`);
  return response.occurrences;
}

export async function getSeatMap(occurrenceId: string): Promise<SeatMapData> {
  const response = await apiRequest<SeatMapResponse>(`/api/v3/occurrences/${occurrenceId}/seatmap`);
  return response.seatMap;
}

export interface PricingData {
  localPrices: PriceItem[];
  localCurrency: string;
  foreignPrices: PriceItem[];
  foreignCurrency: string;
}

export async function getPrices(occurrenceId: string): Promise<PricingData> {
  const response = await apiRequest<PricesResponse>(`/api/v3/occurrences/${occurrenceId}/prices`);
  
  return {
    localPrices: response.priceMatrix?.prices || [],
    localCurrency: response.priceMatrix?.currency || 'EGP',
    foreignPrices: response.foreignPriceMatrix?.prices || [],
    foreignCurrency: response.foreignPriceMatrix?.currency || 'USD'
  };
}

// Quote Management API Functions
export async function createQuote(occurrenceId: string, request: QuoteRequest): Promise<Quote> {
  try {
    const response = await apiRequestWithBody<Quote>(`/api/v3/occurrences/${occurrenceId}/quote`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return response;
  } catch (error) {
    if (error instanceof APIError) {
      // Transform API errors to our expected format
      throw {
        status: error.status,
        error: error.message,
        seat: error.message.includes('SEAT_ALREADY_TAKEN') ? 
               error.message.split('seat": "')[1]?.split('"')[0] : undefined
      };
    }
    throw error;
  }
}

export async function refreshQuote(quoteId: string): Promise<string> {
  try {
    const response = await apiRequestWithBody<RefreshResponse>(`/api/v3/quotes/${quoteId}/refresh`, {
      method: 'PUT',
    });
    return response.expiresAt || '';
  } catch (error) {
    if (error instanceof APIError) {
      throw {
        status: error.status,
        error: error.message
      };
    }
    throw error;
  }
}

export async function deleteQuote(quoteId: string): Promise<void> {
  try {
    await apiRequestWithBody<void>(`/api/v3/quotes/${quoteId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    if (error instanceof APIError) {
      throw {
        status: error.status,
        error: error.message
      };
    }
    throw error;
  }
}

// Add-on Management API Functions (New for Sprint 3)
export async function getAddons(occurrenceId: string): Promise<Addon[]> {
  try {
    const response = await apiRequest<AddonsResponse>(`/api/v3/occurrences/${occurrenceId}/addons`);
    return response.addons;
  } catch (error) {
    if (error instanceof APIError) {
      throw {
        status: error.status,
        error: error.message
      };
    }
    throw error;
  }
}

// Checkout API Function (New for Sprint 3)
export async function processCheckout(request: CheckoutRequest): Promise<CheckoutResponse> {
  try {
    const response = await apiRequestWithBody<CheckoutResponse>('/api/v3/checkout', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return response;
  } catch (error) {
    if (error instanceof APIError) {
      throw {
        status: error.status,
        error: error.message
      };
    }
    throw error;
  }
}

// Tickets API Function (Get tickets by payment ID)
export async function getTicketsByPaymentId(paymentId: string): Promise<TicketsResponse> {
  try {
    const response = await apiRequest<TicketsResponse>(`/api/v3/payments/${paymentId}/tickets`);
    return response;
  } catch (error) {
    if (error instanceof APIError) {
      throw {
        status: error.status,
        error: error.message
      };
    }
    throw error;
  }
} 
