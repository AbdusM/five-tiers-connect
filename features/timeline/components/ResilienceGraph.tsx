'use client'

import { useMemo } from 'react'

interface ResilienceGraphProps {
    data?: number[] // Array of scores (0-100)
    height?: number
    color?: string
}

export function ResilienceGraph({
    data = [65, 68, 72, 70, 75, 78, 82, 85, 84, 88, 92, 90, 94],
    height = 200,
    color = '#10b981' // Emerald-500
}: ResilienceGraphProps) {

    // 1. Calculate Path Data
    const { pathD, fillD, points } = useMemo(() => {
        if (!data.length) return { pathD: '', fillD: '', points: [] }

        const max = 100
        const min = 40 // visual floor to make graph look more dramatic
        const range = max - min
        const width = 100 // percent
        const stepX = width / (data.length - 1)

        // Map points to coordinates [x, y]
        // x is percentage (0-100), y is relative (0 to height)
        const points = data.map((val, i) => {
            const x = i * stepX
            // Invert Y because SVG 0 is top
            const normalizedY = (val - min) / range
            const y = height - (normalizedY * height)
            return [x, y]
        })

        // Generate Smooth Curve (Catmull-Rom or simple Bezier approximation)
        // For "Apple style", we want smooth curves.
        // Lineto strategy is simpler but jagged. Let's do simple quadratic.

        let d = `M ${points[0][0]} ${points[0][1]}`

        for (let i = 0; i < points.length - 1; i++) {
            const [x0, y0] = points[i]
            const [x1, y1] = points[i + 1]

            // Control point strategy: midpoint X, previous Y
            // This is a rough ease-in-out
            const cpX = (x0 + x1) / 2
            const cpY = (y0 + y1) / 2

            // Quadratic bezier: Q control, end
            // Cubic bezier: C cp1, cp2, end
            // Simple cubic smoothing:
            const cp1x = x0 + (x1 - x0) * 0.5
            const cp1y = y0
            const cp2x = x0 + (x1 - x0) * 0.5
            const cp2y = y1

            d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x1} ${y1}`
        }

        // Close the path for the fill
        const fillD = `${d} L 100 ${height} L 0 ${height} Z`

        return { pathD: d, fillD, points }
    }, [data, height])

    return (
        <div className="w-full relative group">
            {/* Container aspect ratio */}
            <svg
                viewBox={`0 0 100 ${height}`}
                preserveAspectRatio="none"
                className="w-full h-48 md:h-64 overflow-visible"
            >
                <defs>
                    <linearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={color} stopOpacity="0.0" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Grad Fill */}
                <path d={fillD} fill="url(#graphGradient)" />

                {/* Stroke Line */}
                <path
                    d={pathD}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    filter="url(#glow)"
                />

                {/* Interactive Points (Only show last few for cleanliness) */}
                {points.slice(-5).map(([x, y], i) => (
                    <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="3"
                        fill="#18181b"
                        stroke={color}
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                ))}

                {/* Last Point Pulse (Always visible) */}
                <circle
                    cx={points[points.length - 1][0]}
                    cy={points[points.length - 1][1]}
                    r="4"
                    fill={color}
                    vectorEffect="non-scaling-stroke"
                >
                    <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
                </circle>
            </svg>

            {/* Overlay Stats */}
            <div className="absolute top-4 left-4">
                <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mb-1">Resilience Index</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-4xl font-mono text-white font-bold">{data[data.length - 1]}</h3>
                    <span className="text-sm text-emerald-400 font-mono">+12%</span>
                </div>
            </div>
        </div>
    )
}
