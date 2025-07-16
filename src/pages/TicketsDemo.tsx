import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Ticket } from "lucide-react";
import { NG, JM, GH, TT } from "country-flag-icons/react/3x2";
import React from "react";

const TicketsDemo = () => {
    const navigate = useNavigate();

    // Demo event ID for seats.io
    const DEMO_EVENT_ID = "9de3e2b4-2acd-4673-8ee0-e6af4435c222";

    const matchData = [
        {
            id: "UFC-2025-NGA-JAM",
            date: { day: "27", month: "MAY" },
            time: "19:30 GMT",
            team1: {
                name: "Nigeria",
                shortCode: "NGA",
                flag: NG,
                logoUrl:
                    "https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/ng.svg",
            },
            team2: {
                name: "Jamaica",
                shortCode: "JAM",
                flag: JM,
                logoUrl:
                    "https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/jm.svg",
            },
            stage: "Semi-Final" as const,
            venue: "Craven Cottage",
            gateOpensAt: "18:00 GMT",
        },
        {
            id: "UFC-2025-GHA-TT",
            date: { day: "28", month: "MAY" },
            time: "18:00 GMT",
            team1: {
                name: "Ghana",
                shortCode: "GHA",
                flag: GH,
                logoUrl:
                    "https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/gh.svg",
            },
            team2: {
                name: "Trinidad & Tobago",
                shortCode: "TT",
                flag: TT,
                logoUrl:
                    "https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/tt.svg",
            },
            stage: "Semi-Final" as const,
            venue: "Craven Cottage",
            gateOpensAt: "17:00 GMT",
        },
        {
            id: "UFC-2025-NGA-GHA",
            date: { day: "29", month: "MAY" },
            time: "19:30 GMT",
            team1: {
                name: "Nigeria",
                shortCode: "NGA",
                flag: NG,
                logoUrl:
                    "https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/ng.svg",
            },
            team2: {
                name: "Ghana",
                shortCode: "GHA",
                flag: GH,
                logoUrl:
                    "https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/gh.svg",
            },
            stage: "3rd Place Play-off" as const,
            venue: "Craven Cottage",
            gateOpensAt: "18:00 GMT",
        },
        {
            id: "UFC-2025-JAM-TT",
            date: { day: "30", month: "MAY" },
            time: "19:30 GMT",
            team1: {
                name: "Jamaica",
                shortCode: "JAM",
                flag: JM,
                logoUrl:
                    "https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/jm.svg",
            },
            team2: {
                name: "Trinidad & Tobago",
                shortCode: "TT",
                flag: TT,
                logoUrl:
                    "https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/tt.svg",
            },
            stage: "Final" as const,
            venue: "Craven Cottage",
            gateOpensAt: "18:00 GMT",
        },
    ];

    const handleTicketClick = (match: (typeof matchData)[0]) => {
        // Calculate the actual date for the match (for demo purposes, we'll use future dates)
        const monthIndex = {
            JAN: 0,
            FEB: 1,
            MAR: 2,
            APR: 3,
            MAY: 4,
            JUN: 5,
            JUL: 6,
            AUG: 7,
            SEP: 8,
            OCT: 9,
            NOV: 10,
            DEC: 11,
        };

        const selectedDate = new Date();
        selectedDate.setDate(Number(match.date.day));
        selectedDate.setMonth(
            monthIndex[match.date.month as keyof typeof monthIndex]
        );
        selectedDate.setFullYear(2026);

        // Store the selected match data in sessionStorage
        const selectedMatchData = {
            eventId: match.id,
            name: `Unity Cup ${match.stage}: ${match.team1.name} vs ${match.team2.name}`,
            date: selectedDate.toISOString(),
            time: match.time,
            venue: match.venue,
            stage: match.stage,
            homeTeam: {
                name: match.team1.name,
                shortCode: match.team1.shortCode,
                logoUrl: match.team1.logoUrl,
            },
            awayTeam: {
                name: match.team2.name,
                shortCode: match.team2.shortCode,
                logoUrl: match.team2.logoUrl,
            },
            venueAddress: "Stevenage Rd, London SW6 6HH, UK",
            gateOpensAt: match.gateOpensAt,
            contactEmail: "support@unitycup.com",
        };

        sessionStorage.setItem(
            "selectedMatchData",
            JSON.stringify(selectedMatchData)
        );

        // Navigate to SeatsIO page
        navigate(`/event/${DEMO_EVENT_ID}/seatsIO`);
    };

    return (
        <div className="min-h-screen bg-black text-white pt-24 sm:pt-32 pb-16">
            <div className="max-w-fit mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                {matchData.map((match, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 * index }}
                        className="relative overflow-hidden"
                    >
                        {/* Background blur effect with enhanced gradient */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,rgba(0,0,0,0.95)_100%)] backdrop-blur-xl rounded-3xl border border-white/10" />

                        {/* Enhanced ambient glow effects */}
                        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-[100px] mix-blend-soft-light" />
                        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-white/5 rounded-full blur-[100px] mix-blend-soft-light" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-32 bg-white/5 blur-[100px] mix-blend-soft-light" />

                        {/* Subtle geometric pattern */}
                        <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_0%,rgba(255,255,255,0.02)_100%)] bg-[size:4px_4px] opacity-20" />

                        {/* Content */}
                        <div className="relative px-12 pt-8 pb-12 rounded-3xl">
                            {/* Tickets Button */}
                            <div className="absolute right-12">
                                <button
                                    onClick={() => handleTicketClick(match)}
                                    className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full font-medium text-sm tracking-wide transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)] hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <Ticket className="w-4 h-4" />
                                    <span>Tickets</span>
                                </button>
                            </div>

                            <div className="flex items-start justify-between">
                                {/* Date and Location */}
                                <div className="flex flex-col items-start gap-6 min-w-[180px]">
                                    <div className="text-left">
                                        <div className="text-5xl font-bold text-white tracking-tight leading-none mb-1">
                                            {match.date.day}
                                        </div>
                                        <div className="text-xl font-medium text-white/80 tracking-widest">
                                            {match.date.month}
                                        </div>
                                    </div>
                                    <div className="w-full space-y-6 text-white/70">
                                        <div className="w-full h-px bg-gradient-to-r from-white/20 via-white/10 to-transparent" />
                                        <div className="text-sm font-medium tracking-wide">
                                            {match.time}
                                        </div>
                                        <div className="w-full h-px bg-gradient-to-r from-white/20 via-white/10 to-transparent" />
                                        <div className="text-sm font-medium tracking-wide">
                                            {match.venue}
                                        </div>
                                        <div className="w-full h-px bg-gradient-to-r from-white/20 via-white/10 to-transparent" />
                                        <div className="text-xs font-medium tracking-wide text-white/50">
                                            {match.stage}
                                        </div>
                                    </div>
                                </div>

                                {/* Teams */}
                                <div className="flex items-center justify-center gap-16 pl-4 pr-16 mt-12">
                                    {/* Team 1 */}
                                    <div className="flex flex-col items-center gap-5 w-32">
                                        <div className="relative w-24 h-24">
                                            <div className="absolute -inset-4 bg-white/5 rounded-full blur-xl" />
                                            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/15 to-white/5 p-0.5 shadow-lg shadow-black/30 transition-all duration-300 hover:scale-105 group">
                                                <div className="w-full h-full rounded-full bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center overflow-hidden backdrop-blur-sm">
                                                    <div className="w-[200%] h-[200%] flex items-center justify-center drop-shadow-2xl transition-transform duration-[5000ms] ease-linear group-hover:rotate-[360deg]">
                                                        {React.createElement(
                                                            match.team1.flag,
                                                            {
                                                                className:
                                                                    "w-full h-full scale-[1.8] object-cover",
                                                            }
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-medium text-white tracking-wide text-center w-full">
                                            {match.team1.name}
                                        </h3>
                                    </div>

                                    {/* VS */}
                                    <div className="relative flex items-center w-20 justify-center">
                                        <div className="absolute -inset-12 bg-white/10 rounded-full blur-2xl" />
                                        <div className="relative text-5xl font-black text-white tracking-widest bg-clip-text">
                                            VS
                                        </div>
                                    </div>

                                    {/* Team 2 */}
                                    <div className="flex flex-col items-center gap-5 w-32">
                                        <div className="relative w-24 h-24">
                                            <div className="absolute -inset-4 bg-white/5 rounded-full blur-xl" />
                                            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/15 to-white/5 p-0.5 shadow-lg shadow-black/30 transition-all duration-300 hover:scale-105 group">
                                                <div className="w-full h-full rounded-full bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center overflow-hidden backdrop-blur-sm">
                                                    <div className="w-[200%] h-[200%] flex items-center justify-center drop-shadow-2xl transition-transform duration-[5000ms] ease-linear group-hover:rotate-[360deg]">
                                                        {React.createElement(
                                                            match.team2.flag,
                                                            {
                                                                className:
                                                                    "w-full h-full scale-[1.8] object-cover",
                                                            }
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <h3
                                            className={`font-medium text-white tracking-wide text-center w-full ${
                                                match.team2.name ===
                                                "Trinidad & Tobago"
                                                    ? "text-sm"
                                                    : "text-2xl"
                                            }`}
                                        >
                                            {match.team2.name}
                                        </h3>
                                    </div>
                                </div>

                                {/* Spacer to maintain layout after moving button */}
                                <div className="min-w-[180px]" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default TicketsDemo;
