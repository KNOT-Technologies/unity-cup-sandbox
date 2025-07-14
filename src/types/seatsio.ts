// SeatsIO TypeScript definitions
// These types complement the official @seatsio/seatsio-react types

// Import only the types that actually exist in @seatsio/seatsio-react
export type { 
  SeatingChart, 
  SelectableObject, 
  Pricing, 
  HoldToken,
  GeneralAdmissionArea,
} from '@seatsio/seatsio-react';

// Define our own types for the application
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

export interface SeatsIOCallbacks {
  onSelect?: (seat: SeatsIOSeat) => void;
  onDeselect?: (seat: SeatsIOSeat) => void;
  onSelectionChange?: (selectedSeats: SeatsIOSeat[]) => void;
  onBasketChange?: (basket: SeatsIOBasket) => void;
  onChartReady?: () => void;
  onError?: (error: Error) => void;
}

export interface SeatsIOConfig {
  workspaceKey: string;
  event: string;
  holdToken?: string;
  region?: 'eu' | 'na' | 'sa' | 'oc';
  language?: string;
  currency?: string;
  pricing?: Pricing;
  callbacks?: SeatsIOCallbacks;
}

export interface SeatsIOCheckoutData {
  selectedSeats: SeatsIOSeat[];
  holdToken: string;
  totalPrice: number;
  currency: string;
}

// State management types
export interface SeatsIOState {
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  holdToken: string | null;
  selectedSeats: SeatsIOSeat[];
  basket: SeatsIOBasket;
  chartInstance: SeatingChart | null;
}

export interface SeatsIOActions {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHoldToken: (token: string | null) => void;
  setSelectedSeats: (seats: SeatsIOSeat[]) => void;
  updateBasket: (basket: SeatsIOBasket) => void;
  setChartInstance: (chart: SeatingChart | null) => void;
  clearSelection: () => void;
  reset: () => void;
}

// Component props
export interface SeatsIOChartProps {
  eventKey: string;
  className?: string;
  style?: React.CSSProperties;
  onSelect?: (seat: SeatsIOSeat) => void;
  onDeselect?: (seat: SeatsIOSeat) => void;
  onSelectionChange?: (selectedSeats: SeatsIOSeat[]) => void;
  onBasketChange?: (basket: SeatsIOBasket) => void;
  onChartReady?: () => void;
  onError?: (error: Error) => void;
  config?: Partial<SeatsIOConfig>;
}

// Environment variable validation
export interface SeatsIOEnvironment {
  publicKey: string | null;
  isValid: boolean;
  error?: string;
}

// Utility types
export type SeatsIOStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface SeatsIOError {
  type: 'config' | 'network' | 'chart' | 'selection' | 'hold';
  message: string;
  details?: unknown;
}

// Global seats.io types augmentation
declare global {
  interface Window {
    seatsio?: {
      SeatingChart: new (config: SeatsIOConfig) => SeatingChart;
      chartJsVersion: string;
    };
  }
}

// Script loading types
export interface SeatsIOScriptStatus {
  loaded: boolean;
  loading: boolean;
  error: Error | null;
}

export interface SeatsIOScriptLoader {
  load: () => Promise<void>;
  unload: () => void;
  getStatus: () => SeatsIOScriptStatus;
}

// Lazy loading helper
export interface SeatsIOLazyLoadConfig {
  version?: string;
  timeout?: number;
  retries?: number;
}

export interface SeatsIOLazyLoadResult {
  success: boolean;
  error?: Error;
  chartConstructor?: typeof SeatingChart;
}

// Chart integration types
export interface SeatsIOChartIntegration {
  initialize: (config: SeatsIOConfig) => Promise<SeatingChart>;
  destroy: () => void;
  updateConfig: (config: Partial<SeatsIOConfig>) => void;
  selectSeats: (seatIds: string[]) => void;
  deselectSeats: (seatIds: string[]) => void;
  clearSelection: () => void;
  getSelectedSeats: () => SeatsIOSeat[];
  getBasket: () => SeatsIOBasket;
  refreshHoldToken: () => Promise<void>;
}

// API integration types
export interface SeatsIOApiIntegration {
  getHoldToken: () => Promise<string>;
  checkoutSeats: (data: SeatsIOCheckoutData) => Promise<void>;
  refreshHoldToken: (token: string) => Promise<string>;
  validateSelection: (seats: SeatsIOSeat[]) => Promise<boolean>;
}

// Hook types
export interface UseSeatsIOResult {
  state: SeatsIOState;
  actions: SeatsIOActions;
  chart: SeatsIOChartIntegration;
  api: SeatsIOApiIntegration;
}

export interface UseSeatsIOOptions {
  eventKey: string;
  config?: Partial<SeatsIOConfig>;
  autoLoad?: boolean;
  onError?: (error: SeatsIOError) => void;
}

// Store types
export interface SeatsIOStore extends SeatsIOState {
  actions: SeatsIOActions;
}

export interface SeatsIOStoreConfig {
  persistSelection?: boolean;
  autoRefreshHoldToken?: boolean;
  holdTokenRefreshInterval?: number;
  maxRetries?: number;
}

// Component ref types
export interface SeatsIOChartRef {
  chart: SeatingChart | null;
  selectSeats: (seatIds: string[]) => void;
  deselectSeats: (seatIds: string[]) => void;
  clearSelection: () => void;
  getSelectedSeats: () => SeatsIOSeat[];
  getBasket: () => SeatsIOBasket;
  refreshHoldToken: () => Promise<void>;
  updateConfig: (config: Partial<SeatsIOConfig>) => void;
}

// Page-level types
export interface SeatsIOPageProps {
  eventKey: string;
  initialConfig?: Partial<SeatsIOConfig>;
  onCheckout?: (data: SeatsIOCheckoutData) => void;
  onError?: (error: SeatsIOError) => void;
}

export interface SeatsIOPageState {
  isLoading: boolean;
  error: string | null;
  chartReady: boolean;
  selectedSeats: SeatsIOSeat[];
  basket: SeatsIOBasket;
  holdToken: string | null;
  checkoutInProgress: boolean;
}

// Basket component types
export interface SeatsIOBasketProps {
  basket: SeatsIOBasket;
  onRemoveSeat?: (seatId: string) => void;
  onClearAll?: () => void;
  onCheckout?: () => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface SeatsIOBasketItemProps {
  item: SeatsIOBasketItem;
  onRemove?: (seatId: string) => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// Pricing types
export interface SeatsIOPricingConfig {
  currency: string;
  formatter?: (price: number) => string;
  categories: Record<string, number>;
  discounts?: Record<string, number>;
  taxes?: Record<string, number>;
}

export interface SeatsIOPricingCalculation {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
}

// Event types (since they don't exist in the package)
export interface SeatsIOEvent {
  type: string;
  data?: unknown;
  timestamp: number;
}

export interface SeatsIOObjectSelectedEvent extends SeatsIOEvent {
  type: 'objectSelected';
  data: {
    object: SelectableObject;
    selectedObjects: SelectableObject[];
  };
}

export interface SeatsIOObjectDeselectedEvent extends SeatsIOEvent {
  type: 'objectDeselected';
  data: {
    object: SelectableObject;
    selectedObjects: SelectableObject[];
  };
}

export interface SeatsIOChartRenderedEvent extends SeatsIOEvent {
  type: 'chartRendered';
  data: {
    chart: SeatingChart;
  };
}

export interface SeatsIOSessionInitializedEvent extends SeatsIOEvent {
  type: 'sessionInitialized';
  data: {
    holdToken: HoldToken;
  };
}

export interface SeatsIOHoldTokenExpiredEvent extends SeatsIOEvent {
  type: 'holdTokenExpired';
  data: {
    holdToken: HoldToken;
  };
}

// Validation types
export interface SeatsIOValidationRule {
  type: 'minSeats' | 'maxSeats' | 'seatType' | 'category' | 'custom';
  value: number | string | ((seats: SeatsIOSeat[]) => boolean);
  message: string;
}

export interface SeatsIOValidationConfig {
  rules: SeatsIOValidationRule[];
  onValidationError?: (errors: string[]) => void;
}

export interface SeatsIOValidationResult {
  valid: boolean;
  errors: string[];
}

// Theme types
export interface SeatsIOTheme {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  text: string;
  background: string;
  border: string;
  shadow: string;
}

export interface SeatsIOThemeConfig {
  theme: SeatsIOTheme;
  customCss?: string;
  darkMode?: boolean;
}

// Accessibility types
export interface SeatsIOAccessibilityConfig {
  announceSelections?: boolean;
  keyboardNavigation?: boolean;
  screenReaderSupport?: boolean;
  highContrast?: boolean;
  focusManagement?: boolean;
}

// Performance types
export interface SeatsIOPerformanceConfig {
  lazyLoad?: boolean;
  debounceSelection?: number;
  throttleResize?: number;
  cacheHoldToken?: boolean;
  preloadChart?: boolean;
}

// Analytics types
export interface SeatsIOAnalyticsEvent {
  type: 'selection' | 'deselection' | 'checkout' | 'error';
  data: Record<string, unknown>;
  timestamp: number;
}

export interface SeatsIOAnalyticsConfig {
  enabled?: boolean;
  trackSelections?: boolean;
  trackErrors?: boolean;
  trackPerformance?: boolean;
  customEventHandler?: (event: SeatsIOAnalyticsEvent) => void;
}

// Testing types
export interface SeatsIOTestConfig {
  mockChart?: boolean;
  mockApi?: boolean;
  debugMode?: boolean;
  testId?: string;
}

export interface SeatsIOTestHelpers {
  selectSeat: (seatId: string) => void;
  deselectSeat: (seatId: string) => void;
  clearSelection: () => void;
  getSelectedSeats: () => SeatsIOSeat[];
  simulateError: (error: Error) => void;
  simulateHoldTokenExpiry: () => void;
}

// Migration types (for compatibility with existing seat selection system)
export interface SeatsIOLegacyCompatibility {
  mapToLegacyFormat?: (seats: SeatsIOSeat[]) => unknown[];
  mapFromLegacyFormat?: (legacySeats: unknown[]) => SeatsIOSeat[];
  legacyCallbacks?: {
    onSeatSelected?: (seat: unknown) => void;
    onSeatDeselected?: (seat: unknown) => void;
  };
} 
