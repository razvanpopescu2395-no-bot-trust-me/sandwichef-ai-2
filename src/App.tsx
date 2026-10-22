import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { StorySection } from './components/StorySection';
import { MenuSection } from './components/MenuSection';
import { SandwichLab } from './components/SandwichLab';
import { CateringSection } from './components/CateringSection';
import { LocationContactSection } from './components/LocationContactSection';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { ItemDetailModal } from './components/ItemDetailModal';
import { MobileBottomBar } from './components/MobileBottomBar';
import { StaffInventoryPage } from './components/StaffInventoryPage';
import { CartItem, MenuItem, Language, BreadInventoryState } from './types';
import { MENU_ITEMS } from './data/menuData';
import { Check, ShoppingBag, ArrowLeft, Sparkles, Utensils, ArrowRight, Star } from 'lucide-react';
import { handleSafeImageError, FALLBACK_IMAGES } from './utils/imageFallback';
import { fetchInventory, getCachedInventory, setCachedInventory } from './utils/inventoryClient';

export type AppPage = 'home' | 'menu' | 'builder' | 'catering' | 'location' | 'gestiune';

const getPageFromHash = (): AppPage => {
  const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
  const hash = window.location.hash.replace('#', '').replace('/', '').toLowerCase();

  // Support direct URL path e.g. /inventar or /gestiune
  if (path === '/inventar' || path === '/gestiune') return 'gestiune';

  // Support hash routing e.g. #inventar, #/inventar, #gestiune
  if (
    hash === 'inventar' ||
    hash === 'gestiune' ||
    hash === 'staff' ||
    hash === 'magazin' ||
    hash === 'tejghea' ||
    hash === 'vanzari'
  ) {
    return 'gestiune';
  }

  if (hash === 'menu' || hash === 'meniu' || path === '/menu' || path === '/meniu') return 'menu';
  if (hash === 'builder' || hash === 'chef-lab' || hash === 'cheflab' || path === '/builder') return 'builder';
  if (hash === 'catering' || path === '/catering') return 'catering';
  if (hash === 'location' || hash === 'locatie' || path === '/location') return 'location';

  return 'home';
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>(getPageFromHash);
  const [lang, setLang] = useState<Language>('ro');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeDetailItem, setActiveDetailItem] = useState<MenuItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [inventory, setInventory] = useState<BreadInventoryState>(getCachedInventory);
  const [isInventoryLoading, setIsInventoryLoading] = useState<boolean>(true);

  // Sync state with browser back/forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      const page = getPageFromHash();
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Real-time server inventory synchronization (SSE + Polling fallback)
  useEffect(() => {
    fetchInventory()
      .then((data) => {
        setInventory(data);
      })
      .finally(() => {
        setIsInventoryLoading(false);
      });

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/inventory/stream');
      eventSource.onmessage = (event) => {
        try {
          const updated: BreadInventoryState = JSON.parse(event.data);
          setInventory(updated);
          setCachedInventory(updated);
        } catch (e) {
          // ignore
        }
      };
    } catch (e) {
      // ignore
    }

    const pollInterval = setInterval(() => {
      fetchInventory().then((data) => setInventory(data));
    }, 4000);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(pollInterval);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Route to page and update URL hash
  const handleNavigateTo = (id: string) => {
    let targetPage: AppPage = 'home';
    if (id === 'menu') targetPage = 'menu';
    else if (id === 'builder' || id === 'cheflab' || id === 'chef-lab') targetPage = 'builder';
    else if (id === 'catering') targetPage = 'catering';
    else if (id === 'location') targetPage = 'location';
    else if (id === 'gestiune' || id === 'inventar' || id === 'staff' || id === 'magazin') targetPage = 'gestiune';
    else if (id === 'home') targetPage = 'home';

    setCurrentPage(targetPage);
    const newHash =
      targetPage === 'home'
        ? ''
        : targetPage === 'builder'
        ? '#chef-lab'
        : targetPage === 'gestiune'
        ? '#inventar'
        : `#${targetPage}`;

    if (targetPage === 'home') {
      if (window.location.pathname === '/inventar' || window.location.pathname === '/gestiune') {
        window.history.pushState(null, '', '/');
      } else if (window.location.hash) {
        window.history.pushState(null, '', window.location.pathname);
      }
    } else {
      if (window.location.hash !== newHash) {
        window.history.pushState(null, '', newHash);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add standard or personalized item from modal
  const handleAddToCartFromModal = (
    item: MenuItem,
    quantity: number,
    removed: string[],
    extras: string[],
    notes: string
  ) => {
    const newCartItem: CartItem = {
      id: `${item.id}-${Date.now()}`,
      menuItem: item,
      quantity,
      selectedExtras: extras,
      removedIngredients: removed,
      specialInstructions: notes,
    };

    setCartItems((prev) => [...prev, newCartItem]);
    showToast(
      lang === 'ro'
        ? `Adăugat: ${quantity}x ${item.name}`
        : lang === 'it'
        ? `Aggiunto: ${quantity}x ${item.nameIt || item.name}`
        : `Added: ${quantity}x ${item.nameEn || item.name}`
    );
  };

  // Quick add button on card
  const handleQuickAdd = (item: MenuItem, e: React.MouseEvent) => {
    const isPanini =
      item.name.toLowerCase().includes('panini') ||
      (item.nameEn && item.nameEn.toLowerCase().includes('panini')) ||
      (item.nameIt && item.nameIt.toLowerCase().includes('panini')) ||
      item.category === 'panini';
    if (isPanini && inventory && inventory.remaining <= 0) {
      showToast(
        lang === 'ro'
          ? 'Stoc epuizat pentru azi! Revenim mâine cu pâine proaspătă Schiacciata.'
          : lang === 'it'
          ? 'Stoc esaurito per oggi! Torniamo domani con schiacciata fresca.'
          : 'Panini sold out for today! Fresh batch baked tomorrow.'
      );
      return;
    }

    const existingIndex = cartItems.findIndex(
      (ci) =>
        ci.menuItem.id === item.id &&
        (!ci.selectedExtras || ci.selectedExtras.length === 0) &&
        (!ci.removedIngredients || ci.removedIngredients.length === 0)
    );

    if (existingIndex > -1) {
      setCartItems((prev) =>
        prev.map((ci, idx) =>
          idx === existingIndex ? { ...ci, quantity: ci.quantity + 1 } : ci
        )
      );
    } else {
      const newCartItem: CartItem = {
        id: `${item.id}-${Date.now()}`,
        menuItem: item,
        quantity: 1,
      };
      setCartItems((prev) => [...prev, newCartItem]);
    }

    showToast(
      lang === 'ro'
        ? `1x ${item.name} adăugat în coș!`
        : lang === 'it'
        ? `1x ${item.nameIt || item.name} aggiunto al carrello!`
        : `1x ${item.nameEn || item.name} added to cart!`
    );
  };

  // Custom sandwich from Chef Lab
  const handleAddCustomSandwich = (
    customItem: MenuItem,
    details: {
      bread: string;
      proteins: string[];
      cheeses: string[];
      veggies: string[];
      sauces: string[];
      totalWeight: number;
    }
  ) => {
    const newCartItem: CartItem = {
      id: customItem.id,
      menuItem: customItem,
      quantity: 1,
      specialInstructions: `Bază: ${details.bread} | Proteine: ${details.proteins.join(', ')} | Brânză: ${details.cheeses.join(', ')} | Veg: ${details.veggies.join(', ')} | Sos: ${details.sauces.join(', ')}`,
      customSandwichDetails: details,
    };

    setCartItems((prev) => [...prev, newCartItem]);
    setIsCartOpen(true);
    showToast(
      lang === 'ro'
        ? `Creația ta "${customItem.name}" a fost adăugată!`
        : lang === 'it'
        ? `La tua creazione "${customItem.name}" è stata aggiunta!`
        : `Your custom "${customItem.name}" was added!`
    );
  };

  // Quantity updates
  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQ = item.quantity + delta;
            return newQ > 0 ? { ...item, quantity: newQ } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartPrice = cartItems.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );

  // Featured popular sandwiches for the visual photo showcase on homepage
  const featuredSandwiches = [
    MENU_ITEMS.find((item) => item.id === 'swc-1'), // Morning Sandwichef Bacon
    MENU_ITEMS.find((item) => item.id === 'swc-2'), // Bagheta fresh
    MENU_ITEMS.find((item) => item.id === 'swc-7'), // Smashed sandwich vită
    MENU_ITEMS.find((item) => item.id === 'swc-10'), // Panini Mamamia
  ].filter(Boolean) as MenuItem[];

  // Dedicated POS & Bread Inventory Management Page for Shop Sellers
  if (currentPage === 'gestiune') {
    return (
      <StaffInventoryPage
        inventory={inventory}
        isInventoryLoading={isInventoryLoading}
        onInventoryUpdate={(updated) => setInventory(updated)}
        onBackToStore={() => {
          if (window.location.pathname === '/inventar' || window.location.pathname === '/gestiune') {
            window.history.pushState(null, '', '/');
          }
          handleNavigateTo('home');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#241813] flex flex-col font-sans selection:bg-[#C44E36] selection:text-white pb-16 md:pb-0">
      {/* Sticky Top Navbar */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onNavigateTo={handleNavigateTo}
        activeTab={currentPage}
        setActiveTab={(tab) => handleNavigateTo(tab)}
        lang={lang}
        setLang={setLang}
        onToggleLang={() => setLang(lang === 'ro' ? 'en' : lang === 'en' ? 'it' : 'ro')}
      />

      {/* Main Content Flow - Switch between Dedicated Pages */}
      <main className="flex-1">
        {/* ==================================================== */}
        {/* PAGE 1: DEDICATED MENU PAGE                          */}
        {/* ==================================================== */}
        {currentPage === 'menu' && (
          <div id="page-menu" className="pt-16 sm:pt-20">
            {/* Page Header & Breadcrumb Bar */}
            <div className="bg-[#F0EAE1] border-b border-[#E4D9CA] py-3.5 px-4 sm:px-6">
              <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs sm:text-sm text-[#6B5E55]">
                <button
                  id="menu-back-to-home-btn"
                  onClick={() => handleNavigateTo('home')}
                  className="hover:text-[#C44E36] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{lang === 'ro' ? 'Acasă' : lang === 'it' ? 'Inizio' : 'Home'}</span>
                </button>
                <span>/</span>
                <span className="font-bold text-[#241813]">
                  {lang === 'ro' ? 'Meniu complet' : lang === 'it' ? 'Menu completo' : 'Full menu'}
                </span>
              </div>
            </div>

            {/* Complete Menu Section with live filters and details */}
            <MenuSection
              onSelectItem={(item) => setActiveDetailItem(item)}
              onQuickAdd={handleQuickAdd}
              lang={lang}
              inventory={inventory}
              isInventoryLoading={isInventoryLoading}
            />

            {/* Bottom Recommendation to Catering & Chef Lab */}
            <div className="bg-[#FAF7F2] pb-16 pt-4 px-4 border-t border-[#241813]/10">
              <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#F0EAE1] p-6 rounded-3xl border border-[#E4D9CA] flex flex-col justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-bold text-[#C44E36]">
                      {lang === 'ro' ? 'Pentru echipe & evenimente' : lang === 'it' ? 'Per team & eventi' : 'For teams & events'}
                    </span>
                    <h3 className="font-serif text-xl font-bold text-[#241813] mt-1 mb-2">
                      {lang === 'ro' ? 'Platouri schiacciata & catering' : lang === 'it' ? 'Taglieri schiacciata & catering' : 'Schiacciata catering platters'}
                    </h3>
                    <p className="text-xs text-[#6B5E55] leading-relaxed mb-4">
                      {lang === 'ro'
                        ? 'Comandă platouri asortate de mini schiacciata pentru birou sau petreceri private.'
                        : lang === 'it'
                        ? 'Ordina taglieri assortiti di mini schiacciate per riunioni o eventi privati.'
                        : 'Order assorted mini Schiacciata platters for meetings and private celebrations.'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleNavigateTo('catering')}
                    className="self-start inline-flex items-center gap-1.5 text-xs font-bold text-[#C44E36] hover:underline cursor-pointer"
                  >
                    <span>{lang === 'ro' ? 'Vezi oferta catering' : lang === 'it' ? 'Vedi catering' : 'View catering'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-[#F0EAE1] p-6 rounded-3xl border border-[#E4D9CA] flex flex-col justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-bold text-[#D97706]">
                      {lang === 'ro' ? 'Creativitate nelimitată' : lang === 'it' ? 'Creatività senza limiti' : 'Unlimited creativity'}
                    </span>
                    <h3 className="font-serif text-xl font-bold text-[#241813] mt-1 mb-2">
                      Chef Lab studio ✨
                    </h3>
                    <p className="text-xs text-[#6B5E55] leading-relaxed mb-4">
                      {lang === 'ro'
                        ? 'Alege carnea, brânza, sosul și legumele preferate pentru un sandwich preparat exact pe gustul tău.'
                        : lang === 'it'
                        ? 'Scegli la tua combinazione preferita di carne, formaggi e salse al momento.'
                        : 'Choose your preferred meats, artisan cheeses, sauces and veggies made to order.'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleNavigateTo('builder')}
                    className="self-start inline-flex items-center gap-1.5 text-xs font-bold text-[#C44E36] hover:underline cursor-pointer"
                  >
                    <span>{lang === 'ro' ? 'Deschide Chef Lab' : lang === 'it' ? 'Apri Chef Lab' : 'Open Chef Lab'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* PAGE 2: DEDICATED CHEF LAB PAGE                      */}
        {/* ==================================================== */}
        {currentPage === 'builder' && (
          <div id="page-builder" className="pt-16 sm:pt-20">
            {/* Page Header & Breadcrumb Bar */}
            <div className="bg-[#F0EAE1] border-b border-[#E4D9CA] py-3.5 px-4 sm:px-6">
              <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs sm:text-sm text-[#6B5E55]">
                <button
                  id="builder-back-to-home-btn"
                  onClick={() => handleNavigateTo('home')}
                  className="hover:text-[#C44E36] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{lang === 'ro' ? 'Acasă' : lang === 'it' ? 'Inizio' : 'Home'}</span>
                </button>
                <span>/</span>
                <span className="font-bold text-[#241813]">Chef Lab studio ✨</span>
              </div>
            </div>

            {/* Interactive Custom Sandwich Studio */}
            <SandwichLab
              onAddCustomSandwich={handleAddCustomSandwich}
              lang={lang}
              inventory={inventory}
            />
          </div>
        )}

        {/* ==================================================== */}
        {/* PAGE 3: DEDICATED CATERING PAGE                      */}
        {/* ==================================================== */}
        {currentPage === 'catering' && (
          <div id="page-catering" className="pt-16 sm:pt-20">
            {/* Page Header & Breadcrumb Bar */}
            <div className="bg-[#F0EAE1] border-b border-[#E4D9CA] py-3.5 px-4 sm:px-6">
              <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs sm:text-sm text-[#6B5E55]">
                <button
                  onClick={() => handleNavigateTo('home')}
                  className="hover:text-[#C44E36] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{lang === 'ro' ? 'Acasă' : lang === 'it' ? 'Inizio' : 'Home'}</span>
                </button>
                <span>/</span>
                <span className="font-bold text-[#241813]">
                  {lang === 'ro' ? 'Catering evenimente' : lang === 'it' ? 'Catering eventi' : 'Event catering'}
                </span>
              </div>
            </div>

            <CateringSection lang={lang} />
          </div>
        )}

        {/* ==================================================== */}
        {/* PAGE 4: DEDICATED LOCATION PAGE                      */}
        {/* ==================================================== */}
        {currentPage === 'location' && (
          <div id="page-location" className="pt-16 sm:pt-20">
            {/* Page Header & Breadcrumb Bar */}
            <div className="bg-[#F0EAE1] border-b border-[#E4D9CA] py-3.5 px-4 sm:px-6">
              <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs sm:text-sm text-[#6B5E55]">
                <button
                  onClick={() => handleNavigateTo('home')}
                  className="hover:text-[#C44E36] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{lang === 'ro' ? 'Acasă' : lang === 'it' ? 'Inizio' : 'Home'}</span>
                </button>
                <span>/</span>
                <span className="font-bold text-[#241813]">
                  {lang === 'ro' ? 'Locație Craiova & contact' : lang === 'it' ? 'Posizione & contatti' : 'Location & contact'}
                </span>
              </div>
            </div>

            <LocationContactSection lang={lang} />
          </div>
        )}

        {/* ==================================================== */}
        {/* PAGE 5: MAIN HOMEPAGE                                */}
        {/* ==================================================== */}
        {currentPage === 'home' && (
          <div id="page-home">
            {/* Hero Section */}
            <HeroSection
              onExploreMenu={() => handleNavigateTo('menu')}
              onOpenBuilder={() => handleNavigateTo('builder')}
              lang={lang}
            />

            {/* Story & Philosophy Section with 4 Visual Cards */}
            <StorySection onNavigateTo={handleNavigateTo} lang={lang} />

            {/* FEATURED BESTSELLERS TEASER ON HOME */}
            <section className="py-14 sm:py-20 bg-[#FAF7F2] border-t border-[#241813]/10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-bold text-[#C44E36] block mb-1">
                      {lang === 'ro' ? 'Selecția zilei' : lang === 'it' ? 'Selezione del giorno' : 'Daily selection'}
                    </span>
                    <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#241813]">
                      {lang === 'ro'
                        ? 'Cele mai iubite sandwichuri toscane'
                        : lang === 'it'
                        ? 'I nostri panini più apprezzati'
                        : 'Our most loved Tuscan panini'}
                    </h2>
                  </div>

                  {/* Button to open the full Meniu page */}
                  <button
                    id="home-open-full-menu-btn"
                    onClick={() => handleNavigateTo('menu')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C44E36] hover:bg-[#A63B25] text-white text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer self-start sm:self-auto active:scale-95"
                  >
                    <span>
                      {lang === 'ro'
                        ? 'Deschide meniul complet (19 rețete)'
                        : lang === 'it'
                        ? 'Apri il menu completo (19 ricette)'
                        : 'Open full menu (19 recipes)'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Visual Photo Showcase of Popular Panini (Photos only, click navigates to menu to order) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mb-8">
                  {featuredSandwiches.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleNavigateTo('menu')}
                      className="group bg-[#F0EAE1] rounded-3xl overflow-hidden border border-[#E4D9CA] shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1"
                    >
                      <div className="relative h-60 sm:h-64 overflow-hidden bg-stone-200">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                          onError={(e) => {
                            handleSafeImageError(e, FALLBACK_IMAGES.sandwich);
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#241813]/90 via-[#241813]/30 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                          <div className="bg-[#241813]/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                            <Star className="w-3 h-3 text-[#F0BE2C] fill-[#F0BE2C]" />
                            <span>{item.weight}g</span>
                          </div>
                          {(() => {
                            const isPan = item.category === 'panini' || item.name.toLowerCase().includes('panini');
                            if (!isPan || !inventory) return null;
                            if (inventory.remaining <= 0) {
                              return (
                                <span className="bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                                  {lang === 'ro' ? 'Stoc epuizat pentru azi' : 'Sold out today'}
                                </span>
                              );
                            }
                            if (inventory.remaining <= 5) {
                              return (
                                <span className="bg-amber-500 text-stone-900 border border-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                                  🔥 {lang === 'ro' ? `Doar ${inventory.remaining} rămase!` : `Only ${inventory.remaining} left!`}
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                        <div className="absolute top-3 right-3 bg-[#C44E36] text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-xs">
                          {item.price} lei
                        </div>

                        {/* Bottom Content Overlay on the Photo */}
                        <div className="absolute bottom-0 inset-x-0 p-4 text-white">
                          <h3 className="font-serif text-lg font-bold text-white leading-tight mb-1 group-hover:text-[#F0BE2C] transition-colors">
                            {lang === 'ro' ? item.name : lang === 'it' ? item.nameIt || item.name : item.nameEn || item.name}
                          </h3>
                          <p className="text-[11px] text-stone-200 line-clamp-2 leading-relaxed mb-3 opacity-90">
                            {lang === 'ro'
                              ? item.description
                              : lang === 'it'
                              ? item.descriptionIt || item.description
                              : item.descriptionEn || item.description}
                          </p>

                          {/* Subtle prompt indicating click to see in menu */}
                          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F0BE2C] group-hover:underline">
                            <span>{lang === 'ro' ? 'Vezi în meniu' : lang === 'it' ? 'Vedi nel menu' : 'View in menu'}</span>
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Guidance Banner: Ordering & adding is done inside the full menu */}
                <div className="mb-12 p-4 sm:p-5 rounded-2xl bg-white border border-[#E7DDCE] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
                  <div className="flex items-center gap-3 text-center sm:text-left">
                    <div className="w-10 h-10 rounded-xl bg-[#C44E36]/10 text-[#C44E36] flex items-center justify-center shrink-0 mx-auto sm:mx-0">
                      <Utensils className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[#241813]">
                        {lang === 'ro'
                          ? 'Vrei să comanzi? Deschide meniul complet'
                          : lang === 'it'
                          ? 'Vuoi ordinare? Apri il menu completo'
                          : 'Ready to order? Open the full menu'}
                      </p>
                      <p className="text-[11px] sm:text-xs text-[#8C7E74]">
                        {lang === 'ro'
                          ? 'Pentru a adăuga preparate în coș sau a personaliza ingredientele, accesează secțiunea Meniu.'
                          : lang === 'it'
                          ? 'Per aggiungere piatti al carrello o personalizzare gli ingredienti, visita la sezione Menu.'
                          : 'To add items to your cart or customize ingredients, explore the Menu section.'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleNavigateTo('menu')}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#241813] hover:bg-[#3D2C24] text-white text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-98"
                  >
                    <span>{lang === 'ro' ? 'Mergi la meniu' : lang === 'it' ? 'Vai al menu' : 'Go to menu'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* CHEF LAB INVITATION BANNER */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#241813] via-[#38261F] to-[#241813] p-6 sm:p-10 text-white border border-[#F0BE2C]/30 shadow-lg">
                  <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0BE2C]/20 border border-[#F0BE2C]/40 text-[#F0BE2C] text-xs font-bold mb-3">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{lang === 'ro' ? 'Sandwich personalizat' : lang === 'it' ? 'Panino personalizzato' : 'Custom sandwich'}</span>
                    </div>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-2">
                      {lang === 'ro'
                        ? 'Fii tu chef-ul! Intră în Chef Lab'
                        : lang === 'it'
                        ? 'Diventa tu lo chef! Entra nel Chef Lab'
                        : 'Be the chef! Step into Chef Lab'}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-300 leading-relaxed mb-6">
                      {lang === 'ro'
                        ? 'Alege schiacciata preferată, mezelurile autentice italiene, brânzeturile fine, sosurile gourmet și legumele proaspete. Vizualizează construcția strat cu strat!'
                        : lang === 'it'
                        ? 'Componi il tuo panino ideale strato dopo strato con ingredienti freschi preparati al momento.'
                        : 'Build your dream sandwich layer by layer with artisan Schiacciata, authentic Italian cuts, cheeses, sauces and veggies!'}
                    </p>
                    <button
                      id="home-open-cheflab-btn"
                      onClick={() => handleNavigateTo('builder')}
                      className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#F0BE2C] hover:bg-[#d8a71e] text-[#241813] font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
                    >
                      <Sparkles className="w-4 h-4 text-[#241813]" />
                      <span>
                        {lang === 'ro'
                          ? 'Deschide Chef Lab studio ✨'
                          : lang === 'it'
                          ? 'Apri Chef Lab studio ✨'
                          : 'Open Chef Lab studio ✨'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Corporate & Event Catering with Instant Quote Simulator */}
            <CateringSection lang={lang} />

            {/* Location, Schedule & 1-Click GPS Navigation */}
            <LocationContactSection lang={lang} />
          </div>
        )}
      </main>

      {/* Comprehensive Footer */}
      <Footer
        onNavigateTo={handleNavigateTo}
        lang={lang}
      />

      {/* MOBILE STICKY BOTTOM NAVIGATION BAR FOR PHONES */}
      <MobileBottomBar
        cartCount={totalCartCount}
        cartTotal={totalCartPrice}
        onOpenCart={() => setIsCartOpen(true)}
        onNavigateTo={handleNavigateTo}
        activeSection={currentPage}
        lang={lang}
      />

      {/* DESKTOP FLOATING BOTTOM CART BUTTON */}
      <button
        id="desktop-bottom-cart-btn"
        onClick={() => setIsCartOpen(true)}
        className="hidden md:flex fixed bottom-6 right-6 z-40 items-center gap-2.5 px-4 py-3 bg-[#C44E36] hover:bg-[#A63B25] text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer active:scale-95 border border-white/20"
        aria-label="Coș de cumpărături"
      >
        <div className="relative inline-flex">
          <ShoppingBag className="w-5 h-5" />
          <span
            id="desktop-cart-badge-dot"
            className={`absolute -top-1.5 -right-2.5 text-[10px] font-extrabold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center shadow-xs transition-colors ${
              totalCartCount > 0 ? 'bg-[#F0BE2C] text-[#241813]' : 'bg-white/30 text-white'
            }`}
          >
            {totalCartCount}
          </span>
        </div>
        <span className="text-sm font-bold">
          {lang === 'ro' ? 'Coș' : lang === 'it' ? 'Carrello' : 'Cart'}
          {totalCartPrice > 0 ? ` • ${totalCartPrice} lei` : ''}
        </span>
      </button>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        inventory={inventory}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onExploreMenu={() => handleNavigateTo('menu')}
        onOrderCompleted={() => {
          fetchInventory().then((data) => setInventory(data));
        }}
        lang={lang}
      />

      {/* Item Detail & Customization Modal */}
      <ItemDetailModal
        item={activeDetailItem}
        onClose={() => setActiveDetailItem(null)}
        inventory={inventory}
        onAddToCart={handleAddToCartFromModal}
        lang={lang}
      />

      {/* Floating Toast Notification - Positioned above Mobile Bottom Bar */}
      {toastMessage && (
        <div
          id="app-toast-notification"
          className="fixed bottom-20 md:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 bg-[#241813] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-[#F0BE2C]/40 animate-in fade-in slide-in-from-bottom-3 duration-200 max-w-sm sm:max-w-md mx-auto sm:mx-0"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs sm:text-sm font-semibold truncate">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
