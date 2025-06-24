import { useState } from 'react';
import { motion } from 'framer-motion';

interface TicketType {
  id: string;
  name: string;
  basePrice: number;
  quantity: number;
}

interface PricingTier {
  minQuantity: number;
  discount: number;
}

const BusinessPortal = () => {
  const [formData, setFormData] = useState({
    agencyName: '',
    contactName: '',
    email: '',
    phone: '',
    date: '',
    timeSlot: '',
  });

  const [tickets, setTickets] = useState<TicketType[]>([
    { id: 'localAdult', name: 'Local Adult', basePrice: 200, quantity: 0 },
    { id: 'localStudent', name: 'Local Student', basePrice: 150, quantity: 0 },
    { id: 'touristAdult', name: 'Tourist Adult', basePrice: 400, quantity: 0 },
    { id: 'touristStudent', name: 'Tourist Student', basePrice: 300, quantity: 0 },
  ]);

  const [isSubmitted, setIsSubmitted] = useState(false);

  const pricingTiers: PricingTier[] = [
    { minQuantity: 50, discount: 0.20 }, // 20% off for 50+ tickets
    { minQuantity: 20, discount: 0.10 }, // 10% off for 20+ tickets
    { minQuantity: 0, discount: 0 },     // No discount
  ];

  const timeSlots = [
    '19:00 - English Show',
    '20:30 - Arabic Show',
    '22:00 - French Show',
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTicketChange = (id: string, value: number) => {
    setTickets(tickets.map(ticket =>
      ticket.id === id ? { ...ticket, quantity: Math.max(0, value) } : ticket
    ));
  };

  const getTotalQuantity = () => {
    return tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
  };

  const getDiscount = () => {
    const totalQuantity = getTotalQuantity();
    return pricingTiers.find(tier => totalQuantity >= tier.minQuantity)?.discount || 0;
  };

  const calculateTotal = () => {
    const subtotal = tickets.reduce((sum, ticket) => sum + (ticket.quantity * ticket.basePrice), 0);
    const discount = getDiscount();
    return subtotal * (1 - discount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    // In a real application, this would send data to a backend
  };

  return (
    <div className="min-h-screen bg-gray-900 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Introduction Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6 tracking-wide">
            Business Portal
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Exclusive access for travel agencies and tour operators. Enjoy special bulk pricing
            and streamlined booking process for group tours.
          </p>
        </motion.div>

        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-serif font-semibold text-white mb-4">
                Thank You for Your Request
              </h2>
              <p className="text-gray-300 mb-6">
                We've received your bulk booking request. Our team will review the details
                and contact you within 24 hours to finalize your booking.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-yellow-400 hover:text-yellow-300 font-medium tracking-wide"
              >
                Submit Another Request
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bulk Order Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <form onSubmit={handleSubmit} className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50">
                <h2 className="text-2xl font-serif font-semibold text-white mb-6">
                  Bulk Order Request
                </h2>
                
                {/* Agency Details */}
                <div className="space-y-4 mb-8">
                  <div>
                    <label htmlFor="agencyName" className="block text-sm font-medium text-gray-300 mb-2">
                      Agency Name
                    </label>
                    <input
                      type="text"
                      id="agencyName"
                      name="agencyName"
                      required
                      value={formData.agencyName}
                      onChange={handleInputChange}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3
                        text-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500/50
                        focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="contactName" className="block text-sm font-medium text-gray-300 mb-2">
                      Contact Person Name
                    </label>
                    <input
                      type="text"
                      id="contactName"
                      name="contactName"
                      required
                      value={formData.contactName}
                      onChange={handleInputChange}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3
                        text-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500/50
                        focus:border-transparent transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3
                        text-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500/50
                        focus:border-transparent transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3
                        text-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500/50
                        focus:border-transparent transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">
                      Desired Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      required
                      value={formData.date}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3
                        text-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500/50
                        focus:border-transparent transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label htmlFor="timeSlot" className="block text-sm font-medium text-gray-300 mb-2">
                      Time Slot
                    </label>
                    <select
                      id="timeSlot"
                      name="timeSlot"
                      required
                      value={formData.timeSlot}
                      onChange={handleInputChange}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3
                        text-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500/50
                        focus:border-transparent transition-all duration-300"
                    >
                      <option value="">Select a time slot</option>
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Ticket Selection */}
                <div className="space-y-4 mb-8">
                  <h3 className="text-xl font-serif font-semibold text-white mb-4">
                    Ticket Selection
                  </h3>
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between">
                      <label htmlFor={ticket.id} className="text-gray-300">
                        {ticket.name} (EGP {ticket.basePrice})
                      </label>
                      <input
                        type="number"
                        id={ticket.id}
                        min="0"
                        value={ticket.quantity}
                        onChange={(e) => handleTicketChange(ticket.id, parseInt(e.target.value) || 0)}
                        className="w-24 bg-gray-900/50 border border-gray-700 rounded-xl px-3 py-2
                          text-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500/50
                          focus:border-transparent transition-all duration-300"
                      />
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="border-t border-gray-700/50 pt-6 mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">Subtotal:</span>
                    <span className="text-white">
                      EGP {calculateTotal().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Applied Discount:</span>
                    <span className="text-yellow-400">
                      {(getDiscount() * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 
                    text-gray-900 px-8 py-4 rounded-xl text-lg font-medium tracking-wider
                    hover:shadow-lg hover:shadow-yellow-500/20 
                    active:scale-95 transform transition-all duration-300
                    focus:outline-none focus:ring-2 focus:ring-yellow-500/60"
                >
                  Submit Request
                </button>
              </form>
            </motion.div>

            {/* Pricing Table */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50"
            >
              <h2 className="text-2xl font-serif font-semibold text-white mb-6">
                Bulk Pricing
              </h2>
              
              <div className="space-y-6">
                {/* Regular Prices */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Regular Prices</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {tickets.map((ticket) => (
                      <div key={ticket.id} className="flex justify-between items-center">
                        <span className="text-gray-300">{ticket.name}</span>
                        <span className="text-white">EGP {ticket.basePrice}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Discount Tiers */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Discount Tiers</h3>
                  <div className="space-y-3">
                    {pricingTiers.filter(tier => tier.discount > 0).map((tier) => (
                      <div key={tier.minQuantity} 
                        className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50">
                        <div className="flex justify-between items-center">
                          <span className="text-yellow-400 font-medium">
                            {tier.minQuantity}+ tickets
                          </span>
                          <span className="text-white">
                            {(tier.discount * 100).toFixed(0)}% off
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Example Calculations */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Example Savings</h3>
                  <div className="space-y-3">
                    <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50">
                      <div className="text-sm text-gray-400 mb-2">20 Tourist Adult Tickets</div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Regular Price</span>
                        <span className="text-white">EGP 8,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">With 10% Discount</span>
                        <span className="text-yellow-400">EGP 7,200</span>
                      </div>
                    </div>
                    <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50">
                      <div className="text-sm text-gray-400 mb-2">50 Tourist Adult Tickets</div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Regular Price</span>
                        <span className="text-white">EGP 20,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">With 20% Discount</span>
                        <span className="text-yellow-400">EGP 16,000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessPortal; 