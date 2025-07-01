import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Calendar,
    Receipt,
    LogOut,
    LayoutDashboard,
    CreditCard,
    X,
} from "lucide-react";
import knotLogo from "../../assets/KNOT LW.png";

interface SidebarItem {
    name: string;
    path: string;
    icon: React.ReactNode;
}

const sidebarItems: SidebarItem[] = [
    {
        name: "Dashboard",
        path: "/business",
        icon: <LayoutDashboard className="w-6 h-6" />,
    },
    {
        name: "Buy Credits",
        path: "/business/credits",
        icon: <CreditCard className="w-6 h-6" />,
    },
    {
        name: "Bookings",
        path: "/business/bookings",
        icon: <Calendar className="w-6 h-6" />,
    },
    {
        name: "Order History",
        path: "/business/orders",
        icon: <Receipt className="w-6 h-6" />,
    },
];

interface SidebarProps {
    onLogout: () => void;
    /**
     * Whether the sidebar is open on mobile screens. Ignored on md and above where the sidebar is always visible.
     */
    isOpen?: boolean;
    /**
     * Optional callback when the close (X) button is pressed on mobile.
     */
    onClose?: () => void;
}

const Sidebar = ({ onLogout, isOpen = false, onClose }: SidebarProps) => {
    const location = useLocation();

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    return (
        <div
            className={`w-64 min-h-screen bg-black fixed left-0 top-0 z-40 transform transition-transform duration-300
            ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
        >
            {/* Logo & Close Button (mobile) */}
            <div className="h-24 flex items-center justify-center relative">
                <Link to="/business" className="block">
                    <img src={knotLogo} alt="KNOT" className="h-14 w-auto" />
                </Link>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-1/2 -translate-y-1/2 md:hidden text-gray-400 hover:text-white transition-colors"
                        aria-label="Close menu"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Navigation Items */}
            <nav className="mt-8">
                {sidebarItems.map((item) => (
                    <Link
                        key={item.name}
                        to={item.path}
                        className={`flex items-center gap-4 px-6 py-5 transition-all duration-300 relative
              ${
                  isActive(item.path)
                      ? "text-amber-400"
                      : "text-gray-400 hover:text-amber-300"
              }`}
                    >
                        {isActive(item.path) && (
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent" />
                        )}
                        <motion.div
                            initial={false}
                            animate={{
                                color: isActive(item.path)
                                    ? "#fbbf24"
                                    : "#9ca3af",
                            }}
                            className="flex-shrink-0 z-10"
                        >
                            {item.icon}
                        </motion.div>
                        <span className="font-medium text-base z-10">
                            {item.name}
                        </span>
                    </Link>
                ))}
            </nav>

            {/* Logout Button */}
            <div className="absolute bottom-4 left-4 right-4">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center gap-3 px-4 py-4
            bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300
            transition-all duration-300 text-base font-medium border border-red-500/20"
                >
                    <LogOut className="w-6 h-6" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
