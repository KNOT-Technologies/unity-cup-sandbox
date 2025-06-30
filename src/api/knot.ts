const API_BASE_URL =
  import.meta.env.VITE_KNOT_API_BASE || "http://localhost:5000";

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
    class: "vip" | "regular";
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
  visitor: "foreign" | "local";
  category: "senior" | "adult" | "student" | "child";
  seatClass: "vip" | "regular";
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
// Updated for per-seat categories
export interface QuoteSeat {
  row: string;
  col: number;
  category: "senior" | "adult" | "student" | "child";
}

export interface QuoteRequest {
  seats: QuoteSeat[];
  visitor: "foreign" | "local";
  // `category` kept optional for backward compatibility; will be ignored by backend
  category?: "senior" | "adult" | "student" | "child";
}

// NEW: Credit-based quote request
export interface CreditQuoteRequest {
  seats: QuoteSeat[];
  paymentMethod: "credits";
  visitor: "local" | "foreign";
}

export interface QuoteLine {
  label: string;
  currency: string;
  amount: number;
}

// NEW: Credit quote line (credits instead of currency)
export interface CreditQuoteLine {
  label: string;
  credits: number;
}

export interface QuoteTotal {
  currency: string;
  amount: number;
}

// NEW: Credit quote total
export interface CreditQuoteTotal {
  credits: number;
}

export interface Quote {
  quoteId: string;
  occurrenceId: string;
  expiresAt: string;
  lines: QuoteLine[];
  total: QuoteTotal;
}

// NEW: Credit-based quote
export interface CreditQuote {
  quoteId: string;
  occurrenceId: string;
  expiresAt: string;
  lines: CreditQuoteLine[];
  visitor: "local" | "foreign";
  total: CreditQuoteTotal;
  paymentMethod: "credits";
}

// NEW: Credit pricing matrix (similar to price matrix but for credits)
export interface CreditPriceItem {
  visitor: "local" | "foreign";
  category: "senior" | "adult" | "student" | "child";
  seatClass: "vip" | "regular";
  credits: number;
  _id: string;
}

export interface CreditPriceMatrix {
  _id: string;
  eventId: string;
  prices: CreditPriceItem[];
}

export interface CreditPricesResponse {
  success: boolean;
  message: string;
  creditPrices: CreditPriceMatrix;
}

export interface QuoteResponse {
  success: boolean;
  quote?: Quote;
  error?: string;
  seat?: string; // For seat conflict errors
}

// NEW: Credit quote response
export interface CreditQuoteResponse {
  success: boolean;
  quote?: CreditQuote;
  error?: string;
  seat?: string;
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

// Checkout Types (Updated for multi-ticket-holder support)
export interface TicketHolderInfo {
  fullName: string;
  dateOfBirth: string; // ISO-8601 date string
  nationality: string;
  email: string;
}

// Checkout Types (New for Sprint 3)
export interface CheckoutRequest {
  quoteId: string;
  paymentMethod: "card";
  ticketHolders: TicketHolderInfo[];
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
  seatClass: "vip" | "regular";
  ticketType: "senior" | "adult" | "student" | "child";
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
    this.name = "APIError";
  }
}

async function apiRequest<T>(endpoint: string): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new APIError(
        response.status,
        `API request failed: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      0,
      `Network error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

async function apiRequestWithBody<T>(
  endpoint: string,
  options: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        response.status,
        errorData.error || `API request failed: ${response.statusText}`
      );
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
    throw new APIError(
      0,
      `Network error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function listOccurrences(eventId: string): Promise<Occurrence[]> {
  const response = await apiRequest<OccurrencesResponse>(
    `/api/v3/events/${eventId}/occurrences`
  );
  return response.occurrences;
}

export async function getSeatMap(occurrenceId: string): Promise<SeatMapData> {
  const response = await apiRequest<SeatMapResponse>(
    `/api/v3/occurrences/${occurrenceId}/seatmap`
  );
  return response.seatMap;
}

export interface PricingData {
  localPrices: PriceItem[];
  localCurrency: string;
  foreignPrices: PriceItem[];
  foreignCurrency: string;
}

export async function getPrices(occurrenceId: string): Promise<PricingData> {
  const response = await apiRequest<PricesResponse>(
    `/api/v3/occurrences/${occurrenceId}/prices`
  );

  return {
    localPrices: response.priceMatrix?.prices || [],
    localCurrency: response.priceMatrix?.currency || "EGP",
    foreignPrices: response.foreignPriceMatrix?.prices || [],
    foreignCurrency: response.foreignPriceMatrix?.currency || "USD",
  };
}

// NEW: Get credit pricing for an occurrence
export async function getCreditPrices(occurrenceId: string): Promise<CreditPriceMatrix> {
  const response = await authenticatedApiRequest<CreditPricesResponse>(
    `/api/v3/occurrences/${occurrenceId}/credit-prices`
  );
  return response.creditPrices;
}

// Quote Management API Functions
export async function createQuote(
  occurrenceId: string,
  request: QuoteRequest
): Promise<Quote> {
  try {
    const response = await apiRequestWithBody<Quote>(
      `/api/v3/occurrences/${occurrenceId}/quote`,
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
    return response;
  } catch (error) {
    if (error instanceof APIError) {
      // Transform API errors to our expected format
      throw {
        status: error.status,
        error: error.message,
        seat: error.message.includes("SEAT_ALREADY_TAKEN")
          ? error.message.split('seat": "')[1]?.split('"')[0]
          : undefined,
      };
    }
    throw error;
  }
}

// New: modify existing quote without resetting expiry
export async function updateQuote(
  quoteId: string,
  request: QuoteRequest
): Promise<Quote> {
  try {
    const response = await apiRequestWithBody<Quote>(
      `/api/v3/quotes/${quoteId}`,
      {
        method: "PUT",
        body: JSON.stringify(request),
      }
    );
    return response;
  } catch (error) {
    if (error instanceof APIError) {
      throw {
        status: error.status,
        error: error.message,
        seat: error.message.includes("SEAT_ALREADY_TAKEN")
          ? error.message.split('seat": "')[1]?.split('"')[0]
          : undefined,
      };
    }
    throw error;
  }
}

export async function refreshQuote(quoteId: string): Promise<string> {
  try {
    const response = await apiRequestWithBody<RefreshResponse>(
      `/api/v3/quotes/${quoteId}/refresh`,
      {
        method: "PUT",
      }
    );
    return response.expiresAt || "";
  } catch (error) {
    if (error instanceof APIError) {
      throw {
        status: error.status,
        error: error.message,
      };
    }
    throw error;
  }
}

export async function deleteQuote(quoteId: string): Promise<void> {
  try {
    await apiRequestWithBody<void>(`/api/v3/quotes/${quoteId}`, {
      method: "DELETE",
    });
  } catch (error) {
    if (error instanceof APIError) {
      throw {
        status: error.status,
        error: error.message,
      };
    }
    throw error;
  }
}

// NEW: Credit Quote Management API Functions
export async function createCreditQuote(
  occurrenceId: string,
  request: CreditQuoteRequest
): Promise<CreditQuote> {
  try {
    const response = await authenticatedApiRequestWithBody<CreditQuote>(
      `/api/v3/occurrences/${occurrenceId}/credit-quote`,
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
    return response;
  } catch (error) {
    if (error instanceof APIError) {
      throw {
        status: error.status,
        error: error.message,
        seat: error.message.includes("SEAT_ALREADY_TAKEN")
          ? error.message.split('seat": "')[1]?.split('"')[0]
          : undefined,
      };
    }
    throw error;
  }
}

export async function updateCreditQuote(
  quoteId: string,
  request: CreditQuoteRequest
): Promise<CreditQuote> {
  try {
    const response = await authenticatedApiRequestWithBody<CreditQuote>(
      `/api/v3/credit-quotes/${quoteId}`,
      {
        method: "PUT",
        body: JSON.stringify(request),
      }
    );
    return response;
  } catch (error) {
    if (error instanceof APIError) {
      throw {
        status: error.status,
        error: error.message,
        seat: error.message.includes("SEAT_ALREADY_TAKEN")
          ? error.message.split('seat": "')[1]?.split('"')[0]
          : undefined,
      };
    }
    throw error;
  }
}

export async function deleteCreditQuote(quoteId: string): Promise<void> {
  try {
    await authenticatedApiRequestWithBody<void>(
      `/api/v3/credit-quotes/${quoteId}`,
      {
        method: "DELETE",
      }
    );
  } catch (error) {
    if (error instanceof APIError) {
      throw {
        status: error.status,
        error: error.message,
      };
    }
    throw error;
  }
}

// Add-on Management API Functions (New for Sprint 3)
export async function getAddons(occurrenceId: string): Promise<Addon[]> {
  try {
    const response = await apiRequest<AddonsResponse>(
      `/api/v3/occurrences/${occurrenceId}/addons`
    );
    return response.addons;
  } catch (error) {
    if (error instanceof APIError) {
      throw {
        status: error.status,
        error: error.message,
      };
    }
    throw error;
  }
}

// Checkout API Function (New for Sprint 3)
export async function processCheckout(
  request: CheckoutRequest
): Promise<CheckoutResponse> {
  try {
    const response = await apiRequestWithBody<CheckoutResponse>(
      "/api/v3/checkout",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
    return response;
  } catch (error) {
    if (error instanceof APIError) {
      throw {
        status: error.status,
        error: error.message,
      };
    }
    throw error;
  }
}

// Tickets API Function (Get tickets by payment ID)
export async function getTicketsByPaymentId(
  paymentId: string
): Promise<TicketsResponse> {
  try {
    const response = await apiRequest<TicketsResponse>(
      `/api/v3/payments/${paymentId}/tickets`
    );
    return response;
  } catch (error) {
    if (error instanceof APIError) {
      throw {
        status: error.status,
        error: error.message,
      };
    }
    throw error;
  }
}

// Add credit-related types and functions at the end of the file

// Credit system types
export interface CreditBundle {
  id: string;
  credits: number;
  expiryMonths: number;
  price: number;
  pricePerCredit: number;
  discount: number;
  currency: string;
}

// Backend response structure
export interface BackendCreditBundle {
  _id: string;
  credits: number;
  price: number;
  currency: string;
  expiresAfterMonths: number;
}

export interface CreditBundlesResponse {
  success: boolean;
  message: string;
  bundles: BackendCreditBundle[];
}

export interface CreditPurchaseResponse {
  success: boolean;
  clientSecret: string;
  publicKey: string;
}

export interface CreditBalance {
  credits: number;
  expiresAt: string;
}

export interface CreditBalanceResponse {
  success: boolean;
  total: number;
  items: CreditBalance[];
}

export interface CreditTransaction {
  id: string;
  date: string;
  credits: number;
  amount?: number;
  type: "purchase" | "redemption";
  description: string;
}

export interface CreditTransactionsResponse {
  success: boolean;
  transactions: CreditTransaction[];
}

export interface CreditCheckoutRequest {
  quoteId: string;
  paymentMethod: "credits";
  addons?: AddonSelection[];
}

export interface CreditCheckoutResponse {
  success: boolean;
  tickets: TicketInfo[];
  remainingCredits: number;
}

// Add authentication helper
function getAuthHeaders(): Record<string, string> {
  const token =
    localStorage.getItem("authToken") || localStorage.getItem("jwt");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

// Update existing API functions to include auth headers
async function authenticatedApiRequest<T>(endpoint: string): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (response.status === 403) {
      // Redirect to login on 403
      window.location.href = "/business/login";
      throw new APIError(403, "Authentication required");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        response.status,
        errorData.error ||
          errorData.message ||
          `API request failed: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      0,
      `Network error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

async function authenticatedApiRequestWithBody<T>(
  endpoint: string,
  options: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: getAuthHeaders(),
      ...options,
    });

    if (response.status === 403) {
      // Redirect to login on 403
      window.location.href = "/business/login";
      throw new APIError(403, "Authentication required");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        response.status,
        errorData.error ||
          errorData.message ||
          `API request failed: ${response.statusText}`
      );
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
    throw new APIError(
      0,
      `Network error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// Credit API functions
export async function getCreditBundles(): Promise<CreditBundle[]> {
  const response = await authenticatedApiRequest<CreditBundlesResponse>(
    "/api/v3/credit-bundles"
  );

  // Transform backend response to frontend format
  return response.bundles.map((bundle) => {
    const pricePerCredit = bundle.price / bundle.credits;

    // Calculate discount based on price per credit (lower price per credit = higher discount)
    // This is a simple heuristic - you might want to adjust this logic
    const basePricePerCredit = 4.5; // Assuming 4.5 is the base price
    const discount = Math.max(
      0,
      Math.round(
        ((basePricePerCredit - pricePerCredit) / basePricePerCredit) * 100
      )
    );

    return {
      id: bundle._id,
      credits: bundle.credits,
      expiryMonths: bundle.expiresAfterMonths,
      price: bundle.price,
      pricePerCredit: Math.round(pricePerCredit * 100) / 100, // Round to 2 decimal places
      discount,
      currency: bundle.currency,
    };
  });
}

export async function purchaseCreditBundle(
  bundleId: string
): Promise<CreditPurchaseResponse> {
  return await authenticatedApiRequestWithBody<CreditPurchaseResponse>(
    `/api/v3/credit-bundles/${bundleId}/purchase`,
    {
      method: "POST",
      body: JSON.stringify({
        redirectionUrl: `${window.location.origin}/business/credit-success`,
      }),
    }
  );
}

export async function getCreditBalance(): Promise<CreditBalanceResponse> {
  return await authenticatedApiRequest<CreditBalanceResponse>(
    "/api/v3/credits/balance"
  );
}

export async function getCreditTransactions(
  limit: number = 10
): Promise<CreditTransaction[]> {
  const response = await authenticatedApiRequest<CreditTransactionsResponse>(
    `/api/v3/credits/transactions?limit=${limit}`
  );
  return response.transactions;
}

export async function checkoutWithCredits(
  request: CreditCheckoutRequest
): Promise<CreditCheckoutResponse> {
  return await authenticatedApiRequestWithBody<CreditCheckoutResponse>(
    "/api/v3/checkout",
    {
      method: "POST",
      body: JSON.stringify(request),
    }
  );
}
