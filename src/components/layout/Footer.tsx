import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageCircle, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useTermsAcceptance } from '../../hooks/useTermsAcceptance';

const Footer: React.FC = () => {
  const { resetTermsAcceptance } = useTermsAcceptance();

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Monster Production</h3>
            <p className="text-gray-400 mb-4">
              Empowering AI innovation through mentorship, tools, and community support.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/tools" className="text-gray-400 hover:text-white transition-colors">AI Tools</Link>
              </li>
              <li>
                <Link to="/request-help" className="text-gray-400 hover:text-white transition-colors">Request Help</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xl font-bold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={resetTermsAcceptance}
                  className="text-gray-400 hover:text-white transition-colors text-left"
                >
                  Terms & Conditions
                </button>
              </li>
              <li className="text-gray-400">Privacy Policy</li>
              <li className="text-gray-400">Cookie Policy</li>
              <li className="text-gray-400">Refund Policy</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-2 mt-0.5 text-purple-500" />
                <span className="text-gray-400">Buddheshwar,Lucknow,Uttar Pradesh  Pin(226017)</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-2 text-purple-500" />
                <span className="text-gray-400">+91 8303858857</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-2 text-purple-500" />
                <span className="text-gray-400">monsterproduction21@gmail.com</span>
              </li>
              <li className="flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-purple-500" />
                <span className="text-gray-400">Live chat available 9AM-5PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="max-w-md mx-auto">
            <h4 className="text-lg font-semibold mb-3">Subscribe to our newsletter</h4>
            <p className="text-gray-400 mb-4">Get the latest AI tools and mentorship opportunities delivered to your inbox.</p>
            <form className="flex">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-grow px-4 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                required
              />
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-r-md transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-8 pt-8 border-t border-gray-800">
          <p className="text-gray-500">
            &copy; {new Date().getFullYear()} Monster Production. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;