import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface BehaviorEvent {
    productId: string;
    productName: string;
    category: string;
    action: 'hover' | 'click' | 'view';
    duration: number;        // ms spent
    timestamp: number;       // epoch ms
    page: string;
}

export interface StyleSnapshot {
    date: string;            // YYYY-MM-DD
    topCategory: string;
    categoryWeights: Record<string, number>;  // { casual: 0.4, formal: 0.3, ... }
}

interface StyleEvolutionContextValue {
    events: BehaviorEvent[];
    snapshots: StyleSnapshot[];
    trackEvent: (e: Omit<BehaviorEvent, 'timestamp'>) => void;
    clearHistory: () => void;
    getTopProducts: () => { name: string; category: string; totalTime: number; clicks: number }[];
    getStyleShift: () => { from: string; to: string; changed: boolean };
    getTodayTime: () => number;
}

const STORAGE_KEY = 'luxe-style-events';
const SNAPSHOT_KEY = 'luxe-style-snapshots';
const MAX_EVENTS = 500;

const StyleEvolutionContext = createContext<StyleEvolutionContextValue | null>(null);

function buildSnapshot(events: BehaviorEvent[]): StyleSnapshot {
    const weights: Record<string, number> = {};
    for (const ev of events) {
        const cat = ev.category.toLowerCase();
        weights[cat] = (weights[cat] || 0) + (ev.duration / 1000) + (ev.action === 'click' ? 5 : 0);
    }
    const total = Object.values(weights).reduce((a, b) => a + b, 0) || 1;
    const normalized: Record<string, number> = {};
    for (const [k, v] of Object.entries(weights)) normalized[k] = Math.round((v / total) * 100);
    const top = Object.entries(normalized).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
    return {
        date: new Date().toISOString().split('T')[0],
        topCategory: top,
        categoryWeights: normalized,
    };
}

export function StyleEvolutionProvider({ children }: { children: ReactNode }) {
    const [events, setEvents] = useState<BehaviorEvent[]>(() => {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
    });

    const [snapshots, setSnapshots] = useState<StyleSnapshot[]>(() => {
        try { return JSON.parse(localStorage.getItem(SNAPSHOT_KEY) || '[]'); } catch { return []; }
    });

    // Save events to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
    }, [events]);

    // Save snapshot daily
    useEffect(() => {
        if (events.length === 0) return;
        const today = new Date().toISOString().split('T')[0];
        const existing = snapshots.find(s => s.date === today);
        const todayEvents = events.filter(e => new Date(e.timestamp).toISOString().split('T')[0] === today);
        const snap = buildSnapshot(todayEvents);

        setSnapshots(prev => {
            const filtered = prev.filter(s => s.date !== today);
            const updated = [...filtered, snap].slice(-30); // keep 30 days
            localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(updated));
            return updated;
        });
    }, [events.length]);

    const trackEvent = useCallback((e: Omit<BehaviorEvent, 'timestamp'>) => {
        const event: BehaviorEvent = { ...e, timestamp: Date.now() };
        setEvents(prev => [...prev.slice(-MAX_EVENTS + 1), event]);
    }, []);

    const getTopProducts = useCallback(() => {
        const map: Record<string, { name: string; category: string; totalTime: number; clicks: number }> = {};
        for (const ev of events) {
            if (!map[ev.productId]) map[ev.productId] = { name: ev.productName, category: ev.category, totalTime: 0, clicks: 0 };
            map[ev.productId].totalTime += ev.duration;
            if (ev.action === 'click') map[ev.productId].clicks += 1;
        }
        return Object.values(map).sort((a, b) => b.totalTime + b.clicks * 5000 - a.totalTime - a.clicks * 5000).slice(0, 10);
    }, [events]);

    const getStyleShift = useCallback(() => {
        if (snapshots.length < 2) return { from: '', to: '', changed: false };
        const sorted = [...snapshots].sort((a, b) => a.date.localeCompare(b.date));
        const oldest = sorted[0].topCategory;
        const newest = sorted[sorted.length - 1].topCategory;
        return { from: oldest, to: newest, changed: oldest !== newest };
    }, [snapshots]);

    const getTodayTime = useCallback(() => {
        const today = new Date().toISOString().split('T')[0];
        return events
            .filter(e => new Date(e.timestamp).toISOString().split('T')[0] === today)
            .reduce((acc, e) => acc + e.duration, 0);
    }, [events]);

    const clearHistory = () => {
        setEvents([]);
        setSnapshots([]);
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(SNAPSHOT_KEY);
    };

    return (
        <StyleEvolutionContext.Provider value={{ events, snapshots, trackEvent, clearHistory, getTopProducts, getStyleShift, getTodayTime }}>
            {children}
        </StyleEvolutionContext.Provider>
    );
}

export function useStyleEvolution() {
    const ctx = useContext(StyleEvolutionContext);
    if (!ctx) throw new Error('useStyleEvolution must be inside StyleEvolutionProvider');
    return ctx;
}
