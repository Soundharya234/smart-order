import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiYoutube } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-[#121212] text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-[#FFD600] rounded-xl flex items-center justify-center">
                <span className="text-black font-black text-sm">Q</span>
              </div>
              <div>
                <span className="text-[#FFD600] font-black text-lg">Quick</span>
                <span className="text-[#00C853] font-black text-lg">Pick</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-4">"Freshness Delivered Fast"</p>
            <p className="text-xs">Your trusted grocery partner delivering freshness at lightning speed, every day.</p>
          </div>
          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {['Home', 'Products', 'Offers', 'About Us', 'Contact'].map(l => (
                <li key={l}><Link to="/" className="hover:text-[#FFD600] transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm">
              {['Vegetables', 'Fruits', 'Dairy & Eggs', 'Snacks', 'Beverages', 'Instant Foods'].map(c => (
                <li key={c}><Link to={`/products?category=${c.toLowerCase()}`} className="hover:text-[#FFD600] transition-colors">{c}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <div className="space-y-2 text-sm">
              <p>📍 Trichy, Tamil Nadu</p>
              <p>📞 +91 98943 20183</p>
              <p>✉️ support@quickpick.com</p>
            </div>
            <div className="flex gap-3 mt-4">
              {[FiFacebook, FiTwitter, FiInstagram, FiYoutube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-[#1E1E1E] hover:bg-[#FFD600] hover:text-black text-gray-400 rounded-xl flex items-center justify-center transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-[#2E2E2E] mt-8 pt-6 text-center text-xs">
          <p>© 2026 QuickPick. All rights reserved. Built with ❤️ by LeoFrankline Edison</p>
        </div>
      </div>
    </footer>
  );
}
