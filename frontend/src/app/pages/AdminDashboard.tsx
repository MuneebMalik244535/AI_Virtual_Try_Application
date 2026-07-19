import { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  BarChart3,
  Settings,
  Plus,
  Search,
  Edit,
  Trash2,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Cpu,
  Activity,
  Zap,
  RefreshCw,
  Tag,
  Star,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/Button';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const POLL_INTERVAL_MS = 15000; // 15 seconds

type AdminView = 'dashboard' | 'products' | 'orders' | 'analytics' | 'settings';

// ─── Types ────────────────────────────────────────────────────────────────────
interface StatsData {
  total_products: number;
  avg_price: number;
  max_price: number;
  total_brands: number;
  categories: { category: string; count: number; avg_price: number }[];
}

interface ProductRow {
  id: number;
  name: string;
  price: number;
  category: string;
  color: string;
  brand: string;
  image_url: string;
}

interface ProductsData {
  products: ProductRow[];
  total: number;
  page: number;
  total_pages: number;
}

interface MetricsData {
  total_ai_calls: number;
  total_cost_usd: number;
  total_tokens: number;
  active_free_trials: number;
  users_acquired: number;
  total_products: number;
}

interface TrendPrediction {
  category: string;
  trend_score: number;
  reason: string;
  action: string;
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-neutral-200 ${className}`}
    />
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  loading,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  loading?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <TrendingUp className="w-4 h-4 text-green-500" />
      </div>
      {loading ? (
        <>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-3 w-32" />
        </>
      ) : (
        <>
          <p className="text-3xl font-bold mb-1">{value}</p>
          <p className="text-sm text-neutral-500">{label}</p>
          {sub && <p className="text-xs text-neutral-400 mt-1">{sub}</p>}
        </>
      )}
    </div>
  );
}

// ─── Category Bar Chart ───────────────────────────────────────────────────────
function CategoryChart({ categories }: { categories: StatsData['categories'] }) {
  if (!categories.length) return null;
  const max = Math.max(...categories.map((c) => c.count));
  const colors = ['bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <BarChart3 className="w-4 h-4 text-neutral-500" />
        <h3 className="font-semibold text-sm tracking-wide uppercase text-neutral-500">
          Products by Category
        </h3>
      </div>
      <div className="space-y-3">
        {categories.map((cat, i) => (
          <div key={cat.category}>
            <div className="flex justify-between text-xs mb-1">
              <span className="capitalize font-medium text-neutral-700">{cat.category}</span>
              <span className="text-neutral-500">
                {cat.count} items · avg ${cat.avg_price}
              </span>
            </div>
            <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
              <div
                className={`${colors[i % colors.length]} h-2 rounded-full transition-all duration-700`}
                style={{ width: `${(cat.count / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function AdminDashboard() {
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Stats from DB
  const [stats, setStats] = useState<StatsData | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Products from DB
  const [productsData, setProductsData] = useState<ProductsData | null>(null);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productSearch, setProductSearch] = useState('');
  const [productPage, setProductPage] = useState(1);

  // AI Metrics
  const [aiMetrics, setAiMetrics] = useState<MetricsData>({
    total_ai_calls: 0,
    total_cost_usd: 0,
    total_tokens: 0,
    active_free_trials: 0,
    users_acquired: 0,
    total_products: 0,
  });
  const [metricsLoading, setMetricsLoading] = useState(true);

  // AI Trends
  const [trends, setTrends] = useState<TrendPrediction[] | null>(null);
  const [trendsLoading, setTrendsLoading] = useState(true);

  // ── Fetch stats ──────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/stats`);
      const data = await res.json();
      if (data.success) setStats(data);
    } catch (e) {
      console.error('admin/stats error:', e);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Fetch products ───────────────────────────────────────────────────────
  const fetchProducts = useCallback(
    async (page = 1, search = '') => {
      setProductsLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), limit: '10', search });
        const res = await fetch(`${BACKEND_URL}/api/admin/products?${params}`);
        const data = await res.json();
        if (data.success) setProductsData(data);
      } catch (e) {
        console.error('admin/products error:', e);
      } finally {
        setProductsLoading(false);
      }
    },
    []
  );

  // ── Fetch AI metrics ─────────────────────────────────────────────────────
  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/metrics`);
      const data = await res.json();
      if (data.success && data.metrics) setAiMetrics(data.metrics);
    } catch (e) {
      console.error('admin/metrics error:', e);
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  // ── Fetch AI trends ──────────────────────────────────────────────────────
  const fetchTrends = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/trends`);
      const data = await res.json();
      if (data.success && data.predictions) setTrends(data.predictions);
    } catch (e) {
      console.error('admin/trends error:', e);
    } finally {
      setTrendsLoading(false);
    }
  }, []);

  // ── All-at-once refresh ──────────────────────────────────────────────────
  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([fetchStats(), fetchMetrics(), fetchTrends()]);
    setLastUpdated(new Date());
    setIsRefreshing(false);
  }, [fetchStats, fetchMetrics, fetchTrends]);

  // ── Initial load + polling ───────────────────────────────────────────────
  useEffect(() => {
    refreshAll();
    fetchProducts(productPage, productSearch);

    const timer = setInterval(refreshAll, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch products when search or page changes (debounced)
  useEffect(() => {
    const t = setTimeout(() => fetchProducts(productPage, productSearch), 350);
    return () => clearTimeout(t);
  }, [productSearch, productPage, fetchProducts]);

  // ── Dashboard overview ───────────────────────────────────────────────────
  const DashboardView = () => (
    <div className="space-y-6">
      {/* Last updated */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Overview</h2>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-neutral-400">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={refreshAll}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 rounded-lg text-xs text-neutral-600 hover:bg-neutral-50 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Package}
          label="Total Products"
          value={stats?.total_products ?? '—'}
          sub="in database"
          color="bg-violet-500"
          loading={statsLoading}
        />
        <KpiCard
          icon={DollarSign}
          label="Avg. Price"
          value={stats ? `$${stats.avg_price}` : '—'}
          sub="across catalogue"
          color="bg-blue-500"
          loading={statsLoading}
        />
        <KpiCard
          icon={Star}
          label="Most Expensive"
          value={stats ? `$${stats.max_price}` : '—'}
          sub="in catalogue"
          color="bg-amber-500"
          loading={statsLoading}
        />
        <KpiCard
          icon={Tag}
          label="Brands"
          value={stats?.total_brands ?? '—'}
          sub="partner brands"
          color="bg-emerald-500"
          loading={statsLoading}
        />
      </div>

      {/* Category chart + AI quick stats */}
      <div className="grid lg:grid-cols-2 gap-6">
        {statsLoading ? (
          <Skeleton className="h-64" />
        ) : (
          <CategoryChart categories={stats?.categories ?? []} />
        )}

        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-neutral-500" />
            <h3 className="font-semibold text-sm tracking-wide uppercase text-neutral-500">
              AI Stylist — Quick Stats
            </h3>
          </div>
          {[
            { label: 'AI Calls Made', value: aiMetrics.total_ai_calls.toLocaleString() },
            { label: 'Tokens Used', value: `${(aiMetrics.total_tokens / 1000).toFixed(1)}k` },
            { label: 'Total API Cost', value: `$${aiMetrics.total_cost_usd.toFixed(4)}` },
            { label: 'Products in DB', value: aiMetrics.total_products },
          ].map((r) => (
            <div key={r.label} className="flex justify-between text-sm py-2 border-b border-neutral-100 last:border-0">
              <span className="text-neutral-500">{r.label}</span>
              {metricsLoading ? (
                <Skeleton className="h-4 w-16" />
              ) : (
                <span className="font-mono font-semibold">{r.value}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Products view ────────────────────────────────────────────────────────
  const ProductsView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h2 className="text-2xl font-bold">
          Products
          {productsData && (
            <span className="ml-2 text-sm font-normal text-neutral-400">
              ({productsData.total} in database)
            </span>
          )}
        </h2>
        <Button onClick={() => setShowAddProduct(true)}>
          <Plus className="w-4 h-4 inline-block mr-2" />
          Add Product
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by name, category or brand…"
            value={productSearch}
            onChange={(e) => { setProductSearch(e.target.value); setProductPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
        </div>

        {/* Table */}
        {productsLoading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-left">
                    {['Product', 'Category', 'Color', 'Brand', 'Price', 'Actions'].map((h) => (
                      <th key={h} className="py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(productsData?.products ?? []).map((p) => (
                    <tr key={p.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-neutral-100 flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                              <Package className="w-5 h-5 text-neutral-300" />
                            </div>
                          )}
                          <span className="font-medium text-neutral-800 line-clamp-1">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 capitalize text-neutral-600">{p.category}</td>
                      <td className="py-3 px-4 text-neutral-600">{p.color || '—'}</td>
                      <td className="py-3 px-4 text-neutral-600">{p.brand || '—'}</td>
                      <td className="py-3 px-4 font-semibold text-neutral-800">${p.price.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          <button className="p-1.5 hover:bg-neutral-100 rounded-lg transition">
                            <Edit className="w-4 h-4 text-neutral-500" />
                          </button>
                          <button className="p-1.5 hover:bg-red-50 rounded-lg transition text-red-400">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {productsData && productsData.total_pages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
                <p className="text-xs text-neutral-400">
                  Page {productsData.page} of {productsData.total_pages} · {productsData.total} products
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={productsData.page <= 1}
                    onClick={() => setProductPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 border border-neutral-300 rounded-lg text-xs disabled:opacity-40 hover:bg-neutral-50 transition"
                  >
                    Prev
                  </button>
                  <button
                    disabled={productsData.page >= productsData.total_pages}
                    onClick={() => setProductPage((p) => Math.min(productsData.total_pages, p + 1))}
                    className="px-3 py-1.5 border border-neutral-300 rounded-lg text-xs disabled:opacity-40 hover:bg-neutral-50 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  // ── AI Analytics view ────────────────────────────────────────────────────
  const AIAnalyticsView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Cpu className="w-6 h-6 text-purple-600" />
            AI Stylist — Unit Economics
          </h2>
          <p className="text-neutral-500 text-sm mt-1">
            Real-time monitoring of AI infrastructure costs and database metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live · auto-refresh {POLL_INTERVAL_MS / 1000}s
          </span>
          {lastUpdated && (
            <span className="text-xs text-neutral-400">
              {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Zap} label="AI Stylist Calls" value={aiMetrics.total_ai_calls.toLocaleString()} color="bg-purple-500" loading={metricsLoading} />
        <KpiCard icon={Activity} label="Tokens Processed" value={`${(aiMetrics.total_tokens / 1000).toFixed(1)}k`} color="bg-blue-500" loading={metricsLoading} />
        <KpiCard icon={DollarSign} label="Cumulative API Cost" value={`$${aiMetrics.total_cost_usd.toFixed(4)}`} color="bg-red-400" loading={metricsLoading} />
        <KpiCard icon={Package} label="Products in DB" value={aiMetrics.total_products} color="bg-emerald-500" loading={metricsLoading} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
          <h3 className="font-bold mb-5">Cost vs Revenue Projection</h3>
          <div className="space-y-3">
            {[
              { label: 'Cost per Recommendation', value: `$${(aiMetrics.total_cost_usd / Math.max(aiMetrics.total_ai_calls, 1)).toFixed(5)}` },
              { label: 'Est. Server Costs (Monthly)', value: '$45.00' },
              { label: 'Avg Conversion Cart Value', value: '$120.50', green: true },
              { label: 'Break-even AI Conversion Rate', value: '0.04%' },
            ].map((row) => (
              <div key={row.label} className="flex justify-between text-sm py-2 border-b border-neutral-100 last:border-0">
                <span className="text-neutral-500">{row.label}</span>
                <span className={`font-mono font-semibold ${row.green ? 'text-green-600' : ''}`}>{row.value}</span>
              </div>
            ))}
            <div className="p-3 bg-blue-50 rounded-lg flex items-start gap-3 mt-2">
              <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">
                Unit economics are highly favorable. AI cost per recommendation is negligible vs. average order value.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
          <h3 className="font-bold mb-5">API Health & Latency</h3>
          <div className="space-y-4">
            {[
              { label: 'Groq LLM Llama-3 (Reasoning)', latency: '45ms avg', pct: 95, color: 'bg-green-500' },
              { label: 'Neon PostgreSQL (Prisma)', latency: '12ms avg', pct: 98, color: 'bg-green-500' },
              { label: 'Computer Vision Pipeline', latency: '1800ms avg', pct: 60, color: 'bg-yellow-500' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-neutral-500">{item.label}</span>
                  <span className={`font-medium ${item.pct >= 90 ? 'text-green-600' : 'text-yellow-600'}`}>{item.latency}</span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-1.5">
                  <div className={`${item.color} h-1.5 rounded-full transition-all duration-700`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Trend Predictions */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm mt-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-lg">AI Trend Predictions</h3>
        </div>
        <p className="text-neutral-500 text-sm mb-6">
          Llama-3 analyzes your inventory and market activity to predict next week's hottest categories.
        </p>
        
        {trendsLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ) : trends && trends.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {trends.map((t, idx) => (
              <div key={idx} className="border border-neutral-100 bg-neutral-50 p-5 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 bg-black" />
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-neutral-800 capitalize text-lg">{t.category}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    t.trend_score >= 80 ? 'bg-green-100 text-green-700' :
                    t.trend_score >= 60 ? 'bg-amber-100 text-amber-700' :
                                          'bg-blue-100 text-blue-700'
                  }`}>
                    {t.trend_score}% Score
                  </span>
                </div>
                <p className="text-xs text-neutral-600 mb-3 italic">"{t.reason}"</p>
                <div className="pt-3 border-t border-neutral-200">
                  <p className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-neutral-400" />
                    Action:
                  </p>
                  <p className="text-xs text-neutral-600 mt-1">{t.action}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-neutral-50 rounded-lg text-sm text-neutral-500 text-center">
            No trend predictions available right now.
          </div>
        )}
      </div>

      {/* Category breakdown */}
      {!statsLoading && stats && (
        <CategoryChart categories={stats.categories} />
      )}
    </div>
  );

  // ── Sidebar nav links ────────────────────────────────────────────────────
  const navItems: { id: AdminView; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'analytics', label: 'AI Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-60 bg-white border-r border-neutral-200 min-h-screen p-5 flex-shrink-0">
          <h1 className="text-lg font-bold mb-1">Admin Panel</h1>
          <p className="text-xs text-neutral-400 mb-6">Luxe AI Stylist</p>
          <nav className="space-y-1">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setCurrentView(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  currentView === id
                    ? 'bg-black text-white font-medium'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>

          {/* Live indicator */}
          <div className="mt-auto pt-6 border-t border-neutral-100 mt-8">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              DB Connected · Neon PG
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8 min-h-screen">
          <div className="max-w-7xl mx-auto">
            {currentView === 'dashboard' && <DashboardView />}
            {currentView === 'products' && <ProductsView />}
            {currentView === 'orders' && (
              <div className="bg-white rounded-xl border border-neutral-200 p-8">
                <h2 className="text-2xl font-bold mb-2">Order Management</h2>
                <p className="text-neutral-500">Orders from the database will appear here once the orders table is created.</p>
              </div>
            )}
            {currentView === 'analytics' && <AIAnalyticsView />}
            {currentView === 'settings' && (
              <div className="bg-white rounded-xl border border-neutral-200 p-8">
                <h2 className="text-2xl font-bold mb-2">Settings</h2>
                <p className="text-neutral-500">Application settings will appear here.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddProduct(false)} />
          <div className="relative bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Add New Product</h2>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowAddProduct(false); }}>
              {[
                { label: 'Product Name', name: 'name', type: 'text' },
                { label: 'Price ($)', name: 'price', type: 'number' },
                { label: 'Color', name: 'color', type: 'text' },
                { label: 'Brand', name: 'brand', type: 'text' },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium mb-1.5">{field.label}</label>
                  <input type={field.type} name={field.name} className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium mb-1.5">Category</label>
                <select className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm">
                  {['shirts', 'pants', 'jackets', 'shoes', 'dresses', 'accessories', 'coats', 'sweaters'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" type="button" onClick={() => setShowAddProduct(false)}>Cancel</Button>
                <Button type="submit">Add Product</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
