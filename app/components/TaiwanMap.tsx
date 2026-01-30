'use client';

import { useState, useEffect, useMemo } from 'react';
import { universities, type University } from '@/app/data/universities';

interface TaiwanMapProps {
  onSelectUniversity?: (university: University) => void;
  selectedUniversityId?: string | null;
  highlightedIds?: string[];
  showLabels?: boolean;
  animated?: boolean;
}

export function TaiwanMap({
  onSelectUniversity,
  selectedUniversityId,
  highlightedIds = [],
  showLabels = false,
  animated = true,
}: TaiwanMapProps) {
  const [visibleDots, setVisibleDots] = useState<Set<string>>(new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // 動畫效果 - 逐一點亮大學
  useEffect(() => {
    if (!animated) {
      setVisibleDots(new Set(universities.map(u => u.id)));
      return;
    }

    const shuffled = [...universities].sort(() => Math.random() - 0.5);
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < shuffled.length) {
        const university = shuffled[currentIndex];
        if (university) {
          setVisibleDots(prev => new Set([...prev, university.id]));
        }
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [animated]);

  const hoveredUniversity = useMemo(() => {
    return universities.find(u => u.id === hoveredId);
  }, [hoveredId]);

  return (
    <div className="relative w-full aspect-[3/4] max-w-md mx-auto">
      {/* 台灣地圖 SVG */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        aria-label="台灣大學分布圖"
      >
        {/* 背景光暈 */}
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(74, 85, 104, 0.3)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
          </filter>
          <filter id="glow-effect">
            <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* 台灣本島 - 更精確的形狀 */}
        <path
          d="M58 5
             C62 6, 66 9, 68 12
             C71 17, 73 22, 74 28
             C76 35, 76 42, 75 50
             C73 58, 70 66, 65 74
             C60 82, 52 88, 42 92
             C35 94, 28 93, 24 88
             C20 82, 20 75, 22 68
             C24 60, 26 52, 28 44
             C30 36, 33 28, 38 22
             C43 16, 50 10, 55 7
             C56 6, 57 5, 58 5Z"
          fill="url(#glow)"
          stroke="rgba(74, 85, 104, 0.4)"
          strokeWidth="0.5"
          className="transition-all duration-500"
        />

        {/* 台灣本島填充 */}
        <path
          d="M58 5
             C62 6, 66 9, 68 12
             C71 17, 73 22, 74 28
             C76 35, 76 42, 75 50
             C73 58, 70 66, 65 74
             C60 82, 52 88, 42 92
             C35 94, 28 93, 24 88
             C20 82, 20 75, 22 68
             C24 60, 26 52, 28 44
             C30 36, 33 28, 38 22
             C43 16, 50 10, 55 7
             C56 6, 57 5, 58 5Z"
          fill="rgba(74, 85, 104, 0.1)"
          stroke="rgba(74, 85, 104, 0.4)"
          strokeWidth="0.8"
        />

        {/* 金門群島 */}
        <g>
          <ellipse
            cx="8"
            cy="32"
            rx="3"
            ry="1.8"
            fill="rgba(74, 85, 104, 0.1)"
            stroke="rgba(74, 85, 104, 0.4)"
            strokeWidth="0.4"
          />
          <text x="8" y="37" fontSize="2" fill="rgba(74, 85, 104, 0.6)" textAnchor="middle">金門</text>
        </g>

        {/* 澎湖群島 */}
        <g>
          <ellipse
            cx="16"
            cy="55"
            rx="2.5"
            ry="3.5"
            fill="rgba(74, 85, 104, 0.1)"
            stroke="rgba(74, 85, 104, 0.4)"
            strokeWidth="0.4"
          />
          <text x="16" y="61" fontSize="2" fill="rgba(74, 85, 104, 0.6)" textAnchor="middle">澎湖</text>
        </g>

        {/* 蘭嶼、綠島 */}
        <circle cx="78" cy="72" r="1.5" fill="rgba(74, 85, 104, 0.1)" stroke="rgba(74, 85, 104, 0.3)" strokeWidth="0.3" />
        <circle cx="75" cy="58" r="1" fill="rgba(74, 85, 104, 0.1)" stroke="rgba(74, 85, 104, 0.3)" strokeWidth="0.3" />

        {/* 大學標記點 */}
        {universities.map((university, index) => {
          const isVisible = visibleDots.has(university.id);
          const isSelected = selectedUniversityId === university.id;
          const isHighlighted = highlightedIds.includes(university.id);
          const isHovered = hoveredId === university.id;

          return (
            <g key={university.id}>
              {/* 光暈效果 */}
              {(isSelected || isHighlighted || isHovered) && (
                <circle
                  cx={university.coordinates.x}
                  cy={university.coordinates.y}
                  r="3"
                  fill={isSelected ? 'rgba(214, 158, 46, 0.4)' : 'rgba(74, 85, 104, 0.3)'}
                  className="animate-pulse"
                />
              )}

              {/* 主點 */}
              <circle
                cx={university.coordinates.x}
                cy={university.coordinates.y}
                r={isSelected || isHovered ? 1.5 : isHighlighted ? 1.2 : 0.8}
                fill={
                  isSelected
                    ? '#D69E2E'
                    : isHighlighted
                    ? '#4A5568'
                    : university.type === 'public'
                    ? '#48BB78'
                    : '#718096'
                }
                className={`
                  transition-all duration-300 cursor-pointer
                  ${isVisible ? 'opacity-100' : 'opacity-0'}
                  ${isHovered ? 'filter drop-shadow-lg' : ''}
                `}
                style={{
                  transitionDelay: animated ? `${index * 30}ms` : '0ms',
                }}
                onMouseEnter={() => setHoveredId(university.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => onSelectUniversity?.(university)}
              />

              {/* 標籤 */}
              {(showLabels || isSelected || isHovered) && isVisible && (
                <text
                  x={university.coordinates.x + 2}
                  y={university.coordinates.y + 0.5}
                  fontSize="2"
                  fill="#4A5568"
                  className={`
                    pointer-events-none transition-opacity duration-200
                    ${isHovered || isSelected ? 'opacity-100' : 'opacity-0'}
                  `}
                >
                  {university.shortName}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Hover 資訊卡 */}
      {hoveredUniversity && (
        <div
          className="absolute bg-bg-card/95 backdrop-blur-sm rounded-lg shadow-lg px-3 py-2 pointer-events-none z-10 border border-border-light"
          style={{
            left: `${hoveredUniversity.coordinates.x}%`,
            top: `${hoveredUniversity.coordinates.y}%`,
            transform: 'translate(10px, -50%)',
          }}
        >
          <p className="font-medium text-text-primary text-sm whitespace-nowrap">
            {hoveredUniversity.name}
          </p>
          <p className="text-xs text-text-muted">
            {hoveredUniversity.city} · {hoveredUniversity.type === 'public' ? '國立' : '私立'}
          </p>
        </div>
      )}

      {/* 圖例 */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-6 text-xs text-text-secondary">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-success" />
          <span>國立</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary-light" />
          <span>私立</span>
        </div>
      </div>
    </div>
  );
}
