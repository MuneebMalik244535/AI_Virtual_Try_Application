import { Routes, Route } from 'react-router';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { StyleEvolutionProvider } from './context/StyleEvolutionContext';
import { VoiceProvider } from './context/VoiceContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SpinWheel } from './components/SpinWheel';
import { ChatWidget } from './components/ChatWidget';
import { useLocation } from 'react-router';
import { Homepage } from './pages/Homepage';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { OrderHistory } from './pages/OrderHistory';
import { Wishlist } from './pages/Wishlist';
import { AdminDashboard } from './pages/AdminDashboard';
import { AIStylist } from './pages/AIStylist';
import { LandingPage } from './pages/stylist/landing-page';
import { QuestionFlow } from './pages/stylist/question-flow';
import { ImageUpload } from './pages/stylist/image-upload';
import { Processing } from './pages/stylist/processing';
import { Recommendations } from './pages/stylist/recommendations';
import { StyleEvolution } from './pages/StyleEvolution';
import { AdminAnalytics } from './pages/AdminAnalytics';
import { VirtualTryOn } from './pages/VirtualTryOn';

export default function App() {
  const location = useLocation();
  return (
    <ThemeProvider>
      <StyleEvolutionProvider>
        <VoiceProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Homepage />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/order-history" element={<OrderHistory />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/style-evolution" element={<StyleEvolution />} />
                  <Route path="/admin/analytics" element={<AdminAnalytics />} />
                  <Route path="/try-on" element={<VirtualTryOn />} />
                  <Route path="/stylist" element={<AIStylist />} />
                  <Route path="/stylist/questions" element={<QuestionFlow />} />
                  <Route path="/stylist/upload" element={<ImageUpload />} />
                  <Route path="/stylist/processing" element={<Processing />} />
                  <Route path="/stylist/recommendations" element={<Recommendations />} />
                </Routes>
              </main>
              <Footer />
              {/* 🎰 Lucky Spin Wheel & 💬 AI Chat Stylist — hidden on checkout */}
              {location.pathname !== '/checkout' && (
                <>
                  <SpinWheel />
                  <ChatWidget />
                </>
              )}
            </div>
          </CartProvider>
        </VoiceProvider>
      </StyleEvolutionProvider>
    </ThemeProvider>
  );
}
