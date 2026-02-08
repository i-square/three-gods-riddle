import { useMemo } from 'react';

interface MysticalAvatarProps {
  isSelected: boolean;
  seed: number;
}

// Reusable SVG definitions for filters and gradients
const SvgDefs = () => (
  <defs>
    <filter id="glow-filter" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
      <feMerge>
        <feMergeNode in="coloredBlur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <linearGradient id="mystic-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#818cf8" />
      <stop offset="100%" stopColor="#c084fc" />
    </linearGradient>
    <radialGradient id="eye-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#22d3ee" stopOpacity="1" />
      <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
    </radialGradient>
  </defs>
);

// 10 different mystical avatar designs
const avatarDesigns = [
  // 1. Hooded Figure with Glowing Eyes
  (isSelected: boolean) => (
    <g className="animate-float-slow">
      <path d="M32 8 C16 8 8 24 8 40 L8 56 L56 56 L56 40 C56 24 48 8 32 8Z"
        className="fill-gray-900 stroke-indigo-500/50" strokeWidth="1.5"/>
      <path d="M20 48 Q32 56 44 48" className="stroke-indigo-400/40 fill-none" strokeWidth="1.5"/>
      <ellipse cx="24" cy="32" rx="4" ry="3" className={`${isSelected ? 'fill-cyan-400 filter url(#glow-filter)' : 'fill-indigo-400/50'} transition-all duration-500`}>
        {isSelected && <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>}
      </ellipse>
      <ellipse cx="40" cy="32" rx="4" ry="3" className={`${isSelected ? 'fill-cyan-400 filter url(#glow-filter)' : 'fill-indigo-400/50'} transition-all duration-500`}>
        {isSelected && <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>}
      </ellipse>
      <path d="M12 20 Q32 4 52 20" className="stroke-purple-400/30 fill-none" strokeWidth="2"/>
    </g>
  ),

  // 2. Ornate Mask with Crown
  (isSelected: boolean) => (
    <g className="animate-float-slow" style={{ animationDelay: '0.5s' }}>
      <path d="M32 4 L24 16 L16 12 L20 24 L12 28 L20 32 L16 44 L24 40 L32 52 L40 40 L48 44 L44 32 L52 28 L44 24 L48 12 L40 16 Z"
        className="fill-gray-900 stroke-amber-500/60" strokeWidth="1.5"/>
      <circle cx="26" cy="28" r="4" className="fill-gray-950 stroke-indigo-300/60" strokeWidth="1"/>
      <circle cx="38" cy="28" r="4" className="fill-gray-950 stroke-indigo-300/60" strokeWidth="1"/>
      <circle cx="26" cy="28" r="2" className={`${isSelected ? 'fill-amber-400 filter url(#glow-filter)' : 'fill-indigo-400/40'}`}>
        {isSelected && <animate attributeName="r" values="1.5;2.5;1.5" dur="1.5s" repeatCount="indefinite"/>}
      </circle>
      <circle cx="38" cy="28" r="2" className={`${isSelected ? 'fill-amber-400 filter url(#glow-filter)' : 'fill-indigo-400/40'}`}>
        {isSelected && <animate attributeName="r" values="1.5;2.5;1.5" dur="1.5s" repeatCount="indefinite"/>}
      </circle>
    </g>
  ),

  // 3. Floating Cloak with Ethereal Glow
  (isSelected: boolean) => (
    <g className="animate-float-slow" style={{ animationDelay: '1s' }}>
      <ellipse cx="32" cy="48" rx="16" ry="4" className="fill-indigo-900/30">
        {isSelected && <animate attributeName="ry" values="4;6;4" dur="3s" repeatCount="indefinite"/>}
      </ellipse>
      <path d="M20 16 Q32 8 44 16 L48 52 Q32 48 16 52 Z" className="fill-gray-900 stroke-purple-400/50" strokeWidth="1.5">
        {isSelected && <animate attributeName="d" values="M20 16 Q32 8 44 16 L48 52 Q32 48 16 52 Z;M20 14 Q32 6 44 14 L48 50 Q32 46 16 50 Z;M20 16 Q32 8 44 16 L48 52 Q32 48 16 52 Z" dur="3s" repeatCount="indefinite"/>}
      </path>
      <circle cx="28" cy="28" r="3" className={`${isSelected ? 'fill-purple-400 filter url(#glow-filter)' : 'fill-indigo-400/40'}`}/>
      <circle cx="36" cy="28" r="3" className={`${isSelected ? 'fill-purple-400 filter url(#glow-filter)' : 'fill-indigo-400/40'}`}/>
      {isSelected && <circle cx="32" cy="20" r="8" className="fill-purple-400/20">
        <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite"/>
      </circle>}
    </g>
  ),

  // 4. Ancient Deity Mask
  (isSelected: boolean) => (
    <g className="animate-float-slow" style={{ animationDelay: '1.5s' }}>
      <ellipse cx="32" cy="32" rx="22" ry="26" className="fill-gray-900 stroke-indigo-400/60" strokeWidth="2"/>
      <path d="M18 26 L26 26 L26 34 L18 34 Z" className="fill-gray-950 stroke-cyan-400/50" strokeWidth="1"/>
      <path d="M38 26 L46 26 L46 34 L38 34 Z" className="fill-gray-950 stroke-cyan-400/50" strokeWidth="1"/>
      <rect x="21" y="28" width="4" height="4" className={`${isSelected ? 'fill-cyan-400 filter url(#glow-filter)' : 'fill-indigo-400/40'}`}>
        {isSelected && <animate attributeName="opacity" values="0.6;1;0.6" dur="1s" repeatCount="indefinite"/>}
      </rect>
      <rect x="39" y="28" width="4" height="4" className={`${isSelected ? 'fill-cyan-400 filter url(#glow-filter)' : 'fill-indigo-400/40'}`}>
        {isSelected && <animate attributeName="opacity" values="0.6;1;0.6" dur="1s" repeatCount="indefinite"/>}
      </rect>
      <path d="M26 44 Q32 50 38 44" className="stroke-indigo-400/40 fill-none" strokeWidth="2"/>
      <path d="M32 8 L32 4 M24 10 L22 6 M40 10 L42 6" className="stroke-amber-500/50" strokeWidth="2"/>
    </g>
  ),

  // 5. Phantom with Swirling Aura
  (isSelected: boolean) => (
    <g className="animate-float-slow" style={{ animationDelay: '2s' }}>
      <path d="M32 12 C20 12 14 24 14 36 C14 48 20 54 32 54 C44 54 50 48 50 36 C50 24 44 12 32 12"
        className="fill-gray-900 stroke-purple-500/50" strokeWidth="1.5"/>
      <ellipse cx="26" cy="30" rx="5" ry="4" className="fill-gray-950"/>
      <ellipse cx="38" cy="30" rx="5" ry="4" className="fill-gray-950"/>
      <circle cx="26" cy="30" r="2" className={`${isSelected ? 'fill-pink-400 filter url(#glow-filter)' : 'fill-indigo-400/40'}`}/>
      <circle cx="38" cy="30" r="2" className={`${isSelected ? 'fill-pink-400 filter url(#glow-filter)' : 'fill-indigo-400/40'}`}/>
      {isSelected && <>
        <circle cx="32" cy="32" r="28" className="fill-none stroke-purple-400/30" strokeWidth="1" strokeDasharray="4 4">
          <animateTransform attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="8s" repeatCount="indefinite"/>
        </circle>
        <circle cx="32" cy="32" r="24" className="fill-none stroke-pink-400/20" strokeWidth="1" strokeDasharray="2 6">
          <animateTransform attributeName="transform" type="rotate" from="360 32 32" to="0 32 32" dur="6s" repeatCount="indefinite"/>
        </circle>
      </>}
    </g>
  ),

  // 6. Tribal Mask with Feathers
  (isSelected: boolean) => (
    <g className="animate-float-slow" style={{ animationDelay: '2.5s' }}>
      <path d="M32 52 L20 44 L16 28 L20 16 L32 12 L44 16 L48 28 L44 44 Z"
        className="fill-gray-900 stroke-orange-400/50" strokeWidth="1.5"/>
      <path d="M16 20 L8 8 M20 16 L14 6 M44 16 L50 6 M48 20 L56 8"
        className="stroke-orange-400/40" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="26" cy="28" r="4" className="fill-gray-950 stroke-orange-300/50" strokeWidth="1"/>
      <circle cx="38" cy="28" r="4" className="fill-gray-950 stroke-orange-300/50" strokeWidth="1"/>
      <circle cx="26" cy="28" r="2" className={`${isSelected ? 'fill-orange-400 filter url(#glow-filter)' : 'fill-indigo-400/40'}`}>
        {isSelected && <animate attributeName="opacity" values="0.5;1;0.5" dur="0.8s" repeatCount="indefinite"/>}
      </circle>
      <circle cx="38" cy="28" r="2" className={`${isSelected ? 'fill-orange-400 filter url(#glow-filter)' : 'fill-indigo-400/40'}`}>
        {isSelected && <animate attributeName="opacity" values="0.5;1;0.5" dur="0.8s" repeatCount="indefinite"/>}
      </circle>
      <path d="M26 40 L32 44 L38 40" className="stroke-orange-400/40 fill-none" strokeWidth="2"/>
    </g>
  ),

  // 7. Celestial Being with Halo
  (isSelected: boolean) => (
    <g className="animate-float-slow" style={{ animationDelay: '3s' }}>
      <ellipse cx="32" cy="6" rx="12" ry="3" className={`fill-none ${isSelected ? 'stroke-yellow-400 filter url(#glow-filter)' : 'stroke-yellow-400/30'}`} strokeWidth="2">
        {isSelected && <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>}
      </ellipse>
      <ellipse cx="32" cy="34" rx="18" ry="22" className="fill-gray-900 stroke-indigo-400/50" strokeWidth="1.5"/>
      <path d="M24 28 Q26 24 28 28 Q26 32 24 28" className="fill-gray-950 stroke-indigo-300/60" strokeWidth="1"/>
      <path d="M36 28 Q38 24 40 28 Q38 32 36 28" className="fill-gray-950 stroke-indigo-300/60" strokeWidth="1"/>
      <ellipse cx="26" cy="28" rx="1.5" ry="2" className={`${isSelected ? 'fill-yellow-300 filter url(#glow-filter)' : 'fill-indigo-400/40'}`}/>
      <ellipse cx="38" cy="28" rx="1.5" ry="2" className={`${isSelected ? 'fill-yellow-300 filter url(#glow-filter)' : 'fill-indigo-400/40'}`}/>
      <path d="M28 42 Q32 46 36 42" className="stroke-indigo-400/30 fill-none" strokeWidth="1.5"/>
    </g>
  ),

  // 8. Shadow Entity
  (isSelected: boolean) => (
    <g className="animate-float-slow" style={{ animationDelay: '3.5s' }}>
      <path d="M32 8 C18 8 10 20 10 34 C10 48 18 56 32 56 C46 56 54 48 54 34 C54 20 46 8 32 8"
        className="fill-gray-900 stroke-indigo-500/40" strokeWidth="1.5">
        {isSelected && <animate attributeName="d"
          values="M32 8 C18 8 10 20 10 34 C10 48 18 56 32 56 C46 56 54 48 54 34 C54 20 46 8 32 8;M32 6 C16 6 8 20 8 34 C8 50 18 58 32 58 C46 58 56 50 56 34 C56 20 48 6 32 6;M32 8 C18 8 10 20 10 34 C10 48 18 56 32 56 C46 56 54 48 54 34 C54 20 46 8 32 8"
          dur="4s" repeatCount="indefinite"/>}
      </path>
      <ellipse cx="24" cy="28" rx="6" ry="8" className="fill-gray-950"/>
      <ellipse cx="40" cy="28" rx="6" ry="8" className="fill-gray-950"/>
      <ellipse cx="24" cy="28" rx="2" ry="4" className={`${isSelected ? 'fill-rose-500 filter url(#glow-filter)' : 'fill-indigo-400/30'}`}>
        {isSelected && <animate attributeName="ry" values="3;5;3" dur="2s" repeatCount="indefinite"/>}
      </ellipse>
      <ellipse cx="40" cy="28" rx="2" ry="4" className={`${isSelected ? 'fill-rose-500 filter url(#glow-filter)' : 'fill-indigo-400/30'}`}>
        {isSelected && <animate attributeName="ry" values="3;5;3" dur="2s" repeatCount="indefinite"/>}
      </ellipse>
    </g>
  ),

  // 9. Crystal Oracle
  (isSelected: boolean) => (
    <g className="animate-float-slow" style={{ animationDelay: '4s' }}>
      <polygon points="32,4 48,20 48,44 32,60 16,44 16,20"
        className="fill-gray-900 stroke-cyan-400/50" strokeWidth="1.5"/>
      <polygon points="32,12 42,22 42,42 32,52 22,42 22,22"
        className="fill-gray-950/60 stroke-cyan-300/30" strokeWidth="1"/>
      <circle cx="26" cy="28" r="3" className={`${isSelected ? 'fill-cyan-400 filter url(#glow-filter)' : 'fill-indigo-400/40'}`}>
        {isSelected && <animate attributeName="opacity" values="0.6;1;0.6" dur="1.2s" repeatCount="indefinite"/>}
      </circle>
      <circle cx="38" cy="28" r="3" className={`${isSelected ? 'fill-cyan-400 filter url(#glow-filter)' : 'fill-indigo-400/40'}`}>
        {isSelected && <animate attributeName="opacity" values="0.6;1;0.6" dur="1.2s" repeatCount="indefinite"/>}
      </circle>
      {isSelected && <polygon points="32,4 48,20 48,44 32,60 16,44 16,20"
        className="fill-none stroke-cyan-400/40" strokeWidth="3">
        <animate attributeName="stroke-opacity" values="0.2;0.6;0.2" dur="2s" repeatCount="indefinite"/>
      </polygon>}
    </g>
  ),

  // 10. Void Walker with Portal
  (isSelected: boolean) => (
    <g className="animate-float-slow" style={{ animationDelay: '4.5s' }}>
      <circle cx="32" cy="32" r="20" className="fill-gray-950 stroke-purple-500/50" strokeWidth="1.5"/>
      <circle cx="32" cy="32" r="14" className="fill-gray-900 stroke-purple-400/30" strokeWidth="1">
        {isSelected && <animate attributeName="r" values="14;16;14" dur="3s" repeatCount="indefinite"/>}
      </circle>
      <ellipse cx="26" cy="28" rx="3" ry="4" className="fill-gray-950"/>
      <ellipse cx="38" cy="28" rx="3" ry="4" className="fill-gray-950"/>
      <circle cx="26" cy="28" r="1.5" className={`${isSelected ? 'fill-purple-400 filter url(#glow-filter)' : 'fill-indigo-400/30'}`}/>
      <circle cx="38" cy="28" r="1.5" className={`${isSelected ? 'fill-purple-400 filter url(#glow-filter)' : 'fill-indigo-400/30'}`}/>
      {isSelected && <>
        <circle cx="32" cy="32" r="22" className="fill-none stroke-purple-500/30" strokeWidth="1">
          <animate attributeName="r" values="20;24;20" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="stroke-opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite"/>
        </circle>
      </>}
      <path d="M28 40 Q32 44 36 40" className="stroke-purple-400/40 fill-none" strokeWidth="1.5"/>
    </g>
  ),
];

export function MysticalAvatar({ isSelected, seed }: MysticalAvatarProps) {
  const designIndex = useMemo(() => seed % avatarDesigns.length, [seed]);
  const AvatarDesign = avatarDesigns[designIndex];

  return (
    <svg viewBox="0 0 64 64" className="w-24 h-24 drop-shadow-2xl" fill="none">
      <SvgDefs />
      {AvatarDesign(isSelected)}
    </svg>
  );
}
