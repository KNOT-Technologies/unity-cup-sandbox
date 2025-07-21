/**
 * Formats a price to remove unnecessary decimal places
 * If the price is a whole number, shows no decimals (e.g., 25 instead of 25.00)
 * If the price has cents, shows with decimals (e.g., 25.50)
 */
export const formatPrice = (price: number): string => {
    return price % 1 === 0 ? price.toString() : price.toFixed(2);
};

/**
 * Formats a price with currency symbol, removing unnecessary decimal places
 */
export const formatPriceWithCurrency = (price: number, currency: string = '£'): string => {
    return `${currency}${formatPrice(price)}`;
}; 
