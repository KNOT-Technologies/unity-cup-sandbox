import { motion } from "framer-motion";

const Home = () => {
    return (
        <div className="relative min-h-screen bg-black">
            {/* Background Gradient */}
            <div className="fixed inset-0 bg-gradient-radial from-black via-black/95 to-black pointer-events-none"></div>
            <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-20 pointer-events-none"></div>

            {/* Content */}
            <div className="relative">
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
                                    <span className="bg-gradient-to-r from-gray-500 to-white bg-clip-text text-transparent">UNITY CUP</span>
                                </h1>
                                <div className="text-right pr-[4.2rem] md:pr-[4.9rem] lg:pr-[6.3rem] xl:pr-[7rem] text-[12rem] md:text-[14rem] lg:text-[18rem] xl:text-[20rem] leading-[0.85] font-bold tracking-tighter bg-gradient-to-r from-gray-500 to-white bg-clip-text text-transparent">
                                    2026
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
                            <h2 className="text-white text-3xl md:text-4xl font-light">
                                Fulham FC's<br />Craven Cottage
                            </h2>
                            <p className="text-white text-3xl md:text-4xl font-light">
                                27, 28 & 31 MAY, 2026
                            </p>
                            <button className="mt-8 bg-white text-black px-16 py-4 rounded-full text-xl font-medium hover:bg-gray-100 transition-colors">
                                Join Newsletter
                            </button>
                        </motion.div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Home;
