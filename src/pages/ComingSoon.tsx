import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const ComingSoon: React.FC = () => {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div className="relative min-h-screen bg-black">
            {/* Background Gradient */}
            <div className="fixed inset-0 bg-gradient-radial from-black via-black/95 to-black pointer-events-none"></div>
            <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-20 pointer-events-none"></div>

            {/* Background "COMING SOON" Text */}
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-[8rem] md:text-[10rem] lg:text-[12rem] xl:text-[14rem] font-bold tracking-tighter text-white/5 whitespace-nowrap transform rotate-12">
                    COMING SOON
                </div>
            </div>

            {/* Content */}
            <div className="relative">
                {/* Header with Back Button */}
                <div className="absolute top-8 left-8 z-10">
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        onClick={handleGoBack}
                        className="text-white/60 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </motion.button>
                </div>

                {/* Hero Section */}
                <main className="max-w-[90%] mx-auto h-screen flex flex-col justify-center">
                    <div className="flex flex-col">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="relative"
                        >
                            <div className="flex flex-col gap-0">
                                <h1 className="text-[12rem] md:text-[14rem] lg:text-[18rem] xl:text-[20rem] leading-[0.85] font-bold tracking-tighter whitespace-nowrap">
                                    <span className="bg-gradient-to-r from-gray-500 to-white bg-clip-text text-transparent">
                                        COMING
                                    </span>
                                </h1>
                                <div className="text-right pr-[4.2rem] md:pr-[4.9rem] lg:pr-[6.3rem] xl:pr-[7rem] text-[12rem] md:text-[14rem] lg:text-[18rem] xl:text-[20rem] leading-[0.85] font-bold tracking-tighter bg-gradient-to-r from-gray-500 to-white bg-clip-text text-transparent">
                                    SOON
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Bottom Left Information */}
                    <div className="absolute bottom-[25%] left-[12%] space-y-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="space-y-4"
                        >
                            <p className="text-white/60 text-lg max-w-md leading-relaxed mt-4">
                                We're working hard to...
                                <br />
                                bring you an amazing experience.
                            </p>
                            <button
                                onClick={() => navigate("/")}
                                className="mt-8 bg-white text-black px-12 py-4 rounded-full text-xl font-medium hover:bg-gray-100 transition-colors"
                            >
                                Return Home
                            </button>
                        </motion.div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ComingSoon;
