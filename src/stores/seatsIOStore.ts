import { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';

// Basic types (without imports to avoid dependency issues)
export interface SeatsIOSeat {
  id: string;
  label: string;
  category: string;
  price: number;
  status: 'available' | 'unavailable' | 'selected';
  seatType: 'seat' | 'table' | 'booth' | 'generalAdmission';
  extraData?: Record<string, unknown>;
}

export interface SeatsIOBasketItem {
  seatId: string;
  seatLabel: string;
  category: string;
  price: number;
  ticketType?: 'adult' | 'child' | 'senior' | 'student';
}

export interface SeatsIOBasket {
  items: SeatsIOBasketItem[];
  totalPrice: number;
  currency: string;
}

export interface SeatsIOError {
  type: 'config' | 'network' | 'chart' | 'selection' | 'hold';
  message: string;
  details?: unknown;
}

// State interface
export interface SeatsIOState {
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  holdToken: string | null;
  selectedSeats: SeatsIOSeat[];
  basket: SeatsIOBasket;
  chartInstance: any; // Using any to avoid SeatingChart import issues
}

// Action types
export type SeatsIOAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_HOLD_TOKEN'; payload: string | null }
  | { type: 'SET_SELECTED_SEATS'; payload: SeatsIOSeat[] }
  | { type: 'UPDATE_BASKET'; payload: SeatsIOBasket }
  | { type: 'SET_CHART_INSTANCE'; payload: any }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'RESET' }
  | { type: 'SET_INITIALIZED'; payload: boolean };

// Initial state
const initialState: SeatsIOState = {
  isLoading: false,
  isInitialized: false,
  error: null,
  holdToken: null,
  selectedSeats: [],
  basket: {
    items: [],
    totalPrice: 0,
    currency: 'USD',
  },
  chartInstance: null,
};

// Reducer
function seatsIOReducer(state: SeatsIOState, action: SeatsIOAction): SeatsIOState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_HOLD_TOKEN':
      return { ...state, holdToken: action.payload };
    
    case 'SET_SELECTED_SEATS':
      return { ...state, selectedSeats: action.payload };
    
    case 'UPDATE_BASKET':
      return { ...state, basket: action.payload };
    
    case 'SET_CHART_INSTANCE':
      return { ...state, chartInstance: action.payload };
    
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: action.payload };
    
    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedSeats: [],
        basket: {
          items: [],
          totalPrice: 0,
          currency: state.basket.currency,
        },
      };
    
    case 'RESET':
      return {
        ...initialState,
        // Preserve currency setting
        basket: {
          ...initialState.basket,
          currency: state.basket.currency,
        },
      };
    
    default:
      return state;
  }
}

// Context interface
export interface SeatsIOContextValue {
  state: SeatsIOState;
  actions: {
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setHoldToken: (token: string | null) => void;
    setSelectedSeats: (seats: SeatsIOSeat[]) => void;
    updateBasket: (basket: SeatsIOBasket) => void;
    setChartInstance: (chart: any) => void;
    setInitialized: (initialized: boolean) => void;
    clearSelection: () => void;
    reset: () => void;
    addSeatToBasket: (seat: SeatsIOSeat) => void;
    removeSeatFromBasket: (seatId: string) => void;
    calculateBasketTotal: () => void;
  };
}

// Context
const SeatsIOContext = createContext<SeatsIOContextValue | undefined>(undefined);

// Provider component
export interface SeatsIOProviderProps {
  children: ReactNode;
  initialCurrency?: string;
}

export function SeatsIOProvider({ children, initialCurrency = 'USD' }: SeatsIOProviderProps) {
  const [state, dispatch] = useReducer(seatsIOReducer, {
    ...initialState,
    basket: {
      ...initialState.basket,
      currency: initialCurrency,
    },
  });

  // Actions
  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const setHoldToken = useCallback((token: string | null) => {
    dispatch({ type: 'SET_HOLD_TOKEN', payload: token });
  }, []);

  const setSelectedSeats = useCallback((seats: SeatsIOSeat[]) => {
    dispatch({ type: 'SET_SELECTED_SEATS', payload: seats });
  }, []);

  const updateBasket = useCallback((basket: SeatsIOBasket) => {
    dispatch({ type: 'UPDATE_BASKET', payload: basket });
  }, []);

  const setChartInstance = useCallback((chart: any) => {
    dispatch({ type: 'SET_CHART_INSTANCE', payload: chart });
  }, []);

  const setInitialized = useCallback((initialized: boolean) => {
    dispatch({ type: 'SET_INITIALIZED', payload: initialized });
  }, []);

  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  // Helper action to add a seat to the basket
  const addSeatToBasket = useCallback((seat: SeatsIOSeat) => {
    const basketItem: SeatsIOBasketItem = {
      seatId: seat.id,
      seatLabel: seat.label,
      category: seat.category,
      price: seat.price,
      ticketType: 'adult', // Default, can be customized
    };

    const newBasket: SeatsIOBasket = {
      items: [...state.basket.items, basketItem],
      totalPrice: state.basket.totalPrice + seat.price,
      currency: state.basket.currency,
    };

    dispatch({ type: 'UPDATE_BASKET', payload: newBasket });
  }, [state.basket]);

  // Helper action to remove a seat from the basket
  const removeSeatFromBasket = useCallback((seatId: string) => {
    const itemToRemove = state.basket.items.find(item => item.seatId === seatId);
    if (!itemToRemove) return;

    const newBasket: SeatsIOBasket = {
      items: state.basket.items.filter(item => item.seatId !== seatId),
      totalPrice: state.basket.totalPrice - itemToRemove.price,
      currency: state.basket.currency,
    };

    dispatch({ type: 'UPDATE_BASKET', payload: newBasket });
  }, [state.basket]);

  // Helper action to recalculate basket total
  const calculateBasketTotal = useCallback(() => {
    const totalPrice = state.basket.items.reduce((sum, item) => sum + item.price, 0);
    const newBasket: SeatsIOBasket = {
      ...state.basket,
      totalPrice,
    };

    dispatch({ type: 'UPDATE_BASKET', payload: newBasket });
  }, [state.basket]);

  const contextValue: SeatsIOContextValue = {
    state,
    actions: {
      setLoading,
      setError,
      setHoldToken,
      setSelectedSeats,
      updateBasket,
      setChartInstance,
      setInitialized,
      clearSelection,
      reset,
      addSeatToBasket,
      removeSeatFromBasket,
      calculateBasketTotal,
    },
  };

  return (
    <SeatsIOContext.Provider value={contextValue}>
      {children}
    </SeatsIOContext.Provider>
  );
}

// Hook to use the context
export function useSeatsIO() {
  const context = useContext(SeatsIOContext);
  if (context === undefined) {
    throw new Error('useSeatsIO must be used within a SeatsIOProvider');
  }
  return context;
}

// Selectors for common state derivations
export const useSeatsIOSelectors = () => {
  const { state } = useSeatsIO();

  const isBasketEmpty = state.basket.items.length === 0;
  const selectedSeatsCount = state.selectedSeats.length;
  const hasError = state.error !== null;
  const isReady = state.isInitialized && !state.isLoading && !hasError;
  const canCheckout = isReady && !isBasketEmpty && state.holdToken !== null;

  return {
    isBasketEmpty,
    selectedSeatsCount,
    hasError,
    isReady,
    canCheckout,
  };
};

// Utility functions
export const seatsIOUtils = {
  // Convert seat to basket item
  seatToBasketItem: (seat: SeatsIOSeat, ticketType: SeatsIOBasketItem['ticketType'] = 'adult'): SeatsIOBasketItem => ({
    seatId: seat.id,
    seatLabel: seat.label,
    category: seat.category,
    price: seat.price,
    ticketType,
  }),

  // Calculate total price from seats
  calculateTotalPrice: (seats: SeatsIOSeat[]): number => {
    return seats.reduce((sum, seat) => sum + seat.price, 0);
  },

  // Format price for display
  formatPrice: (price: number, currency: string): string => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    });
    return formatter.format(price);
  },

  // Check if seat is selected
  isSeatSelected: (seat: SeatsIOSeat, selectedSeats: SeatsIOSeat[]): boolean => {
    return selectedSeats.some(s => s.id === seat.id);
  },

  // Group seats by category
  groupSeatsByCategory: (seats: SeatsIOSeat[]): Record<string, SeatsIOSeat[]> => {
    return seats.reduce((groups, seat) => {
      const category = seat.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(seat);
      return groups;
    }, {} as Record<string, SeatsIOSeat[]>);
  },

  // Validate seat selection
  validateSelection: (seats: SeatsIOSeat[], rules?: { minSeats?: number; maxSeats?: number }): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const minSeats = rules?.minSeats || 1;
    const maxSeats = rules?.maxSeats || 10;

    if (seats.length < minSeats) {
      errors.push(`Please select at least ${minSeats} seat${minSeats > 1 ? 's' : ''}`);
    }

    if (seats.length > maxSeats) {
      errors.push(`Please select no more than ${maxSeats} seat${maxSeats > 1 ? 's' : ''}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};

// Export types for use in other files
export type { SeatsIOContextValue, SeatsIOProviderProps }; 
