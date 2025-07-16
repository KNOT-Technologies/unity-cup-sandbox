import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, User, LogOut } from "lucide-react";
import { useUserAuth } from "../hooks/useUserAuth";
import UserAuthModal from "./auth/UserAuthModal";

const Navbar = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState<"login" | "register">(
        "login"
    );
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

    const { user, isAuthenticated, logout, isLoading } = useUserAuth();

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

    const handleAuthSuccess = () => {
        setIsAuthModalOpen(false);
    };

    const handleLogout = () => {
        logout();
        setIsUserDropdownOpen(false);
    };

    const openAuthModal = (mode: "login" | "register") => {
        setAuthModalMode(mode);
        setIsAuthModalOpen(true);
    };

    return (
        <>
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
                                    <div
                                        key={item}
                                        className="flex items-center"
                                    >
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

                        {/* Right side - Auth and Mobile Menu */}
                        <div className="ml-auto flex items-center space-x-4">
                            {/* Desktop Auth Dropdown */}
                            <div className="hidden md:block relative">
                                {isLoading ? (
                                    <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                ) : isAuthenticated && user ? (
                                    <div className="relative">
                                        <button
                                            onClick={() =>
                                                setIsUserDropdownOpen(
                                                    !isUserDropdownOpen
                                                )
                                            }
                                            className="flex items-center space-x-2 px-4 py-2 text-white hover:text-gray-300 transition-colors duration-300 rounded-lg hover:bg-white/10"
                                        >
                                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                                <User className="w-4 h-4 text-white " />
                                            </div>
                                            <ChevronDown
                                                className={`w-4 h-4 transition-transform duration-200 ${
                                                    isUserDropdownOpen
                                                        ? "rotate-180"
                                                        : ""
                                                }`}
                                            />
                                        </button>

                                        <AnimatePresence>
                                            {isUserDropdownOpen && (
                                                <motion.div
                                                    initial={{
                                                        opacity: 0,
                                                        y: -10,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    exit={{
                                                        opacity: 0,
                                                        y: -10,
                                                    }}
                                                    className="absolute right-0 top-full mt-2 w-64 bg-black/90 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden"
                                                >
                                                    <div className="p-4 border-b border-white/10">
                                                        <p className="text-white font-medium">
                                                            {user.fullName}
                                                        </p>
                                                        <p className="text-gray-400 text-sm">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                    <div className="p-2">
                                                        <button
                                                            onClick={
                                                                handleLogout
                                                            }
                                                            className="w-full flex items-center space-x-2 px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
                                                        >
                                                            <LogOut className="w-4 h-4" />
                                                            <span>
                                                                Sign Out
                                                            </span>
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() =>
                                                openAuthModal("login")
                                            }
                                            className="px-4 py-2 text-sm font-medium text-white hover:text-gray-300 transition-colors duration-300"
                                        >
                                            Sign In
                                        </button>
                                        <button
                                            onClick={() =>
                                                openAuthModal("register")
                                            }
                                            className="px-6 py-2 bg-white text-black text-sm font-medium tracking-wider rounded-full hover:bg-gray-200 transition-colors duration-300"
                                        >
                                            Register
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Mobile Menu Button */}
                            <div className="md:hidden">
                                <button
                                    onClick={() =>
                                        setIsMobileMenuOpen(!isMobileMenuOpen)
                                    }
                                    className="text-gray-300 hover:text-white transition-colors duration-300 focus:outline-none rounded-lg p-2"
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

                        {/* Mobile Auth Section */}
                        <div className="pt-4 border-t border-gray-800/50 mt-4">
                            {isLoading ? (
                                <div className="px-4 py-2 flex items-center justify-center">
                                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                </div>
                            ) : isAuthenticated && user ? (
                                <div className="space-y-2">
                                    <div className="px-4 py-2">
                                        <p className="text-white font-medium">
                                            {user.fullName}
                                        </p>
                                        <p className="text-gray-400 text-sm">
                                            {user.email}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="w-full flex items-center space-x-2 px-4 py-2 text-white hover:bg-white/10 transition-colors duration-200"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <button
                                        onClick={() => {
                                            openAuthModal("login");
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="block w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors duration-200 rounded-lg mx-2"
                                    >
                                        Sign In
                                    </button>
                                    <button
                                        onClick={() => {
                                            openAuthModal("register");
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="block w-full px-4 py-2 mx-2 text-center text-black bg-white rounded-full hover:bg-gray-200 transition-colors duration-200"
                                    >
                                        Register
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Auth Modal */}
            <UserAuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onSuccess={handleAuthSuccess}
                initialMode={authModalMode}
            />
        </>
    );
};

export default Navbar;
