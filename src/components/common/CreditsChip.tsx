import { Coins, AlertCircle, Loader2 } from "lucide-react";
import { useCreditBalance } from "../../hooks/useApi";

interface CreditsChipProps {
    className?: string;
    showTooltip?: boolean;
}

const CreditsChip = ({
    className = "",
    showTooltip = true,
}: CreditsChipProps) => {
    const { balance, items, isLoading, error } = useCreditBalance();

    // Find the soonest expiring credit balance for tooltip
    const soonestExpiry =
        items.length > 0
            ? items.reduce((earliest, item) => {
                  const itemDate = new Date(item.expiresAt);
                  const earliestDate = new Date(earliest.expiresAt);
                  return itemDate < earliestDate ? item : earliest;
              })
            : null;

    const formatExpiryDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const daysLeft = Math.ceil(
            (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysLeft <= 0) return "Expired";
        if (daysLeft === 1) return "1 day left";
        if (daysLeft <= 30) return `${daysLeft} days left`;

        return date.toLocaleDateString();
    };

    if (error) {
        return (
            <div
                className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 
        border border-red-500/20 text-red-400 ${className}`}
            >
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Credits unavailable</span>
            </div>
        );
    }

    return (
        <div className={`relative group ${className}`}>
            <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 
        backdrop-blur-sm border border-amber-500/20 transition-all duration-300
        hover:bg-amber-500/15 hover:border-amber-500/30"
            >
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="text-white/90 text-sm font-medium">
                    Credits:{" "}
                    {isLoading ? (
                        <Loader2 className="inline w-3 h-3 animate-spin ml-1" />
                    ) : (
                        balance.toLocaleString()
                    )}
                </span>
            </div>

            {/* Tooltip */}
            {showTooltip && soonestExpiry && !isLoading && (
                <div
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
          opacity-0 invisible group-hover:opacity-100 group-hover:visible 
          transition-all duration-300 z-50"
                >
                    <div
                        className="bg-black/90 backdrop-blur-xl rounded-lg border border-white/10 
            px-3 py-2 text-sm text-white/90 whitespace-nowrap shadow-2xl"
                    >
                        <div className="flex items-center gap-2">
                            <span>Next expiry:</span>
                            <span className="text-amber-400 font-medium">
                                {formatExpiryDate(soonestExpiry.expiresAt)}
                            </span>
                        </div>
                        <div className="text-xs text-white/60 mt-1">
                            {soonestExpiry.credits} credits expire then
                        </div>
                    </div>
                    {/* Arrow */}
                    <div
                        className="absolute top-full left-1/2 transform -translate-x-1/2 
            w-0 h-0 border-l-4 border-r-4 border-t-4 
            border-l-transparent border-r-transparent border-t-black/90"
                    ></div>
                </div>
            )}
        </div>
    );
};

export default CreditsChip;
