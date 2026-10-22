import React from 'react';
import { Language } from '../types';

export const FlagRO: React.FC<{ className?: string }> = ({ className = 'w-4 h-3' }) => (
  <svg
    className={`${className} inline-block shrink-0 rounded-2xs overflow-hidden shadow-2xs border border-black/10`}
    viewBox="0 0 3 2"
    aria-hidden="true"
  >
    <rect width="1" height="2" fill="#002B7F" />
    <rect x="1" width="1" height="2" fill="#FCD116" />
    <rect x="2" width="1" height="2" fill="#CE1126" />
  </svg>
);

export const FlagEN: React.FC<{ className?: string }> = ({ className = 'w-4 h-3' }) => (
  <svg
    className={`${className} inline-block shrink-0 rounded-2xs overflow-hidden shadow-2xs border border-black/10`}
    viewBox="0 0 60 30"
    aria-hidden="true"
  >
    <clipPath id="uk-flag-clip">
      <path d="M0 0v30h60V0z" />
    </clipPath>
    <g clipPath="url(#uk-flag-clip)">
      <path d="M0 0v30h60V0z" fill="#012169" />
      <path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6" />
      <path d="M0 0l60 30m0-30L0 30" stroke="#C8102E" strokeWidth="2" />
      <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
      <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6" />
    </g>
  </svg>
);

export const FlagIT: React.FC<{ className?: string }> = ({ className = 'w-4 h-3' }) => (
  <svg
    className={`${className} inline-block shrink-0 rounded-2xs overflow-hidden shadow-2xs border border-black/10`}
    viewBox="0 0 3 2"
    aria-hidden="true"
  >
    <rect width="1" height="2" fill="#009246" />
    <rect x="1" width="1" height="2" fill="#FFFFFF" />
    <rect x="2" width="1" height="2" fill="#CE2B37" />
  </svg>
);

interface LanguageSwitcherProps {
  currentLang: Language;
  onSelectLang: (lang: Language) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  currentLang,
  onSelectLang,
  size = 'sm',
  className = '',
}) => {
  const languages: { id: Language; label: string; name: string; Flag: React.FC<{ className?: string }> }[] = [
    { id: 'ro', label: 'RO', name: 'Română', Flag: FlagRO },
    { id: 'en', label: 'EN', name: 'English', Flag: FlagEN },
    { id: 'it', label: 'IT', name: 'Italiano', Flag: FlagIT },
  ];

  return (
    <div
      id="language-switcher-group"
      className={`inline-flex items-center bg-[#F0EAE1] rounded-full p-0.5 border border-[#E4D9CA] ${className}`}
      role="group"
      aria-label="Alege limba / Select language / Scegli la lingua"
    >
      {languages.map(({ id, label, name, Flag }) => {
        const isSelected = currentLang === id;
        return (
          <button
            key={id}
            id={`lang-btn-${id}`}
            type="button"
            onClick={() => onSelectLang(id)}
            title={name}
            aria-pressed={isSelected}
            className={`flex items-center gap-1 sm:gap-1.5 transition-all duration-200 cursor-pointer font-bold rounded-full shrink-0 ${
              size === 'sm'
                ? 'px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-[11px]'
                : size === 'md'
                ? 'px-2.5 py-1.5 text-xs'
                : 'px-3.5 py-2 text-sm'
            } ${
              isSelected
                ? 'bg-[#C44E36] text-white shadow-xs font-extrabold'
                : 'text-[#5C4D44] hover:text-[#241813] hover:bg-white/40'
            }`}
          >
            <Flag className={size === 'sm' ? 'w-3.5 h-2.5 shrink-0' : 'w-4 h-3 shrink-0'} />
            <span className="leading-none">{label}</span>
          </button>
        );
      })}
    </div>
  );
};
