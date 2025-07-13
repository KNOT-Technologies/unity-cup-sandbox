import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Trophy,
    Users,
    Calendar,
    ChevronDown,
    Star,
    Clock,
    MapPin,
    Info,
    Flag,
    Award,
} from "lucide-react";

const Home = () => {
    const features = [
        {
            icon: <Trophy className="w-8 h-8" />,
            title: "International Football Excellence",
            description:
                "Experience top-tier football with teams from around the world competing for the Unity Cup.",
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: "Group Booking & Corporate Packages",
            description:
                "Special rates and dedicated support for tour operators, corporate groups, and large parties.",
        },
        {
            icon: <Calendar className="w-8 h-8" />,
            title: "Multiple Match Days",
            description:
                "Choose from various match days and times throughout the tournament schedule.",
        },
        {
            icon: <Award className="w-8 h-8" />,
            title: "Premium Stadium Experience",
            description:
                "State-of-the-art facilities with excellent views and world-class amenities.",
        },
    ];

    const highlights = [
        {
            icon: <Star className="w-6 h-6" />,
            title: "5-Star Experience",
            description: "Rated excellent by over 50,000 fans",
        },
        {
            icon: <Clock className="w-6 h-6" />,
            title: "90-Minute Matches",
            description: "Full-length international football matches",
        },
    ];

    return (
        <div className="relative min-h-screen bg-black">
            {/* Background Gradient */}
            <div className="fixed inset-0 bg-gradient-radial from-black via-black/95 to-black pointer-events-none"></div>
            <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-20 pointer-events-none"></div>

            {/* Content */}
            <div className="relative">
                {/* Hero Section */}
                <main className="container mx-auto px-4 pt-48 md:pt-56 lg:pt-64 pb-24 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center space-y-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="space-y-12"
                        >
                            <h1
                                className="text-6xl md:text-7xl lg:text-8xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70
                leading-[1.2] md:leading-[1.2] lg:leading-[1.2] tracking-wide pb-4"
                            >
                                Unity Cup Football Tournament
                            </h1>

                            <p
                                className="text-xl md:text-2xl text-white/80 leading-relaxed tracking-wide
                max-w-3xl mx-auto font-light"
                            >
                                Experience the thrill of international football as top teams
                                compete for glory in the Unity Cup. Secure your seats for
                                unforgettable matches at world-class stadiums.
                            </p>

                            <div className="flex flex-wrap justify-center gap-6">
                                {highlights.map((highlight) => (
                                    <div
                                        key={highlight.title}
                                        className="flex items-center gap-4 bg-white/[0.03] backdrop-blur-xl rounded-2xl px-8 py-4
                    border border-white/[0.05] hover:border-white/[0.1] transition-all duration-500
                    hover:bg-white/[0.05] hover:shadow-2xl hover:shadow-amber-500/5 group"
                                    >
                                        <span className="text-amber-500/80 group-hover:text-amber-400 transition-colors duration-500">
                                            {highlight.icon}
                                        </span>
                                        <div className="text-left">
                                            <p className="text-white/90 font-medium">
                                                {highlight.title}
                                            </p>
                                            <p className="text-white/40 text-sm">
                                                {highlight.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12"
                            >
                                <Link
                                    to="/tickets"
                                    className="group relative overflow-hidden bg-amber-500/90 text-black px-10 py-5 rounded-2xl text-lg 
                    font-medium tracking-wider hover:bg-amber-400/90 
                    transition-all duration-500 min-w-[200px]
                    hover:shadow-2xl hover:shadow-amber-500/20"
                                >
                                    <div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                    translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"
                                    ></div>
                                    Book Your Tickets
                                </Link>
                                <Link
                                    to="/business/login"
                                    className="group relative overflow-hidden bg-white/[0.03] backdrop-blur-xl text-white hover:bg-white/[0.08]
                    px-10 py-5 rounded-2xl text-lg font-medium tracking-wider 
                    transition-all duration-500 min-w-[200px]
                    border border-white/[0.05] hover:border-white/[0.1]
                    hover:shadow-2xl hover:shadow-white/5"
                                >
                                    <div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent 
                    translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"
                                    ></div>
                                    Travel Agencies
                                </Link>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Scroll Indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 0.8 }}
                        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
                    >
                        <span className="text-white/40 text-sm tracking-wider mb-2 font-light">
                            Discover More
                        </span>
                        <div className="animate-bounce">
                            <ChevronDown className="w-6 h-6 text-white/40" />
                        </div>
                    </motion.div>
                </main>

                {/* Features Section */}
                <section className="py-32 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/30 backdrop-blur-xl"></div>
                    <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-4xl md:text-5xl font-medium text-center text-transparent bg-clip-text bg-gradient-to-b from-white to-white/80 mb-24">
                            What Makes the Unity Cup Special
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {features.map((feature) => (
                                <div
                                    key={feature.title}
                                    className="group bg-white/[0.02] backdrop-blur-xl rounded-3xl p-10
                    border border-white/[0.05] hover:border-amber-500/20
                    transform hover:scale-105 transition-all duration-500
                    hover:shadow-2xl hover:shadow-amber-500/5"
                                >
                                    <div
                                        className="text-amber-500/80 mb-8 transform group-hover:scale-110 group-hover:text-amber-400
                    transition-all duration-500"
                                    >
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-2xl font-medium text-white/90 mb-4">
                                        {feature.title}
                                    </h3>
                                    <p className="text-white/50 leading-relaxed font-light">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Information Section */}
                <section className="py-32 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50 backdrop-blur-xl"></div>
                    <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Title with decorative elements */}
                        <div className="flex items-center justify-center gap-4 mb-12">
                            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
                            <h2 className="text-4xl font-medium text-center text-transparent bg-clip-text bg-gradient-to-b from-white to-white/80">
                                Essential Information
                            </h2>
                            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                            {/* Visitor Information */}
                            <div
                                className="group bg-white/[0.02] backdrop-blur-xl rounded-3xl p-8
                border border-white/[0.05] hover:border-amber-500/20
                transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/5"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <Info className="w-8 h-8 text-amber-500/80 group-hover:text-amber-400 transition-colors duration-500" />
                                    <h3 className="text-2xl font-medium text-white/90">
                                        Visitor Info
                                    </h3>
                                </div>
                                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/5 to-transparent mb-6"></div>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-white/80 font-medium mb-2">
                                            Payment Methods
                                        </h4>
                                        <p className="text-white/50 font-light">
                                            All major cards, digital wallets,
                                            and cash accepted.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-white/80 font-medium mb-2">
                                            Accessibility
                                        </h4>
                                        <p className="text-white/50 font-light">
                                            Wheelchair accessible seating.
                                            Elderly assistance available.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-white/80 font-medium mb-2">
                                            Security
                                        </h4>
                                        <p className="text-white/50 font-light">
                                            Bag checks required. No large bags
                                            or prohibited items.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* What to Bring */}
                            <div
                                className="group bg-white/[0.02] backdrop-blur-xl rounded-3xl p-8
                border border-white/[0.05] hover:border-amber-500/20
                transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/5"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <Flag className="w-8 h-8 text-amber-500/80 group-hover:text-amber-400 transition-colors duration-500" />
                                    <h3 className="text-2xl font-medium text-white/90">
                                        What to Bring
                                    </h3>
                                </div>
                                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/5 to-transparent mb-6"></div>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-white/80 font-medium mb-2">
                                            Essential Items
                                        </h4>
                                        <div className="space-y-2">
                                            <p className="text-white/50 font-light flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500/50"></span>
                                                Valid ID or passport
                                            </p>
                                            <p className="text-white/50 font-light flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500/50"></span>
                                                Match ticket (digital or print)
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-white/80 font-medium mb-2">
                                            Recommended
                                        </h4>
                                        <div className="space-y-2">
                                            <p className="text-white/50 font-light flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500/50"></span>
                                                Team colors and flags
                                            </p>
                                            <p className="text-white/50 font-light flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500/50"></span>
                                                Camera (no flash photography)
                                            </p>
                                            <p className="text-white/50 font-light flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500/50"></span>
                                                Cash for food and merchandise
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Getting There */}
                            <div
                                className="group bg-white/[0.02] backdrop-blur-xl rounded-3xl p-8
                border border-white/[0.05] hover:border-amber-500/20
                transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/5"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <MapPin className="w-8 h-8 text-amber-500/80 group-hover:text-amber-400 transition-colors duration-500" />
                                    <h3 className="text-2xl font-medium text-white/90">
                                        Getting There
                                    </h3>
                                </div>
                                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/5 to-transparent mb-6"></div>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-white/80 font-medium mb-2">
                                            Stadium Location
                                        </h4>
                                        <p className="text-white/50 font-light">
                                            Various stadiums across the host
                                            cities. Check your match details.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-white/80 font-medium mb-2">
                                            Transportation
                                        </h4>
                                        <p className="text-white/50 font-light">
                                            Public transport, taxi, or organized
                                            shuttle services available
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-white/80 font-medium mb-2">
                                            Parking
                                        </h4>
                                        <p className="text-white/50 font-light">
                                            Limited parking available. Public
                                            transport recommended.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Home;
