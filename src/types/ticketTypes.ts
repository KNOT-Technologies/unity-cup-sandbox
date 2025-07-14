export interface TicketType {
    id: string;
    label: string;
    multiplier: number; // Price multiplier (1.0 = full price, 0.8 = 80% of base price)
    iconName: string;
    description: string;
}

export const TICKET_TYPES: TicketType[] = [
    {
        id: 'adult',
        label: 'Adult',
        multiplier: 1.0,
        iconName: 'User',
        description: 'Ages 18+'
    },
    {
        id: 'senior',
        label: 'Senior',
        multiplier: 0.8, // 20% discount
        iconName: 'Users',
        description: 'Ages 65+'
    },
    {
        id: 'child',
        label: 'Child',
        multiplier: 0.6, // 40% discount
        iconName: 'Baby',
        description: 'Ages 3-17'
    }
];

// Helper function to get ticket type by ID
export const getTicketType = (id: string): TicketType | undefined => {
    return TICKET_TYPES.find(type => type.id === id);
};

// Helper function to calculate price with ticket type multiplier
export const calculatePrice = (basePrice: number, ticketTypeId: string): number => {
    const ticketType = getTicketType(ticketTypeId);
    return basePrice * (ticketType?.multiplier || 1.0);
}; 
