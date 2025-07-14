import React from "react";
import { X, User, Users, Baby } from "lucide-react";
import { TICKET_TYPES, calculatePrice } from "../../types/ticketTypes";

interface SeatInfo {
    id: string;
    label: string;
    category: string;
    basePrice: number;
}

interface SeatTicketTypeModalProps {
    seat: SeatInfo | null;
    isOpen: boolean;
    onClose: () => void;
    onSelectTicketType: (
        seatId: string,
        ticketType: string,
        finalPrice: number
    ) => void;
}

const getIcon = (iconName: string) => {
    const iconMap = {
        User: <User className="w-5 h-5" />,
        Users: <Users className="w-5 h-5" />,
        Baby: <Baby className="w-5 h-5" />,
    };
    return (
        iconMap[iconName as keyof typeof iconMap] || (
            <User className="w-5 h-5" />
        )
    );
};

const SeatTicketTypeModal: React.FC<SeatTicketTypeModalProps> = ({
    seat,
    isOpen,
    onClose,
    onSelectTicketType,
}) => {
    if (!isOpen || !seat) return null;

    const handleTicketTypeSelect = (ticketTypeId: string) => {
        const finalPrice = calculatePrice(seat.basePrice, ticketTypeId);
        onSelectTicketType(seat.id, ticketTypeId, finalPrice);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 relative">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Seat info */}
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">
                        Select Ticket Type
                    </h3>
                    <div className="text-gray-300">
                        <div className="font-semibold">{seat.label}</div>
                        <div className="text-sm text-gray-400">
                            {seat.category} • Base price: ${seat.basePrice}
                        </div>
                    </div>
                </div>

                {/* Ticket type options */}
                <div className="space-y-3">
                    {TICKET_TYPES.map((type) => {
                        const finalPrice = calculatePrice(
                            seat.basePrice,
                            type.id
                        );
                        const discount =
                            type.multiplier < 1
                                ? `${Math.round(
                                      (1 - type.multiplier) * 100
                                  )}% off`
                                : null;

                        return (
                            <button
                                key={type.id}
                                onClick={() => handleTicketTypeSelect(type.id)}
                                className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg p-4 flex items-center gap-4 transition-colors"
                            >
                                <div className="text-amber-400">
                                    {getIcon(type.iconName)}
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="text-white font-semibold">
                                        {type.label}
                                    </div>
                                    <div className="text-sm text-gray-400">
                                        {type.description}
                                        {discount && (
                                            <span className="ml-2 text-green-400">
                                                ({discount})
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-amber-400">
                                        ${finalPrice.toFixed(0)}
                                    </div>
                                    {type.multiplier < 1 && (
                                        <div className="text-xs text-gray-500 line-through">
                                            ${seat.basePrice}
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Cancel button */}
                <button
                    onClick={onClose}
                    className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default SeatTicketTypeModal;
