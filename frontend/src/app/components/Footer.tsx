import { Link } from 'react-router';
import { Facebook, Instagram, Twitter, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-neutral-50 border-t border-neutral-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">LUXE</h2>
            <p className="text-sm text-neutral-600">
              Premium fashion for the modern lifestyle. Discover timeless pieces that define your style.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-neutral-600 hover:text-black transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-neutral-600 hover:text-black transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-neutral-600 hover:text-black transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <Link to="/shop" className="hover:text-black transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/shop?category=men" className="hover:text-black transition-colors">
                  Men
                </Link>
              </li>
              <li>
                <Link to="/shop?category=women" className="hover:text-black transition-colors">
                  Women
                </Link>
              </li>
              <li>
                <Link to="/shop?sale=true" className="hover:text-black transition-colors">
                  Sale
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <a href="#" className="hover:text-black transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black transition-colors">
                  Shipping & Returns
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black transition-colors">
                  Size Guide
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-semibold mb-4">Account</h3>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <Link to="/login" className="hover:text-black transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-black transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-black transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link to="/order-history" className="hover:text-black transition-colors">
                  Order History
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-200 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-neutral-600">
              © 2026 LUXE. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-sm text-neutral-600 hover:text-black transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-neutral-600 hover:text-black transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-neutral-600 hover:text-black transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
