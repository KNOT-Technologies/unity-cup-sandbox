import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";

const Navbar = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isActive = (path: string) => {
        if (path === "/") {
            return location.pathname === "/";
        }
        return location.pathname === path;
    };

    const navItems = [
        "Home",
        "History",
        "Hospitality",
        "Tickets",
        "Information",
    ];
    const getPath = (item: string) => {
        if (item === "Home") return "/";
        return `/${item.toLowerCase().replace(" ", "-")}`;
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black pt-4">
            <div className="relative max-w-full px-8">
                <div className="flex items-center h-24">
                    {/* Logo */}
                    <motion.img
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        src="/UnityAfrexim.png.avif"
                        alt="Unity Afrexim Logo"
                        className="h-16 w-auto"
                    />

                    {/* Center container for menu and button - Absolutely positioned */}
                    <div className="absolute left-1/2 w-full -translate-x-1/2 hidden md:flex items-center justify-center space-x-8">
                        {/* Menu Items */}
                        <div className="flex items-center space-x-0">
                            {navItems.map((item, index) => (
                                <div key={item} className="flex items-center">
                                    <Link
                                        to={getPath(item)}
                                        className={`px-6 py-2 text-sm font-medium tracking-wider transition-all duration-300 
                      ${
                          isActive(getPath(item))
                              ? "text-[#4A90E2]"
                              : "text-white hover:text-gray-300"
                      }`}
                                    >
                                        {item}
                                    </Link>
                                    {index < navItems.length - 1 && (
                                        <div className="h-4 w-px bg-white/50"></div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Buy Tickets Button */}
                        <Link
                            to="/tickets"
                            className="px-8 py-2 bg-white text-black text-sm font-medium tracking-wider rounded-full hover:bg-gray-200 transition-colors duration-300"
                        >
                            Buy Tickets
                        </Link>
                    </div>

                    {/* Mobile Menu Button - Aligned to the right */}
                    <div className="md:hidden ml-auto">
                        <button
                            onClick={() =>
                                setIsMobileMenuOpen(!isMobileMenuOpen)
                            }
                            className="text-gray-300 hover:text-white transition-colors duration-300
                focus:outline-none rounded-lg p-2"
                        >
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d={
                                        isMobileMenuOpen
                                            ? "M6 18L18 6M6 6l12 12"
                                            : "M4 6h16M4 12h16M4 18h16"
                                    }
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div
                className={`md:hidden transition-all duration-500 ease-in-out
          ${
              isMobileMenuOpen
                  ? "max-h-96 opacity-100 border-t border-gray-800/50"
                  : "max-h-0 opacity-0"
          } 
          overflow-hidden bg-black`}
            >
                <div className="px-4 pt-2 pb-3 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item}
                            to={getPath(item)}
                            className={`block px-4 py-2 text-base font-medium tracking-wide
                transition-all duration-300 
                ${
                    isActive(getPath(item))
                        ? "text-[#4A90E2]"
                        : "text-white hover:text-gray-300"
                }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {item}
                        </Link>
                    ))}
                    <Link
                        to="/tickets"
                        className="block px-4 py-2 mt-2 text-base font-medium tracking-wide text-black bg-white rounded-full text-center"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Buy Tickets
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
