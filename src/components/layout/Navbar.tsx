import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, ChevronDown, Sparkles } from 'lucide-react';
import { throttle } from '../../utils/performance';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut, isAdmin } = useAuth();
  const location = useLocation();

  // Throttled scroll handler for better performance
  const handleScroll = useCallback(
    throttle(() => {
      const offset = window.scrollY;
      setScrolled(offset > 50);
    }, 16), // ~60fps
    []
  );

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const handleSignOut = async () => {
    await signOut();
  };

  const navigationItems = [
    { path: '/', label: 'Home' },
    { path: '/tools', label: 'AI Tools' },
    { path: '/competitions', label: 'Competitions' },
    { path: '/hackathons', label: 'Hackathons' },
    { path: '/projects', label: 'Projects' },
    { path: '/certificates', label: 'Certificates' },
    { path: '/request-help', label: 'Request Help' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-lg py-2' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:via-pink-500 group-hover:to-purple-600 transition-all duration-500">
              Monster Production
              <Sparkles className="w-5 h-5 inline-block ml-2 text-purple-600 animate-pulse" />
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map(({ path, label }) => (
              <Link 
                key={path}
                to={path} 
                className={`px-4 py-2 rounded-full text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all duration-300 font-medium ${
                  location.pathname === path ? 'bg-purple-50 text-purple-600' : ''
                }`}
              >
                {label}
              </Link>
            ))}

            {/* Auth/Profile buttons */}
            {user ? (
              <div className="relative group ml-2">
                <button className="flex items-center px-4 py-2 rounded-full text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all duration-300 font-medium">
                  My Account <ChevronDown className="ml-1 w-4 h-4 transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 z-50">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                  >
                    Profile
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 ml-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full text-purple-600 hover:text-purple-800 hover:bg-purple-50 transition-all duration-300 font-medium"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300 font-medium transform hover:scale-105"
                >
                  Sign up
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden flex items-center p-2 rounded-lg hover:bg-purple-50 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden fixed inset-0 bg-white/95 backdrop-blur-lg transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full pt-20 pb-6 px-6">
          <div className="flex-grow">
            {navigationItems.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`block py-3 text-lg font-medium transition-colors ${
                  location.pathname === path
                    ? 'text-purple-600'
                    : 'text-gray-700 hover:text-purple-600'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
          
          <div className="border-t border-gray-100 pt-6">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="block py-3 text-lg font-medium text-gray-700 hover:text-purple-600 transition-colors"
                >
                  Profile
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="block py-3 text-lg font-medium text-gray-700 hover:text-purple-600 transition-colors"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left py-3 text-lg font-medium text-gray-700 hover:text-purple-600 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="block w-full py-3 text-center text-lg font-medium text-purple-600 hover:text-purple-800 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="block w-full py-3 text-center text-lg font-medium bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;