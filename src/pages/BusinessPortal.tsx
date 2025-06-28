import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  ClipboardList, 
  Receipt, 
  Settings,
  LogOut,
  LayoutDashboard,
  CreditCard,
  Clock,
  Plus,
  Percent,
  Coins,
  Check,
  Download,
  CalendarDays,
  Ticket,
  FileText,
  Upload,
  Users
} from 'lucide-react';
import { useState } from 'react';
import Sidebar from '../components/common/Sidebar';
import DatePicker from '../components/tickets/DatePicker';
import ShowTimeSelector from '../components/tickets/ShowTimeSelector';
import SeatMap from '../components/tickets/SeatMap';
import TicketSummary from '../components/tickets/TicketSummary';
import TranslationSelector from '../components/tickets/TranslationSelector';
import GuestUploadModal from '../components/common/GuestUploadModal';
import DashboardCharts from '../components/dashboard/DashboardCharts';
import DemographicCharts from '../components/dashboard/DemographicCharts';
import type { UserType, Seat, TicketType, SelectedSeat } from '../types/tickets';

const creditPackages = [
  {
    credits: 100,
    expiryMonths: 1,
    price: 450,
    pricePerCredit: 4.50,
    discount: 0
  },
  {
    credits: 500,
    expiryMonths: 2,
    price: 2000,
    pricePerCredit: 4.00,
    discount: 11
  },
  {
    credits: 1000,
    expiryMonths: 3,
    price: 3500,
    pricePerCredit: 3.50,
    discount: 22
  }
];

// Credit costs for different ticket types and zones
const CREDIT_COSTS = {
  regular: {
    senior: 2,
    adult: 2,
    student: 1,
    child: 1
  },
  vip: {
    senior: 3,
    adult: 3,
    student: 2,
    child: 2
  }
} as const;

// Mock invoice data - in a real app, this would come from your backend
const ticketOrders = [
  {
    id: 'INV-2024-001',
    date: '2024-03-15',
    tickets: 45,
    credits: 135,
    amount: 2025,
    status: 'Paid'
  },
  {
    id: 'INV-2024-002',
    date: '2024-03-12',
    tickets: 60,
    credits: 180,
    amount: 2700,
    status: 'Paid'
  },
  {
    id: 'INV-2024-003',
    date: '2024-03-08',
    tickets: 80,
    credits: 240,
    amount: 3600,
    status: 'Paid'
  },
  {
    id: 'INV-2024-004',
    date: '2024-03-05',
    tickets: 35,
    credits: 105,
    amount: 1575,
    status: 'Paid'
  },
  {
    id: 'INV-2024-005',
    date: '2024-02-28',
    tickets: 50,
    credits: 150,
    amount: 2250,
    status: 'Paid'
  },
  {
    id: 'INV-2024-006',
    date: '2024-02-25',
    tickets: 65,
    credits: 195,
    amount: 2925,
    status: 'Paid'
  },
  {
    id: 'INV-2024-007',
    date: '2024-02-20',
    tickets: 75,
    credits: 225,
    amount: 3375,
    status: 'Paid'
  },
  {
    id: 'INV-2024-008',
    date: '2024-02-15',
    tickets: 40,
    credits: 120,
    amount: 1800,
    status: 'Paid'
  }
];

// Mock credit purchase data
const creditPurchases = [
  {
    id: 'CRD-2024-001',
    date: '2024-03-14',
    credits: 500,
    amount: 2250,
  },
  {
    id: 'CRD-2024-002',
    date: '2024-03-01',
    credits: 1000,
    amount: 4500,
  },
  {
    id: 'CRD-2024-003',
    date: '2024-02-15',
    credits: 200,
    amount: 900,
  },
  {
    id: 'CRD-2024-004',
    date: '2024-02-01',
    credits: 750,
    amount: 3375,
  }
];

const BusinessPortal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSuccess, setShowSuccess] = useState(false);
  const [purchasedCredits, setPurchasedCredits] = useState(0);
  
  // Booking state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>();
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [translationPreference, setTranslationPreference] = useState<{
    needed: boolean;
    language?: string;
  }>({
    needed: false
  });
  const [availableCredits] = useState(100); // This would come from your backend in a real app
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Mock user data - in a real app, this would come from your auth context/state
  const user = {
    name: "John Smith",
    initials: "JS"
  };

  const handleLogout = () => {
    navigate('/business/login');
  };

  const handlePurchase = (credits: number) => {
    // In a real app, this would make an API call to process the purchase
    setPurchasedCredits(credits);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000); // Hide after 3 seconds
  };

  const handleSeatSelect = (seat: Seat, ticketType: TicketType) => {
    const creditCost = CREDIT_COSTS[seat.zone][ticketType];
    const newSelectedSeats = [
      ...selectedSeats,
      {
        ...seat,
        ticketType,
        price: creditCost // We use this field for credit cost instead of money
      }
    ];
    setSelectedSeats(newSelectedSeats);
  };

  const handleSeatRemove = (seatId: string) => {
    setSelectedSeats((prev) => prev.filter((seat) => seat.id !== seatId));
  };

  const handleTranslationChange = (needed: boolean, language?: string) => {
    setTranslationPreference({ needed, language });
  };

  const handleProceedToCheckout = () => {
    // In a real app, this would make an API call to process the booking
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedSeats([]);
      setSelectedTime(undefined);
    }, 3000);
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    // In a real app, this would trigger a PDF download
    console.log('Downloading invoice:', invoiceId);
  };

  const handleUploadGuestDetails = () => {
    setShowUploadModal(true);
  };

  const handleGuestFileUpload = async (file: File): Promise<number> => {
    // In a real app, this would be an API call to process the file
    // For now, we'll simulate processing with a delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return a mock number of processed guests
    return Math.floor(Math.random() * 20) + 10;
  };

  const getPageIcon = () => {
    switch (location.pathname) {
      case '/business/credits':
        return <CreditCard className="w-8 h-8 text-amber-400" strokeWidth={2} />;
      case '/business/bookings':
        return <Calendar className="w-8 h-8 text-amber-400" strokeWidth={2} />;
      case '/business/orders':
        return <Receipt className="w-8 h-8 text-amber-400" strokeWidth={2} />;
      case '/business/settings':
        return <Settings className="w-8 h-8 text-amber-400" strokeWidth={2} />;
      default:
        return <LayoutDashboard className="w-8 h-8 text-amber-400" strokeWidth={2} />;
    }
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/business/credits':
        return 'Buy Credits';
      case '/business/bookings':
        return 'Bookings';
      case '/business/orders':
        return 'Order History';
      case '/business/settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Sidebar onLogout={handleLogout} />
      
      {/* Success Messages */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-24 left-64 right-0 z-50 flex justify-end px-12"
          >
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/30 to-emerald-500/0 rounded-lg blur-xl opacity-50"></div>
              <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 backdrop-blur-xl 
                border border-emerald-500/20 rounded-lg p-4 relative flex items-center gap-3">
                <div className="bg-emerald-500/20 rounded-full p-1">
                  <Check className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-emerald-400 font-medium">Purchase Successful!</p>
                  <p className="text-emerald-400/80 text-sm">{purchasedCredits} credits have been added to your account</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with Welcome Message */}
      <div className="fixed top-0 left-64 right-0 h-24 bg-black z-0 flex items-center justify-end px-12">
        <div className="flex items-center gap-6">
          <p className="text-white text-xl font-semibold tracking-wide">{user.name}</p>
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-lg blur-xl opacity-50"></div>
            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-500/5 backdrop-blur-xl border border-amber-500/20 flex items-center justify-center relative">
              <span className="text-amber-400 font-medium text-base">{user.initials}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area with Grey Panel */}
      <div className="ml-64 pt-24 relative z-10">
        <div className="min-h-[calc(100vh-6rem)] bg-[#737373]/10 backdrop-blur-md rounded-tl-[2rem] border-t border-l border-white/5 shadow-2xl">
          <main className="p-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="h-full"
            >
              <div className="mb-12">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-lg blur-xl opacity-50"></div>
                    <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-2 relative
                      backdrop-blur-xl border border-amber-500/20 transition-colors duration-300">
                      {getPageIcon()}
                    </div>
                  </div>
                  <h1 className="text-4xl font-semibold text-white tracking-wide">
                    {getPageTitle()}
                  </h1>
                </div>
                                <div className="h-0.5 w-full bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent" />
                  </div>

              {/* Dashboard */}
              {location.pathname === '/business' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <DashboardCharts />
                  <DemographicCharts />
                </motion.div>
              )}

              {/* Order History Tables */}
              {location.pathname === '/business/orders' && (
                <div className="grid grid-cols-2 gap-8">
                  {/* Ticket Orders Table */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-black/20 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden
                      hover:border-amber-500/20 transition-all duration-500 
                      hover:shadow-2xl hover:shadow-amber-500/5"
                  >
                    <div className="px-6 py-4 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-lg blur-xl opacity-50"></div>
                          <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-2 relative
                            backdrop-blur-xl border border-amber-500/20">
                            <Ticket className="w-6 h-6 text-amber-400" strokeWidth={2} />
                          </div>
                        </div>
                        <h2 className="text-xl font-semibold text-amber-400">Ticket Orders</h2>
                      </div>
                    </div>
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1.5">
                              <div className="relative">
                                <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-lg blur-xl opacity-30"></div>
                                <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-1 relative
                                  backdrop-blur-xl border border-amber-500/20">
                                  <CalendarDays className="w-4 h-4 text-amber-400" />
                                </div>
                              </div>
                              <span className="text-white/80 font-semibold text-sm">Date</span>
                            </div>
                          </th>
                          <th className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1.5">
                              <div className="relative">
                                <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-lg blur-xl opacity-30"></div>
                                <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-1 relative
                                  backdrop-blur-xl border border-amber-500/20">
                                  <Ticket className="w-4 h-4 text-amber-400" />
                                </div>
                              </div>
                              <span className="text-white/80 font-semibold text-sm">Tickets</span>
                            </div>
                          </th>
                          <th className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1.5">
                              <div className="relative">
                                <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-lg blur-xl opacity-30"></div>
                                <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-1 relative
                                  backdrop-blur-xl border border-amber-500/20">
                                  <Coins className="w-4 h-4 text-amber-400" />
                  </div>
                  </div>
                              <span className="text-white/80 font-semibold text-sm">Credits</span>
                  </div>
                          </th>
                          <th className="px-4 py-3"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {ticketOrders.map((order) => (
                          <tr 
                            key={order.id}
                            className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200"
                          >
                            <td className="px-4 py-3 text-center">
                              <span className="text-white/80 text-xs">{new Date(order.date).toLocaleDateString()}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-base font-semibold text-white">{order.tickets.toLocaleString()}</span>
                              <span className="text-white/60 text-xs ml-1">tickets</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-base font-semibold text-white">{order.credits.toLocaleString()}</span>
                              <span className="text-white/60 text-xs ml-1">credits</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button 
                                onClick={() => handleDownloadInvoice(order.id)}
                                className="px-3 py-1.5 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/5 
                                  backdrop-blur-xl border border-purple-500/20 hover:border-purple-500/40 
                                  transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20
                                  group flex items-center gap-1.5"
                              >
                                <Download className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform duration-300" />
                                <span className="text-purple-400 text-xs font-medium">PDF</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>

                  {/* Credit Purchases Table */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="bg-black/20 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden
                      hover:border-amber-500/20 transition-all duration-500 
                      hover:shadow-2xl hover:shadow-amber-500/5"
                    >
                    <div className="px-6 py-4 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-lg blur-xl opacity-50"></div>
                          <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-2 relative
                            backdrop-blur-xl border border-amber-500/20">
                            <Coins className="w-6 h-6 text-amber-400" strokeWidth={2} />
                  </div>
                </div>
                        <h2 className="text-xl font-semibold text-amber-400">Credit Purchases</h2>
                      </div>
                    </div>
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1.5">
                              <div className="relative">
                                <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-lg blur-xl opacity-30"></div>
                                <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-1 relative
                                  backdrop-blur-xl border border-amber-500/20">
                                  <CalendarDays className="w-4 h-4 text-amber-400" />
                                </div>
                              </div>
                              <span className="text-white/80 font-semibold text-sm">Date</span>
                            </div>
                          </th>
                          <th className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1.5">
                              <div className="relative">
                                <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-lg blur-xl opacity-30"></div>
                                <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-1 relative
                                  backdrop-blur-xl border border-amber-500/20">
                                  <Coins className="w-4 h-4 text-amber-400" />
                                </div>
                              </div>
                              <span className="text-white/80 font-semibold text-sm">Credits</span>
                            </div>
                          </th>
                          <th className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1.5">
                              <div className="relative">
                                <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-lg blur-xl opacity-30"></div>
                                <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-1 relative
                                  backdrop-blur-xl border border-amber-500/20">
                                  <CreditCard className="w-4 h-4 text-amber-400" />
                                </div>
                              </div>
                              <span className="text-white/80 font-semibold text-sm">Amount</span>
                            </div>
                          </th>
                          <th className="px-4 py-3"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {creditPurchases.map((purchase) => (
                          <tr 
                            key={purchase.id}
                            className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200"
                          >
                            <td className="px-4 py-3 text-center">
                              <span className="text-white/80 text-xs">{new Date(purchase.date).toLocaleDateString()}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-base font-semibold text-white">{purchase.credits.toLocaleString()}</span>
                              <span className="text-white/60 text-xs ml-1">credits</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-base font-semibold text-amber-400">${purchase.amount.toLocaleString()}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button 
                                onClick={() => handleDownloadInvoice(purchase.id)}
                                className="px-3 py-1.5 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/5 
                                  backdrop-blur-xl border border-purple-500/20 hover:border-purple-500/40 
                                  transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20
                                  group flex items-center gap-1.5"
                              >
                                <Download className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform duration-300" />
                                <span className="text-purple-400 text-xs font-medium">PDF</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>
                </div>
              )}

              {/* Credits Table - Only show on credits page */}
              {location.pathname === '/business/credits' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-black/20 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden
                    hover:border-amber-500/20 transition-all duration-500 
                    hover:shadow-2xl hover:shadow-amber-500/5"
                >
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <div className="relative">
                              <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-lg blur-xl opacity-30"></div>
                              <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-1 relative
                                backdrop-blur-xl border border-amber-500/20">
                                <Coins className="w-4 h-4 text-amber-400" />
                              </div>
                            </div>
                            <span className="text-white/80 font-semibold text-sm">Credits</span>
                          </div>
                        </th>
                        <th className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <div className="relative">
                              <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-lg blur-xl opacity-30"></div>
                              <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-1 relative
                                backdrop-blur-xl border border-amber-500/20">
                                <Clock className="w-4 h-4 text-amber-400" />
                              </div>
                            </div>
                            <span className="text-white/80 font-semibold text-sm">Expiry</span>
                          </div>
                        </th>
                        <th className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <div className="relative">
                              <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-lg blur-xl opacity-30"></div>
                              <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-1 relative
                                backdrop-blur-xl border border-amber-500/20">
                                <CreditCard className="w-4 h-4 text-amber-400" />
                              </div>
                            </div>
                            <span className="text-white/80 font-semibold text-sm">Total Price</span>
                  </div>
                        </th>
                        <th className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <div className="relative">
                              <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-lg blur-xl opacity-30"></div>
                              <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-1 relative
                                backdrop-blur-xl border border-amber-500/20">
                                <Percent className="w-4 h-4 text-amber-400" />
                  </div>
                </div>
                            <span className="text-white/80 font-semibold text-sm">Price Per Credit</span>
                          </div>
                        </th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {creditPackages.map((pkg, index) => (
                        <tr 
                          key={index}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200"
                        >
                          <td className="px-4 py-3 text-center">
                            <span className="text-2xl font-semibold text-white">{pkg.credits}</span>
                            <span className="text-white/60 ml-1">credits</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-white/80">{pkg.expiryMonths} months</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-2xl font-semibold text-amber-400">${pkg.price}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-white/80">${pkg.pricePerCredit}/credit</span>
                              {pkg.discount > 0 && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-400 font-medium">
                                  {pkg.discount}% OFF
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                <button
                              onClick={() => handlePurchase(pkg.credits)}
                              className="px-4 py-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 
                                backdrop-blur-xl border border-emerald-500/20 hover:border-emerald-500/40 
                                transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20
                                group flex items-center gap-2"
                            >
                              <Plus className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
                              <span className="text-emerald-400 font-medium">Buy</span>
                </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
            </motion.div>
              )}

              {/* Bookings Interface - Only show on bookings page */}
              {location.pathname === '/business/bookings' && (
                <div className="w-full px-4 sm:px-6">
                  <div className="space-y-4 sm:space-y-6">
                    {/* Available Credits Display and Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                      <div className="bg-amber-500/10 backdrop-blur-sm rounded-xl border border-amber-500/20 p-3 flex-1">
                        <div className="flex items-center gap-2">
                          <Coins className="w-4 h-4 text-amber-400" />
                          <span className="text-white/90 text-sm">Credits: {availableCredits}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate('/business/credits')}
                        className="px-3 py-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 
                          backdrop-blur-xl border border-emerald-500/20 hover:border-emerald-500/40 
                          transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20
                          flex items-center justify-center gap-2 flex-1 sm:flex-initial"
                      >
                        <Plus className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400 text-sm font-medium whitespace-nowrap">Buy Credits</span>
                      </button>
                      <button
                        onClick={handleUploadGuestDetails}
                        className="px-3 py-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 
                          backdrop-blur-xl border border-purple-500/20 hover:border-purple-500/40 
                          transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20
                          flex items-center justify-center gap-2 flex-1 sm:flex-initial"
                      >
                        <Upload className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-400 text-sm font-medium whitespace-nowrap">Upload Guest Details</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      <DatePicker 
                        selectedDate={selectedDate} 
                        onDateSelect={setSelectedDate}
                      />
                      <ShowTimeSelector 
                        selectedTime={selectedTime} 
                        onTimeSelect={setSelectedTime}
                        showTimes={[]}
                        className="h-full"
                      />
                      <TranslationSelector
                        onTranslationChange={handleTranslationChange}
                        className="w-full"
                      />
                    </div>
                    
                    {selectedTime && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-x-auto pb-4 -mx-4 sm:mx-0 px-4 sm:px-0"
                      >
                        <div className="min-w-[800px] lg:min-w-0">
                          <SeatMap
                            userType="tourist"
                            onUserTypeChange={() => {}} // Disabled for business portal
                            onSeatSelect={handleSeatSelect}
                            onSeatDeselect={handleSeatRemove}
                            selectedSeatIds={selectedSeats.map(seat => seat.id)}
                            selectedDate={selectedDate}
                            selectedShowTime={selectedTime}
                            useCredits={true}
                            creditCosts={CREDIT_COSTS}
                          />
                        </div>
                      </motion.div>
                    )}

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TicketSummary
                        selectedSeats={selectedSeats}
                        userType="tourist"
                        onRemoveSeat={handleSeatRemove}
                        onProceedToCheckout={handleProceedToCheckout}
                        translationPreference={translationPreference}
                        useCredits={true}
                        creditCosts={CREDIT_COSTS}
                      />
                    </motion.div>
                  </div>
                </div>
              )}
            </motion.div>
          </main>
          </div>
      </div>

      {/* Guest Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <GuestUploadModal
            onClose={() => setShowUploadModal(false)}
            onUpload={handleGuestFileUpload}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default BusinessPortal; 