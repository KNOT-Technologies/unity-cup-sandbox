import React from "react";
import { User, Users, Baby } from "lucide-react";
import { TICKET_TYPES } from "../../types/ticketTypes";

const getIcon = (iconName: string) => {
    const iconMap = {
        User: <User className="w-4 h-4" />,
        Users: <Users className="w-4 h-4" />,
        Baby: <Baby className="w-4 h-4" />,
    };
    return (
        iconMap[iconName as keyof typeof iconMap] || (
            <User className="w-4 h-4" />
        )
    );
};

interface TicketTypeSelectorProps {
    selectedType: string;
    onTypeChange: (typeId: string) => void;
    className?: string;
    basePrice?: number; // Add base price to calculate actual prices
}

const TicketTypeSelector: React.FC<TicketTypeSelectorProps> = ({
    selectedType,
    onTypeChange,
    className = "",
    basePrice = 25,
}) => {
    return (
        <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
            <h3 className="text-white font-semibold mb-3">Ticket Type</h3>
            <div className="space-y-2">
                {TICKET_TYPES.map((type) => (
                    <button
                        key={type.id}
                        onClick={() => onTypeChange(type.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                            selectedType === type.id
                                ? "bg-amber-600 text-white"
                                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                    >
                        <div className="flex-shrink-0">
                            {getIcon(type.iconName)}
                        </div>
                        <div className="flex-1 text-left">
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs opacity-75">
                                {type.description}
                            </div>
                        </div>
                        <div className="flex-shrink-0 text-sm font-medium">
                            ${(basePrice * type.multiplier).toFixed(0)}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TicketTypeSelector;
