import { useState, useRef, useCallback, useEffect } from 'react';
import {
    Upload, Download, Sparkles, RefreshCw, ZoomIn, ZoomOut,
    Camera, ChevronLeft, ChevronRight, Move, Loader2, CheckCircle, X
} from 'lucide-react';
import { products } from '../data/products';
import { Link } from 'react-router';

// ── Types ────────────────────────────────────────────────────────────────────
interface TryOnState {
    selfieUrl: string | null;
    clothing: typeof products[0] | null;
    isDetecting: boolean;
    isAnalyzing: boolean;
    aiAnalysis: string | null;
    error: string | null;
    clothingX: number;   // 0-1 normalized
    clothingY: number;
    clothingScale: number;
    clothingOpacity: number;
}

// ── Groq Vision Analysis ─────────────────────────────────────────────────────
async function analyzeWithGroq(imageBase64: string, productName: string): Promise<string> {
    const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
    if (!GROQ_API_KEY) return 'AI analysis unavailable — add VITE_GROQ_API_KEY to .env';

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
            model: 'llama-3.2-11b-vision-preview',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image_url',
                            image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
                        },
                        {
                            type: 'text',
                            text: `You are a luxury fashion stylist. Analyze this person's photo and give a brief 3-sentence style assessment: 
1) What outfit style suits them best based on their body type and features
2) Whether "${productName}" would suit them (be specific about why)
3) One styling tip for wearing this outfit. Keep response concise and positive.`,
                        },
                    ],
                },
            ],
            max_tokens: 250,
        }),
    });

    if (!res.ok) throw new Error('Vision API failed');
    const data = await res.json();
    return data.choices[0]?.message?.content || 'Analysis complete.';
}

// ── MediaPipe Pose Loader ─────────────────────────────────────────────────────
function loadMediaPipeScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        if ((window as any).Pose) { resolve(); return; }
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/pose.js';
        s.crossOrigin = 'anonymous';
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('MediaPipe failed to load'));
        document.head.appendChild(s);
    });
}

async function detectShoulders(imgEl: HTMLImageElement): Promise<{ cx: number; cy: number; width: number } | null> {
    try {
        await loadMediaPipeScript();
        return await new Promise((resolve) => {
            const PoseClass = (window as any).Pose;
            const pose = new PoseClass({
                locateFile: (f: string) =>
                    `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${f}`,
            });
            pose.setOptions({ modelComplexity: 0, minDetectionConfidence: 0.5 });

            pose.onResults((results: any) => {
                const lm = results.poseLandmarks;
                if (!lm) { resolve(null); return; }
                // landmarks 11=left shoulder, 12=right shoulder, 23=left hip, 24=right hip
                const ls = lm[11]; const rs = lm[12];
                const lh = lm[23]; const rh = lm[24];
                if (!ls || !rs) { resolve(null); return; }
                const cx = (ls.x + rs.x) / 2;
                const cy = (ls.y + rs.y) / 2 + (lh && rh ? ((lh.y + rh.y) / 2 - (ls.y + rs.y) / 2) * 0.35 : 0.05);
                const width = Math.abs(rs.x - ls.x) * 1.6;
                resolve({ cx, cy, width });
            });

            const offscreen = document.createElement('canvas');
            offscreen.width = imgEl.naturalWidth || imgEl.width;
            offscreen.height = imgEl.naturalHeight || imgEl.height;
            const ctx = offscreen.getContext('2d')!;
            ctx.drawImage(imgEl, 0, 0);
            pose.send({ image: offscreen }).catch(() => resolve(null));
            setTimeout(() => resolve(null), 6000);
        });
    } catch {
        return null;
    }
}

// ── Main Component ────────────────────────────────────────────────────────────
const PREVIEW_W = 480;
const PREVIEW_H = 600;

export function VirtualTryOn() {
    const [state, setState] = useState<TryOnState>({
        selfieUrl: null,
        clothing: null,
        isDetecting: false,
        isAnalyzing: false,
        aiAnalysis: null,
        error: null,
        clothingX: 0.5,
        clothingY: 0.42,
        clothingScale: 0.7,
        clothingOpacity: 0.88,
    });

    const [catFilter, setCatFilter] = useState<string>('all');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const selfieImgRef = useRef<HTMLImageElement | null>(null);
    const clothingImgRef = useRef<HTMLImageElement | null>(null);
    const dragRef = useRef<{ dragging: boolean; startX: number; startY: number }>({ dragging: false, startX: 0, startY: 0 });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [resultReady, setResultReady] = useState(false);

    // ── Draw Canvas ─────────────────────────────────────────────────────────────
    const drawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, PREVIEW_W, PREVIEW_H);

        // Background
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, PREVIEW_W, PREVIEW_H);

        // Draw selfie
        if (selfieImgRef.current) {
            const img = selfieImgRef.current;
            const ratio = Math.min(PREVIEW_W / img.naturalWidth, PREVIEW_H / img.naturalHeight);
            const dw = img.naturalWidth * ratio;
            const dh = img.naturalHeight * ratio;
            const dx = (PREVIEW_W - dw) / 2;
            const dy = (PREVIEW_H - dh) / 2;
            ctx.drawImage(img, dx, dy, dw, dh);
        }

        // Draw clothing overlay
        if (clothingImgRef.current && state.selfieUrl) {
            const img = clothingImgRef.current;
            const w = PREVIEW_W * state.clothingScale;
            const aspect = img.naturalHeight / img.naturalWidth;
            const h = w * aspect;
            const x = state.clothingX * PREVIEW_W - w / 2;
            const y = state.clothingY * PREVIEW_H - h / 4;

            ctx.save();
            ctx.globalAlpha = state.clothingOpacity;
            ctx.globalCompositeOperation = 'source-over';

            // Soft drop shadow for realism
            ctx.shadowBlur = 20;
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.drawImage(img, x, y, w, h);
            ctx.restore();
        }

        // Watermark
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#fff';
        ctx.letterSpacing = '3px';
        ctx.fillText('LUXE · AI TRY-ON', 12, PREVIEW_H - 12);
        ctx.restore();

        setResultReady(!!(selfieImgRef.current && clothingImgRef.current));
    }, [state]);

    useEffect(() => { drawCanvas(); }, [drawCanvas]);

    // ── Load selfie ─────────────────────────────────────────────────────────────
    const loadSelfie = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const url = e.target?.result as string;
            const img = new Image();
            img.src = url;
            img.onload = () => {
                selfieImgRef.current = img;
                setState(prev => ({ ...prev, selfieUrl: url, aiAnalysis: null, error: null }));
            };
        };
        reader.readAsDataURL(file);
    };

    // ── Select clothing & auto-detect position ─────────────────────────────────
    const selectClothing = async (product: typeof products[0]) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = product.image;
        img.onload = async () => {
            clothingImgRef.current = img;
            setState(prev => ({ ...prev, clothing: product, isDetecting: true, error: null, aiAnalysis: null }));

            if (selfieImgRef.current) {
                const result = await detectShoulders(selfieImgRef.current);
                if (result) {
                    setState(prev => ({
                        ...prev, isDetecting: false,
                        clothingX: result.cx,
                        clothingY: Math.min(result.cy + 0.05, 0.85),
                        clothingScale: Math.min(Math.max(result.width, 0.4), 0.85),
                    }));
                } else {
                    setState(prev => ({ ...prev, isDetecting: false }));
                }
            } else {
                setState(prev => ({ ...prev, isDetecting: false }));
            }
        };
        img.onerror = () => {
            clothingImgRef.current = img;
            setState(prev => ({ ...prev, clothing: product, isDetecting: false }));
        };
    };

    // ── AI Analysis ─────────────────────────────────────────────────────────────
    const runAIAnalysis = async () => {
        if (!state.selfieUrl || !state.clothing) return;
        setState(prev => ({ ...prev, isAnalyzing: true }));
        try {
            const base64 = state.selfieUrl.split(',')[1];
            const analysis = await analyzeWithGroq(base64, state.clothing.name);
            setState(prev => ({ ...prev, aiAnalysis: analysis, isAnalyzing: false }));
        } catch {
            setState(prev => ({ ...prev, aiAnalysis: 'Unable to connect to AI. Please check your API key.', isAnalyzing: false }));
        }
    };

    // ── Download ─────────────────────────────────────────────────────────────────
    const download = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/jpeg', 0.92);
        a.download = `luxe-tryon-${Date.now()}.jpg`;
        a.click();
    };

    // ── Canvas drag (move clothing) ──────────────────────────────────────────────
    const onMouseDown = (e: React.MouseEvent) => {
        dragRef.current = { dragging: true, startX: e.clientX, startY: e.clientY };
    };
    const onMouseMove = (e: React.MouseEvent) => {
        if (!dragRef.current.dragging) return;
        const dx = (e.clientX - dragRef.current.startX) / PREVIEW_W;
        const dy = (e.clientY - dragRef.current.startY) / PREVIEW_H;
        dragRef.current.startX = e.clientX;
        dragRef.current.startY = e.clientY;
        setState(prev => ({
            ...prev,
            clothingX: Math.max(0, Math.min(1, prev.clothingX + dx)),
            clothingY: Math.max(0, Math.min(1, prev.clothingY + dy)),
        }));
    };
    const onMouseUp = () => { dragRef.current.dragging = false; };

    const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];
    const filtered = catFilter === 'all' ? products : products.filter(p => p.category === catFilter);

    return (
        <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh' }}>
            {/* Ambient */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 rounded-full blur-3xl opacity-10 pointer-events-none"
                style={{ background: 'var(--accent)' }} />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 pt-28">

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4"
                        style={{ background: 'color-mix(in srgb, var(--accent) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)', color: 'var(--accent)' }}>
                        <Sparkles className="w-3 h-3" /> World-Class Feature
                    </div>
                    <h1 className="text-5xl font-thin mb-3" style={{ color: 'var(--text-primary)' }}>
                        AI Virtual <span className="font-bold italic" style={{ color: 'var(--accent)' }}>Try-On</span>
                    </h1>
                    <p className="text-sm max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                        Upload your photo → select any outfit → watch it appear on you. AI-powered pose detection positions it perfectly. Download & share.
                    </p>
                </div>

                <div className="grid lg:grid-cols-[280px_1fr_300px] gap-6">

                    {/* ── LEFT: Product Selector ────────────────────────────────────────── */}
                    <div className="rounded-2xl overflow-hidden flex flex-col" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', maxHeight: '80vh' }}>
                        <div className="p-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <h2 className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--accent)' }}>Select an Outfit</h2>
                            <div className="flex gap-1.5 flex-wrap">
                                {categories.map(c => (
                                    <button key={c} onClick={() => setCatFilter(c)}
                                        className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider capitalize transition-all"
                                        style={{
                                            background: catFilter === c ? 'var(--accent)' : 'var(--bg-card)',
                                            color: catFilter === c ? 'var(--accent-text)' : 'var(--text-muted)',
                                            border: `1px solid ${catFilter === c ? 'var(--accent)' : 'var(--border-color)'}`,
                                        }}>
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="overflow-y-auto flex-1">
                            {filtered.map(p => (
                                <button key={p.id} onClick={() => selectClothing(p)}
                                    className="w-full flex items-center gap-3 p-3 transition-all text-left"
                                    style={{
                                        background: state.clothing?.id === p.id ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'transparent',
                                        borderLeft: `3px solid ${state.clothing?.id === p.id ? 'var(--accent)' : 'transparent'}`,
                                    }}>
                                    <img src={p.image} alt={p.name}
                                        className="w-12 h-14 rounded-xl object-cover flex-shrink-0"
                                        style={{ border: `1px solid ${state.clothing?.id === p.id ? 'var(--accent)' : 'var(--border-color)'}` }} />
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>${p.price}</p>
                                    </div>
                                    {state.clothing?.id === p.id && <CheckCircle className="w-4 h-4 flex-shrink-0 ml-auto" style={{ color: 'var(--accent)' }} />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── CENTER: Canvas ────────────────────────────────────────────────── */}
                    <div className="flex flex-col items-center gap-4">
                        {/* Canvas */}
                        <div className="relative rounded-2xl overflow-hidden"
                            style={{ border: '1px solid var(--border-hover)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', cursor: state.clothing ? 'grab' : 'default' }}>
                            <canvas ref={canvasRef} width={PREVIEW_W} height={PREVIEW_H}
                                onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
                                style={{ display: 'block', maxWidth: '100%' }} />

                            {/* Upload overlay when no selfie */}
                            {!state.selfieUrl && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{ background: 'rgba(10,10,10,0.95)' }}>
                                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                                        style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)', border: '1px dashed var(--accent)' }}>
                                        <Camera className="w-7 h-7" style={{ color: 'var(--accent)' }} />
                                    </div>
                                    <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Upload Your Photo</p>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>JPG, PNG · Front-facing recommended</p>
                                </div>
                            )}

                            {/* Detecting overlay */}
                            {state.isDetecting && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center"
                                    style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
                                    <Loader2 className="w-10 h-10 animate-spin mb-3" style={{ color: 'var(--accent)' }} />
                                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Detecting body pose...</p>
                                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>AI is finding your shoulders & torso</p>
                                </div>
                            )}

                            {/* Drag hint */}
                            {state.clothing && state.selfieUrl && !state.isDetecting && (
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full pointer-events-none"
                                    style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
                                    <Move className="w-3 h-3" style={{ color: 'var(--accent)' }} />
                                    <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Drag to reposition outfit</span>
                                </div>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="w-full rounded-2xl p-4 space-y-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Scale */}
                                <div>
                                    <div className="flex justify-between text-xs mb-2">
                                        <span className="uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Size</span>
                                        <span className="font-bold" style={{ color: 'var(--accent)' }}>{Math.round(state.clothingScale * 100)}%</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ZoomOut className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                                        <input type="range" min="20" max="110" value={Math.round(state.clothingScale * 100)}
                                            onChange={e => setState(prev => ({ ...prev, clothingScale: parseInt(e.target.value) / 100 }))}
                                            className="flex-1" style={{ accentColor: 'var(--accent)' }} />
                                        <ZoomIn className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                                    </div>
                                </div>
                                {/* Opacity */}
                                <div>
                                    <div className="flex justify-between text-xs mb-2">
                                        <span className="uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Blend</span>
                                        <span className="font-bold" style={{ color: 'var(--accent)' }}>{Math.round(state.clothingOpacity * 100)}%</span>
                                    </div>
                                    <input type="range" min="40" max="100" value={Math.round(state.clothingOpacity * 100)}
                                        onChange={e => setState(prev => ({ ...prev, clothingOpacity: parseInt(e.target.value) / 100 }))}
                                        className="w-full" style={{ accentColor: 'var(--accent)' }} />
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-2">
                                <input ref={fileInputRef} type="file" accept="image/*" className="sr-only"
                                    onChange={e => { if (e.target.files?.[0]) loadSelfie(e.target.files[0]); }} />
                                <button onClick={() => fileInputRef.current?.click()}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all"
                                    style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                                    <Upload className="w-3.5 h-3.5" /> {state.selfieUrl ? 'Change Photo' : 'Upload Photo'}
                                </button>
                                <button onClick={download} disabled={!resultReady}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all hover:-translate-y-0.5 disabled:opacity-40"
                                    style={{ background: 'var(--accent)', color: 'var(--accent-text)', boxShadow: resultReady ? '0 4px 12px var(--accent-glow)' : 'none' }}>
                                    <Download className="w-3.5 h-3.5" /> Download
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT: AI Analysis Panel ──────────────────────────────────────── */}
                    <div className="space-y-4">
                        {/* Selected product info */}
                        {state.clothing && (
                            <div className="p-5 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                                <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>Selected Outfit</p>
                                <div className="flex gap-3 items-start">
                                    <img src={state.clothing.image} alt={state.clothing.name}
                                        className="w-16 h-20 rounded-xl object-cover flex-shrink-0"
                                        style={{ border: '1px solid var(--border-hover)' }} />
                                    <div>
                                        <p className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{state.clothing.name}</p>
                                        <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{state.clothing.category}</p>
                                        <p className="text-lg font-bold" style={{ color: 'var(--accent)' }}>${state.clothing.price}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* AI Analysis */}
                        <div className="p-5 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--accent)' }}>AI Style Analysis</span>
                            </div>

                            {!state.selfieUrl || !state.clothing ? (
                                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                                    Upload your photo and select an outfit to get personalized AI feedback on how it suits your body type and features.
                                </p>
                            ) : state.isAnalyzing ? (
                                <div className="flex items-center gap-3">
                                    <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" style={{ color: 'var(--accent)' }} />
                                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Groq Vision is analyzing your photo...</p>
                                </div>
                            ) : state.aiAnalysis ? (
                                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{state.aiAnalysis}</p>
                            ) : (
                                <button onClick={runAIAnalysis}
                                    className="w-full py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all hover:-translate-y-0.5"
                                    style={{ background: 'var(--accent)', color: 'var(--accent-text)', boxShadow: '0 4px 16px var(--accent-glow)' }}>
                                    <Sparkles className="inline w-3.5 h-3.5 mr-2" />
                                    Analyze My Style
                                </button>
                            )}
                        </div>

                        {/* Tips */}
                        <div className="p-5 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--text-muted)' }}>📸 Tips for Best Results</p>
                            <ul className="space-y-2">
                                {['Use a front-facing, full-body photo', 'Good lighting makes detection better', 'Plain background works best', 'Drag the outfit to fine-tune position'].map((tip, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                                        <span className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'var(--accent)' }} />
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Shop button */}
                        {state.clothing && (
                            <Link to={`/product/${state.clothing.id}`}
                                className="block w-full py-3 text-center rounded-xl text-xs font-bold tracking-wider uppercase transition-all"
                                style={{ border: '1px solid var(--accent)', color: 'var(--accent)' }}>
                                View & Buy This Outfit →
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
