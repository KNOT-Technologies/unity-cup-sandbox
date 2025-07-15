import React from "react";
import { X, User, Users, Baby } from "lucide-react";
import { TICKET_TYPES, calculatePrice } from "../../types/ticketTypes";
import { formatSeatDisplay } from "../../utils/seatParser";

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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full mx-4 relative border border-white/10 overflow-hidden">
                {/* Enhanced ambient glow effects */}
                <div className="absolute -top-16 -left-16 w-48 h-48 bg-white/5 rounded-full blur-[60px] mix-blend-soft-light" />
                <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-white/5 rounded-full blur-[60px] mix-blend-soft-light" />

                {/* Content wrapper */}
                <div className="relative">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Seat info */}
                    <div className="mb-8">
                        <h3 className="text-xl font-medium text-white mb-4 tracking-wide">
                            Select Ticket Type
                        </h3>
                        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5 border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-400/10 rounded-lg flex items-center justify-center">
                                    <span className="text-blue-400 text-lg">
                                        🪑
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-white text-lg">
                                        {formatSeatDisplay(seat.label)}
                                    </div>
                                    <div className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                                        <span className="bg-white/10 px-2 py-1 rounded text-xs">
                                            {seat.category}
                                        </span>
                                        <span className="text-blue-400 font-medium">
                                            £{seat.basePrice}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ticket type options */}
                    <div className="space-y-4">
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
                                    onClick={() =>
                                        handleTicketTypeSelect(type.id)
                                    }
                                    className="w-full bg-black/30 hover:bg-black/50 rounded-xl p-5 flex items-center gap-4 transition-all border border-white/5 hover:border-blue-400/30"
                                >
                                    <div className="text-blue-400">
                                        {getIcon(type.iconName)}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="text-white font-medium">
                                            {type.label}
                                        </div>
                                        <div className="text-sm text-gray-400 mt-1">
                                            {type.description}
                                            {discount && (
                                                <span className="ml-2 text-blue-400">
                                                    ({discount})
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg text-blue-400">
                                            £{finalPrice.toFixed(0)}
                                        </div>
                                        {type.multiplier < 1 && (
                                            <div className="text-xs text-white/40 line-through">
                                                £{seat.basePrice}
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
                        className="w-full mt-6 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl transition-all border border-gray-700 hover:border-gray-600"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SeatTicketTypeModal;
