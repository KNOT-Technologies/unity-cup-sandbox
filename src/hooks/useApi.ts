import useSWR from 'swr';
import { listOccurrences, getSeatMap, getPrices, createQuote, updateQuote, deleteQuote, getCreditBundles, getCreditBalance, getCreditTransactions, type QuoteRequest, type QuoteSeat, type PricingData } from '../api/knot';
import { useState, useEffect, useCallback, useRef } from 'react';
import type { QuoteState, UserType, SeatSelection } from '../types/tickets';

// SWR configuration with 30s cache and revalidate on window focus
const swrConfig = {
  dedupingInterval: 30000, // 30 seconds cache
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  errorRetryCount: 3,
  errorRetryInterval: 1000,
};

export function useSchedule(eventId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    eventId ? `/events/${eventId}/occurrences` : null,
    () => eventId ? listOccurrences(eventId) : null,
    swrConfig
  );

  return {
    occurrences: data || [],
    isLoading,
    error,
    refetch: mutate,
  };
}

export function useSeatMap(occurrenceId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    occurrenceId ? `/occurrences/${occurrenceId}/seatmap` : null,
    () => occurrenceId ? getSeatMap(occurrenceId) : null,
    swrConfig
  );

  return {
    seatMap: data,
    isLoading,
    error,
    refetch: mutate,
  };
}

export function usePrices(occurrenceId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    occurrenceId ? `/occurrences/${occurrenceId}/prices` : null,
    () => occurrenceId ? getPrices(occurrenceId) : null,
    swrConfig
  );

  const defaultPricing: PricingData = {
    localPrices: [],
    localCurrency: 'EGP',
    foreignPrices: [],
    foreignCurrency: 'USD'
  };

  return {
    pricingData: data || defaultPricing,
    // Backward compatibility - return all prices combined
    prices: data ? [...data.localPrices, ...data.foreignPrices] : [],
    isLoading,
    error,
    refetch: mutate,
  };
}

// Quote Management Hook
export function useQuote(occurrenceId: string | null) {
  const [quoteState, setQuoteState] = useState<QuoteState>({
    quote: null,
    isLoading: false,
    error: null,
    timeRemaining: 0,
  });

  const timeoutRef = useRef<number | undefined>(undefined);
  const refreshIntervalRef = useRef<number | undefined>(undefined);
  const debounceTimeoutRef = useRef<number | undefined>(undefined);

  // Load quote from sessionStorage on mount
  useEffect(() => {
    const savedQuoteId = sessionStorage.getItem('quoteId');
    const savedQuote = sessionStorage.getItem('quote');
    
    if (savedQuoteId && savedQuote && occurrenceId) {
      try {
        const parsedQuote = JSON.parse(savedQuote);
        const expiresAt = new Date(parsedQuote.expiresAt);
        const now = new Date();
        
        // Check if quote is still valid
        if (expiresAt > now && parsedQuote.occurrenceId === occurrenceId) {
          setQuoteState(prev => ({
            ...prev,
            quote: parsedQuote,
            timeRemaining: Math.floor((expiresAt.getTime() - now.getTime()) / 1000)
          }));
          startCountdown(expiresAt);
        } else {
          // Quote expired, clean up
          sessionStorage.removeItem('quoteId');
          sessionStorage.removeItem('quote');
        }
      } catch (error) {
        console.warn('Failed to restore quote from sessionStorage:', error);
        sessionStorage.removeItem('quoteId');
        sessionStorage.removeItem('quote');
      }
    }
  }, [occurrenceId]);

  const startCountdown = useCallback((expiresAt: Date) => {
    const updateCountdown = () => {
      const now = new Date();
      const timeLeft = Math.floor((expiresAt.getTime() - now.getTime()) / 1000);
      
      if (timeLeft <= 0) {
        // Quote expired
        setQuoteState(prev => ({
          ...prev,
          quote: null,
          timeRemaining: 0,
          error: 'Quote expired'
        }));
        sessionStorage.removeItem('quoteId');
        sessionStorage.removeItem('quote');
        clearInterval(refreshIntervalRef.current);
        return;
      }
      
      setQuoteState(prev => ({
        ...prev,
        timeRemaining: timeLeft
      }));
    };

    updateCountdown();
    timeoutRef.current = setInterval(updateCountdown, 1000);
  }, []);

  const createQuoteDebounced = useCallback(async (
    selections: SeatSelection[],
    userType: UserType
  ) => {
    if (!occurrenceId || selections.length === 0) {
      return;
    }

    // Clear existing debounce
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce for 200ms
    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        setQuoteState(prev => ({ ...prev, isLoading: true, error: null }));

        // Transform selections to API format with per-seat categories
        const seats: QuoteSeat[] = selections.map(selection => ({
          row: selection.seat.row,
          col: selection.seat.number,
          category: selection.ticketType
        }));

        const visitor = userType === 'tourist' ? 'foreign' as const : 'local' as const;

        const request: QuoteRequest = {
          seats,
          visitor
        };

        let quote;
        if (quoteState.quote) {
          // Update existing quote without resetting expiry
          quote = await updateQuote(quoteState.quote.quoteId, request);
        } else {
          quote = await createQuote(occurrenceId, request);
        }
        const expiresAt = new Date(quote.expiresAt);

        setQuoteState(prev => ({
          ...prev,
          quote,
          isLoading: false,
          error: null
        }));

        // Save/update sessionStorage
        sessionStorage.setItem('quoteId', quote.quoteId);
        sessionStorage.setItem('quote', JSON.stringify(quote));

        // Only start a new countdown if this is a brand-new quote
        if (!quoteState.quote) {
          startCountdown(expiresAt);
        }
      } catch (error: unknown) {
        console.error('Failed to create quote:', error);
        setQuoteState(prev => ({
          ...prev,
          isLoading: false,
          error: error && typeof error === 'object' && 'error' in error 
            ? String(error.error) 
            : 'Failed to create quote'
        }));
      }
    }, 200);
  }, [occurrenceId, startCountdown, quoteState.quote]);

  const cancelQuote = useCallback(async () => {
    if (!quoteState.quote) return;

    try {
      await deleteQuote(quoteState.quote.quoteId);
    } catch (error) {
      console.warn('Failed to delete quote on server:', error);
    } finally {
      // Clear local state regardless of API response
      setQuoteState({
        quote: null,
        isLoading: false,
        error: null,
        timeRemaining: 0
      });
      
      sessionStorage.removeItem('quoteId');
      sessionStorage.removeItem('quote');
      
      if (timeoutRef.current) {
        clearInterval(timeoutRef.current);
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    }
  }, [quoteState.quote]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearInterval(timeoutRef.current);
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...quoteState,
    createQuote: createQuoteDebounced,
    cancelQuote,
    hasActiveQuote: !!quoteState.quote && quoteState.timeRemaining > 0
  };
}

// Credit hooks
export function useCreditBundles() {
  const { data, error, isLoading, mutate } = useSWR(
    '/credit-bundles',
    getCreditBundles,
    swrConfig
  );

  return {
    bundles: data || [],
    isLoading,
    error,
    refetch: mutate,
  };
}

export function useCreditBalance() {
  const { data, error, isLoading, mutate } = useSWR(
    '/credits/balance',
    getCreditBalance,
    {
      ...swrConfig,
      refreshInterval: 10000, // Refresh every 10 seconds for real-time updates
    }
  );

  return {
    balance: data?.total || 0,
    items: data?.items || [],
    isLoading,
    error,
    refetch: mutate,
  };
}

export function useCreditTransactions(limit: number = 10) {
  const { data, error, isLoading, mutate } = useSWR(
    `/credits/transactions?limit=${limit}`,
    () => getCreditTransactions(limit),
    swrConfig
  );

  return {
    transactions: data || [],
    isLoading,
    error,
    refetch: mutate,
  };
} 
