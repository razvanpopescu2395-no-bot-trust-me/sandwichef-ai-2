import React, { useState, useEffect } from 'react';
import { Phone, Menu, X, Clock, MapPin, Sparkles, MessageCircle, ExternalLink, Globe } from 'lucide-react';
import { Language } from '../types';
import { getStoreStatus } from '../utils/status';
import { LanguageSwitcher } from './LanguageFlags';
import { handleSafeImageError, FALLBACK_IMAGES } from '../utils/imageFallback';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onNavigateTo: (id: string) => void;
  lang: Language;
  onToggleLang?: () => void;
  setLang?: (lang: Language) => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  openCart?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onNavigateTo,
  lang,
  onToggleLang,
  setLang,
  activeTab = 'home',
  setActiveTab,
  openCart,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [storeStatus, setStoreStatus] = useState(getStoreStatus());

  useEffect(() => {
    const update = () => setStoreStatus(getStoreStatus());
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', labelRo: 'Acasă', labelEn: 'Home', labelIt: 'Inizio' },
    { id: 'menu', labelRo: 'Meniu complet', labelEn: 'Full menu', labelIt: 'Menu completo' },
    { id: 'builder', labelRo: 'Chef Lab ✨', labelEn: 'Chef Lab ✨', labelIt: 'Chef Lab ✨' },
    { id: 'catering', labelRo: 'Catering evenimente', labelEn: 'Catering', labelIt: 'Catering eventi' },
    { id: 'location', labelRo: 'Locație & contact', labelEn: 'Location & contact', labelIt: 'Posizione & contatti' },
  ];

  const handleNavClick = (id: string) => {
    if (setActiveTab) setActiveTab(id);
    onNavigateTo(id);
    setMobileMenuOpen(false);
  };

  const handleSetLang = (newLang: Language) => {
    if (setLang) {
      setLang(newLang);
    } else if (onToggleLang) {
      onToggleLang();
    }
  };

  const statusText =
    lang === 'ro'
      ? storeStatus.statusTextRo
      : lang === 'it'
      ? storeStatus.statusTextIt
      : storeStatus.statusTextEn;

  return (
    <>
      <header
        id="main-navbar"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#FAF7F2]/95 backdrop-blur-md shadow-xs py-2 sm:py-2.5 border-b border-[#241813]/10'
            : 'bg-[#FAF7F2]/90 backdrop-blur-sm py-2.5 sm:py-3.5 border-b border-[#241813]/5'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            {/* Brand Logo & Name - In phone view, languages are positioned directly under the logo */}
            <div className="flex flex-col items-start gap-1 shrink-0">
              <button
                id="brand-logo-btn"
                onClick={() => handleNavClick('home')}
                className="flex items-center gap-2 sm:gap-3 group text-left cursor-pointer focus:outline-none shrink-0"
              >
                <div className="relative w-8 h-8 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-[#C44E36] shadow-xs group-hover:scale-105 transition-transform shrink-0">
                  <img
                    src="/images/logo.png"
                    alt="Sandwichef Logo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      handleSafeImageError(e, FALLBACK_IMAGES.logoSvg);
                    }}
                  />
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2.5 whitespace-nowrap">
                  <span className="font-serif text-lg sm:text-2xl md:text-3xl font-bold tracking-tight text-[#241813] group-hover:text-[#C44E36] transition-colors leading-none">
                    Sandwichef
                  </span>
                  <span className="font-sans font-bold text-[#C44E36] tracking-widest text-[10px] sm:text-xs md:text-sm uppercase bg-[#C44E36]/10 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-[#C44E36]/20 leading-none">
                    Craiova
                  </span>
                </div>
              </button>

              {/* Language Switcher under left logo - ONLY visible in phone view (< sm) */}
              <div className="sm:hidden pl-0.5">
                <LanguageSwitcher
                  currentLang={lang}
                  onSelectLang={handleSetLang}
                  size="sm"
                />
              </div>
            </div>

            {/* Desktop Navigation Links - Wider pill buttons */}
            <nav className="hidden lg:flex items-center gap-1.5 bg-[#F0EAE1] px-3.5 py-1.5 rounded-full border border-[#E4D9CA] shadow-2xs">
              {navLinks.map((link) => {
                const isActive = activeTab === link.id;
                const label = lang === 'ro' ? link.labelRo : lang === 'it' ? link.labelIt : link.labelEn;
                return (
                  <button
                    key={link.id}
                    id={`nav-link-${link.id}`}
                    onClick={() => handleNavClick(link.id)}
                    className={`px-5 py-2 text-sm font-semibold rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap min-w-[85px] text-center ${
                      isActive
                        ? 'bg-[#C44E36] text-white shadow-xs'
                        : 'text-[#4A3B32] hover:text-[#C44E36] hover:bg-white/70'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Quick Call on Desktop / Tablet */}
              <a
                id="header-quick-call"
                href="tel:0735468253"
                className="hidden sm:inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-[#241813] bg-white border border-[#241813]/15 rounded-full hover:border-[#C44E36] hover:text-[#C44E36] transition-colors shadow-2xs min-h-[38px] whitespace-nowrap"
                title="Apelează Sandwichef Craiova"
              >
                <Phone className="w-3.5 h-3.5 text-[#C44E36]" />
                <span>0735 468 253</span>
              </a>

              {/* Language Switcher with Flags for RO, EN, IT - Desktop and Tablet only */}
              <div className="hidden sm:block">
                <LanguageSwitcher
                  currentLang={lang}
                  onSelectLang={handleSetLang}
                  size="sm"
                />
              </div>

              {/* Mobile Menu Hamburger Button */}
              <button
                id="mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-[#241813] hover:bg-[#F0EAE1] active:bg-[#E4D9CA] transition-colors focus:outline-none cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                aria-label="Meniu de navigare"
              >
                {mobileMenuOpen ? <X className="w-6 h-6 text-[#C44E36]" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Full-Screen Mobile Drawer Overlay for Phones */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu-drawer-backdrop"
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs flex flex-col justify-end pt-16 animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            id="mobile-menu-drawer-content"
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF7F2] rounded-t-3xl p-5 border-t border-[#E7DDCE] shadow-2xl flex flex-col max-h-[85vh] overflow-y-auto safe-bottom animate-in slide-in-from-bottom duration-300"
          >
            {/* Drawer Header with Store Status */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#241813]/10">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    storeStatus.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                <span className="text-xs font-bold text-[#241813]">
                  {statusText}
                </span>
                <span className="text-xs text-[#8C7E74]">
                  ({lang === 'ro' ? storeStatus.subtextRo : lang === 'it' ? storeStatus.subtextIt : storeStatus.subtextEn})
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-full text-stone-500 hover:text-[#241813]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Language Selector in Drawer with Flag Badges */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F0EAE1] border border-[#E7DDCE] mb-4">
              <span className="text-xs font-bold text-[#4A3B32] flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#C44E36]" />
                <span>{lang === 'ro' ? 'Limba:' : lang === 'it' ? 'Lingua:' : 'Language:'}</span>
              </span>
              <LanguageSwitcher currentLang={lang} onSelectLang={handleSetLang} size="md" />
            </div>

            {/* Quick Action Dial Cards on Mobile */}
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <a
                href="tel:0735468253"
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-[#241813] text-white font-bold text-xs shadow-xs active:scale-98 transition-transform"
              >
                <Phone className="w-4 h-4 text-[#F0BE2C]" />
                <span>
                  {lang === 'ro' ? 'Sună: 0735 468 253' : lang === 'it' ? 'Chiama: 0735 468 253' : 'Call: 0735 468 253'}
                </span>
              </a>

              <a
                href="https://wa.me/40769409493?text=Salut%20Sandwichef%20Craiova!%20Vreau%20s%C4%83%20comand."
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-xs active:scale-98 transition-transform"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Navigation links with large comfortable tap targets (min 48px) */}
            <div className="flex flex-col gap-1.5 mb-4">
              {navLinks.map((link) => {
                const isActive = activeTab === link.id;
                const label = lang === 'ro' ? link.labelRo : lang === 'it' ? link.labelIt : link.labelEn;
                return (
                  <button
                    key={link.id}
                    id={`mobile-nav-${link.id}`}
                    onClick={() => handleNavClick(link.id)}
                    className={`text-left px-4 py-3 rounded-2xl font-bold text-base transition-colors flex items-center justify-between min-h-[48px] ${
                      isActive
                        ? 'bg-[#C44E36] text-white shadow-xs'
                        : 'text-[#241813] hover:bg-[#F0EAE1] active:bg-[#E4D9CA]'
                    }`}
                  >
                    <span>{label}</span>
                    <span className="text-xs opacity-60">→</span>
                  </button>
                );
              })}
            </div>

            {/* Location and Schedule summary */}
            <div className="pt-3 border-t border-[#241813]/10 space-y-2 text-xs text-[#6B5E55]">
              <a
                href="https://maps.app.goo.gl/UqDviip6A3CN9qXP7"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#E7DDCE] text-[#241813] font-semibold"
              >
                <MapPin className="w-4 h-4 text-[#C44E36] shrink-0" />
                <span className="flex-1">Str. Amaradia, Nr. 29, Craiova</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#8C7E74]" />
              </a>

              <div className="flex items-center justify-around pt-2 text-[11px] font-semibold text-[#8C7E74]">
                <a
                  href="https://food.bolt.eu/ro-ro/1052-craiova/p/91364-sandwichef/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-700 underline flex items-center gap-1"
                >
                  🟢 Bolt Food Craiova
                </a>
                <span>•</span>
                <a
                  href="https://wolt.com/ro/rou/craiova/restaurant/sandwichef-68dfdfbd3a8557c375c011d6"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cyan-700 underline flex items-center gap-1"
                >
                  🔵 Wolt Craiova
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

