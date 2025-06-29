import { motion } from "framer-motion";
import Portal from "../common/Portal";
import type { Seat, UserType, TicketType } from "../../types/tickets";
import { Ticket, Users, AlertCircle } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";

interface TicketTypeModalProps {
    seat: Seat;
    userType: UserType;
    onClose: () => void;
    onConfirm: (ticketType: TicketType) => void;
    onUserTypeChange: (type: UserType) => void;
    position: { x: number; y: number };
    direction?: "up" | "down";
    findPrice: (
        userType: UserType,
        seatClass: "vip" | "regular",
        category: TicketType
    ) => number;
    useCredits?: boolean;
    creditCosts?: {
        regular: {
            senior: number;
            adult: number;
            student: number;
            child: number;
        };
        vip: {
            senior: number;
            adult: number;
            student: number;
            child: number;
        };
    };
    hasSelectedSeats?: boolean;
}

const TicketTypeModal = ({
    seat,
    userType,
    onClose,
    onConfirm,
    onUserTypeChange,
    position,
    direction: _direction,
    useCredits = false,
    creditCosts,
    findPrice,
    hasSelectedSeats = false,
}: TicketTypeModalProps) => {
    const pricing = useCredits && creditCosts ? creditCosts[seat.zone] : null;
    const currency = userType === "tourist" ? "$" : "EGP";

    // Ref & dynamic top adjustment to keep modal within viewport
    const modalRef = useRef<HTMLDivElement>(null);
    const [adjustedTop, setAdjustedTop] = useState(position.y);

    useLayoutEffect(() => {
        if (!modalRef.current) return;
        const margin = 12;
        const rect = modalRef.current.getBoundingClientRect();
        let newTop = rect.top;
        if (rect.bottom > window.innerHeight - margin) {
            newTop -= rect.bottom - (window.innerHeight - margin);
        }
        if (newTop < margin) newTop = margin;
        if (newTop !== rect.top) {
            setAdjustedTop(newTop);
        }
    }, []);

    const arrowClass =
        _direction === "up"
            ? "absolute -top-3 left-1/2 transform -translate-x-1/2 -translate-y-full border-[10px] border-transparent border-b-gray-800/20"
            : "absolute -bottom-3 left-1/2 transform -translate-x-1/2 translate-y-full border-[10px] border-transparent border-t-gray-800/20";

    return (
        <Portal>
            <div
                className="fixed inset-0 z-50 flex sm:block items-center justify-center"
                onClick={onClose}
            >
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{
                        type: "spring",
                        bounce: 0.1,
                        duration: 0.4,
                        opacity: { duration: 0.2 },
                    }}
                    style={{
                        position: "absolute",
                        ...(window.matchMedia("(min-width: 640px)").matches && {
                            top: adjustedTop,
                            left: position.x,
                            transform: "translateX(-50%)",
                        }),
                    }}
                    onClick={(e) => e.stopPropagation()}
                    ref={modalRef}
                    className="bg-gray-800/95 sm:bg-gray-800/20 backdrop-blur-xl rounded-xl border border-gray-700/20 
            motion-safe:animate-fade-in motion-safe:animate-duration-500
            hover:border-amber-500/20 transition-[border,shadow] duration-300 delay-200
            hover:shadow-2xl hover:shadow-amber-500/5 p-6 w-[320px]
            relative before:absolute before:inset-0 
            before:bg-gradient-to-b before:from-amber-500/5 before:to-transparent 
            before:rounded-xl before:opacity-0 hover:before:opacity-100 
            before:transition-opacity before:duration-300 before:delay-200
            relative sm:absolute z-10"
                >
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="relative">
                                <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-full blur-xl opacity-50"></div>
                                <div
                                    className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-2 relative
                  backdrop-blur-xl border border-amber-500/20 transition-[border,background] duration-300 delay-200"
                                >
                                    <Ticket className="w-5 h-5 text-amber-400" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-base font-medium bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                                    {seat.zone === "vip"
                                        ? "VIP Zone"
                                        : "Regular Zone"}{" "}
                                    - Row {seat.row}, Seat {seat.number}
                                </h3>
                                <p className="text-sm font-medium text-white/60">
                                    Select ticket type
                                </p>
                            </div>
                        </div>

                        {hasSelectedSeats && (
                            <div className="mb-4 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                                    <p className="text-xs text-amber-400">
                                        You can only select{" "}
                                        <span className="font-medium">
                                            {userType}
                                        </span>{" "}
                                        tickets for this order
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="h-px w-full bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent mb-4"></div>

                        {/* User Type Selection - Only show if not using credits */}
                        {!useCredits && (
                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Users className="w-4 h-4 text-amber-400" />
                                    <span className="text-sm font-medium text-white/90">
                                        Select User Type
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onUserTypeChange("tourist")
                                        }
                                        disabled={
                                            hasSelectedSeats &&
                                            userType !== "tourist"
                                        }
                                        className={`py-2 px-3 rounded-lg border text-sm transition-all duration-300 ${
                                            userType === "tourist"
                                                ? "bg-amber-500/20 border-amber-500 text-amber-400"
                                                : hasSelectedSeats
                                                ? "border-gray-700 text-gray-600 opacity-50 cursor-not-allowed"
                                                : "border-gray-700 text-gray-400 hover:border-amber-500/50 hover:bg-amber-400/10"
                                        }`}
                                    >
                                        Tourist
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onUserTypeChange("local")
                                        }
                                        disabled={
                                            hasSelectedSeats &&
                                            userType !== "local"
                                        }
                                        className={`py-2 px-3 rounded-lg border text-sm transition-all duration-300 ${
                                            userType === "local"
                                                ? "bg-amber-500/20 border-amber-500 text-amber-400"
                                                : hasSelectedSeats
                                                ? "border-gray-700 text-gray-600 opacity-50 cursor-not-allowed"
                                                : "border-gray-700 text-gray-400 hover:border-amber-500/50 hover:bg-amber-400/10"
                                        }`}
                                    >
                                        Local
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            {(
                                ["senior", "adult", "student", "child"] as const
                            ).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => onConfirm(type)}
                                    className="w-full p-3 rounded-lg border border-gray-700/50 bg-gray-800/30
                    hover:bg-amber-500/10 hover:border-amber-500/30 
                    transition-[background,border] duration-300 delay-200 group relative
                    before:absolute before:inset-0 
                    before:bg-gradient-to-r before:from-amber-500/0 before:via-amber-500/5 before:to-amber-500/0 
                    before:rounded-lg before:opacity-0 group-hover:before:opacity-100 
                    before:transition-opacity before:duration-300 before:delay-200"
                                >
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="text-white/90 capitalize group-hover:text-white 
                        transition-colors duration-300 delay-200"
                                            >
                                                {type}
                                            </span>
                                            <span
                                                className="text-xs text-white/60 group-hover:text-white/80 
                        transition-colors duration-300 delay-200"
                                            >
                                                {type === "senior"
                                                    ? "(>80)"
                                                    : type === "student"
                                                    ? "(<16)"
                                                    : type === "child"
                                                    ? "(<6)"
                                                    : ""}
                                            </span>
                                        </div>
                                        <span
                                            className="text-amber-400 font-medium group-hover:text-amber-300
                      transition-colors duration-300 delay-200 min-w-[80px] text-right"
                                        >
                                            {useCredits && pricing
                                                ? `${pricing[type]} credits`
                                                : `${currency} ${findPrice(
                                                      userType,
                                                      seat.zone as
                                                          | "vip"
                                                          | "regular",
                                                      type
                                                  )}`}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="absolute -inset-6 z-0"></div>

                    <div className={`${arrowClass} z-10 hidden sm:block`}></div>
                </motion.div>
            </div>
        </Portal>
    );
};

export default TicketTypeModal;
