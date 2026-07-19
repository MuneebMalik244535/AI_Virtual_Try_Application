import { useStyleEvolution } from '../context/StyleEvolutionContext';
import { Sparkles, Clock, TrendingUp, Trash2, ShoppingBag, BarChart2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { useEffect, useState } from 'react';

const CATEGORY_ICONS: Record<string, string> = {
    casual: '👕', formal: '👔', women: '👗', men: '🕴️', sport: '⚽',
    accessories: '💍', shoes: '👟', winter: '🧥', summer: '☀️', unknown: '✨',
};

function msToReadable(ms: number) {
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`;
    return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
}

function MiniBar({ label, value, max }: { label: string; value: number; max: number }) {
    return (
        <div>
            <div className="flex justify-between text-xs mb-1">
                <span className="capitalize" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                <span className="font-bold" style={{ color: 'var(--accent)' }}>{value}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
                <div className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${(value / max) * 100}%`, background: 'var(--accent)' }} />
            </div>
        </div>
    );
}

export function StyleEvolution() {
    const { events, snapshots, getTopProducts, getStyleShift, getTodayTime, clearHistory } = useStyleEvolution();
    const [animIn, setAnimIn] = useState(false);
    useEffect(() => { const t = setTimeout(() => setAnimIn(true), 100); return () => clearTimeout(t); }, []);

    const topProducts = getTopProducts();
    const styleShift = getStyleShift();
    const todayMs = getTodayTime();
    const totalClicks = events.filter(e => e.action === 'click').length;
    const todayEvents = events.filter(e =>
        new Date(e.timestamp).toISOString().split('T')[0] === new Date().toISOString().split('T')[0]
    );

    // Today's category distribution
    const todayWeights: Record<string, number> = {};
    for (const ev of todayEvents) {
        const cat = ev.category.toLowerCase();
        todayWeights[cat] = (todayWeights[cat] || 0) + ev.duration / 1000 + (ev.action === 'click' ? 5 : 0);
    }
    const maxW = Math.max(...Object.values(todayWeights), 1);

    // Last 14 days for timeline
    const timelineItems = [...snapshots].sort((a, b) => a.date.localeCompare(b.date)).slice(-14);

    const hasData = events.length > 0;

    return (
        <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh' }}>
            {/* Ambient glow */}
            <div className="fixed top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none"
                style={{ background: 'var(--accent)' }} />

            <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12 pt-28">
                {/* Header */}
                <div className={`mb-12 transition-all duration-700 ${animIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-px w-8" style={{ background: 'var(--accent)' }} />
                        <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--accent)' }}>Your Style DNA</span>
                    </div>
                    <div className="flex items-end justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-5xl font-thin">Style <span className="font-bold italic" style={{ color: 'var(--accent)' }}>Evolution</span></h1>
                            <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                Tracking your taste since you first visited. {events.length} behaviour signals recorded.
                            </p>
                        </div>
                        {hasData && (
                            <button onClick={clearHistory}
                                className="flex items-center gap-2 px-4 py-2. rounded-full text-xs tracking-widest uppercase transition-all"
                                style={{ border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#ef4444'; (e.currentTarget as HTMLElement).style.borderColor = '#ef4444'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-color)'; }}>
                                <Trash2 className="w-3.5 h-3.5" /> Clear History
                            </button>
                        )}
                    </div>
                </div>

                {!hasData ? (
                    /* Empty state */
                    <div className="text-center py-32 rounded-3xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                            style={{ background: 'color-mix(in srgb, var(--accent) 12%, transparent)', color: 'var(--accent)' }}>
                            <Sparkles className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-thin mb-3" style={{ color: 'var(--text-primary)' }}>No data yet</h2>
                        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Browse some products — your style profile will appear here automatically.</p>
                        <Link to="/shop"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold tracking-wider uppercase"
                            style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}>
                            Start Browsing <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* KPI Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Today\'s Browse Time', value: msToReadable(todayMs), icon: Clock },
                                { label: 'Products Clicked', value: totalClicks, icon: ShoppingBag },
                                { label: 'Total Events', value: events.length, icon: BarChart2 },
                                { label: 'Days Tracked', value: snapshots.length, icon: TrendingUp },
                            ].map((kpi, i) => (
                                <div key={i} className="p-5 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                                    <kpi.icon className="w-4 h-4 mb-3" style={{ color: 'var(--accent)' }} />
                                    <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{kpi.value}</div>
                                    <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{kpi.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="grid lg:grid-cols-2 gap-6">
                            {/* Style Shift Banner */}
                            <div className="p-6 rounded-2xl relative overflow-hidden" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-hover)' }}>
                                <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(ellipse at top right, var(--accent), transparent 70%)' }} />
                                <div className="relative">
                                    <div className="flex items-center gap-2 mb-4">
                                        <TrendingUp className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                                        <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--accent)' }}>Style Shift Detected</span>
                                    </div>
                                    {styleShift.changed ? (
                                        <>
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="text-center">
                                                    <span className="text-3xl">{CATEGORY_ICONS[styleShift.from] || '✨'}</span>
                                                    <p className="text-xs mt-1 capitalize" style={{ color: 'var(--text-muted)' }}>{styleShift.from}</p>
                                                </div>
                                                <div className="flex-1 h-px" style={{ background: 'var(--accent)' }}>
                                                    <div className="w-2 h-2 rounded-full mx-auto -mt-[3px]" style={{ background: 'var(--accent)' }} />
                                                </div>
                                                <div className="text-center">
                                                    <span className="text-3xl">{CATEGORY_ICONS[styleShift.to] || '✨'}</span>
                                                    <p className="text-xs mt-1 capitalize font-bold" style={{ color: 'var(--accent)' }}>{styleShift.to} (now)</p>
                                                </div>
                                            </div>
                                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                Your taste has evolved from <span className="font-semibold capitalize" style={{ color: 'var(--text-primary)' }}>{styleShift.from}</span> to <span className="font-semibold capitalize" style={{ color: 'var(--accent)' }}>{styleShift.to}</span> since you first visited.
                                            </p>
                                        </>
                                    ) : (
                                        <div>
                                            <p className="text-3xl mb-2">{CATEGORY_ICONS[styleShift.to || 'unknown'] || '✨'}</p>
                                            <p className="font-semibold capitalize text-lg" style={{ color: 'var(--accent)' }}>{styleShift.to || 'Building profile...'}</p>
                                            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                                                Your consistent taste. Keep browsing for evolution tracking.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Today's Category Breakdown */}
                            <div className="p-6 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                                <div className="flex items-center gap-2 mb-5">
                                    <BarChart2 className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                                    <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>Today's Interest by Category</span>
                                </div>
                                {Object.keys(todayWeights).length > 0 ? (
                                    <div className="space-y-3">
                                        {Object.entries(todayWeights).sort((a, b) => b[1] - a[1]).map(([cat, val]) => (
                                            <MiniBar key={cat} label={cat} value={Math.round((val / maxW) * 100)} max={100} />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Browse products to see today's breakdown.</p>
                                )}
                            </div>
                        </div>

                        {/* 14-Day Timeline */}
                        {timelineItems.length > 1 && (
                            <div className="p-6 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                                <div className="flex items-center gap-2 mb-6">
                                    <TrendingUp className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                                    <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>Style Timeline — Last {timelineItems.length} Days</span>
                                </div>
                                <div className="flex items-end gap-2 h-24 overflow-x-auto pb-2">
                                    {timelineItems.map((snap, i) => {
                                        const maxVal = Math.max(...Object.values(snap.categoryWeights), 1);
                                        const topCat = Object.entries(snap.categoryWeights).sort((a, b) => b[1] - a[1])[0];
                                        const height = topCat ? (topCat[1] / 100) * 100 : 10;
                                        const isLast = i === timelineItems.length - 1;
                                        return (
                                            <div key={snap.date} className="flex flex-col items-center gap-1 flex-1 min-w-[36px] group relative">
                                                {/* Tooltip */}
                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center">
                                                    <div className="px-2 py-1 rounded text-[9px] font-bold whitespace-nowrap"
                                                        style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}>
                                                        {snap.topCategory}
                                                    </div>
                                                </div>
                                                <div className="w-full rounded-t-lg transition-all" style={{ height: `${Math.max(height, 8)}%`, background: isLast ? 'var(--accent)' : 'color-mix(in srgb, var(--accent) 40%, transparent)', boxShadow: isLast ? '0 0 8px var(--accent-glow)' : 'none' }} />
                                                <span className="text-[8px] capitalize" style={{ color: isLast ? 'var(--accent)' : 'var(--text-muted)' }}>
                                                    {snap.date.split('-')[2]}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="flex justify-between text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                                    <span>{timelineItems[0]?.date}</span>
                                    <span style={{ color: 'var(--accent)' }}>Today</span>
                                </div>
                            </div>
                        )}

                        {/* Top Products */}
                        <div className="p-6 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                            <div className="flex items-center gap-2 mb-6">
                                <Sparkles className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>Most Captivating Products</span>
                            </div>
                            <div className="space-y-3">
                                {topProducts.slice(0, 8).map((p, i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl transition-all"
                                        style={{ border: '1px solid var(--border-color)' }}>
                                        <span className="text-lg font-bold w-6 flex-shrink-0" style={{ color: i === 0 ? 'var(--accent)' : 'var(--text-muted)' }}>#{i + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                                            <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{p.category}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-xs font-bold" style={{ color: 'var(--accent)' }}>{msToReadable(p.totalTime)}</p>
                                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{p.clicks} clicks</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
