import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Clock, MapPin, Phone, ExternalLink } from 'lucide-react';
import { Language } from '../types';
import { getStoreStatus } from '../utils/status';
import { handleSafeImageError, FALLBACK_IMAGES } from '../utils/imageFallback';

interface HeroSectionProps {
  onExploreMenu: () => void;
  onOpenBuilder: () => void;
  lang: Language;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreMenu,
  onOpenBuilder,
  lang,
}) => {
  const [storeStatus, setStoreStatus] = useState(getStoreStatus());

  useEffect(() => {
    const update = () => setStoreStatus(getStoreStatus());
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="home" className="relative pt-20 pb-10 sm:pt-28 sm:pb-20 overflow-hidden">
      {/* Background Image with Layered Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/swc-cover.jpg"
          alt="Sandwichef Gourmet Sandwiches"
          className="w-full h-full object-cover object-center filter brightness-45 scale-105"
          onError={(e) => {
            handleSafeImageError(e, FALLBACK_IMAGES.coverUnsplash);
          }}
        />
        {/* Warm tinted gradient overlay for crisp contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#241813] via-[#241813]/80 to-[#241813]/50" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Dynamic Store Status Pill above Logo */}
          <div
            className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full backdrop-blur-md text-[11px] sm:text-xs font-semibold mb-4 sm:mb-6 shadow-sm transition-all duration-300 max-w-full flex-wrap justify-center ${
              storeStatus.isOpen
                ? 'bg-emerald-950/75 border border-emerald-500/40 text-white'
                : 'bg-[#241813]/90 border border-amber-500/40 text-stone-200'
            }`}
          >
            <span className="relative flex h-2 w-2 shrink-0">
              {storeStatus.isOpen ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
              )}
            </span>
            <span
              className={`font-bold uppercase tracking-wider text-[10px] sm:text-[11px] ${
                storeStatus.isOpen ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              Craiova
            </span>
            <span className={storeStatus.isOpen ? 'text-emerald-500/60' : 'text-amber-500/60'}>•</span>
            <span className="font-medium flex items-center gap-1.5">
              <span className={`font-bold ${storeStatus.isOpen ? 'text-emerald-300' : 'text-amber-300'}`}>
                {lang === 'ro'
                  ? storeStatus.statusBadgeRo
                  : lang === 'it'
                  ? storeStatus.statusBadgeIt
                  : storeStatus.statusBadgeEn}
              </span>
              <span className={storeStatus.isOpen ? 'text-emerald-500/60' : 'text-amber-500/60'}>•</span>
              <span className={`text-[10px] sm:text-[11px] ${storeStatus.isOpen ? 'text-[#F0BE2C] font-semibold' : 'text-stone-300'}`}>
                {lang === 'ro'
                  ? storeStatus.scheduleSnippetRo
                  : lang === 'it'
                  ? storeStatus.scheduleSnippetIt
                  : storeStatus.scheduleSnippetEn}
              </span>
            </span>
          </div>

          {/* Central Sandwichef Logo Crest */}
          <div className="relative mb-4 sm:mb-6 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#C44E36] to-[#F0BE2C] rounded-full blur-sm opacity-40 group-hover:opacity-75 transition-opacity" />
            <div className="relative w-20 h-20 sm:w-32 sm:h-32 rounded-full overflow-hidden border-3 sm:border-4 border-white/90 shadow-xl bg-[#FAF7F2] p-0.5">
              <img
                src="/images/logo.png"
                alt="Sandwichef Craiova"
                className="w-full h-full object-cover rounded-full transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  handleSafeImageError(e, FALLBACK_IMAGES.logoSvg);
                }}
              />
            </div>
          </div>

          {/* Main Display Headline */}
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight max-w-3xl leading-tight sm:leading-none mb-3 sm:mb-4 drop-shadow-sm">
            {lang === 'ro' ? (
              <>
                Sandwich-ul pe care îl iubești.{' '}
                <span className="text-[#F0BE2C] italic">Chef-ul</span> care îl desăvârșește.
              </>
            ) : lang === 'it' ? (
              <>
                Il panino che ami.{' '}
                <span className="text-[#F0BE2C] italic">Lo Chef</span> che lo perfeziona.
              </>
            ) : (
              <>
                The sandwich you love.{' '}
                <span className="text-[#F0BE2C] italic">The Chef</span> who perfects it.
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="max-w-xl text-sm sm:text-base md:text-lg text-stone-200 font-normal leading-relaxed mb-6 sm:mb-8 drop-shadow-2xs px-2">
            {lang === 'ro'
              ? 'Panini toscane pe Schiacciata de 180g, mortadella di Bologna, gorgonzola cremoasă și sosuri artizanale gătite în casă.'
              : lang === 'it'
              ? 'Panini toscani su Schiacciata da 180g, mortadella di Bologna, gorgonzola cremosa e salse artigianali fatte in casa.'
              : 'Tuscan panini on 180g Schiacciata flatbread, Bologna mortadella, gorgonzola cream, and house sauces.'}
          </p>

          {/* Action CTAs - Sized for effortless phone thumb tapping (min 48px) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-4 mb-8 sm:mb-10 w-full max-w-md px-2">
            <button
              id="hero-explore-menu-btn"
              onClick={onExploreMenu}
              className="w-full sm:w-auto px-7 py-3.5 bg-[#C44E36] hover:bg-[#A63B25] active:scale-98 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer min-h-[48px]"
            >
              <span>{lang === 'ro' ? 'Explorează meniul' : lang === 'it' ? 'Esplora il menu' : 'Explore menu'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="hero-open-builder-btn"
              onClick={onOpenBuilder}
              className="w-full sm:w-auto px-7 py-3.5 bg-white/15 hover:bg-white/25 active:scale-98 text-white border border-white/30 backdrop-blur-md font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer min-h-[48px]"
            >
              <Sparkles className="w-4 h-4 text-[#F0BE2C]" />
              <span>{lang === 'ro' ? 'Creează-ți sandwich-ul' : lang === 'it' ? 'Crea il tuo panino' : 'Build custom panini'}</span>
            </button>
          </div>

          {/* Quick Partner & Schedule Info - Mobile Optimized */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 w-full max-w-3xl pt-5 sm:pt-6 border-t border-white/15 text-left px-2">
            {/* Hours */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 border border-white/10 text-white flex items-center gap-3">
              <div className="p-2 bg-[#C44E36]/40 rounded-xl text-[#F0BE2C] shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-stone-300 font-medium">
                  {lang === 'ro' ? 'Program' : lang === 'it' ? 'Orari' : 'Opening hours'}
                </p>
                <p className="text-xs sm:text-sm font-bold truncate">
                  {lang === 'ro' ? 'L - V: 09:30 - 17:30' : lang === 'it' ? 'Lun - Ven: 09:30 - 17:30' : 'Mon - Fri: 09:30 - 17:30'}
                </p>
                <span className="text-[11px] text-emerald-400 font-semibold block truncate">
                  {lang === 'ro' ? storeStatus.statusTextRo : lang === 'it' ? storeStatus.statusTextIt : storeStatus.statusTextEn}
                </span>
              </div>
            </div>

            {/* Address */}
            <a
              href="https://maps.app.goo.gl/UqDviip6A3CN9qXP7"
              target="_blank"
              rel="noreferrer"
              className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 border border-white/10 text-white flex items-center gap-3 hover:bg-white/15 transition-colors"
            >
              <div className="p-2 bg-[#C44E36]/40 rounded-xl text-[#F0BE2C] shrink-0">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-stone-300 font-medium">
                  {lang === 'ro' ? 'Locație Craiova' : lang === 'it' ? 'Posizione Craiova' : 'Location'}
                </p>
                <p className="text-xs sm:text-sm font-bold truncate">Str. Amaradia, Nr. 29</p>
                <p className="text-[11px] text-[#F0BE2C] font-semibold flex items-center gap-1">
                  <span>{lang === 'ro' ? 'Deschide harta' : lang === 'it' ? 'Apri mappa' : 'Open map'}</span>
                  <ExternalLink className="w-3 h-3" />
                </p>
              </div>
            </a>

            {/* Call */}
            <a
              href="tel:0735468253"
              className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 border border-white/10 text-white flex items-center gap-3 hover:bg-white/15 transition-colors"
            >
              <div className="p-2 bg-[#C44E36]/40 rounded-xl text-[#F0BE2C] shrink-0">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-stone-300 font-medium">
                  {lang === 'ro' ? 'Comenzi rapide' : lang === 'it' ? 'Ordini rapidi' : 'Quick order'}
                </p>
                <p className="text-xs sm:text-sm font-bold text-[#F0BE2C] truncate">
                  0735 468 253
                </p>
                <p className="text-[11px] text-stone-300">
                  {lang === 'ro' ? 'Apasă pentru apel direct' : lang === 'it' ? 'Tocca per chiamare subito' : 'Tap for instant call'}
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
