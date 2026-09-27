import React, { useState } from 'react';

interface CompanyLogoProps {
  src?: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

/**
 * Extracts initials from company name for fallback display.
 * Example:
 * "PT Maju Jaya" -> "MJ"
 * "CV Berkah Mandiri" -> "BM"
 * "ABC Indonesia" -> "AI"
 * "Tokopedia" -> "TO"
 */
export function getCompanyInitials(name: string): string {
  if (!name || !name.trim()) return 'PK';

  // Strip company type prefixes like PT, CV, UD, TBK, NV, FA, PO
  const cleaned = name
    .trim()
    .replace(/^(PT|CV|UD|TBK|NV|FA|PO)\.?\s+/i, '')
    .trim() || name;

  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  if (words.length === 1 && words[0].length >= 2) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return cleaned.slice(0, 2).toUpperCase();
}

/**
 * Deterministic pleasant background gradient for company fallback
 */
function getCompanyBgColor(name: string): string {
  const colors = [
    'from-blue-600 to-indigo-600 text-white',
    'from-emerald-600 to-teal-600 text-white',
    'from-violet-600 to-purple-600 text-white',
    'from-amber-500 to-orange-600 text-white',
    'from-rose-500 to-pink-600 text-white',
    'from-cyan-600 to-blue-600 text-white',
    'from-slate-700 to-slate-900 text-white',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  src,
  name,
  size = 'md',
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);

  // Size mappings
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px] rounded-lg',
    sm: 'w-8 h-8 text-xs rounded-xl',
    md: 'w-11 h-11 text-sm rounded-xl',
    lg: 'w-14 h-14 text-base rounded-2xl',
    xl: 'w-18 h-18 text-lg rounded-2xl',
    '2xl': 'w-24 h-24 text-2xl rounded-3xl',
  };

  const imagePadding = {
    xs: 'p-0.5',
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2',
    xl: 'p-2.5',
    '2xl': 'p-3',
  };

  const initials = getCompanyInitials(name);
  const bgGradient = getCompanyBgColor(name);

  // If no source or error occurred, show fallback initials
  if (!src || hasError) {
    return (
      <div
        className={`shrink-0 flex items-center justify-center font-extrabold uppercase tracking-wide bg-gradient-to-tr ${bgGradient} shadow-2xs select-none ${sizeClasses[size]} ${className}`}
        title={name}
        aria-label={name}
      >
        <span>{initials}</span>
      </div>
    );
  }

  return (
    <div
      className={`shrink-0 bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center overflow-hidden ${imagePadding[size]} ${sizeClasses[size]} ${className}`}
      title={name}
    >
      <img
        src={src}
        alt={`Logo ${name}`}
        loading="lazy"
        onError={() => setHasError(true)}
        className="w-full h-full object-contain"
      />
    </div>
  );
};
