import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import image1 from '../assets/Image 1.png';
import image2 from '../assets/Image 2.png';
import image3 from '../assets/Image 3.png';

const Home = () => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const galleryImages = [
    {
      url: image1,
      alt: 'Pyramids illuminated at night',
      caption: 'Spectacular evening light show'
    },
    {
      url: image2,
      alt: 'Sphinx with colorful projections',
      caption: 'Ancient stories brought to life'
    },
    {
      url: image3,
      alt: 'Audience enjoying the show',
      caption: 'Immersive viewing experience'
    }
  ];

  const testimonials = [
    {
      quote: "An absolutely mesmerizing experience. The way they bring history to life is unlike anything I've seen before.",
      author: "Sarah M.",
      role: "Tourist from UK"
    },
    {
      quote: "Perfect for our tour groups. The multiple language options and group booking process make it a must-include in our Egypt packages.",
      author: "Ahmed H.",
      role: "Tour Operator"
    },
    {
      quote: "The combination of lights, sound, and the majestic pyramids created an unforgettable evening under the stars.",
      author: "Carlos R.",
      role: "Travel Blogger"
    }
  ];

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
      title: "Exclusive Access Under the Stars",
      description: "Experience the pyramids in a unique evening setting with perfect viewing conditions."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
            d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
      title: "Live Multilingual Narration",
      description: "Professional narration available in multiple languages for an immersive experience."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: "Effortless Group Booking",
      description: "Special rates and dedicated support for tour operators and large groups."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: "Rich Visuals & Soundscapes",
      description: "State-of-the-art projection mapping and surround sound technology."
    }
  ];

  return (
    <div className="relative min-h-screen">
      {/* Video Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-gray-900"></div>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          poster="/pyramid-poster.jpg"
        >
          <source src="/pyramid-light.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Content */}
      <div className="relative min-h-screen flex flex-col">
        {/* Hero Section */}
        <main className="flex-grow container mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white
                leading-tight tracking-wide mb-6"
              >
                Experience the Magic of Ancient Egypt
              </h1>

              <p className="text-lg md:text-xl text-gray-300 leading-relaxed tracking-wide
                max-w-2xl mx-auto"
              >
                Journey through time with our spectacular Sound and Light Show at the Pyramids of Giza.
                Let the ancient stones tell their story under the starlit sky of Cairo.
              </p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-8"
              >
                <Link
                  to="/tickets"
                  className="bg-gradient-to-r from-yellow-500 to-amber-500 text-gray-900
                    px-8 py-4 rounded-xl text-lg font-medium tracking-wider
                    hover:shadow-lg hover:shadow-yellow-500/20 
                    active:scale-95 transform transition-all duration-300
                    focus:outline-none focus:ring-2 focus:ring-yellow-500/60"
                >
                  Book Your Experience
                </Link>
                <Link
                  to="/business-portal"
                  className="text-yellow-400 hover:text-yellow-300 px-8 py-4
                    text-lg font-medium tracking-wider transition-colors duration-300
                    border border-yellow-400/30 hover:border-yellow-300/50 rounded-xl
                    backdrop-blur-sm hover:backdrop-blur-lg"
                >
                  Travel Agencies →
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
          >
            <span className="text-yellow-400/80 text-sm tracking-wider mb-2">Discover More</span>
            <div className="animate-bounce">
              <svg className="w-6 h-6 text-yellow-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </motion.div>
        </main>

        {/* Features Section */}
        <section className="relative py-24 bg-black/40 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-3xl md:text-4xl font-serif font-bold text-center text-white mb-16"
            >
              What Makes the Experience Unforgettable
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className="bg-black/20 backdrop-blur-sm rounded-2xl p-6
                    border border-white/10 hover:border-yellow-500/30
                    transform hover:scale-105 transition-all duration-500
                    group"
                >
                  <div className="text-yellow-400 mb-4 transform group-hover:scale-110 
                    transition-transform duration-500"
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="relative py-32 bg-gradient-to-b from-black/30 to-gray-900/30 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-20"
            >
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white 
                tracking-wide leading-tight"
              >
                Captured Moments
              </h2>
              <div className="mt-4 w-24 h-px mx-auto bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent"></div>
            </motion.div>

            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {galleryImages.map((image, index) => (
                  <motion.div
                    key={image.url}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.2 }}
                    className="group relative bg-gray-900/20 rounded-2xl 
                      overflow-hidden shadow-xl shadow-black/20
                      backdrop-blur-sm border border-white/5
                      transition-all duration-500 ease-out
                      hover:shadow-2xl hover:shadow-yellow-500/10
                      hover:border-yellow-500/20
                      hover:-translate-y-1"
                  >
                    {/* Aspect ratio container */}
                    <div className="relative w-full pt-[75%]"> {/* 4:3 aspect ratio */}
                      {/* Image container */}
                      <div className="absolute inset-0 overflow-hidden">
                        <img
                          src={image.url}
                          alt={image.alt}
                          className="w-full h-full object-cover object-center
                            transform transition-all duration-700 ease-out
                            group-hover:scale-110 group-hover:brightness-110"
                        />
                        
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t 
                          from-black/90 via-black/30 to-transparent
                          opacity-60 group-hover:opacity-40
                          transition-all duration-300"
                        ></div>
                        
                        {/* Caption */}
                        <div className="absolute bottom-0 left-0 right-0 p-6
                          transform translate-y-2 group-hover:translate-y-0
                          transition-all duration-300 ease-out"
                        >
                          <h3 className="text-white/90 font-serif text-xl mb-2
                            group-hover:text-yellow-400/90"
                          >
                            {image.alt}
                          </h3>
                          <p className="text-white/70 text-sm tracking-wide
                            transform opacity-0 -translate-y-4
                            group-hover:opacity-100 group-hover:translate-y-0
                            transition-all duration-300 delay-100"
                          >
                            {image.caption}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Hover glow effect */}
                    <div className="absolute -inset-px rounded-2xl opacity-0
                      group-hover:opacity-30 duration-500 ease-out
                      bg-gradient-to-tr from-yellow-500 via-yellow-400/50 to-amber-500
                      mix-blend-overlay pointer-events-none"
                    ></div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="relative py-24 bg-black/40 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-3xl md:text-4xl font-serif font-bold text-center text-white mb-16"
            >
              What Our Visitors Say
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.author}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className="backdrop-blur-md bg-slate-800/40 rounded-2xl p-8
                    border border-white/10 shadow-lg shadow-black/20"
                >
                  <svg className="w-8 h-8 text-yellow-400/60 mb-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                  <p className="italic text-gray-200 mb-6 leading-relaxed">
                    {testimonial.quote}
                  </p>
                  <div>
                    <p className="text-white font-medium">{testimonial.author}</p>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Plan Your Visit Section */}
        <section className="relative py-24 bg-gradient-to-b from-black/30 to-gray-900/30 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-3xl md:text-4xl font-serif font-bold text-center text-white mb-16"
            >
              Plan Your Visit
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="bg-black/20 backdrop-blur-sm rounded-2xl p-6
                  border border-white/10"
              >
                <h3 className="text-xl font-serif font-semibold text-white mb-4">Show Times</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    19:00 - English Show
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    20:30 - Arabic Show
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    22:00 - French Show
                  </li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-black/20 backdrop-blur-sm rounded-2xl p-6
                  border border-white/10"
              >
                <h3 className="text-xl font-serif font-semibold text-white mb-4">Languages</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    English
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    Arabic
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    French
                  </li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="bg-black/20 backdrop-blur-sm rounded-2xl p-6
                  border border-white/10"
              >
                <h3 className="text-xl font-serif font-semibold text-white mb-4">Facilities</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Wheelchair Accessible
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Restroom Facilities
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Refreshment Area
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative py-8 text-center text-gray-400 bg-black/60 backdrop-blur-sm">
          <p className="text-sm tracking-wide">
            © {new Date().getFullYear()} Sound & Light Show. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Home; 