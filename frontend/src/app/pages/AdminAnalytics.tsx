import { useStyleEvolution } from '../context/StyleEvolutionContext';
import { BarChart2, Clock, MousePointer, TrendingUp, Users, Zap, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';

function msToReadable(ms: number) {
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`;
    return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
}

function Bar({ pct, glow }: { pct: number; glow?: boolean }) {
    return (
        <div className="h-2 rounded-full overflow-hidden flex-1" style={{ background: 'var(--border-color)' }}>
            <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: 'var(--accent)', boxShadow: glow ? '0 0 6px var(--accent-glow)' : 'none' }} />
        </div>
    );
}

export function AdminAnalytics() {
    const { events, snapshots, getTopProducts } = useStyleEvolution();
    const [animIn, setAnimIn] = useState(false);
    const [lastRefresh, setLastRefresh] = useState(new Date());
    useEffect(() => { const t = setTimeout(() => setAnimIn(true), 100); return () => clearTimeout(t); }, []);

    const topProducts = getTopProducts();
    const totalHoverMs = events.filter(e => e.action === 'hover').reduce((a, e) => a + e.duration, 0);
    const totalClicks = events.filter(e => e.action === 'click').length;

    // Page dwell time
    const pageDwell: Record<string, number> = {};
    for (const ev of events) {
        pageDwell[ev.page] = (pageDwell[ev.page] || 0) + ev.duration;
    }
    const maxPageDwell = Math.max(...Object.values(pageDwell), 1);

    // Category engagement
    const catEngagement: Record<string, { time: number; clicks: number }> = {};
    for (const ev of events) {
        const cat = ev.category.toLowerCase();
        if (!catEngagement[cat]) catEngagement[cat] = { time: 0, clicks: 0 };
        catEngagement[cat].time += ev.duration;
        if (ev.action === 'click') catEngagement[cat].clicks += 1;
    }
    const maxCatTime = Math.max(...Object.values(catEngagement).map(c => c.time), 1);

    // Hourly activity (last 24h)
    const nowMs = Date.now();
    const hourlyBuckets = Array(24).fill(0);
    for (const ev of events) {
        const ageH = (nowMs - ev.timestamp) / 3600000;
        if (ageH < 24) {
            const bucket = 23 - Math.floor(ageH);
            hourlyBuckets[bucket] += ev.duration / 1000;
        }
    }
    const maxHourly = Math.max(...hourlyBuckets, 1);

    // Recent events feed (last 20)
    const recentFeed = [...events].sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);

    return (
        <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh' }}>
            <div className="fixed top-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-8 pointer-events-none"
                style={{ background: 'var(--accent)' }} />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 pt-28">
                {/* Header */}
                <div className={`mb-10 transition-all duration-700 ${animIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className="flex items-end justify-between flex-wrap gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-px w-8" style={{ background: 'var(--accent)' }} />
                                <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--accent)' }}>Store Intelligence</span>
                            </div>
                            <h1 className="text-4xl font-thin">User <span className="font-bold italic" style={{ color: 'var(--accent)' }}>Behaviour</span> Analytics</h1>
                            <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                                Real-time tracking of hover time, clicks, and page engagement on this device.
                                <span className="ml-2 font-semibold" style={{ color: 'var(--accent)' }}>{events.length} events recorded.</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
                                style={{ background: 'color-mix(in srgb, #22c55e 10%, transparent)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}>
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                Live Tracking
                            </div>
                            <button onClick={() => setLastRefresh(new Date())}
                                className="p-2 rounded-full transition-colors" style={{ color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* KPI grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                        { icon: Clock, label: 'Total Hover Time', value: msToReadable(totalHoverMs), sub: 'across all products' },
                        { icon: MousePointer, label: 'Total Clicks', value: totalClicks, sub: 'product interactions' },
                        { icon: Users, label: 'Days Tracked', value: snapshots.length, sub: 'style snapshots' },
                        { icon: Zap, label: 'Unique Products', value: new Set(events.map(e => e.productId)).size, sub: 'products engaged' },
                    ].map((kpi, i) => (
                        <div key={i} className="p-5 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                            <kpi.icon className="w-4 h-4 mb-3" style={{ color: 'var(--accent)' }} />
                            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{kpi.value}</div>
                            <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{kpi.label}</div>
                            <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{kpi.sub}</div>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-6 mb-6">
                    {/* Page Dwell Time */}
                    <div className="p-6 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                        <div className="flex items-center gap-2 mb-5">
                            <Clock className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>Time on Pages</span>
                        </div>
                        {Object.keys(pageDwell).length > 0 ? (
                            <div className="space-y-3">
                                {Object.entries(pageDwell).sort((a, b) => b[1] - a[1]).map(([page, ms]) => (
                                    <div key={page}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-mono truncate max-w-[120px]" style={{ color: 'var(--text-secondary)' }}>{page || '/'}</span>
                                            <span className="font-bold ml-2 flex-shrink-0" style={{ color: 'var(--accent)' }}>{msToReadable(ms)}</span>
                                        </div>
                                        <Bar pct={(ms / maxPageDwell) * 100} glow={ms === maxPageDwell} />
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No page data yet.</p>}
                    </div>

                    {/* Category Engagement */}
                    <div className="p-6 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                        <div className="flex items-center gap-2 mb-5">
                            <BarChart2 className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>Category Engagement</span>
                        </div>
                        {Object.keys(catEngagement).length > 0 ? (
                            <div className="space-y-3">
                                {Object.entries(catEngagement).sort((a, b) => b[1].time - a[1].time).map(([cat, data]) => (
                                    <div key={cat}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="capitalize" style={{ color: 'var(--text-secondary)' }}>{cat}</span>
                                            <div className="flex gap-2 flex-shrink-0">
                                                <span style={{ color: 'var(--text-muted)' }}>{data.clicks} clicks</span>
                                                <span className="font-bold" style={{ color: 'var(--accent)' }}>{msToReadable(data.time)}</span>
                                            </div>
                                        </div>
                                        <Bar pct={(data.time / maxCatTime) * 100} />
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No category data yet.</p>}
                    </div>

                    {/* Top Products */}
                    <div className="p-6 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                        <div className="flex items-center gap-2 mb-5">
                            <TrendingUp className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>Top Products by Attention</span>
                        </div>
                        {topProducts.length > 0 ? (
                            <div className="space-y-2">
                                {topProducts.slice(0, 7).map((p, i) => (
                                    <div key={i} className="flex items-center gap-3 p-2 rounded-xl" style={{ background: 'var(--bg-card)' }}>
                                        <span className="text-xs font-bold w-5 text-center" style={{ color: i === 0 ? 'var(--accent)' : 'var(--text-muted)' }}>#{i + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs truncate" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                                            <p className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{p.category}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-xs font-bold" style={{ color: 'var(--accent)' }}>{msToReadable(p.totalTime)}</p>
                                            <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{p.clicks}×</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No product data yet.</p>}
                    </div>
                </div>

                {/* Hourly Activity Chart */}
                <div className="p-6 rounded-2xl mb-6" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                    <div className="flex items-center gap-2 mb-6">
                        <Zap className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                        <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>Hourly Activity — Last 24 Hours</span>
                    </div>
                    <div className="flex items-end gap-1 h-20">
                        {hourlyBuckets.map((val, i) => (
                            <div key={i} className="flex-1 flex flex-col gap-0.5 items-center group relative">
                                {val > 0 && (
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] opacity-0 group-hover:opacity-100 whitespace-nowrap font-bold"
                                        style={{ color: 'var(--accent)' }}>
                                        {Math.round(val)}s
                                    </div>
                                )}
                                <div className="w-full rounded-sm transition-all duration-500"
                                    style={{
                                        height: `${Math.max((val / maxHourly) * 100, 4)}%`,
                                        background: i === 23 ? 'var(--accent)' : 'color-mix(in srgb, var(--accent) 35%, transparent)',
                                        boxShadow: i === 23 ? '0 0 6px var(--accent-glow)' : 'none',
                                    }} />
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-[9px] mt-2" style={{ color: 'var(--text-muted)' }}>
                        <span>24h ago</span><span>12h ago</span><span style={{ color: 'var(--accent)' }}>Now</span>
                    </div>
                </div>

                {/* Live Events Feed */}
                <div className="p-6 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
                            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>Live Event Feed</span>
                        </div>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Last refreshed {lastRefresh.toLocaleTimeString()}</span>
                    </div>
                    {recentFeed.length > 0 ? (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {recentFeed.map((ev, i) => {
                                const timeAgo = Math.round((Date.now() - ev.timestamp) / 1000);
                                const timeLabel = timeAgo < 60 ? `${timeAgo}s ago` : `${Math.round(timeAgo / 60)}m ago`;
                                const actionColor = ev.action === 'click' ? '#22c55e' : ev.action === 'hover' ? 'var(--accent)' : '#8b5cf6';
                                return (
                                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: 'var(--bg-card)' }}>
                                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: actionColor }} />
                                        <div className="flex-1 min-w-0">
                                            <span className="text-xs font-bold mr-2 uppercase" style={{ color: actionColor }}>{ev.action}</span>
                                            <span className="text-xs truncate" style={{ color: 'var(--text-primary)' }}>{ev.productName}</span>
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <span className="text-[10px] px-2 py-0.5 rounded-full capitalize" style={{ background: 'var(--border-color)', color: 'var(--text-secondary)' }}>{ev.category}</span>
                                            {ev.duration > 0 && <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{msToReadable(ev.duration)}</span>}
                                            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{timeLabel}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
                            No events yet. Browse products to see real-time tracking here.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
