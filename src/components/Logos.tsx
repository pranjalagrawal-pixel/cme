import React from 'react';

/**
 * EXACT CONCEPT MADE EASY CLASSES LOGO
 * Vector SVG matching the official brand identity from CME logo.jpg:
 * - Navy semicircle arch with 7 radiating sunburst rays
 * - Vibrant golden lightbulb with detailed filament and socket
 * - Multi-layered open book pages in navy & gold
 * - Precise typography: "CONCEPT", "MADE EASY", "— CLASSES —", "UNDERSTAND • LEARN • SUCCEED"
 */

export interface LogoProps {
  className?: string;
  showTagline?: boolean;
  inverted?: boolean;
}

export function ConceptLogo({ 
  className = "h-64 w-auto", 
  showTagline = true,
  inverted = false 
}: { 
  className?: string; 
  showTagline?: boolean;
  inverted?: boolean;
}) {
  const navyColor = inverted ? "#FFFFFF" : "#061F48";
  const goldColor = inverted ? "#D09515" : "#D09515";
  const lightRayColor = "#D09515";

  return (
    <svg 
      className={className} 
      viewBox="0 0 320 440" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Concept Made Easy Classes Logo"
    >
      <defs>
        {/* Subtle radial glow around the lightbulb */}
        <radialGradient id={`bulbGlow_${inverted ? 'inv' : 'reg'}`} cx="160" cy="132" r="55" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D09515" stopOpacity={inverted ? 0.35 : 0.25} />
          <stop offset="100%" stopColor="#D09515" stopOpacity="0" />
        </radialGradient>

        {/* Bulb inner gradient */}
        <linearGradient id={`bulbGradient_${inverted ? 'inv' : 'reg'}`} x1="140" y1="95" x2="180" y2="155" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F7B82B" />
          <stop offset="100%" stopColor="#C78308" />
        </linearGradient>
      </defs>

      {/* Glow aura */}
      <circle cx="160" cy="132" r="50" fill={`url(#bulbGlow_${inverted ? 'inv' : 'reg'})`} />

      {/* 1. TOP ARCH */}
      <path 
        d="M 68 165 A 92 92 0 0 1 252 165" 
        stroke={navyColor} 
        strokeWidth="6" 
        strokeLinecap="round" 
      />

      {/* 2. SUNBURST RAYS (7 RAYS) */}
      <g stroke={lightRayColor} strokeWidth="4" strokeLinecap="round">
        {/* Ray 1 - Top Center */}
        <line x1="160" y1="92" x2="160" y2="105" />
        {/* Ray 2 - Top Left */}
        <line x1="126" y1="102" x2="135" y2="112" />
        {/* Ray 3 - Top Right */}
        <line x1="194" y1="102" x2="185" y2="112" />
        {/* Ray 4 - Middle Left */}
        <line x1="114" y1="130" x2="128" y2="130" />
        {/* Ray 5 - Middle Right */}
        <line x1="206" y1="130" x2="192" y2="130" />
        {/* Ray 6 - Lower Left */}
        <line x1="119" y1="157" x2="131" y2="152" />
        {/* Ray 7 - Lower Right */}
        <line x1="201" y1="157" x2="189" y2="152" />
      </g>

      {/* 3. LIGHTBULB */}
      <g>
        {/* Glass Bulb Body */}
        <path 
          d="M 143 148 C 137 139, 137 124, 146 115 C 153 107, 167 107, 174 115 C 183 124, 183 139, 177 148 C 173 154, 171 159, 171 163 L 149 163 C 149 159, 147 154, 143 148 Z" 
          fill={`url(#bulbGradient_${inverted ? 'inv' : 'reg'})`} 
        />

        {/* Bulb Glass Highlight Reflection */}
        <path 
          d="M 148 120 C 151 114, 160 112, 167 113 C 159 116, 154 122, 151 130 C 149 126, 148 123, 148 120 Z" 
          fill="#FFFFFF" 
          fillOpacity="0.5" 
        />

        {/* Bulb Socket / Screw Base */}
        <rect x="151" y="164" width="18" height="3" rx="1" fill={navyColor} />
        <rect x="152" y="169" width="16" height="3" rx="1" fill={navyColor} />
        <rect x="154" y="174" width="12" height="2.5" rx="1" fill={navyColor} />
        <path d="M 157 177.5 C 157 180.5, 163 180.5, 163 177.5 Z" fill={navyColor} />
      </g>

      {/* 4. OPEN BOOK PAGES */}
      <g>
        {/* LEFT WING */}
        <path d="M 160 188 C 142 178, 108 178, 77 190 C 74 191, 75 187, 79 185 C 109 171, 144 172, 160 188 Z" fill={navyColor} />
        <path d="M 160 193 C 139 184, 110 184, 84 198 C 80 200, 81 196, 86 193 C 112 180, 143 181, 160 193 Z" fill={navyColor} />
        <path d="M 160 198 C 136 190, 110 192, 89 206 C 85 208, 87 204, 93 201 C 116 189, 142 189, 160 198 Z" fill={navyColor} />
        <path d="M 160 204 C 134 197, 106 199, 84 214 C 80 216, 82 212, 88 209 C 112 197, 139 196, 160 204 Z" fill={navyColor} />

        {/* RIGHT WING */}
        <path d="M 160 188 C 178 178, 212 178, 243 190 C 246 191, 245 187, 241 185 C 211 171, 176 172, 160 188 Z" fill={navyColor} />
        <path d="M 160 193 C 181 184, 210 184, 236 198 C 240 200, 239 196, 234 193 C 208 180, 177 181, 160 193 Z" fill={navyColor} />
        <path d="M 160 198 C 184 190, 210 192, 231 206 C 235 208, 233 204, 227 201 C 204 189, 178 189, 160 198 Z" fill={navyColor} />
        <path d="M 160 204 C 186 197, 214 199, 236 214 C 240 216, 238 212, 232 209 C 208 197, 181 196, 160 204 Z" fill={navyColor} />

        {/* GOLD BASE SWOOSHES */}
        <path d="M 160 214 C 132 210, 96 215, 65 231 C 62 232, 62 230, 65 228 C 96 211, 134 206, 160 214 Z" fill={goldColor} />
        <path d="M 160 214 C 188 210, 224 215, 255 231 C 258 232, 258 230, 255 228 C 224 211, 186 206, 160 214 Z" fill={goldColor} />

        {/* Center Spine Accent Point */}
        <polygon points="158,189 162,189 161,215 159,215" fill={navyColor} />
      </g>

      {/* 5. TYPOGRAPHY */}
      {/* "CONCEPT" */}
      <text 
        x="160" 
        y="280" 
        textAnchor="middle" 
        fill={navyColor} 
        fontSize="38" 
        fontWeight="900" 
        fontFamily="'Space Grotesk', 'Plus Jakarta Sans', system-ui, sans-serif" 
        letterSpacing="2.5"
      >
        CONCEPT
      </text>

      {/* "MADE EASY" */}
      <text 
        x="160" 
        y="326" 
        textAnchor="middle" 
        fill={goldColor} 
        fontSize="38" 
        fontWeight="900" 
        fontFamily="'Space Grotesk', 'Plus Jakarta Sans', system-ui, sans-serif" 
        letterSpacing="1.2"
      >
        MADE EASY
      </text>

      {/* "— C L A S S E S —" */}
      <g>
        <line x1="36" y1="352" x2="62" y2="352" stroke={navyColor} strokeWidth="3.5" strokeLinecap="round" />
        
        <text 
          x="160" 
          y="359" 
          textAnchor="middle" 
          fill={navyColor} 
          fontSize="20" 
          fontWeight="900" 
          fontFamily="'Space Grotesk', 'Plus Jakarta Sans', system-ui, sans-serif" 
          letterSpacing="7"
        >
          CLASSES
        </text>

        <line x1="258" y1="352" x2="284" y2="352" stroke={navyColor} strokeWidth="3.5" strokeLinecap="round" />
      </g>

      {/* 6. MOTTO: "UNDERSTAND • LEARN • SUCCEED" */}
      {showTagline && (
        <text 
          x="160" 
          y="390" 
          textAnchor="middle" 
          fill={navyColor} 
          fontSize="11" 
          fontWeight="800" 
          fontFamily="'Space Grotesk', 'Plus Jakarta Sans', system-ui, sans-serif" 
          letterSpacing="2.2"
        >
          UNDERSTAND <tspan fill="#D09515" fontWeight="900"> • </tspan> LEARN <tspan fill="#D09515" fontWeight="900"> • </tspan> SUCCEED
        </text>
      )}
    </svg>
  );
}

/**
 * EMBLEM ONLY LOGO (Arch, Lightbulb, Rays & Book)
 * Ideal for Favicons, App Icons, Small Badges
 */
export function ConceptLogoEmblem({ 
  className = "h-12 w-12",
  inverted = false 
}: { 
  className?: string;
  inverted?: boolean;
}) {
  const navyColor = inverted ? "#FFFFFF" : "#061F48";
  const goldColor = inverted ? "#D09515" : "#D09515";

  return (
    <svg 
      className={className} 
      viewBox="50 80 220 165" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Concept Made Easy Emblem"
    >
      <defs>
        <linearGradient id={`emblemBulbGrad_${inverted ? 'inv' : 'reg'}`} x1="140" y1="95" x2="180" y2="155" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F7B82B" />
          <stop offset="100%" stopColor="#C78308" />
        </linearGradient>
      </defs>

      {/* Arch */}
      <path 
        d="M 68 165 A 92 92 0 0 1 252 165" 
        stroke={navyColor} 
        strokeWidth="6" 
        strokeLinecap="round" 
      />

      {/* Sunburst Rays */}
      <g stroke="#D09515" strokeWidth="4" strokeLinecap="round">
        <line x1="160" y1="92" x2="160" y2="105" />
        <line x1="126" y1="102" x2="135" y2="112" />
        <line x1="194" y1="102" x2="185" y2="112" />
        <line x1="114" y1="130" x2="128" y2="130" />
        <line x1="206" y1="130" x2="192" y2="130" />
        <line x1="119" y1="157" x2="131" y2="152" />
        <line x1="201" y1="157" x2="189" y2="152" />
      </g>

      {/* Lightbulb */}
      <g>
        <path 
          d="M 143 148 C 137 139, 137 124, 146 115 C 153 107, 167 107, 174 115 C 183 124, 183 139, 177 148 C 173 154, 171 159, 171 163 L 149 163 C 149 159, 147 154, 143 148 Z" 
          fill={`url(#emblemBulbGrad_${inverted ? 'inv' : 'reg'})`} 
        />
        <path 
          d="M 148 120 C 151 114, 160 112, 167 113 C 159 116, 154 122, 151 130 C 149 126, 148 123, 148 120 Z" 
          fill="#FFFFFF" 
          fillOpacity="0.5" 
        />
        <rect x="151" y="164" width="18" height="3" rx="1" fill={navyColor} />
        <rect x="152" y="169" width="16" height="3" rx="1" fill={navyColor} />
        <rect x="154" y="174" width="12" height="2.5" rx="1" fill={navyColor} />
        <path d="M 157 177.5 C 157 180.5, 163 180.5, 163 177.5 Z" fill={navyColor} />
      </g>

      {/* Open Book Wings */}
      <g>
        {/* Left Navy Pages */}
        <path d="M 160 188 C 142 178, 108 178, 77 190 C 74 191, 75 187, 79 185 C 109 171, 144 172, 160 188 Z" fill={navyColor} />
        <path d="M 160 193 C 139 184, 110 184, 84 198 C 80 200, 81 196, 86 193 C 112 180, 143 181, 160 193 Z" fill={navyColor} />
        <path d="M 160 198 C 136 190, 110 192, 89 206 C 85 208, 87 204, 93 201 C 116 189, 142 189, 160 198 Z" fill={navyColor} />
        <path d="M 160 204 C 134 197, 106 199, 84 214 C 80 216, 82 212, 88 209 C 112 197, 139 196, 160 204 Z" fill={navyColor} />

        {/* Right Navy Pages */}
        <path d="M 160 188 C 178 178, 212 178, 243 190 C 246 191, 245 187, 241 185 C 211 171, 176 172, 160 188 Z" fill={navyColor} />
        <path d="M 160 193 C 181 184, 210 184, 236 198 C 240 200, 239 196, 234 193 C 208 180, 177 181, 160 193 Z" fill={navyColor} />
        <path d="M 160 198 C 184 190, 210 192, 231 206 C 235 208, 233 204, 227 201 C 204 189, 178 189, 160 198 Z" fill={navyColor} />
        <path d="M 160 204 C 186 197, 214 199, 236 214 C 240 216, 238 212, 232 209 C 208 197, 181 196, 160 204 Z" fill={navyColor} />

        {/* Gold Flourishes */}
        <path d="M 160 214 C 132 210, 96 215, 65 231 C 62 232, 62 230, 65 228 C 96 211, 134 206, 160 214 Z" fill={goldColor} />
        <path d="M 160 214 C 188 210, 224 215, 255 231 C 258 232, 258 230, 255 228 C 224 211, 186 206, 160 214 Z" fill={goldColor} />
      </g>
    </svg>
  );
}

/**
 * COMPACT LOGO (Icon Emblem + Side Typography)
 * Tailored for Header Navbar, Breadcrumbs & Footer
 */
export function CompactLogo({ 
  className = "h-11 w-auto",
  inverted = false 
}: { 
  className?: string;
  inverted?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 ${className}`}>
      {/* Emblem SVG */}
      <ConceptLogoEmblem 
        className="h-10 w-10 sm:h-11 sm:w-11 shrink-0 drop-shadow-sm" 
        inverted={inverted} 
      />
      
      {/* Brand Typography */}
      <div className="flex flex-col text-left justify-center">
        <span className={`text-[13px] sm:text-[15px] font-black tracking-wider leading-none font-['Space_Grotesk'] ${inverted ? 'text-white' : 'text-[#061F48] dark:text-white'}`}>
          CONCEPT
        </span>
        <span className={`text-[11px] sm:text-[13px] font-black tracking-wide leading-tight font-['Space_Grotesk'] ${inverted ? 'text-[#D09515]' : 'text-[#D09515]'}`}>
          MADE EASY
        </span>
        <div className="flex items-center gap-1 mt-0.5">
          <span className={`h-[1px] w-2 ${inverted ? 'bg-white/40' : 'bg-[#061F48] dark:bg-white/40'}`} />
          <span className={`text-[7.5px] sm:text-[8px] font-black tracking-[0.25em] leading-none ${inverted ? 'text-white/90' : 'text-[#061F48] dark:text-white/80'}`}>
            CLASSES
          </span>
          <span className={`h-[1px] w-2 ${inverted ? 'bg-white/40' : 'bg-[#061F48] dark:bg-white/40'}`} />
        </div>
      </div>
    </div>
  );
}
