'use client';

import React from 'react';

interface SvgQrCodeProps {
  value: string;
  size?: number;
  className?: string;
  accentColor?: string;
}

/**
 * Procedural SVG QR Code Renderer
 * Produces crisp QR pattern with authentic finder patterns and randomized deterministic data matrix
 */
export function SvgQrCode({ value, size = 120, className = '', accentColor = '#06b6d4' }: SvgQrCodeProps) {
  // Deterministic pseudo-random matrix generator based on input string
  const gridSize = 21;
  const hash = Array.from(value).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 1337);

  const isFinderPattern = (r: number, c: number) => {
    // Top-left
    if (r < 7 && c < 7) return true;
    // Top-right
    if (r < 7 && c >= gridSize - 7) return true;
    // Bottom-left
    if (r >= gridSize - 7 && c < 7) return true;
    return false;
  };

  const isFinderFilled = (r: number, c: number) => {
    const checkPattern = (row: number, col: number) => {
      if (row === 0 || row === 6 || col === 0 || col === 6) return true;
      if (row >= 2 && row <= 4 && col >= 2 && col <= 4) return true;
      return false;
    };

    if (r < 7 && c < 7) return checkPattern(r, c);
    if (r < 7 && c >= gridSize - 7) return checkPattern(r, c - (gridSize - 7));
    if (r >= gridSize - 7 && c < 7) return checkPattern(r - (gridSize - 7), c);
    return false;
  };

  const cells: React.ReactNode[] = [];

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      let filled = false;

      if (isFinderPattern(r, c)) {
        filled = isFinderFilled(r, c);
      } else if (r === 6 || c === 6) {
        // Timing patterns
        filled = (r + c) % 2 === 0;
      } else {
        // Deterministic pseudo-random data bits
        const seed = (r * gridSize + c) ^ hash;
        const pseudoBit = ((seed * 1103515245 + 12345) & 0x7fffffff) % 2;
        filled = pseudoBit === 1;
      }

      if (filled) {
        cells.push(
          <rect
            key={`${r}-${c}`}
            x={c}
            y={r}
            width={0.92}
            height={0.92}
            rx={0.15}
            fill="#0f172a"
          />
        );
      }
    }
  }

  return (
    <div className={`p-2 bg-white rounded-xl shadow-lg border border-slate-200 inline-block ${className}`}>
      <svg
        viewBox={`0 0 ${gridSize} ${gridSize}`}
        width={size}
        height={size}
        className="w-full h-auto block"
        shapeRendering="crispEdges"
      >
        {cells}
      </svg>
    </div>
  );
}
