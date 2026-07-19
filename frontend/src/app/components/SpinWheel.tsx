import { useState, useRef, useEffect } from 'react';
import { useTheme, THEMES, ThemeName } from '../context/ThemeContext';
import { Sparkles, X, RotateCw } from 'lucide-react';

const NUM_THEMES = THEMES.length;
const SLICE_ANGLE = 360 / NUM_THEMES;

// Colors for each wheel slice label text
const LABEL_COLORS = ['#fbbf24', '#1a1a1a', '#f5e6d3', '#e8f5e9', '#e0f7ff'];

export function SpinWheel() {
    const { setTheme, currentTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [spinning, setSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [winner, setWinner] = useState<string | null>(null);
    const [appliedTheme, setAppliedTheme] = useState<ThemeName | null>(null);
    const animFrame = useRef<number>(0);
    const startTime = useRef<number>(0);
    const startRotation = useRef<number>(0);
    const targetRotation = useRef<number>(0);
    const duration = useRef<number>(4500);

    // Ease out cubic for natural deceleration
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    const spin = () => {
        if (spinning) return;
        setWinner(null);
        setAppliedTheme(null);
        setSpinning(true);

        // Pick a random theme index
        const themeIndex = Math.floor(Math.random() * NUM_THEMES);
        // Spin at least 5 full rotations + alignment to winner
        const extraSpins = (5 + Math.floor(Math.random() * 3)) * 360;
        // Align so the winner slice sits at the pointer (top of wheel)
        const alignAngle = 360 - (themeIndex * SLICE_ANGLE) - (SLICE_ANGLE / 2);
        const finalTarget = rotation + extraSpins + ((alignAngle - rotation % 360) + 360) % 360;

        startTime.current = performance.now();
        startRotation.current = rotation;
        targetRotation.current = finalTarget;
        duration.current = 4000 + Math.random() * 1000;

        const animate = (now: number) => {
            const elapsed = now - startTime.current;
            const progress = Math.min(elapsed / duration.current, 1);
            const eased = easeOut(progress);
            const currentRot = startRotation.current + (targetRotation.current - startRotation.current) * eased;

            setRotation(currentRot);

            if (progress < 1) {
                animFrame.current = requestAnimationFrame(animate);
            } else {
                setRotation(finalTarget);
                setSpinning(false);
                setWinner(THEMES[themeIndex].label);
                setTimeout(() => {
                    setTheme(THEMES[themeIndex].name);
                    setAppliedTheme(THEMES[themeIndex].name);
                }, 600);
            }
        };

        animFrame.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        return () => cancelAnimationFrame(animFrame.current);
    }, []);

    // SVG wheel path builder
    const buildSlicePath = (index: number, r: number, cx: number, cy: number) => {
        const startAngle = (index * SLICE_ANGLE - 90) * (Math.PI / 180);
        const endAngle = ((index + 1) * SLICE_ANGLE - 90) * (Math.PI / 180);
        const x1 = cx + r * Math.cos(startAngle);
        const y1 = cy + r * Math.sin(startAngle);
        const x2 = cx + r * Math.cos(endAngle);
        const y2 = cy + r * Math.sin(endAngle);
        return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
    };

    const getLabelPosition = (index: number, r: number, cx: number, cy: number) => {
        const midAngle = (index * SLICE_ANGLE + SLICE_ANGLE / 2 - 90) * (Math.PI / 180);
        return {
            x: cx + (r * 0.65) * Math.cos(midAngle),
            y: cy + (r * 0.65) * Math.sin(midAngle),
        };
    };

    const R = 130;
    const CX = 140;
    const CY = 140;

    return (
        <>
            {/* Floating trigger button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-28 right-6 z-40 group flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold tracking-widest uppercase shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_var(--accent-glow)]"
                style={{
                    background: 'var(--accent)',
                    color: 'var(--accent-text)',
                }}
                title="Spin to change theme!"
            >
                <span className="group-hover:animate-spin inline-block">🎰</span>
                <span className="hidden sm:block">Spin Theme</span>
            </button>

            {/* Modal overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 backdrop-blur-md"
                        style={{ background: 'var(--overlay)' }}
                        onClick={() => !spinning && setIsOpen(false)}
                    />

                    {/* Wheel Card */}
                    <div
                        className="relative rounded-3xl border p-8 w-full max-w-sm shadow-2xl"
                        style={{
                            background: 'var(--bg-secondary)',
                            borderColor: 'var(--border-hover)',
                            boxShadow: `0 0 80px var(--accent-glow)`,
                        }}
                    >
                        {/* Close */}
                        <button
                            onClick={() => !spinning && setIsOpen(false)}
                            className="absolute top-4 right-4 p-2 rounded-full opacity-50 hover:opacity-100 transition-opacity"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Header */}
                        <div className="text-center mb-6">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <Sparkles className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--accent)' }}>
                                    Lucky Spin
                                </span>
                                <Sparkles className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                            </div>
                            <h2 className="text-xl font-thin" style={{ color: 'var(--text-primary)' }}>
                                Spin for a <span className="font-bold italic">new vibe</span>
                            </h2>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                                5 unique themes await you
                            </p>
                        </div>

                        {/* Wheel + Pointer */}
                        <div className="relative flex justify-center mb-6">
                            {/* Pointer arrow */}
                            <div
                                className="absolute top-[-10px] left-1/2 -translate-x-1/2 z-10 w-0 h-0"
                                style={{
                                    borderLeft: '10px solid transparent',
                                    borderRight: '10px solid transparent',
                                    borderTop: `22px solid var(--accent)`,
                                    filter: `drop-shadow(0 0 6px var(--accent))`,
                                }}
                            />

                            {/* SVG Wheel */}
                            <div
                                className="rounded-full overflow-hidden shadow-2xl"
                                style={{
                                    transform: `rotate(${rotation}deg)`,
                                    transition: spinning ? 'none' : 'transform 0.3s ease',
                                    boxShadow: `0 0 30px var(--accent-glow)`,
                                }}
                            >
                                <svg width="280" height="280" viewBox="0 0 280 280">
                                    {THEMES.map((theme, i) => {
                                        const pos = getLabelPosition(i, R, CX, CY);
                                        const midAngle = (i * SLICE_ANGLE + SLICE_ANGLE / 2 - 90);
                                        return (
                                            <g key={theme.name}>
                                                <path
                                                    d={buildSlicePath(i, R, CX, CY)}
                                                    fill={theme.wheelColor}
                                                    stroke="rgba(255,255,255,0.15)"
                                                    strokeWidth="1.5"
                                                />
                                                <text
                                                    x={pos.x}
                                                    y={pos.y}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                    fontSize="10"
                                                    fontWeight="bold"
                                                    fill={LABEL_COLORS[i]}
                                                    transform={`rotate(${midAngle + 90}, ${pos.x}, ${pos.y})`}
                                                >
                                                    <tspan x={pos.x} dy="-6">{theme.emoji}</tspan>
                                                    <tspan x={pos.x} dy="13" fontSize="8" fontFamily="sans-serif">
                                                        {theme.label.split(' ')[0]}
                                                    </tspan>
                                                </text>
                                            </g>
                                        );
                                    })}
                                    {/* Center circle */}
                                    <circle cx={CX} cy={CY} r="20" fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                                    <text x={CX} y={CY} textAnchor="middle" dominantBaseline="middle" fontSize="14">🎯</text>
                                </svg>
                            </div>
                        </div>

                        {/* Result Display */}
                        {winner && !spinning && (
                            <div
                                className="mb-4 py-3 px-4 rounded-2xl text-center border"
                                style={{
                                    background: 'var(--bg-card)',
                                    borderColor: 'var(--border-hover)',
                                }}
                            >
                                <p className="text-xs tracking-widest uppercase mb-1" style={{ color: 'var(--text-muted)' }}>You got</p>
                                <p className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
                                    {THEMES.find(t => t.label === winner)?.emoji} {winner}
                                </p>
                                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                                    {THEMES.find(t => t.label === winner)?.description}
                                </p>
                            </div>
                        )}

                        {/* Spin Button */}
                        <button
                            onClick={spin}
                            disabled={spinning}
                            className="w-full py-4 rounded-2xl font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                background: spinning ? 'var(--bg-card)' : 'var(--accent)',
                                color: spinning ? 'var(--text-muted)' : 'var(--accent-text)',
                                boxShadow: spinning ? 'none' : `0 4px 20px var(--accent-glow)`,
                            }}
                        >
                            <RotateCw className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} />
                            {spinning ? 'Spinning...' : winner ? 'Spin Again' : 'Spin the Wheel!'}
                        </button>

                        {/* Current theme indicator */}
                        <div className="mt-4 text-center">
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                Current: <span style={{ color: 'var(--accent)' }}>
                                    {currentTheme.emoji} {currentTheme.label}
                                </span>
                            </span>
                        </div>

                        {/* Theme quick-select dots */}
                        <div className="flex justify-center gap-2 mt-4">
                            {THEMES.map((theme) => (
                                <button
                                    key={theme.name}
                                    onClick={() => { setTheme(theme.name); setWinner(theme.label); }}
                                    title={theme.label}
                                    className="w-5 h-5 rounded-full border-2 transition-all hover:scale-125"
                                    style={{
                                        background: theme.wheelColor,
                                        borderColor: currentTheme.name === theme.name ? 'var(--accent)' : 'rgba(255,255,255,0.2)',
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
