import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Sparkles, User, ShoppingBag } from "lucide-react";
import { PreferencesProvider } from "../context/preferences-context";

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <PreferencesProvider>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            {/* Left Side */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/5 rounded-full">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">AI-Powered Fashion Assistant</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-semibold tracking-tight">
                Find Your Perfect Outfit with AI
              </h1>
              <p className="text-lg text-neutral-600 max-w-lg">
                Our AI Virtual Stylist analyzes your unique style preferences, body type, and budget to recommend personalized outfits from our curated collection.
              </p>
              <Button
                size="lg"
                className="bg-black text-white hover:bg-black/90 px-8 py-6 text-lg"
                onClick={() => navigate("/questions")}
              >
                Start AI Styling
                <Sparkles className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Right Side */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1584448033590-3e5e5124f87a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBSSUyMGZhc2hpb24lMjBzdHlsaXN0JTIwYXNzaXN0YW50JTIwaWxsdXN0cmF0aW9ufGVufDF8fHx8MTc3MjgyOTE4NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="AI Fashion Assistant"
                  className="w-full h-[500px] object-cover"
                />
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">AI Match Score</p>
                    <p className="text-2xl font-semibold">98%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 border-neutral-200 hover:border-black transition-colors">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Personalized Outfit Recommendations</h3>
              <p className="text-neutral-600">
                AI-curated selections tailored to your unique taste and preferences.
              </p>
            </Card>

            <Card className="p-8 border-neutral-200 hover:border-black transition-colors">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                <User className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Based on Your Body & Style</h3>
              <p className="text-neutral-600">
                Recommendations that complement your body type, skin tone, and personal aesthetic.
              </p>
            </Card>

            <Card className="p-8 border-neutral-200 hover:border-black transition-colors">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real Store Products Only</h3>
              <p className="text-neutral-600">
                All recommendations are in-stock items available for immediate purchase.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </PreferencesProvider>
  );
}
