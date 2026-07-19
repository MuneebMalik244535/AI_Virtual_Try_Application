import { Link, useLocation } from 'react-router';
import { ShoppingCart, Heart, User, Search, Menu, X, Sparkles, Mic, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useVoice } from '../context/VoiceContext';
import { useState, useEffect } from 'react';

export function Navbar() {
  const { getTotalItems, wishlist } = useCart();
  const { isListening, isProcessing, startListening, stopListening } = useVoice();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Men', path: '/shop?category=men' },
    { name: 'Women', path: '/shop?category=women' },
    { name: 'Sale', path: '/shop?sale=true' },
  ];

  const isActive = (path: string) => location.pathname === path && !location.search;

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? 'var(--nav-bg)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border-color)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 group">
            <h1 className="text-2xl font-semibold tracking-[0.2em] transition-colors duration-300 group-hover:opacity-80"
              style={{ color: 'var(--text-primary)' }}>
              LUXE
            </h1>
            <div className="h-[1px] w-0 group-hover:w-full transition-all duration-300" style={{ background: 'var(--accent)' }} />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path}
                className="relative text-xs tracking-widest uppercase font-medium transition-colors duration-200 group"
                style={{ color: isActive(link.path) ? 'var(--accent)' : 'var(--text-secondary)' }}>
                {link.name}
                <span className="absolute -bottom-1 left-0 h-[1px] transition-all duration-300"
                  style={{ background: 'var(--accent)', width: isActive(link.path) ? '100%' : '0' }} />
              </Link>
            ))}
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-2">
            <Link to="/stylist"
              className="hidden md:flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 hover:-translate-y-0.5"
              style={{ background: 'var(--accent)', color: 'var(--accent-text)', boxShadow: '0 2px 12px var(--accent-glow)' }}>
              <Sparkles className="w-3.5 h-3.5" /> AI Stylist
            </Link>
            <Link to="/stylist" className="md:hidden p-2 rounded-full transition-colors" style={{ color: 'var(--text-secondary)' }}>
              <Sparkles className="w-5 h-5" />
            </Link>
            
            {/* Voice Shopping Button */}
            <button 
              onClick={isListening ? stopListening : startListening}
              className={`p-2 rounded-full transition-all relative ${isListening ? 'animate-pulse' : ''}`} 
              style={{ color: isListening ? 'var(--accent)' : 'var(--text-secondary)' }}
              title="Voice Shopping">
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}
              {isListening && (
                 <span className="absolute inset-0 rounded-full animate-ping" style={{ border: '2px solid var(--accent)', opacity: 0.5 }} />
              )}
            </button>

            <button className="p-2 rounded-full transition-all" style={{ color: 'var(--text-secondary)' }}>
              <Search className="w-5 h-5" />
            </button>
            <Link to="/wishlist" className="p-2 rounded-full transition-all relative" style={{ color: 'var(--text-secondary)' }}>
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                  style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}>
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link to="/cart" className="p-2 rounded-full transition-all relative" style={{ color: 'var(--text-secondary)' }}>
              <ShoppingCart className="w-5 h-5" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                  style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}>
                  {getTotalItems()}
                </span>
              )}
            </Link>
            <Link to="/login" className="p-2 rounded-full transition-all" style={{ color: 'var(--text-secondary)' }}>
              <User className="w-5 h-5" />
            </Link>
            <button className="md:hidden p-2 rounded-full transition-all" style={{ color: 'var(--text-secondary)' }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-500 ${isMenuOpen ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}>
          <div className="flex flex-col space-y-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path}
                className="text-xs tracking-widest uppercase font-medium transition-colors"
                style={{ color: isActive(link.path) ? 'var(--accent)' : 'var(--text-secondary)' }}
                onClick={() => setIsMenuOpen(false)}>
                {link.name}
              </Link>
            ))}
            <Link to="/stylist"
              className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold"
              style={{ color: 'var(--accent)' }}
              onClick={() => setIsMenuOpen(false)}>
              <Sparkles className="w-4 h-4" /> AI Stylist
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
