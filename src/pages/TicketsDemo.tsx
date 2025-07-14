import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Clock, MapPin, Users, Trophy } from "lucide-react";
import DatePicker from "../components/tickets/DatePicker";

const TicketsDemo = () => {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    // Demo event ID for seats.io
    const DEMO_EVENT_ID = "9de3e2b4-2acd-4673-8ee0-e6af4435c222";

    // Generate some fake available dates (next 30 days)
    const availableDates = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        return date;
    });

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
    };

    const handleMatchClick = () => {
        console.log("🎯 Navigating to seats.io with event ID:", DEMO_EVENT_ID);
        navigate(`/event/${DEMO_EVENT_ID}/seatsIO`);
    };

    // Format the selected date
    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-black text-white pt-24 sm:pt-32 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                        Unity Cup 2025
                    </h1>
                    <p className="text-xl text-gray-300">
                        Select your match date and book your seats
                    </p>
                </motion.div>

                {/* Date Selection */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                >
                    <DatePicker
                        selectedDate={selectedDate}
                        onDateSelect={handleDateSelect}
                        availableDates={availableDates}
                    />
                </motion.div>

                {/* Match Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700/50 backdrop-blur-xl"
                >
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-amber-400 mb-2">
                            Featured Match
                        </h2>
                        <p className="text-gray-300">
                            {formatDate(selectedDate)}
                        </p>
                    </div>

                    {/* Teams */}
                    <div className="flex items-center justify-center gap-8 mb-8">
                        <motion.div
                            className="text-center"
                            whileHover={{ scale: 1.05 }}
                        >
                            <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center text-3xl font-bold">
                                🇳🇬
                            </div>
                            <h3 className="text-xl font-bold text-white">
                                Nigeria
                            </h3>
                            <p className="text-sm text-gray-400">
                                Super Eagles
                            </p>
                        </motion.div>

                        <div className="text-4xl font-bold text-amber-400">
                            VS
                        </div>

                        <motion.div
                            className="text-center"
                            whileHover={{ scale: 1.05 }}
                        >
                            <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-br from-yellow-500 to-green-600 rounded-full flex items-center justify-center text-3xl font-bold">
                                🇯🇲
                            </div>
                            <h3 className="text-xl font-bold text-white">
                                Jamaica
                            </h3>
                            <p className="text-sm text-gray-400">Reggae Boyz</p>
                        </motion.div>
                    </div>

                    {/* Match Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="flex items-center gap-3 justify-center md:justify-start">
                            <Clock className="w-5 h-5 text-amber-400" />
                            <div>
                                <p className="text-sm text-gray-400">
                                    Kick-off
                                </p>
                                <p className="font-semibold">19:30 GMT</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 justify-center md:justify-start">
                            <MapPin className="w-5 h-5 text-amber-400" />
                            <div>
                                <p className="text-sm text-gray-400">Venue</p>
                                <p className="font-semibold">Fullham Stadium</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 justify-center md:justify-start">
                            <Trophy className="w-5 h-5 text-amber-400" />
                            <div>
                                <p className="text-sm text-gray-400">
                                    Tournament
                                </p>
                                <p className="font-semibold">Unity Cup Final</p>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Info */}
                    <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
                        <h4 className="text-lg font-semibold mb-4 text-center">
                            Ticket Prices
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-amber-400">
                                    $25
                                </div>
                                <div className="text-sm text-gray-400">
                                    Regular Seats
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-amber-400">
                                    $50
                                </div>
                                <div className="text-sm text-gray-400">
                                    VIP Seats
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 text-center">
                            <p className="text-sm text-gray-400">
                                🎫 Discounts available for Seniors (20% off) &
                                Children (40% off)
                            </p>
                        </div>
                    </div>

                    {/* Book Now Button */}
                    <motion.button
                        onClick={handleMatchClick}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-black font-bold py-4 px-8 rounded-xl text-lg hover:from-amber-400 hover:to-orange-500 transition-all duration-200 flex items-center justify-center gap-3"
                    >
                        <Users className="w-6 h-6" />
                        Select Your Seats
                    </motion.button>

                    <p className="text-center text-sm text-gray-400 mt-4">
                        Interactive seat selection • Choose ticket types •
                        Secure booking
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default TicketsDemo;
