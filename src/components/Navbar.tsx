import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = ['Home', 'Tickets'];
  const getPath = (item: string) => {
    if (item === 'Home') return '/';
    return `/${item.toLowerCase().replace(' ', '-')}`;
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
      ${isScrolled 
        ? 'bg-black/95 backdrop-blur-xl shadow-2xl shadow-black/20 border-b border-gray-800/50' 
        : 'bg-black/80 backdrop-blur-lg'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          <div className="flex-shrink-0">
            <Link 
              to="/" 
              className="text-2xl font-medium tracking-wide group relative"
            >
              <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400 
                bg-clip-text text-transparent group-hover:opacity-80 transition-opacity duration-300">
                Unity Cup
              </span>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-amber-400 
                group-hover:w-full transition-all duration-500"></div>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item}
                to={getPath(item)}
                className={`relative px-3 py-2 text-sm font-medium tracking-wider
                  transition-all duration-300 ${isActive(getPath(item))
                    ? 'text-yellow-400' 
                    : 'text-gray-300 hover:text-yellow-300'}`}
              >
                {item}
                <div className={`absolute -bottom-1 left-1/2 w-1.5 h-1.5 rounded-full 
                  transform -translate-x-1/2 transition-all duration-300 
                  ${isActive(getPath(item))
                    ? 'bg-yellow-400 scale-100'
                    : 'bg-yellow-400/0 scale-0 group-hover:scale-75 group-hover:bg-yellow-400/50'}`}>
                </div>
              </Link>
            ))}
            <div className="flex items-center space-x-4">
              <Link
                to="/tickets"
                className="bg-gradient-to-r from-yellow-500 to-amber-500 text-gray-900 
                  px-6 py-2 rounded-xl font-medium tracking-wider
                  hover:shadow-lg hover:shadow-yellow-500/20 
                  active:scale-95 transform transition-all duration-300
                  focus:outline-none focus:ring-2 focus:ring-yellow-500/60"
              >
                Book Now
              </Link>
              <Link
                to="/business/login"
                className="text-yellow-400 hover:text-yellow-300 px-5 py-2
                  font-medium tracking-wider transition-colors duration-300
                  border border-yellow-400/30 hover:border-yellow-300/50 rounded-xl
                  backdrop-blur-sm hover:backdrop-blur-lg"
              >
                Business Portal
              </Link>
            </div>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-yellow-300 transition-colors duration-300
                focus:outline-none focus:ring-2 focus:ring-yellow-500/60 rounded-lg p-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden transition-all duration-500 ease-in-out
          ${isMobileMenuOpen 
            ? 'max-h-96 opacity-100 border-t border-gray-800/50' 
            : 'max-h-0 opacity-0'} 
          overflow-hidden backdrop-blur-xl bg-black/90`}
      >
        <div className="px-4 pt-2 pb-3 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item}
              to={getPath(item)}
              className={`block px-4 py-3 rounded-xl text-base font-medium tracking-wide
                transition-all duration-300 ${isActive(getPath(item))
                  ? 'bg-yellow-500/10 text-yellow-400'
                  : 'text-gray-300 hover:bg-yellow-500/5 hover:text-yellow-300'}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item}
            </Link>
          ))}
          <Link
            to="/tickets"
            className="block mt-4 bg-gradient-to-r from-yellow-500 to-amber-500 
              text-gray-900 px-4 py-3 rounded-xl text-base font-medium tracking-wider text-center
              hover:shadow-lg hover:shadow-yellow-500/20 active:scale-95 
              transform transition-all duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Book Now
          </Link>
          <Link
            to="/business/login"
            className="block mt-2 text-yellow-400 hover:text-yellow-300 px-4 py-3
              font-medium tracking-wider transition-colors duration-300 text-center
              border border-yellow-400/30 hover:border-yellow-300/50 rounded-xl
              backdrop-blur-sm hover:backdrop-blur-lg"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Business Portal
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 