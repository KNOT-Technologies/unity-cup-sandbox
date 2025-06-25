import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  Moon, 
  Languages, 
  Users, 
  Tv, 
  ChevronDown,
  Star,
  Clock,
  MapPin,
  Calendar,
  Headphones,
  CreditCard,
  Info
} from 'lucide-react';

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <Moon className="w-8 h-8" />,
      title: "Exclusive Access Under the Stars",
      description: "Experience the pyramids in a unique evening setting with perfect viewing conditions."
    },
    {
      icon: <Languages className="w-8 h-8" />,
      title: "Live Multilingual Narration",
      description: "Professional narration available in multiple languages for an immersive experience."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Effortless Group Booking",
      description: "Special rates and dedicated support for tour operators and large groups."
    },
    {
      icon: <Tv className="w-8 h-8" />,
      title: "Rich Visuals & Soundscapes",
      description: "State-of-the-art projection mapping and surround sound technology."
    }
  ];

  const highlights = [
    {
      icon: <Star className="w-6 h-6" />,
      title: "5-Star Experience",
      description: "Rated excellent by over 10,000 visitors"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "1-Hour Show",
      description: "Perfect length for an evening activity"
    }
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
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70
                leading-[1.2] md:leading-[1.2] lg:leading-[1.2] tracking-wide pb-4"
              >
                Experience the Magic of Ancient Egypt
              </h1>

              <p className="text-xl md:text-2xl text-white/80 leading-relaxed tracking-wide
                max-w-3xl mx-auto font-light"
              >
                Journey through time with our spectacular Sound and Light Show at the Pyramids of Giza.
                Let the ancient stones tell their story under the starlit sky of Cairo.
              </p>

              <div className="flex flex-wrap justify-center gap-6">
                {highlights.map((highlight) => (
                  <div key={highlight.title} 
                    className="flex items-center gap-4 bg-white/[0.03] backdrop-blur-xl rounded-2xl px-8 py-4
                    border border-white/[0.05] hover:border-white/[0.1] transition-all duration-500
                    hover:bg-white/[0.05] hover:shadow-2xl hover:shadow-amber-500/5 group"
                  >
                    <span className="text-amber-500/80 group-hover:text-amber-400 transition-colors duration-500">
                      {highlight.icon}
                    </span>
                    <div className="text-left">
                      <p className="text-white/90 font-medium">{highlight.title}</p>
                      <p className="text-white/40 text-sm">{highlight.description}</p>
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
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                    translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  Book Your Experience
                </Link>
                <Link
                  to="/business-portal"
                  className="group relative overflow-hidden bg-white/[0.03] backdrop-blur-xl text-white hover:bg-white/[0.08]
                    px-10 py-5 rounded-2xl text-lg font-medium tracking-wider 
                    transition-all duration-500 min-w-[200px]
                    border border-white/[0.05] hover:border-white/[0.1]
                    hover:shadow-2xl hover:shadow-white/5"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent 
                    translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
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
            <span className="text-white/40 text-sm tracking-wider mb-2 font-light">Discover More</span>
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
              What Makes the Experience Unforgettable
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
                  <div className="text-amber-500/80 mb-8 transform group-hover:scale-110 group-hover:text-amber-400
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
              <div className="group bg-white/[0.02] backdrop-blur-xl rounded-3xl p-8
                border border-white/[0.05] hover:border-amber-500/20
                transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/5">
                <div className="flex items-center gap-4 mb-6">
                  <Info className="w-8 h-8 text-amber-500/80 group-hover:text-amber-400 transition-colors duration-500" />
                  <h3 className="text-2xl font-medium text-white/90">Visitor Info</h3>
                </div>
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/5 to-transparent mb-6"></div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white/80 font-medium mb-2">Translation Services</h4>
                    <p className="text-white/50 font-light">
                      Headphones available in 20+ languages. Book in advance.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-white/80 font-medium mb-2">Payment Methods</h4>
                    <p className="text-white/50 font-light">
                      All major cards, digital wallets, and cash (EGP).
                    </p>
                  </div>
                  <div>
                    <h4 className="text-white/80 font-medium mb-2">Accessibility</h4>
                    <p className="text-white/50 font-light">
                      Wheelchair accessible. Elderly assistance available.
                    </p>
                  </div>
                </div>
              </div>

              {/* What to Bring */}
              <div className="group bg-white/[0.02] backdrop-blur-xl rounded-3xl p-8
                border border-white/[0.05] hover:border-amber-500/20
                transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/5">
                <div className="flex items-center gap-4 mb-6">
                  <Headphones className="w-8 h-8 text-amber-500/80 group-hover:text-amber-400 transition-colors duration-500" />
                  <h3 className="text-2xl font-medium text-white/90">What to Bring</h3>
                </div>
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/5 to-transparent mb-6"></div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white/80 font-medium mb-2">Essential Items</h4>
                    <div className="space-y-2">
                      <p className="text-white/50 font-light flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500/50"></span>
                        Valid ID or passport
                      </p>
                      <p className="text-white/50 font-light flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500/50"></span>
                        Booking confirmation
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white/80 font-medium mb-2">Recommended</h4>
                    <div className="space-y-2">
                      <p className="text-white/50 font-light flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500/50"></span>
                        Light jacket (evenings can be cool)
                      </p>
                      <p className="text-white/50 font-light flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500/50"></span>
                        Camera (photography allowed)
                      </p>
                      <p className="text-white/50 font-light flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500/50"></span>
                        Cash for souvenirs
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Getting There */}
              <div className="group bg-white/[0.02] backdrop-blur-xl rounded-3xl p-8
                border border-white/[0.05] hover:border-amber-500/20
                transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/5">
                <div className="flex items-center gap-4 mb-6">
                  <MapPin className="w-8 h-8 text-amber-500/80 group-hover:text-amber-400 transition-colors duration-500" />
                  <h3 className="text-2xl font-medium text-white/90">Getting There</h3>
                </div>
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/5 to-transparent mb-6"></div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white/80 font-medium mb-2">Location</h4>
                    <p className="text-white/50 font-light">
                      Giza Pyramid Complex, Al Haram, Giza Governorate
                    </p>
                  </div>
                  <div>
                    <h4 className="text-white/80 font-medium mb-2">Transportation</h4>
                    <p className="text-white/50 font-light">
                      Taxi, Uber, or organized tour transport recommended
                    </p>
                  </div>
                  <div>
                    <h4 className="text-white/80 font-medium mb-2">Parking</h4>
                    <p className="text-white/50 font-light">
                      Free parking available on-site for visitors
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